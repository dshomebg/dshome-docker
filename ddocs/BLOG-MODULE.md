# Blog Module Documentation

**Дата на създаване:** 2025-11-15
**Статус:** ✅ Production Ready

---

## Преглед

Blog модулът е пълнофункционална система за управление на блог съдържание в DSHome e-commerce платформата. Предоставя CRUD операции за категории, автори и постове, с вграден WYSIWYG editor, автоматична транслитерация и SEO оптимизация.

### Ключови Функции

- ✅ **Йерархични категории** - Parent/child структура за организация
- ✅ **Автори** - Профили с биография, снимка и социални мрежи
- ✅ **Постове** - Пълна функционалност с draft/published/archived статуси
- ✅ **WYSIWYG Editor** - Rich text editor с HTML view
- ✅ **Автоматична транслитерация** - Кирилица → Латиница за URL slugs
- ✅ **Image Upload** - Drag & drop с crop функционалност
- ✅ **SEO оптимизация** - Meta tags, canonical URLs, robots control
- ✅ **Статистики** - View tracking и analytics dashboard
- ✅ **Search** - Full-text search в всички модули

---

## Database Schema

### Blog Categories (`blog_categories`)

```sql
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,                    -- WYSIWYG content
  image VARCHAR(500),                  -- URL към изображение
  parent_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,          -- За сортиране
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'inactive'

  -- SEO Fields
  meta_title VARCHAR(255),
  meta_description TEXT,
  canonical_url VARCHAR(500),
  robots_index BOOLEAN DEFAULT true,
  robots_follow BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blog_categories_parent ON blog_categories(parent_id);
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_categories_status ON blog_categories(status);
```

**Полета:**
- `parent_id` - Null за root категории, UUID за подкатегории
- `position` - Число за custom сортиране (lower = higher priority)
- `status` - Active категории се показват на frontend

### Blog Authors (`blog_authors`)

```sql
CREATE TABLE blog_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  bio TEXT,                           -- WYSIWYG content
  image VARCHAR(500),                 -- URL към профилна снимка

  -- Social Links
  facebook_link VARCHAR(500),
  instagram_link VARCHAR(500),
  youtube_link VARCHAR(500),
  linkedin_link VARCHAR(500),
  website_link VARCHAR(500),

  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'inactive'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blog_authors_slug ON blog_authors(slug);
CREATE INDEX idx_blog_authors_status ON blog_authors(status);
```

**Полета:**
- `bio` - Rich text биография на автора
- Социалните линкове са опционални

### Blog Posts (`blog_posts`)

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  excerpt TEXT,                         -- WYSIWYG кратко описание
  content TEXT NOT NULL,                -- WYSIWYG пълно съдържание
  featured_image VARCHAR(500),          -- URL към главна снимка

  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES blog_authors(id) ON DELETE SET NULL,

  status VARCHAR(20) DEFAULT 'draft',   -- 'draft' | 'published' | 'archived'
  published_at TIMESTAMP,               -- Дата на публикуване
  views_count INTEGER DEFAULT 0,        -- Брой преглеждания

  -- SEO Fields
  meta_title VARCHAR(255),
  meta_description TEXT,
  canonical_url VARCHAR(500),
  robots_index BOOLEAN DEFAULT true,
  robots_follow BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at);
```

**Полета:**
- `excerpt` - Показва се в listing pages
- `published_at` - Auto-set при промяна на статус от draft → published
- `views_count` - Инкрементира се при всяко преглеждане

### Blog Post Views (`blog_post_views`)

```sql
CREATE TABLE blog_post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),               -- IPv4 или IPv6
  user_agent TEXT,                      -- Browser/device info
  viewed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blog_post_views_post ON blog_post_views(post_id);
