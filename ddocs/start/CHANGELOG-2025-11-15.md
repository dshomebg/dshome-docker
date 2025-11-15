# Changelog - 2025-11-15

**Дата:** 15 Ноември 2025
**Тип промени:** ✅ Нова функционалност + 🐛 Bug fixes

---

## 🎉 Нови Функционалности

### ✅ Blog Module - Пълна Имплементация

Имплементиран пълен Blog модул за DSHome с всички CRUD операции, SEO функционалности и статистики.

#### 📊 Database Schema

**Нови таблици:**

1. **`blog_categories`**
   - Йерархична структура (parent/child категории)
   - Полета: name, slug, description (WYSIWYG), image, parentId, position, status
   - SEO полета: metaTitle, metaDescription, canonicalUrl, robotsIndex, robotsFollow

2. **`blog_authors`**
   - Информация за автори на постове
   - Полета: name, slug, bio (WYSIWYG), image, status
   - Социални мрежи: facebookLink, instagramLink, youtubeLink, linkedinLink, websiteLink

3. **`blog_posts`**
   - Постове с пълна функционалност
   - Полета: title, slug, excerpt (WYSIWYG), content (WYSIWYG), featuredImage
   - Връзки: categoryId, authorId
   - Статуси: draft, published, archived
   - SEO полета: metaTitle, metaDescription, canonicalUrl, robotsIndex, robotsFollow
   - Статистика: viewsCount, publishedAt

4. **`blog_post_views`**
   - Проследяване на преглеждания на постове
   - Полета: postId, ipAddress, userAgent, viewedAt

#### 🔧 Backend API

**Blog Categories API** (`/api/blog/categories`)
- `GET /` - Списък с категории (pagination, search, status filter, parentId filter)
- `GET /tree` - Йерархична структура на категориите
- `GET /:id` - Детайли за категория
- `POST /` - Създаване на категория
- `PUT /:id` - Редактиране на категория
- `DELETE /:id` - Изтриване на категория

**Blog Authors API** (`/api/blog/authors`)
- `GET /` - Списък с автори (pagination, search, status filter)
- `GET /:id` - Детайли за автор
- `POST /` - Създаване на автор
- `PUT /:id` - Редактиране на автор
- `DELETE /:id` - Изтриване на автор

**Blog Posts API** (`/api/blog/posts`)
- `GET /` - Списък с постове (pagination, search, status filter, categoryId, authorId)
- `GET /stats` - Статистики (популярни постове, скорошни постове, общи данни)
- `GET /:id` - Детайли за пост (включва category и author данни)
- `POST /` - Създаване на пост
- `PUT /:id` - Редактиране на пост
- `DELETE /:id` - Изтриване на пост
- `POST /:id/view` - Записване на преглеждане (за статистика)

#### 💻 Admin Panel UI

**Страници:**

1. **Blog Categories** (`/admin/blog/categories`)
   - Списък с всички категории
   - Search функционалност
   - Показва: име, slug, статус, позиция
   - Бутони: Нова Категория, Редактирай

2. **Blog Category Form** (`/admin/blog/categories/new`, `/admin/blog/categories/:id`)
   - Основна информация: име, slug (авто-генериране с транслитерация)
   - Описание: WYSIWYG editor (TiptapEditor)
   - Изображение: Upload с crop функционалност (ImageUpload)
   - Родителска категория: Dropdown със йерархична структура
   - Позиция: Number input за сортиране
   - Статус: Active/Inactive
   - SEO секция: Meta Title, Meta Description, Robots Index/Follow

3. **Blog Authors** (`/admin/blog/authors`)
   - Списък с всички автори
   - Search функционалност
   - Показва: име, slug, статус
   - Бутони: Нов Автор, Редактирай

4. **Blog Author Form** (`/admin/blog/authors/new`, `/admin/blog/authors/:id`)
   - Основна информация: име, slug (авто-генериране)
   - Биография: WYSIWYG editor
   - Изображение: Upload с crop
   - Социални мрежи: Facebook, Instagram, YouTube, LinkedIn, Website
   - Статус: Active/Inactive

