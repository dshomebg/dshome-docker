# E-Commerce Platform Development Roadmap

## Progress Summary

**Total Modules/Features:** 38
**Completed:** 7 (18.4%)
**Pending:** 31 (81.6%)

---

## 1. Catalog Module

### 1.1 Products
- [ ] **ProductList Component**
  - Product table with filtering capabilities
  - Quick filters in table header
  - Bulk operations (status change, delete, category association)
  - Toggle status switch
  - Edit and delete actions

- [ ] **ProductForm Component**
  - Tab-based organization (Basic Info, Prices, Combinations, Associations, SEO)
  - Support for "Simple Product" and "Product with Combinations"
  - Combination generator based on Attributes
  - Association with Categories, Brands, and Suppliers
  - Stock management per warehouse

### 1.2 Categories
- [x] **CategoryList Component**
  - Hierarchical tree view
  - Expand/collapse functionality
  - Display name, status, and actions

- [x] **CategoryForm Component**
  - Name, status, and parent category selection
  - WYSIWYG editor for description (placeholder ready)
  - Image upload
  - SEO section (meta title, meta description, URL slug)

### 1.3 Attributes
- [x] **AttributeForm Component**
  - Create attribute groups (e.g., "Color", "RAM Size")
  - Add values to groups
  - Display type selection:
    - Dropdown
    - Radio button
    - Color (with HEX color picker and texture image upload)
  - Reorder values with up/down buttons
  - Image has priority over HEX color when displaying

### 1.4 Features (Characteristics)
- [x] **Feature Management**
  - Create feature groups (e.g., "Warranty", "Origin")
  - Add predefined values to groups
  - Information-only (no combinations)
  - Used for filtering and specifications

### 1.5 Brands
- [x] **BrandList Component**
  - List all brands with actions

- [x] **BrandForm Component**
  - Brand name and status
  - Logo upload
  - WYSIWYG description editor
  - SEO fields (meta title, meta description, URL slug)

### 1.6 Suppliers
- [x] **SupplierList Component**
  - List all suppliers with actions

- [x] **SupplierForm Component**
  - Supplier name
  - Contact information (phone, email, contact person)
  - Default supplier functionality

### 1.7 Warehouses
- [x] **WarehouseList Component**
  - List all warehouses with actions

- [x] **WarehouseForm Component**
  - Name, address, phone, working hours
  - Geographic coordinates (latitude, longitude)
  - URL field
  - "Physical Store" flag
  - Status field
  - Stock tracking per warehouse

### 1.8 Faceted Navigation
- [ ] **Template Management**
  - Template for category page filters
  - Template for search page filters

- [ ] **TemplateForm Component**
  - Drag-and-drop filter reordering
  - Toggle switches for activating/deactivating filters
  - Filter-specific settings:
    - Price filter: slider vs. from-to fields
    - Feature/Attribute filters: SearchableMultiSelect for group selection

### 1.9 Catalog Settings
- [ ] **CatalogSettingsPage Component**
  - VAT percentage field
  - Products per page setting
  - "New Product" period (in days)
  - Default product sorting
  - Delivery time templates (dynamic list)

---

## 2. Sales Module

### 2.1 Orders
- [ ] **OrderList Component**
  - Table with all orders
  - Advanced filters (order number, customer, courier, products, amount, status, date)
  - Quick status change from list

- [ ] **OrderDetail Component**
  - Customer information
  - Delivery information
  - Product list
  - Status history
  - Administrative notes
  - "Print Order" button (PDF generation)
  - Edit order products (quantity, price)
  - Add/remove products from order

### 2.2 Customers
- [ ] **CustomerList Component**
  - Table with customer information (name, email, phone, city)
  - Edit and delete actions

- [ ] **CustomerForm Component**
  - Basic data section (name, email, address)
  - Company data section (company name, VAT number)

### 2.3 Couriers
- [ ] **CourierForm Component**
  - Basic information (name, logo, tracking URL, status)
  - Standard delivery:
    - Office delivery option
    - Weight-based pricing tables (from-to kg)
    - Separate tables for address and office delivery
  - Pallet delivery:
    - Activation toggle
    - Activation threshold (kg)
    - Max pallet weight
    - Price per pallet

### 2.4 Courier Offices
- [ ] **CourierOfficeList Component**
  - Table with all imported offices
  - Filter by courier and text search (city, address)

- [ ] **CourierOfficeImport Component**
  - Step 1: Select courier and upload file (.csv, .xls, .xlsx)
  - Step 2: Column mapping (City, Address, Office Name, Postal Code)
  - Step 3: Preview and final confirmation
  - Auto-delete old offices for selected courier

### 2.5 Order Statuses
- [ ] **StatusForm Component**
  - Status name
  - Color selection (visual indication)
  - "Visible to customer" toggle
  - "Send email to customer" toggle
  - Email template selection (if email enabled)

---

## 3. Modules

### 3.1 Quantity Update (Количества - Update)
- [x] **Excel Import Module**
  - Step 1: File upload (.xlsx, .xls)
  - Step 2: Column mapping interface
    - SKU (required)
    - Sale Price (with VAT)
    - Purchase Price (supplier cost)
    - Warehouse 1-6 ID and Quantity fields
  - Step 3: Template management
    - Save column mappings as templates
    - Load, update, and delete templates
  - Step 4: Preview mapped data
  - Step 5: Import with progress tracking
  - Backend: Batch processing (100 rows per batch)
  - Business logic:
    - Ignore non-existent SKUs and warehouses
    - Update prices only if provided
    - Calculate total quantity from warehouse sum
    - UUID validation for warehouse IDs