CREATE INDEX idx_blog_post_views_date ON blog_post_views(viewed_at);
```

**Използване:**
- Проследяване на уникални и общи преглеждания
- Analytics и статистика
- Популярни постове (ORDER BY views_count DESC)

---

## API Endpoints

### Blog Categories

#### `GET /api/blog/categories`
Списък с всички категории с pagination и филтри.

**Query Parameters:**
```typescript
{
  status?: 'active' | 'inactive',  // Филтър по статус
  parentId?: string,               // Филтър по parent (или 'null' за root)
  search?: string,                 // Търсене в име и slug
  page?: number,                   // Страница (default: 1)
  limit?: number                   // Резултати на страница (default: 20)
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Технологии",
      "slug": "tehnologii",
      "description": "<p>Категория за технологични постове</p>",
      "image": "https://...",
      "parentId": null,
      "position": 1,
      "status": "active",
      "createdAt": "2025-11-15T10:00:00.000Z",
      "updatedAt": "2025-11-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

#### `GET /api/blog/categories/tree`
Йерархична структура на категориите (за navigation, dropdowns).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Технологии",
      "slug": "tehnologii",
      "children": [
        {
          "id": "uuid2",
          "name": "AI & ML",
          "slug": "ai-ml",
          "children": []
        }
      ]
    }
  ]
}
```

#### `GET /api/blog/categories/:id`
Детайли за конкретна категория.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Технологии",
    "slug": "tehnologii",
    "description": "<p>...</p>",
    "image": "https://...",
    "parentId": null,
    "position": 1,
    "status": "active",
    "metaTitle": "Технологии - DSHome Blog",
    "metaDescription": "Най-новите технологични новини",
    "canonicalUrl": null,
    "robotsIndex": true,
    "robotsFollow": true,
    "createdAt": "2025-11-15T10:00:00.000Z",
    "updatedAt": "2025-11-15T10:00:00.000Z"
  }
}
```

#### `POST /api/blog/categories`
Създаване на нова категория.

**Request Body:**
```json
{
  "name": "Нова Категория",
  "slug": "nova-kategoriya",
  "description": "<p>Описание</p>",
  "image": "https://...",
  "parentId": "uuid",  // optional
  "position": 1,
  "status": "active",
  "metaTitle": "...",
  "metaDescription": "...",
  "robotsIndex": true,
  "robotsFollow": true
}
```

#### `PUT /api/blog/categories/:id`
Редактиране на категория.

**Request Body:** Same as POST

#### `DELETE /api/blog/categories/:id`
Изтриване на категория.

**Важно:** Cascade delete на подкатегории! Постовете остават с `categoryId = null`.

---

### Blog Authors

#### `GET /api/blog/authors`
**Query Params:** `status`, `search`, `page`, `limit`

#### `GET /api/blog/authors/:id`
Детайли за автор.

#### `POST /api/blog/authors`
**Request Body:**
```json
{
  "name": "Иван Иванов",
  "slug": "ivan-ivanov",
  "bio": "<p>Биография...</p>",
  "image": "https://...",
  "facebookLink": "https://facebook.com/...",
  "instagramLink": "https://instagram.com/...",
  "youtubeLink": "https://youtube.com/...",
  "linkedinLink": "https://linkedin.com/...",
  "websiteLink": "https://...",
  "status": "active"
}
```

#### `PUT /api/blog/authors/:id`
Редактиране на автор.

#### `DELETE /api/blog/authors/:id`
Изтриване на автор (постовете остават с `authorId = null`).

---

### Blog Posts

#### `GET /api/blog/posts`
**Query Params:**
- `status`: 'draft' | 'published' | 'archived'
- `categoryId`: UUID
- `authorId`: UUID
- `search`: string
- `page`, `limit`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "post": {
        "id": "uuid",
        "title": "Заглавие",
        "slug": "zaglavie",
        "excerpt": "<p>...</p>",
        "content": "<p>...</p>",
        "featuredImage": "https://...",
        "categoryId": "uuid",
        "authorId": "uuid",
        "status": "published",
        "publishedAt": "2025-11-15T10:00:00.000Z",
        "viewsCount": 150,
        "createdAt": "...",
        "updatedAt": "..."
      },
      "category": {
        "id": "uuid",
        "name": "Технологии",
        "slug": "tehnologii"
      },
      "author": {
        "id": "uuid",
        "name": "Иван Иванов",
        "slug": "ivan-ivanov"
      }
    }
  ],
  "pagination": {...}
}
```

#### `GET /api/blog/posts/stats`
Статистики за блога.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPosts": 50,
    "publishedPosts": 35,
    "draftPosts": 15,
    "totalCategories": 8,
    "totalAuthors": 5,
    "totalViews": 12450,
    "popularPosts": [
      {
        "post": {...},  // BlogPostWithRelations
        "viewsCount": 500
      }
    ],
    "recentPosts": [...]  // BlogPostWithRelations[]
  }
}
```