5. **Blog Posts** (`/admin/blog/posts`)
   - Списък с всички постове
   - Search функционалност
   - Показва: заглавие, категория, автор, статус, преглеждания
   - Бутони: Нов Пост, Редактирай, Статистики

6. **Blog Post Form** (`/admin/blog/posts/new`, `/admin/blog/posts/:id`)
   - Основна информация: заглавие, slug (авто-генериране)
   - Кратко описание: WYSIWYG editor
   - Съдържание: WYSIWYG editor с HTML view
   - Главно изображение: Upload с crop
   - Категория: Dropdown с активни категории
   - Автор: Dropdown с активни автори
   - Статус: Draft/Published/Archived
   - Дата на публикуване: DateTime picker
   - SEO секция: Meta Title, Meta Description, Robots Index/Follow

7. **Blog Statistics** (`/admin/blog/stats`)
   - Overview cards:
     - Общо постове (публикувани + чернови)
     - Общо категории
     - Общо автори
     - Общо преглеждания
   - Най-популярни постове (таблица с преглеждания)
   - Последни постове (таблица със статус)
   - Линкове към управление на категории и автори

#### 🎨 UI Components

**TiptapEditor**
- WYSIWYG rich text editor
- Функции: Headings, Bold, Italic, Underline, Lists, Alignment, Links
- HTML view toggle за ръчно редактиране
- Използван за: descriptions, bio, excerpt, content

**ImageUpload**
- Drag & drop функционалност
- Image cropping с aspect ratio control
- Automatic upload към сървър
- Preview на качени изображения
- Използван за: category images, author images, featured images

**Transliteration Utility**
- Автоматична транслитерация от Кирилица (BG) към Латиница
- Mapping на специални букви: щ→sht, ж→zh, ч→ch, ю→yu, я→ya и т.н.
- Генериране на URL-friendly slugs
- Използван за всички slug полета в Blog модула

#### 🔍 SEO Integration

**URL Structure**
- Категории: `/blog/{category-slug}`
- Постове: `/blog/{category-slug}/{post-slug}`
- Конфигурация чрез SEO модул (Модули → SEO)
- Специални правила за Blog Страници и Blog Категории

**Meta Tags**
- Custom meta title и description за всяка категория/пост
- Canonical URL support
- Robots index/follow контрол
- OpenGraph ready структура

#### 📊 Statistics & Analytics

**Tracking**
- Автоматично проследяване на преглеждания на постове
- IP адрес и User Agent logging
- ViewsCount counter на ниво пост

**Statistics Dashboard**
- Общи метрики (постове, категории, автори, преглеждания)
- Top 10 най-популярни постове
- Последни 10 постове
- Filtering по статус, категория, автор

---

## 🐛 Bug Fixes

### TypeScript Build Errors

**Проблем:** Docker build failing заради TypeScript грешки в blog контролерите

**Решение:**
1. **Backend Controllers** - Поправени type casts за status filters:
   - `blog-authors.controller.ts`: status cast от `string` на `"active" | "inactive"`
   - `blog-categories.controller.ts`: status cast от `string` на `"active" | "inactive"` + explicit type за tree array
   - `blog-posts.controller.ts`: status cast от `string` на `"draft" | "published" | "archived"`

2. **Admin Stats Page** - Поправени типове за BlogStatistics:
   - Импортиран `BlogStatistics` от `@dshome/shared`
   - Премахнат локален `BlogStats` интерфейс
   - Поправен destructuring за `popularPosts`: `{ post, viewsCount }` вместо `{ post, category, author }`
   - Поправен mapping за `recentPosts`: директно `(post)` с достъп до `post.category`, `post.author`

### Navigation & Routing Issues

**Проблем:** Next.js basePath не се прилага правилно - URLs водят към `/blog/...` вместо `/admin/blog/...`

