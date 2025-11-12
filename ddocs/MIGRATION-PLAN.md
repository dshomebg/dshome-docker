# PrestaShop → DSHome Migration Plan

**Последна актуализация:** 2025-11-12

## Обща Информация

**Източник:** PrestaShop 8.1.7
**Цел:** DSHome (Custom Node.js + React)
**Статус:** Планиране

---

## 1.Scope на Миграцията

### 1.1 Какво мигрираме

#### Приоритет 1 (Critical):
- ✅ **Категории** - йерархична структура
- ✅ **Продукти** - основни данни + описания
- ✅ **Снимки на продукти** - всички размери
- ✅ **Комбинации** (Product Combinations) - size, color вариации
- ✅ **Характеристики** (Features) - технически параметри
- ✅ **Цени** - текущи + history
- ✅ **Stock/Наличности** - по складове

#### Приоритет 2 (Important):
- ✅ **Марки** (Manufacturers/Brands)
- ✅ **Доставчици** (Suppliers)
- ✅ **SEO данни** - meta titles, descriptions, friendly URLs
- ✅ **Категории-Продукти връзки** - many-to-many

#### Приоритет 3 (Customer Data):
- ✅ **Клиенти** - регистрирани потребители
- ✅ **Адреси за доставка**
- ✅ **Поръчки** - history
- ✅ **Order Items** - артикули в поръчките

#### Приоритет 4 (Optional):
- ⏳ **CMS Pages** (ако има)
- ⏳ **Отстъпки/Промоции** (ако са активни)
- ⏳ **Коментари/Reviews** (ако има)

### 1.2 Какво НЕ мигрираме

- ❌ **Парола на клиенти** (reset при първи login)
- ❌ **Сесии/Кошници** (temporary data)
- ❌ **Логове/Stats**
- ❌ **Email templates** (ще се направят нови)

---

## 2. PrestaShop 8.1.7 Database Structure

### 2.1 Основни Таблици

```
# Products
ps_product                   → products
ps_product_lang              → product translations
ps_product_shop              → shop-specific data
ps_image                     → product_images
ps_product_attribute         → product_combinations
ps_product_attribute_combination → combination_attributes

# Categories
ps_category                  → categories
ps_category_lang             → category translations
ps_category_product          → product_categories (many-to-many)

# Features (Характеристики)
ps_feature                   → feature_groups
ps_feature_lang              → feature group translations
ps_feature_value             → feature_values
ps_feature_value_lang        → feature value translations
ps_feature_product           → product_features

# Attributes (Вариации: size, color)
ps_attribute_group           → attribute_groups
ps_attribute_group_lang      → attribute group translations
ps_attribute                 → attribute_values
ps_attribute_lang            → attribute value translations

# Stock
ps_stock_available           → product_inventory
ps_warehouse                 → warehouses

# Brands & Suppliers
ps_manufacturer              → brands
ps_supplier                  → suppliers

# Customers & Orders
ps_customer                  → (future: customers table)
ps_address                   → (future: shipping_addresses)
ps_orders                    → (future: orders)
ps_order_detail              → (future: order_items)

# SEO
ps_meta                      → seo_settings
```

---

## 3. Mapping Strategy

### 3.1 Категории (ps_category → categories)

**PrestaShop:**
```sql
ps_category:
- id_category
- id_parent
- level_depth
- active
- position

ps_category_lang:
- id_category
- id_lang (1=Bulgarian, 2=English)
- name
- description
- meta_title
- meta_description
- link_rewrite
```

**DSHome:**
```typescript
categories:
- id (uuid)
- name
- slug
- description
- parentId (nullable)
- isActive
- sortOrder
- imageUrl
- createdAt
- updatedAt
```

**Mapping Notes:**
- PrestaShop е multi-language → ще вземем Bulgarian (id_lang=1)
- `id_parent=0` (root) → `parentId=null`
- `link_rewrite` → `slug`
- `position` → `sortOrder`

---

### 3.2 Продукти (ps_product → products)

**PrestaShop:**
```sql
ps_product:
- id_product
- id_manufacturer
- id_supplier
- reference (SKU)
- ean13
- price (base price without tax)
- wholesale_price
- active
- quantity (deprecated in PS 1.5+, use ps_stock_available)

ps_product_lang:
- id_product
- id_lang
- name
- description
- description_short
- meta_title
- meta_description
- link_rewrite

ps_stock_available:
- id_product
- id_product_attribute (0 if no combinations)
- quantity
- id_shop
```

**DSHome:**
```typescript
products:
- id (uuid)
- name
- slug
- sku
- ean
- description
- shortDescription
- basePrice
- wholesalePrice
- taxRate
- isActive
- brandId
- supplierId
- weight
- createdAt
- updatedAt
```