#### `GET /api/blog/posts/:id`
Детайли за пост (включва category и author).

#### `POST /api/blog/posts`
Създаване на пост.

**Request Body:**
```json
{
  "title": "Заглавие",
  "slug": "zaglavie",
  "excerpt": "<p>Кратко описание</p>",
  "content": "<p>Пълно съдържание</p>",
  "featuredImage": "https://...",
  "categoryId": "uuid",
  "authorId": "uuid",
  "status": "draft",
  "publishedAt": "2025-11-15T10:00:00.000Z",  // optional
  "metaTitle": "...",
  "metaDescription": "...",
  "canonicalUrl": null,
  "robotsIndex": true,
  "robotsFollow": true
}
```

#### `PUT /api/blog/posts/:id`
Редактиране на пост.

#### `DELETE /api/blog/posts/:id`
Изтриване на пост.

#### `POST /api/blog/posts/:id/view`
Записване на преглеждане (за статистика).

**Request Body:**
```json
{
  "ipAddress": "192.168.1.1",  // optional
  "userAgent": "Mozilla/5.0 ..."  // optional
}
```

---

## Admin Panel

### Страници

#### 1. Blog Categories (`/admin/blog/categories`)

**Функции:**
- Списък с всички категории
- Search по име и slug
- Показва: име, slug, статус, позиция
- Бутон "Нова Категория"
- Link "Редактирай" за всяка категория

**Screenshot:**
```
┌─────────────────────────────────────────────────┐
│ Blog Категории              [+ Нова Категория] │
├─────────────────────────────────────────────────┤
│ Търсене: [_________________]                   │
├──────────┬────────┬─────────┬────────┬─────────┤
│ Име      │ Slug   │ Статус  │ Позиция│ Действия│
├──────────┼────────┼─────────┼────────┼─────────┤
│ Технолог.│tehnolo.│ Активна │   1    │Редактир.│
│ Lifestyle│lifesty.│ Активна │   2    │Редактир.│
└──────────┴────────┴─────────┴────────┴─────────┘
```

#### 2. Blog Category Form (`/admin/blog/categories/:id`)

**Секции:**

**Основна Информация:**
- Име * (text input)
- Slug * (text input + "Генерирай" бутон за авто-транслитерация)
- Описание (WYSIWYG editor - TiptapEditor)
- Изображение (ImageUpload с crop)
- Родителска категория (dropdown със йерархична структура)
- Позиция (number input)
- Статус (Active/Inactive dropdown)

**SEO:**
- Meta Title (text input, max 255)
- Meta Description (textarea)
- Robots Index (checkbox)
- Robots Follow (checkbox)

**Бутони:**
- Запази (създава/update-ва категория)
- Отказ (връща към списък)

#### 3. Blog Authors (`/admin/blog/authors`)

Подобен layout като categories, показва име, slug, статус.

#### 4. Blog Author Form (`/admin/blog/authors/:id`)

**Секции:**

**Основна Информация:**
- Име *
- Slug * (с "Генерирай" бутон)
- Биография (WYSIWYG)
- Изображение (ImageUpload)
- Статус

**Социални Мрежи:**
- Facebook Link (URL input)
- Instagram Link
- YouTube Link
- LinkedIn Link
- Website Link

#### 5. Blog Posts (`/admin/blog/posts`)

**Функции:**
- Списък с всички постове
- Search по заглавие, slug, excerpt
- Показва: заглавие, категория, автор, статус, преглеждания
- Бутони: "Статистики", "Нов Пост"

#### 6. Blog Post Form (`/admin/blog/posts/:id`)

**Секции:**

