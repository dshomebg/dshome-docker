import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const seoSettings = pgTable('seo_settings', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Product URLs
  productUrlFormat: varchar('product_url_format', { length: 255 }).notNull().default('/{def-category-slug}/{product-slug}'),
  productUrlSuffix: varchar('product_url_suffix', { length: 50 }).notNull().default(''),

  // Category URLs
  categoryUrlFormat: varchar('category_url_format', { length: 255 }).notNull().default('/{category-slug}'),
  categoryUrlSuffix: varchar('category_url_suffix', { length: 50 }).notNull().default(''),

  // Brand URLs
  brandUrlFormat: varchar('brand_url_format', { length: 255 }).notNull().default('/{brand-slug}'),
  brandUrlSuffix: varchar('brand_url_suffix', { length: 50 }).notNull().default(''),

  // CMS Page URLs
  cmsUrlFormat: varchar('cms_url_format', { length: 255 }).notNull().default('/pages/{cms-category}/{cms-page-slug}'),
  cmsUrlSuffix: varchar('cms_url_suffix', { length: 50 }).notNull().default(''),

  // CMS Category URLs
  cmsCategoryUrlFormat: varchar('cms_category_url_format', { length: 255 }).notNull().default('/pages/{cms-category}'),
  cmsCategoryUrlSuffix: varchar('cms_category_url_suffix', { length: 50 }).notNull().default(''),

  // Blog Page URLs
  blogUrlFormat: varchar('blog_url_format', { length: 255 }).notNull().default('/blog/{blog-category}/{blog-page-slug}'),
  blogUrlSuffix: varchar('blog_url_suffix', { length: 50 }).notNull().default(''),

  // Blog Category URLs
  blogCategoryUrlFormat: varchar('blog_category_url_format', { length: 255 }).notNull().default('/blog/{blog-category}'),
  blogCategoryUrlSuffix: varchar('blog_category_url_suffix', { length: 50 }).notNull().default(''),

  // Canonical URLs
  canonicalEnabled: boolean('canonical_enabled').notNull().default(true),

  // Meta Tags for Products
  productMetaTitleTemplate: varchar('product_meta_title_template', { length: 255 }).notNull().default('{name} - {shop_name}'),
  productMetaDescriptionTemplate: varchar('product_meta_description_template', { length: 500 }).notNull().default('Купете {name} на страхотна цена от {shop_name}. {description}'),

  // Meta Tags for Categories
  categoryMetaTitleTemplate: varchar('category_meta_title_template', { length: 255 }).notNull().default('{name} - {shop_name}'),
  categoryMetaDescriptionTemplate: varchar('category_meta_description_template', { length: 500 }).notNull().default('Разгледайте нашата категория {name} в {shop_name}. {description}'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type SeoSettings = typeof seoSettings.$inferSelect;
export type NewSeoSettings = typeof seoSettings.$inferInsert;