**Mapping Notes:**
- `reference` → `sku`
- `ean13` → `ean`
- `id_manufacturer` → lookup brand, create if missing
- `id_supplier` → lookup supplier, create if missing
- Price: PS има price без ДДС, DSHome може да запази същото

---

### 3.3 Комбинации (ps_product_attribute → product_combinations)

**PrestaShop:**
```sql
ps_product_attribute:
- id_product_attribute
- id_product
- reference
- ean13
- price (impact on base price, can be negative)
- quantity (deprecated, use ps_stock_available)

ps_product_attribute_combination:
- id_attribute (value: "Size: L", "Color: Red")
- id_product_attribute

ps_attribute_group_lang:
- id_attribute_group (e.g., 1=Size, 2=Color)
- name ("Size", "Color")

ps_attribute_lang:
- id_attribute
- name ("S", "M", "L", "Red", "Blue")
```

**DSHome:**
```typescript
product_combinations:
- id (uuid)
- productId
- sku
- ean
- priceModifier (can be negative)
- stockQuantity

product_combination_attributes:
- id (uuid)
- combinationId
- attributeGroupId (Size, Color)
- attributeValueId (L, Red)
```

**Mapping Notes:**
- PS combinations са price modifiers → DSHome също
- Атрибути трябва да се мигрират ПРЕДИ комбинациите

---

### 3.4 Снимки (ps_image → product_images)

**PrestaShop:**
```sql
ps_image:
- id_image
- id_product
- position
- cover (main image)

# Физически файлове:
/img/p/{id}/  (split by digits)
Example: image ID 123 → /img/p/1/2/3/123.jpg
```

**DSHome:**
```typescript
product_images:
- id (uuid)
- productId
- filename
- position
- isMain
- url (generated)
```

**Mapping Notes:**
- PrestaShop има сложна файлова структура
- Трябва да copy-нем файловете и да генерираме thumbnails
- `cover=1` → `isMain=true`

---

## 4. Migration Process

### Phase 1: Preparation
1. ✅ Backup PrestaShop database
2. ✅ Export schema + sample data
3. ✅ Analyze data quality (missing fields, inconsistencies)
4. ✅ Create mapping documentation

### Phase 2: Structure Migration
1. ✅ Migrate Brands (ps_manufacturer → brands)
2. ✅ Migrate Suppliers (ps_supplier → suppliers)
3. ✅ Migrate Warehouses (ps_warehouse → warehouses)
4. ✅ Migrate Categories (ps_category → categories)
5. ✅ Migrate Attribute Groups & Values (ps_attribute_group → attribute_groups)
6. ✅ Migrate Feature Groups & Values (ps_feature → feature_groups)

### Phase 3: Product Migration
1. ✅ Migrate Products (basic data)
2. ✅ Migrate Product-Category relationships
3. ✅ Migrate Product Features
4. ✅ Migrate Product Combinations
5. ✅ Migrate Product Images (copy files + resize)
6. ✅ Migrate Product Inventory (stock)

### Phase 4: Customer Data (Optional, може да се направи по-късно)
1. ⏳ Migrate Customers
2. ⏳ Migrate Addresses
3. ⏳ Migrate Orders (read-only history)

### Phase 5: Validation
1. ✅ Compare counts (products, categories, etc.)
2. ✅ Test sample products in admin panel
3. ✅ Verify images load correctly
4. ✅ Check prices + stock
5. ✅ Test search (Meilisearch indexing)

---

## 5. Technical Approach

### 5.1 Migration Package Structure

```
packages/migration/
├── src/
│   ├── config/
│   │   └── prestashop.ts         # PS DB connection config
│   ├── analyzers/
│   │   ├── products.ts           # Analyze PS product data
│   │   ├── categories.ts         # Analyze PS category data
│   │   └── stats.ts              # Generate statistics
│   ├── mappers/
│   │   ├── productMapper.ts      # PS product → DSHome product
│   │   ├── categoryMapper.ts     # PS category → DSHome category
│   │   ├── imageMapper.ts        # Handle image paths
│   │   └── attributeMapper.ts    # Map combinations
│   ├── migrators/
│   │   ├── 01-brands.ts
│   │   ├── 02-suppliers.ts
│   │   ├── 03-categories.ts
│   │   ├── 04-attributes.ts
│   │   ├── 05-features.ts
│   │   ├── 06-products.ts
│   │   ├── 07-combinations.ts
│   │   ├── 08-images.ts
│   │   └── 09-inventory.ts
│   ├── utils/
│   │   ├── psConnection.ts       # PrestaShop DB connection
│   │   ├── dsConnection.ts       # DSHome DB connection
│   │   ├── logger.ts             # Migration logs
│   │   └── validator.ts          # Data validation
│   └── index.ts                  # Main migration runner
├── docs/
│   └── FIELD-MAPPING.md          # Detailed field mapping
├── package.json
└── tsconfig.json
```

### 5.2 Connection Strategy