**Основна Информация:**
- Заглавие *
- Slug * (с "Генерирай")
- Кратко описание (WYSIWYG - excerpt)
- Съдържание * (WYSIWYG - content)
- Главно изображение (ImageUpload)
- Категория (dropdown)
- Автор (dropdown)
- Статус (Draft/Published/Archived)
- Дата на публикуване (datetime-local input)

**SEO:**
- Meta Title
- Meta Description
- Robots Index
- Robots Follow

#### 7. Blog Statistics (`/admin/blog/stats`)

**Секции:**

**Overview Cards:**
- Общо Постове (публикувани + чернови)
- Общо Категории (с link към управление)
- Общо Автори (с link към управление)
- Общо Преглеждания

**Най-Популярни Постове:**
Таблица със:
- Заглавие (link към edit)
- Категория
- Автор
- Преглеждания

**Последни Постове:**
Таблица със:
- Заглавие (link към edit)
- Категория
- Автор
- Статус (badge с цвят)
- Създаден (дата)

---

## UI Components

### TiptapEditor

**Файл:** `packages/admin/components/editor/TiptapEditor.tsx`

**Features:**
- WYSIWYG rich text editing
- Formatting: Headings (H1-H6), Bold, Italic, Underline
- Lists: Bullet list, Numbered list
- Alignment: Left, Center, Right
- Links
- HTML View toggle за ръчно редактиране

**Usage:**
```tsx
import TiptapEditor from "@/components/editor/TiptapEditor";

<TiptapEditor
  content={formData.description}
  onChange={(html) => setFormData({ ...formData, description: html })}
  placeholder="Въведете описание..."
/>
```

**Props:**
```typescript
interface TiptapEditorProps {
  content: string;           // HTML string
  onChange: (html: string) => void;
  placeholder?: string;
}
```

### ImageUpload

**Файл:** `packages/admin/components/ui/ImageUpload.tsx`

**Features:**
- Drag & drop upload
- Click to select file
- Image preview
- Crop/Edit functionality (ImageEditor integration)
- Automatic upload to server
- Progress indicator
- Remove uploaded image

**Usage:**
```tsx
import ImageUpload from "@/components/ui/ImageUpload";

<ImageUpload
  value={formData.image}
  onChange={(url) => setFormData({ ...formData, image: url })}
  onRemove={() => setFormData({ ...formData, image: "" })}
/>
```

**Props:**
```typescript
interface ImageUploadProps {
  value: string;                    // Current image URL
  onChange: (url: string) => void;  // Callback with new URL
  onRemove: () => void;             // Callback when removed
}
```

**Image Processing:**
- Upload endpoint: `/api/upload/image`
- Auto-resize to configured dimensions
- Stored in `/uploads/blog/` directory
- Returns public URL

---

## Transliteration

**Файл:** `packages/admin/lib/utils/transliterate.ts`

### Mapping

Българска Кирилица → Латиница:

```typescript
const transliterationMap = {
  // Lowercase
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
  'е': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y',
  'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
  'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
  'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya',

  // Uppercase
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D',
  'Е': 'E', 'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y',
  'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
  'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh',
  'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y', 'Ю': 'Yu', 'Я': 'Ya'
};
```

### Functions

#### `transliterate(text: string): string`
Transliterate Cyrillic to Latin.

```typescript
transliterate("Технологии и Новини")
// → "Tehnologii i Novini"
```

#### `generateSlug(text: string): string`
Generate URL-friendly slug.

```typescript
generateSlug("Технологии и Новини")
// → "tehnologii-i-novini"

generateSlug("SEO Tips & Tricks!")
// → "seo-tips-tricks"
```

**Process:**
1. Transliterate Cyrillic → Latin
2. Convert to lowercase
3. Remove special characters (keep a-z, 0-9, spaces, hyphens)
4. Replace spaces with hyphens
5. Replace multiple hyphens with single
6. Trim leading/trailing hyphens

---

## SEO Configuration

### URL Structure

Конфигурирано в **Модули → SEO**:

**Blog Категории:**
```
Pattern: /blog/{category-slug}
Example: /blog/tehnologii
```

**Blog Постове:**
```
Pattern: /blog/{category-slug}/{post-slug}
Example: /blog/tehnologii/novini-za-ai
```

