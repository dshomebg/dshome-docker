# Image Deletion System Fixes

## Обобщение

Решени са критични проблеми в системата за управление на изображения, свързани с изтриване на снимки, дублиране при качване и синхронизация между база данни и файлова система.

## Проблеми и Решения

### 1. Изтритите снимки се връщат след refresh
**Проблем**: При изтриване на последна снимка, в базата се записваше `images: undefined` вместо празен масив, което пропускаше логиката за изтриване.

**Решение**:
- Файл: `packages/admin/components/products/ProductForm.tsx` (ред 587)
- Винаги се подава масив: `images: newImages`
- Добавен `handleAutoSave` с директно подаване на новия масив

### 2. Липса на потвърждение при изтриване
**Проблем**: Не се показваше диалог за потвърждение преди изтриване на снимка.

**Решение**:
- Файл: `packages/admin/components/products/ProductImagesUpload.tsx` (ред 77)
- Добавен `window.confirm()` диалог на български език

### 3. Дублиране на снимки при едновременно качване
**Проблем**: При качване на 4 снимки едновременно, 3 излизаха еднакви защото `Date.now()` връщаше един и същ timestamp.

**Решение**:
- Файл: `packages/backend/src/services/image-processing.service.ts`
- Заменен `Date.now()` с `crypto.randomBytes(6).toString('hex')` за гарантирано уникални ID

### 4. Физическите файлове не се изтриват
**Проблем**: След изтриване на снимка от интерфейса, файловете оставаха в `uploads/products/`

**Решение**:
- Файл: `packages/backend/src/services/image-processing.service.ts` (редове 328-370)
- Добавени методи `deleteImageByUrl()` и `deleteImagesByUrls()`
- Изтриват се както генерираните WebP файлове, така и оригиналните JPG
- Файл: `packages/backend/src/controllers/products.controller.ts`
- Добавена логика за сравняване на стари и нови URL-и и изтриване на премахнатите

### 5. PostgreSQL syntax error при изтриване
**Проблем**: Грешка `syntax error at or near "$1"` при опит за изтриване.

**Решение**:
- Файл: `packages/backend/src/services/image-processing.service.ts` (редове 343-345)
- Поправен синтаксис на drizzle-orm `like()`:
```typescript
where: (fields, { like }) => like(fields.generatedPath, `%${uniqueId}%`)
```
- Поправено име на поле от `generatedFilename` на `generatedPath`

### 6. Сираци файлове без записи в базата
**Проблем**: Някои файлове се създаваха на диска, но не се записваха в базата когато четенето на метаданни (Sharp) се проваляше.

**Решение**:
- Файл: `packages/backend/src/services/image-processing.service.ts` (редове 280-289)
- Изолирано четене на метаданни в отделен `try-catch`
- Винаги се вмъква запис в базата, дори с `null` размери ако метаданните не могат да се прочетат

### 7. Оригиналните файлове не се изтриват
**Проблем**: След изтриване оставаха само оригиналните `.jpg` файлове, изтриваха се само `.webp`

**Решение**:
- Файл: `packages/backend/src/services/image-processing.service.ts` (редове 347-368)
- Добавена логика за изтриване на оригинални файлове
- Използван `Set<string>` за избягване на дублирано изтриване на споделени оригинали

### 8. Legacy upload режим при създаване на продукт
**Проблем**: При качване на снимки преди записване на нов продукт, не се използва multi-size системата.

**Решение**:
- Файл: `packages/admin/components/products/ProductForm.tsx` (редове 745-763)
- Блокиран upload компонент в create режим докато продуктът няма ID
- Показва се предупредително съобщение на потребителя

## Засегнати Файлове

### Backend
- `packages/backend/src/services/image-processing.service.ts` - основна логика за обработка и изтриване
- `packages/backend/src/controllers/products.controller.ts` - сравняване на стари/нови URL-и

### Admin Panel
- `packages/admin/components/products/ProductForm.tsx` - auto-save и блокиране на upload
- `packages/admin/components/products/ProductImagesUpload.tsx` - потвърждение и директно подаване на масив
- `packages/admin/app/(dashboard)/catalog/warehouses/new/page.tsx` - добавена "use client" директива

## Технически Подробности

### Уникално генериране на ID
```typescript
const uniqueId = crypto.randomBytes(6).toString('hex'); // вместо Date.now()
```

### Изтриване на физически файлове
```typescript
const deletedOriginals = new Set<string>();
for (const file of files) {
  // Изтриване на генериран файл
  if (file.generatedPath && fs.existsSync(file.generatedPath)) {
    fs.unlinkSync(file.generatedPath);
  }
  // Изтриване на оригинал (веднъж за уникален път)
  if (file.originalPath && !deletedOriginals.has(file.originalPath)) {
    fs.unlinkSync(file.originalPath);
    deletedOriginals.add(file.originalPath);
  }
}
```

### Auto-save с директно подаване на масив
```typescript
// Избягване на React state timing проблем
await onAutoSave(reorderedImages); // вместо onAutoSave()
```

## Commits
- `Fix image deletion: delete all files and block upload before product save`
- `Fix database insert when metadata read fails`

## Тестване

За тестване на пълната функционалност:
1. Създайте нов продукт (upload трябва да е блокиран)
2. Запазете продукта
3. Качете 4-5 снимки едновременно (трябва да са различни)
4. Изтрийте снимка (трябва да пита за потвърждение)
5. Refresh на страницата (снимката трябва да остане изтрита)
6. Проверете `packages/backend/uploads/products/` (всички файлове трябва да са изтрити)

## Известни Ограничения

- Next.js build грешки в development среда (може да работи на production сървър)
- Всички проблемни страници вече имат "use client" директива