### 3.2 Packages per m² (Пакети/м²)
- [ ] **Module Status:** Placeholder (not yet implemented)

### 3.3 Reviews and Questions
- [ ] **Tab-based Interface**
  - "Reviews" tab
  - "Questions" tab

- [ ] **Reviews Tab**
  - Table with all reviews (product, author, rating, text, status)
  - Quick moderation buttons (approve/reject)
  - Full CRUD operations

- [ ] **Questions Tab**
  - List of all questions
  - Quick reply form for unanswered questions
  - Full CRUD operations

### 3.4 SEO Module

#### 3.4.1 URL Settings
- [ ] **URL Configuration Interface**
  - Tab-based (Products & Categories, Brands, CMS, Blog)
  - URL suffix field for each tab
  - Dynamic preview URL
  - Automatic canonical tag generation info

#### 3.4.2 Meta Tags
- [ ] **Meta Tag Templates**
  - Section for Product meta tags
  - Section for Category meta tags
  - Available variables display
  - Template for meta title
  - Template for meta description
  - Live preview with sample data

#### 3.4.3 Sitemap
- [ ] **Sitemap Generation**
  - Manual generation button
  - Auto-generation toggle switch
  - Last generation date indicator

- [ ] **Sitemap Settings**
  - Table for content types configuration
  - Change frequency setting per type
  - Priority setting per type

- [ ] **Sitemap Index**
  - Split large files toggle
  - Max URLs per file field

#### 3.4.4 Structured Data
- [ ] **Global Settings**
  - Master toggle for all structured data
  - Individual toggles for: Product, BreadcrumbList, Organization, WebSite

- [ ] **Organization Settings**
  - Company name, logo, address, phone fields

- [ ] **Product Settings**
  - Currency configuration
  - Toggle controls for: rating, description, images, features

#### 3.4.5 Smart Filters (SEO Landing Pages)
- [ ] **SmartFilterList Component**
  - Table with created pages (H1, URL)

- [ ] **SmartFilterForm Component**
  - Filter configuration interface (categories, brands, features)
  - Real-time product count
  - SEO fields (H1, URL, meta tags, unique description)

### 3.5 Display Hooks
- [ ] **Hook Management**
  - List of available hooks (e.g., displayFooterProduct)
  - Block list per hook

- [ ] **Block Management**
  - Add new block to hook
  - Select block type (e.g., "Products from same category", "Recently viewed")
  - Block-specific settings
  - Drag-and-drop block ordering

---

## 4. Settings

### 4.1 General Settings
- [ ] **GeneralSettingsPage Component**
  - Shop name
  - Shop logo
  - Contact information (address, phone, email)

### 4.2 Administration Settings
- [ ] **AdministrationSettingsPage Component**
  - Site URL field
  - File size limits:
    - Attached files (MB)
    - Downloadable products (MB)
    - Product images (MB)
  - Notification toggles (new orders, customers, messages)

### 4.3 Image Settings
- [ ] **ImageSettingsPage Component**
  - Table of image types (small_default, large_default, category_default)
  - Width, height, and resize method (Scale/Crop) per type
  - "Regenerate all images" button with warning

---

## 5. Tools

### 5.1 Shipping Calculator
- [ ] **ShippingCalculator Component**
  - Input form:
    - Package weight (kg)
    - Order amount (BGN)
    - Calculate button
  - Results display:
    - Card per active courier
    - Price to address
    - Price to office (if available)
    - Pallet delivery price (if weight exceeds threshold)

### 5.2 Stock Update Tool
- [ ] **Multi-step Process**
  - Step 1: Upload (.xlsx or .xls file)
  - Step 2: Column mapping
    - SKU (required)
    - Price with VAT
    - Total quantity
    - Quantity per warehouse
  - Step 3: Review
    - Products to be updated (old -> new)
    - Products not found in system
    - Products with no changes
    - "Confirm and Update" button

---

## Legend
- [x] Completed
- [ ] Pending

---

## Notes

### Completed Items (7)
1. **Suppliers CRUD** - Full supplier management with contact information and default supplier functionality
2. **Warehouses CRUD** - Complete warehouse management with all required fields (name, address, phone, workingHours, url, latitude, longitude, isPhysicalStore, status)
3. **Brands CRUD** - Complete brand management with logo upload, WYSIWYG description, and SEO fields
4. **Attributes CRUD** - Full attribute group and value management with display types (dropdown, radio, color with HEX/texture image), reordering, and image priority over HEX color
5. **Categories CRUD** - Hierarchical category management with tree view, expand/collapse, parent selection, image upload, and SEO fields (meta title, meta description, slug). Includes cascade delete for child categories
6. **Features CRUD** - Feature group management with predefined values, used for product specifications and filtering (information-only, no combinations)
7. **Quantity Update Module** - Excel import module for bulk updating product prices and warehouse inventory with template management, column mapping, UUID validation, and batch processing (100 rows per batch)

### Development Priorities
1. **High Priority**: Products, Categories, Orders (core e-commerce functionality)
2. **Medium Priority**: Customers, Couriers, Attributes, Features, Brands
3. **Lower Priority**: SEO tools, Display Hooks, Advanced settings

### Key Dependencies
- Products module depends on: Categories, Attributes, Features, Brands, Suppliers, Warehouses
- Orders module depends on: Customers, Couriers, Courier Offices, Statuses
- Faceted Navigation depends on: Attributes, Features, Brands
- Smart Filters depend on: Categories, Brands, Features

---

*Last updated: 2025-11-10 (Quantity Update Module completed and deployed to production)*