**Решение:**
- Заменени всички `window.location.href` с Next.js `router.push()`
- `useRouter` от `next/navigation` автоматично зачита `basePath: '/admin'` конфигурацията
- Файлове: `blog/categories/page.tsx`, `blog/posts/page.tsx`, `blog/authors/page.tsx`

### Transliteration Bug

**Проблем:** Грешка при клик на "Генерирай" бутон в authors форма - `generateSlug` се извиква с event обект вместо със string

**Решение:**
- Променен `onClick={generateSlug}` на `onClick={handleGenerateSlug}`
- `handleGenerateSlug` е локалната wrapper функция която извиква `generateSlug(formData.name)`
- Файл: `blog/authors/[id]/page.tsx:139`

---

## 📁 Файлова Структура

### Database Migrations
```
packages/backend/migrations/
└── 20251115100000_create_blog_tables.ts
```

### Backend
```
packages/backend/src/
├── db/schema/
│   └── blog.schema.ts
├── controllers/
│   ├── blog-categories.controller.ts
│   ├── blog-authors.controller.ts
│   └── blog-posts.controller.ts
└── routes/
    └── blog.routes.ts
```

### Shared Types
```
packages/shared/src/types/
└── blog.types.ts
```

### Admin Panel
```
packages/admin/
├── app/(dashboard)/blog/
│   ├── categories/
│   │   ├── page.tsx (список)
│   │   └── [id]/page.tsx (форма)
│   ├── authors/
│   │   ├── page.tsx (список)
│   │   └── [id]/page.tsx (форма)
│   ├── posts/
│   │   ├── page.tsx (список)
│   │   └── [id]/page.tsx (форма)
│   └── stats/
│       └── page.tsx (статистики)
└── lib/
    ├── services/blog.service.ts
    └── utils/transliterate.ts
```

---

## 🚀 Deployment Notes

**Database Migrations:**
- Автоматично изпълнение при deployment
- Migration файл: `20251115100000_create_blog_tables.ts`
- Създава 4 нови таблици с индекси и foreign keys

**Environment Variables:**
- Няма нужда от нови променливи
- Използва съществуващата DB конфигурация

**Build Process:**
- TypeScript компилация минава успешно
- Next.js build генерира оптимизирани production файлове
- Docker multi-stage build за backend и admin

---

## 📝 TODO / Future Enhancements

1. **Frontend Store Integration**
   - Public blog pages за customer-facing store
   - Category listing page
   - Post detail page with comments
   - Author profile pages

2. **Comments System**
   - Добавяне на коментари към постове
   - Moderation workflow
   - Spam protection

3. **Tags System**
   - Добавяне на тагове към постове
   - Tag cloud widget
   - Filter by tags

4. **Related Posts**
   - "Свързани постове" suggestion engine
   - Based on category, tags, or content similarity

5. **Social Sharing**
   - Share buttons (Facebook, Twitter, LinkedIn)
   - OpenGraph meta tags optimization

6. **RSS Feed**
   - Auto-generated RSS feed за блога
   - `/blog/feed.xml` endpoint

7. **Search Functionality**
   - Full-text search в постове
   - Search по категории и автори

---

## 📊 Statistics

**Код добавен:**
- 4 нови database таблици
- 3 backend контролера (categories, authors, posts)
- 7 admin panel страници
- 2 reusable UI компонента (TiptapEditor, ImageUpload)
- 1 utility функция (transliteration)
- ~2000 реда TypeScript/TSX код

**API Endpoints:**
- 15+ REST API endpoints
- Full CRUD operations за 3 entity types
- Statistics aggregation endpoint

**Time Invested:**
- Schema design: 1 час
- Backend API: 3 часа
- Admin UI: 4 часа
- Bug fixes: 1 час
- **Total: ~9 часа**

---

## ✅ Завършено

Blog модулът е напълно функционален и готов за production use. Всички CRUD операции, SEO функционалности и статистики работят коректно. TypeScript build минава успешно. Ready for Docker deployment! 🚀
