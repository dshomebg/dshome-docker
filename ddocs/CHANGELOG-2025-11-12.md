# Changelog - 2025-11-12

## Завършени модули

### ✅ Customers Module (Клиенти)
- Database schema: `customers` table
- Backend API: `/api/customers` with CRUD + change password
- Admin UI: List, Create, Edit, Delete
- Features: Active/Inactive toggle, password management, admin notes

### ✅ Couriers Module (Куриери)
- Database schema: `couriers` + `courier_pricing_ranges` tables
- Backend API: `/api/couriers` with CRUD + delivery price calculator
- Admin UI: List, Create, Edit with compact design
- Features:
  - Logo upload (ImageUpload component)
  - Tracking URL
  - Standard delivery with weight-based pricing ranges
  - Office delivery option (separate pricing)
  - Pallet delivery with threshold calculation
  - Auto-populate "from" field in pricing ranges
  - Delivery type tabs (Address / Office)

### ✅ Email Templates Module (Email шаблони)
- Database schema: `email_templates` table
- Backend API: `/api/design/email-templates` with CRUD + variables endpoint
- Admin UI: Grid layout, Create, Edit
- Features:
  - WYSIWYG editor (Tiptap)
  - Variable insertion dropdown (17 predefined variables)
  - HTML view toggle
  - Subject field with variable support

### ✅ Order Statuses Module (Статуси)
- Database schema: `order_statuses` table
- Backend API: `/api/order-statuses` with CRUD
- Admin UI: Table layout, Create, Edit
- Features:
  - HEX color picker (visual preview + native picker + manual input)
  - "Visible to customer" toggle
  - "Send email" toggle
  - Conditional email template dropdown
  - Email template validation

## Technical Changes

### Backend
- Created 4 new database schemas
- Created 4 new controllers with full CRUD operations
- Created 4 new route files
- Registered routes in `routes/index.ts`
- All using TypeScript with proper type inference from Drizzle
- All prices in EUR currency
- All migrations pushed with `docker exec dshome-backend-dev npm run db:push`

### Frontend
- Created 4 new service files in `lib/services/`
- Created 4 new page directories with components
- All using compact design pattern (smaller spacing, text sizes)
- All forms with proper validation
- Created `TiptapEditorWithVariables` component (enhanced version)
- Reused `ImageUpload` component for logo uploads
- Updated Sidebar menu with new links

### Docker
- Fixed missing bind mounts in `docker-compose.dev.yml`:
  - Added `lib` directory mount
  - Added `components` directory mount
- Backend and Admin containers restarted successfully

### Documentation
- Created `SALES-MODULES-IMPLEMENTATION.md` - detailed implementation summary
- Updated `DEVELOPMENT-ROADMAP.md` - marked modules as completed
- Updated `ARCHITECTURE.md` - added new tables and API endpoints
- Created this changelog

## Design Patterns Established

### Compact Design System
All Sales modules follow this pattern:
- Form spacing: `space-y-4` (not `space-y-6`)
- Section padding: `p-4` (not `p-6`)
- Headings: `text-base` (not `text-lg`)
- Labels: `text-xs font-medium`
- Inputs: `px-3 py-1.5 text-sm`
- Buttons: `px-3 py-1.5 text-xs` with `h-3.5 w-3.5` icons
- Toggle switches: `h-5 w-9` with `h-3.5 w-3.5` inner circle

### File Structure
```
Backend:
  db/schema/{module}.ts
  controllers/{module}.controller.ts
  routes/{module}.routes.ts

Frontend:
  lib/services/{module}.service.ts
  app/(dashboard)/{section}/{module}/
    page.tsx
    {Component}.tsx
    new/page.tsx
    [id]/page.tsx
```

## Fixes Applied

### Issue: Module resolution error for customers.service
- **Cause:** `lib` directory not bind-mounted in docker-compose.dev.yml
- **Fix:** Added volume mount for `lib` directory
- **Result:** Module resolved successfully

### Issue: Deploy script path error
- **Cause:** Script looking for docker-compose.prod.yml in wrong directory
- **Fix:** Changed path to `../docker-compose.prod.yml`
- **Result:** Deployment successful

### Issue: TypeScript compilation error in customers.routes.ts
- **Cause:** Missing explicit Router type annotation
- **Fix:** Changed `const router = Router()` to `const router: Router = Router()`
- **Result:** Build successful

### Issue: Module resolution error for TiptapEditorWithVariables
- **Cause:** `components` directory not bind-mounted
- **Fix:** Added volume mount for `components` directory
- **Result:** Module resolved successfully

### Issue: Table "order_statuses" does not exist
- **Cause:** Database migration not run after schema creation
- **Fix:** Ran `docker exec dshome-backend-dev npm run db:push`
- **Result:** Table created successfully

## Deployment Status

- ✅ All modules tested locally
- ✅ Backend container restarted
- ✅ Admin container restarted
- ✅ Database migrations applied
- ⏳ Ready for production deployment

## Next Steps

1. Deploy to production server
2. Test all modules in production
3. Start Orders module implementation
4. Add customer addresses (if needed)
5. Prepare for PrestaShop migration

## Time Spent

~1 day of work for 4 complete modules:
- Customers: ~2-3 hours
- Couriers: ~2-3 hours
- Email Templates: ~2 hours
- Order Statuses: ~1-2 hours

**Total:** 4 fully functional modules with backend + frontend + database in one day! 🚀
