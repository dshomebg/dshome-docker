# Модул "Количества - Update"

## Общ преглед

Модулът "Количества - Update" позволява масово обновяване на цени и складови наличности чрез импорт на Excel файлове. Модулът включва система за запазване на темплейти с column mapping, batch processing, и валидация на данни.

## Архитектура

### Frontend
**Location:** `packages/admin/app/(dashboard)/modules/quantity-update/page.tsx`

**Technology Stack:**
- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Lucide React Icons

### Backend Services

#### Excel Parser Service
**Location:** `packages/backend/src/services/excel-parser.service.ts`

**Функции:**
- `parseExcelFile(buffer: Buffer)` - Парсва Excel файл и връща колони + редове
- `isValidExcelFile(buffer: Buffer)` - Валидира дали файлът е валиден Excel
- `getExcelPreview(buffer: Buffer, maxRows: number)` - Връща preview на данните
- `applyColumnMapping(rows, columnMapping)` - Прилага column mapping към данните

**Dependencies:**
- `xlsx` - Excel file parsing

#### Product Import Service
**Location:** `packages/backend/src/services/product-import.service.ts`

**Функции:**
- `processImport(rows: ImportRowData[])` - Главна функция за импорт с batch processing
- `processBatch()` - Обработва batch от 100 реда
- `processRow()` - Обработва един ред
- `updateProductPrice()` - Обновява цени на продукт
- `updateProductInventory()` - Обновява складова наличност
- `validateImportData()` - Валидира данните преди импорт

**Business Logic:**
1. Игнорира несъществуващи SKU-та (не хвърля грешка)
2. Игнорира несъществуващи warehouse ID-та (не хвърля грешка)
3. Обновява цени само ако са предоставени
4. UUID validation за warehouse ID-та (regex pattern)
5. Batch processing - 100 реда наведнъж за производителност

### Backend API Endpoints

#### Import Templates Routes
**Location:** `packages/backend/src/routes/import-templates.routes.ts`

```
GET    /api/import-templates        # List all templates
GET    /api/import-templates/:id    # Get single template
POST   /api/import-templates        # Create template
PUT    /api/import-templates/:id    # Update template
DELETE /api/import-templates/:id    # Delete template
```

#### Product Import Routes
**Location:** `packages/backend/src/routes/product-import.routes.ts`

```
POST   /api/product-import/upload   # Upload Excel file
POST   /api/product-import/preview  # Preview mapped data
POST   /api/product-import/process  # Process import
```

### Database Schema

**Table:** `import_templates`

```sql
CREATE TABLE import_templates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         varchar(255) NOT NULL,
  column_mapping jsonb NOT NULL,
  created_at   timestamp DEFAULT now() NOT NULL,
  updated_at   timestamp DEFAULT now() NOT NULL
);
```

**Column Mapping JSON Structure:**
```json
{
  "Excel Column Name": "fieldName",
  "SKU": "sku",
  "Цена с ДДС": "salePrice",
  "Складова цена": "purchasePrice",
  "Склад 1 ID": "warehouse1Id",
  "Склад 1 Количество": "warehouse1Qty"
}
```

## User Flow

### Step 1: Upload File
- Поддържа `.xlsx` и `.xls` файлове
- Парсва файла и извлича column headers
- Показва брой намерени колони и редове

### Step 2: Column Mapping
- Dropdown за всяка колона от Excel файла
- Опции за mapping:
  - **ignore** - игнорира колоната
  - **sku** - SKU на продукта (задължително)
  - **salePrice** - продажна цена с ДДС
  - **purchasePrice** - складова/доставна цена
  - **warehouse1Id/Qty** до **warehouse6Id/Qty** - ID и количество за склад

### Step 3: Template Management
- Запазване на текущия column mapping като темплейт
- Зареждане на съществуващ темплейт
- Обновяване на темплейт (променя името и mapping-а)
- Изтриване на темплейт
- Dropdown списък с всички темплейти

### Step 4: Preview
- Показва първите 10 реда с приложен mapping
- Потвърждава че mapping-ът е правилен
- Възможност за връщане назад и промяна

### Step 5: Import Process
- Progress bar с текущ статус
- Real-time update на броя обработени редове
- Показва резултати след завършване:
  - Общо редове
  - Обработени продукти
  - Обновени цени
  - Обновени складови наличности
  - Пропуснати редове (несъществуващи SKU-та)
  - Грешки (ако има)

## Data Validation

### SKU Validation
- SKU полето е задължително за всеки ред
- Ако SKU не съществува в базата → редът се пропуска (не е грешка)

### Warehouse ID Validation
- UUID validation чрез regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- Ако ID не е валиден UUID → пропуска се
- Ако UUID не съществува в базата → пропуска се

### Price Validation
- Конвертира към float със `parseFloat()`
- Валидира с `isNaN()` проверка
- Празни стойности → не обновява цената

### Quantity Validation
- Конвертира към integer със `parseInt()`
- Валидира с `isNaN()` проверка
- Празни стойности → не обновява количеството

## Performance

### Batch Processing
- Обработва по 100 реда наведнъж
- Намалява броя на database queries чрез:
  - Bulk fetch на products по SKU
  - Bulk fetch на warehouses по ID
  - Map структури за бърз lookup

### Database Optimization
- Използва `inArray()` за batch queries
- Index върху `products.sku` и `warehouses.id`
- Drizzle ORM параметризирани queries

## Error Handling

### Non-breaking Errors
Следните ситуации **НЕ** спират импорта:
- Несъществуващ SKU → пропуска реда
- Несъществуващ warehouse ID → пропуска warehouse-а
- Невалиден UUID за warehouse → пропуска warehouse-а
- Невалидна цена → не обновява цената
- Невалидно количество → не обновява количеството