```typescript
// Two database connections
const psDb = postgres(PRESTASHOP_DATABASE_URL);  // Read-only
const dsDb = postgres(DSHOME_DATABASE_URL);      // Write
```

### 5.3 Migration Modes

1. **Dry Run** - analyze only, no writes
2. **Incremental** - migrate one entity type at a time
3. **Full** - complete migration
4. **Rollback** - revert migration (delete migrated data)

### 5.4 Error Handling

- Log all errors to file
- Continue on non-critical errors
- Track skipped records
- Generate report at the end

---

## 6. Challenges & Solutions

### Challenge 1: Multi-language Support
**PrestaShop:** Multi-language (Bulgarian + English)
**DSHome:** Currently single language (Bulgarian)

**Solution:**
- Migrate only Bulgarian (id_lang=1 or 2, check which is BG)
- Keep English data in separate JSON field for future
- Or: Add multi-language support to DSHome first

### Challenge 2: Product Combinations
**PrestaShop:** Complex attribute system
**DSHome:** Simplified but flexible

**Solution:**
- Map PS attribute groups → DSHome attribute_groups
- Map PS attributes → DSHome attribute_values
- Map combinations one-to-one

### Challenge 3: Image Files
**PrestaShop:** Split directory structure
**DSHome:** Flat structure with sizes

**Solution:**
- Copy files from PS structure
- Generate thumbnails with Sharp
- Store in DSHome upload structure

### Challenge 4: Stock Management
**PrestaShop:** ps_stock_available (complex)
**DSHome:** Simple inventory table

**Solution:**
- Take latest quantity per product/combination
- Ignore warehouse movements history (for now)

### Challenge 5: Price with Tax
**PrestaShop:** Price without tax + tax rules
**DSHome:** TBD (decide on approach)

**Solution:**
- Store base price without tax (like PS)
- Calculate display price on frontend

---

## 7. Data Quality Checks

Before migration:
- [ ] Count products in PS vs expected
- [ ] Check for products without categories
- [ ] Check for orphaned images
- [ ] Identify products without stock
- [ ] Find duplicate SKUs

After migration:
- [ ] Compare counts (categories, products, images)
- [ ] Verify random sample of products
- [ ] Check category tree structure
- [ ] Test image URLs
- [ ] Verify prices match

---

## 8. Timeline (Estimate)

1. **Setup + Analysis** - 1 day
   - Create migration package
   - Analyze PS database
   - Document edge cases

2. **Mapper Development** - 2-3 days
   - Write mappers for all entities
   - Add validation logic
   - Test with sample data

3. **Migration Execution** - 1 day
   - Run dry-run
   - Fix issues
   - Run full migration

4. **Validation + Fixes** - 1 day
   - Manual checks
   - Fix data issues
   - Re-index search

**Total: ~5-6 days**

---

## 9. Next Steps

1. [ ] Get PrestaShop database credentials
2. [ ] Create read-only DB user for migration
3. [ ] Export sample data for testing
4. [ ] Create migration package structure
5. [ ] Write analyzers to inspect PS data
6. [ ] Document specific field mappings
7. [ ] Develop mappers + migrators
8. [ ] Test on sample data
9. [ ] Execute full migration
10. [ ] Validate results

---

## 10. SQL Queries for Analysis

### Count Records

```sql
-- PrestaShop
SELECT 'Products' as entity, COUNT(*) as count FROM ps_product WHERE active=1
UNION ALL
SELECT 'Categories', COUNT(*) FROM ps_category WHERE active=1
UNION ALL
SELECT 'Images', COUNT(*) FROM ps_image
UNION ALL
SELECT 'Combinations', COUNT(*) FROM ps_product_attribute
UNION ALL
SELECT 'Brands', COUNT(*) FROM ps_manufacturer
UNION ALL
SELECT 'Customers', COUNT(*) FROM ps_customer WHERE active=1;
```

### Find Data Issues

```sql
-- Products without categories
SELECT p.id_product, p.reference, pl.name
FROM ps_product p
LEFT JOIN ps_product_lang pl ON p.id_product = pl.id_product
LEFT JOIN ps_category_product cp ON p.id_product = cp.id_product
WHERE cp.id_category IS NULL AND p.active=1;

-- Products without images
SELECT p.id_product, p.reference, pl.name
FROM ps_product p
LEFT JOIN ps_product_lang pl ON p.id_product = pl.id_product
LEFT JOIN ps_image i ON p.id_product = i.id_product
WHERE i.id_image IS NULL AND p.active=1;

-- Duplicate SKUs
SELECT reference, COUNT(*) as count
FROM ps_product
WHERE reference != ''
GROUP BY reference
HAVING COUNT(*) > 1;
```

---

## Resources

- [PrestaShop 8.1 Database Schema](https://devdocs.prestashop-project.org/8/development/database/)
- [PrestaShop Image System](https://devdocs.prestashop-project.org/8/development/components/image/)