### Meta Tags

Auto-generated ако не са custom:

```html
<!-- Category -->
<title>Технологии - DSHome Blog</title>
<meta name="description" content="Най-новите технологични новини и статии">
<link rel="canonical" href="https://dshome.dev/blog/tehnologii">
<meta name="robots" content="index, follow">

<!-- Post -->
<title>Новини за AI - DSHome Blog</title>
<meta name="description" content="Последните новини в света на AI">
<link rel="canonical" href="https://dshome.dev/blog/tehnologii/novini-za-ai">
<meta name="robots" content="index, follow">
```

### OpenGraph Tags

```html
<meta property="og:type" content="article">
<meta property="og:title" content="Новини за AI">
<meta property="og:description" content="...">
<meta property="og:image" content="https://dshome.dev/uploads/blog/featured.jpg">
<meta property="og:url" content="https://dshome.dev/blog/tehnologii/novini-za-ai">

<meta property="article:published_time" content="2025-11-15T10:00:00Z">
<meta property="article:author" content="Иван Иванов">
<meta property="article:section" content="Технологии">
```

---

## Best Practices

### Slug Generation

1. **Винаги използвай "Генерирай" бутон** за автоматична транслитерация
2. Slugs трябва да са уникални
3. Използвай kebab-case (с тирета)
4. Избягвай специални символи

**Добри slugs:**
- `tehnologii-i-novini`
- `seo-tips-2025`
- `programirane-za-nachinayushti`

**Лоши slugs:**
- `Технологии и Новини` (не е транслитериран)
- `seo_tips_2025` (underscore вместо dash)
- `SEO-TIPS!!!` (uppercase, специални символи)

### Content Writing

1. **Excerpt:**
   - 1-2 изречения
   - 150-200 символа
   - Кратко обобщение на поста

2. **Content:**
   - Структуриран с headings (H2, H3)
   - Параграфи с 3-4 изречения
   - Използвай lists за enumeration
   - Добави links към related content

3. **Images:**
   - Featured image: 1200x630px (OpenGraph standard)
   - Inline images: 800-1200px wide
   - Alt text за accessibility

### SEO Optimization

1. **Meta Title:**
   - 50-60 символа
   - Включи ключова дума
   - Format: `{Post Title} - {Category} | DSHome`

2. **Meta Description:**
   - 150-160 символа
   - Summarize съдържанието
   - Include call-to-action

3. **Headings:**
   - Едно H1 (title)
   - Multiple H2 (sections)
   - H3 за subsections

4. **Internal Linking:**
   - Link към related posts
   - Link към product pages
   - Link към category pages

### Publishing Workflow

1. **Draft → Review:**
   - Създай пост със статус "Draft"
   - Попълни всички полета
   - Preview в staging environment

2. **Review → Published:**
   - Провери spelling/grammar
   - Optimize images
   - Verify links
   - Set publishedAt date
   - Change status to "Published"

3. **Monitoring:**
   - Проверявай статистиките
   - Track views и engagement
   - Update старо съдържание

---

## Common Tasks

### Създаване на Нова Категория

1. Отиди на `/admin/blog/categories`
2. Натисни "Нова Категория"
3. Попълни име (напр. "Технологии")
4. Натисни "Генерирай" за slug
5. Добави описание (WYSIWYG)
6. Upload изображение
7. Избери parent category (опционално)
8. Set position (за сортиране)
9. Попълни SEO fields
10. Натисни "Запази"

### Създаване на Нов Пост

1. Отиди на `/admin/blog/posts`
2. Натисни "Нов Пост"
3. Попълни заглавие
4. Генерирай slug
5. Напиши excerpt (кратко описание)
6. Напиши content (пълно съдържание)
7. Upload featured image
8. Избери категория
9. Избери автор
10. Set статус (Draft/Published)
11. Попълни SEO fields
12. Натисни "Запази"

### Преглед на Статистики

1. Отиди на `/admin/blog/posts`
2. Натисни "Статистики"
3. Виж overview metrics
4. Прегледай популярни постове
5. Check скорошни постове

---