### Breaking Errors
Следните ситуации **СПИРАТ** импорта:
- Невалиден Excel файл
- Липсва SKU mapping
- Database connection error
- Unexpected server error

## Security

### File Upload
- Валидира file extension (.xlsx, .xls)
- Валидира MIME type
- Ограничение на размер (настроено в Multer)

### API Authentication
- Всички endpoints изискват JWT authentication
- Role-based access control (admin only)

### Input Sanitization
- Drizzle ORM защитава от SQL injection
- Zod validation на input data
- Type safety чрез TypeScript

## Migration

**File:** `packages/backend/src/db/migrations/0027_add_import_templates.sql`

```sql
CREATE TABLE IF NOT EXISTS "import_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "column_mapping" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

**Run Migration:**
```bash
cd packages/backend
pnpm db:migrate
```

## Frontend Services

**Location:** `packages/admin/services/`

### Import Templates Service
```typescript
// packages/admin/services/import-templates.service.ts
class ImportTemplatesService {
  async getImportTemplates(): Promise<ImportTemplate[]>
  async getImportTemplate(id: string): Promise<ImportTemplate>
  async createImportTemplate(data: CreateTemplateDto): Promise<ImportTemplate>
  async updateImportTemplate(id: string, data: UpdateTemplateDto): Promise<ImportTemplate>
  async deleteImportTemplate(id: string): Promise<void>
}
```

### Product Import Service
```typescript
// packages/admin/services/product-import.service.ts
class ProductImportService {
  async uploadFile(file: File): Promise<ExcelParseResult>
  async previewImport(file: File, mapping: ColumnMapping): Promise<PreviewResult>
  async processImport(file: File, mapping: ColumnMapping): Promise<ImportResult>
}
```

## Types

### ImportRowData
```typescript
interface ImportRowData {
  sku: string;
  salePrice?: string | number;
  purchasePrice?: string | number;
  warehouse1Id?: string;
  warehouse1Qty?: string | number;
  warehouse2Id?: string;
  warehouse2Qty?: string | number;
  // ... до warehouse6
}
```

### ImportResult
```typescript
interface ImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  updatedProducts: number;
  updatedPrices: number;
  updatedInventories: number;
  skippedRows: number;
  errors: ImportError[];
}
```

### ColumnMapping
```typescript
type ColumnMapping = Record<string, string>;
// Example:
// {
//   "SKU": "sku",
//   "Цена": "salePrice",
//   "Склад 1": "warehouse1Id"
// }
```

## Testing

### Manual Testing Checklist
- [ ] Upload valid Excel file
- [ ] Upload invalid file (PDF, etc.)
- [ ] Map columns correctly
- [ ] Save template
- [ ] Load template
- [ ] Update template
- [ ] Delete template
- [ ] Preview import
- [ ] Process import with valid data
- [ ] Process import with non-existent SKU
- [ ] Process import with non-existent warehouse ID
- [ ] Process import with invalid UUID
- [ ] Process import with invalid prices
- [ ] Process import with mixed valid/invalid data

## Future Improvements

### Potential Enhancements
1. **Bulk Delete Products** - добавяне на функция за масово изтриване
2. **Import History** - запазване на история на импортите
3. **Dry Run Mode** - preview на промените без да се прилагат
4. **Undo Import** - възможност за отмяна на последен импорт
5. **Email Notifications** - изпращане на email след завършване
6. **Scheduled Imports** - автоматично изпълнение на импорти
7. **Multiple Warehouses** - support за повече от 6 склада
8. **CSV Support** - поддръжка на CSV файлове
9. **Error Export** - експорт на грешките в Excel файл
10. **Import Templates Categories** - категоризация на темплейтите

## Troubleshooting

### Проблем: "relation 'import_templates' does not exist"
**Решение:** Run database migration
```bash
cd packages/backend
pnpm db:migrate
```

### Проблем: "invalid input syntax for type uuid"
**Причина:** Excel файлът съдържа numeric IDs вместо UUID-та
**Решение:** Модулът автоматично пропуска невалидни UUID-та. Уверете се, че използвате правилните UUID-та от Warehouses страницата.

### Проблем: Import завършва но не обновява данни
**Причина:** SKU-тата или warehouse ID-тата не съществуват
**Решение:** Проверете "Пропуснати редове" в резултатите и се уверете, че:
- SKU-тата съществуват в Products таблицата
- Warehouse ID-тата са валидни UUID-та и съществуват в Warehouses таблицата

### Проблем: Template не се запазва
**Причина:** Празно име на темплейт
**Решение:** Въведете име за темплейта преди да го запазите

## Deployment

### Production Deployment Checklist
1. Run database migration на production сървър
2. Build backend с `pnpm --filter @dshome/backend build`
3. Build admin с `pnpm --filter @dshome/admin build`
4. Deploy Docker containers
5. Verify module accessibility at `/modules/quantity-update`
6. Test with sample Excel file

### Environment Variables
Няма специфични environment variables за този модул. Използва общите database и API конфигурации.

## Changelog

### Version 1.0.0 (2025-11-10)
- Initial release
- Excel import functionality (.xlsx, .xls)
- Column mapping interface
- Template management (CRUD)
- Batch processing (100 rows)
- UUID validation for warehouses
- Price and inventory updates
- Progress tracking
- Error handling and reporting

---

**Дата на създаване:** 2025-11-10
**Автор:** Claude Code Assistant
**Статус:** ✅ Deployed to Production