## Frontend Integration

### Public Pages (TODO)

Следващите public pages трябва да се имплементират във `packages/frontend`:

#### 1. Blog Home (`/blog`)
- List на скорошни постове
- Featured posts
- Categories sidebar
- Search

#### 2. Category Page (`/blog/{category}`)
- List на постове в категорията
- Breadcrumbs
- SEO meta tags

#### 3. Post Page (`/blog/{category}/{slug}`)
- Full post content
- Author info
- Related posts
- Social sharing
- Comments (future)
- View tracking (call POST /api/blog/posts/:id/view)

#### 4. Author Page (`/authors/{slug}`)
- Author bio
- Author posts list
- Social links

### Example Frontend Component

```tsx
// PostList.tsx
import { useEffect, useState } from 'react';
import { blogApi } from '@/lib/api/blog';

export function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    blogApi.getPosts({ status: 'published', limit: 10 })
      .then(res => setPosts(res.data));
  }, []);

  return (
    <div className="post-list">
      {posts.map(({ post, category, author }) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: post.excerpt }} />
          <p>By {author?.name} in {category?.name}</p>
          <a href={`/blog/${category?.slug}/${post.slug}`}>Read more</a>
        </article>
      ))}
    </div>
  );
}
```

---

## Troubleshooting

### Problem: Slug не се генерира

**Причина:** `handleGenerateSlug` не се извиква или името е празно.

**Решение:**
1. Попълни името първо
2. Натисни "Генерирай" бутон
3. Провери дали бутонът извиква `handleGenerateSlug`, не директно `generateSlug`

### Problem: WYSIWYG editor не показва toolbar

**Причина:** TiptapEditor не се зарежда правилно.

**Решение:**
1. Провери browser console за errors
2. Refresh страницата
3. Clear browser cache

### Problem: Image upload fails

**Причина:** Upload directory permissions или backend не работи.

**Решение:**
1. Провери backend logs
2. Verify `/uploads/blog/` directory съществува и е writable
3. Check network tab за error response

### Problem: URLs не включват /admin prefix

**Причина:** Използва се `window.location.href` вместо `router.push()`.

**Решение:**
1. Винаги използвай `router.push()` от `next/navigation`
2. Next.js автоматично добавя basePath
3. Никога не hardcode `/admin` в пътищата

### Problem: TypeScript errors при build

**Причина:** Type mismatches в форми или controllers.

**Решение:**
1. Провери че използваш правилните enum types (`"active" | "inactive"`)
2. Използвай `BlogStatistics` от `@dshome/shared`
3. Cast status values към enum types, не към `string`

---

## Future Enhancements

### Phase 1 (Planned)
- [ ] Comments system
- [ ] Tags functionality
- [ ] Related posts algorithm
- [ ] Social sharing buttons

### Phase 2 (Future)
- [ ] Multi-language support
- [ ] Rich media embeds (YouTube, Twitter)
- [ ] Advanced analytics (bounce rate, time on page)
- [ ] Email notifications for new posts
- [ ] RSS feed generation

### Phase 3 (Nice to Have)
- [ ] AI-powered content suggestions
- [ ] Automatic image optimization
- [ ] A/B testing for titles
- [ ] Newsletter integration

---

## Maintenance

### Regular Tasks

**Weekly:**
- Review new posts for quality
- Check статистики за trending content
- Update старо съдържание

**Monthly:**
- Backup database
- Archive old draft posts
- Optimize images
- Review SEO performance

**Quarterly:**
- Audit категория structure
- Remove inactive authors
- Update social links
- Content strategy review

---

## Support

**Issues & Bugs:**
Съобщи в GitHub или direct contact.

**Documentation:**
- [CHANGELOG-2025-11-15.md](./start/CHANGELOG-2025-11-15.md)
- [DEVELOPMENT-ROADMAP.md](./DEVELOPMENT-ROADMAP.md)
- [ARCHITECTURE.md](./start/ARCHITECTURE.md)

**API Reference:**
Вж. API Endpoints секцията в този документ.

---

**Last Updated:** 2025-11-15
**Version:** 1.0.0
**Status:** ✅ Production Ready
