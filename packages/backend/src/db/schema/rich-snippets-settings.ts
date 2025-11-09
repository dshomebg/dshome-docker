import { pgTable, uuid, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core';

export const richSnippetsSettings = pgTable('rich_snippets_settings', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Organization Settings
  organizationEnabled: boolean('organization_enabled').notNull().default(true),
  organizationName: varchar('organization_name', { length: 255 }).notNull().default(''),
  organizationLogo: varchar('organization_logo', { length: 500 }).notNull().default(''),
  organizationType: varchar('organization_type', { length: 50 }).notNull().default('OnlineStore'),
  telephone: varchar('telephone', { length: 50 }).notNull().default(''),
  email: varchar('email', { length: 255 }).notNull().default(''),
  addressStreet: varchar('address_street', { length: 255 }).notNull().default(''),
  addressCity: varchar('address_city', { length: 100 }).notNull().default(''),
  addressPostalCode: varchar('address_postal_code', { length: 20 }).notNull().default(''),
  addressCountry: varchar('address_country', { length: 2 }).notNull().default('BG'),
  socialFacebook: varchar('social_facebook', { length: 500 }).notNull().default(''),
  socialInstagram: varchar('social_instagram', { length: 500 }).notNull().default(''),
  socialTwitter: varchar('social_twitter', { length: 500 }).notNull().default(''),

  // Product Snippets
  productSnippetsEnabled: boolean('product_snippets_enabled').notNull().default(true),
  productDescriptionType: varchar('product_description_type', { length: 20 }).notNull().default('short'), // 'short' | 'full'
  productIncludeSpecifications: boolean('product_include_specifications').notNull().default(true),
  productIncludePrice: boolean('product_include_price').notNull().default(true),
  productIncludeAvailability: boolean('product_include_availability').notNull().default(true),
  productIncludeSku: boolean('product_include_sku').notNull().default(true),
  productIncludeImages: boolean('product_include_images').notNull().default(true),
  productIncludeBrand: boolean('product_include_brand').notNull().default(true),
  defaultCurrency: varchar('default_currency', { length: 3 }).notNull().default('BGN'),

  // Breadcrumbs
  breadcrumbsEnabled: boolean('breadcrumbs_enabled').notNull().default(true),

  // Website Search
  websiteSearchEnabled: boolean('website_search_enabled').notNull().default(true),
  searchUrlPattern: varchar('search_url_pattern', { length: 255 }).notNull().default('/search?q={search_term_string}'),

  // Blog Snippets
  blogSnippetsEnabled: boolean('blog_snippets_enabled').notNull().default(true),
  defaultAuthorName: varchar('default_author_name', { length: 255 }).notNull().default(''),
  defaultAuthorImage: varchar('default_author_image', { length: 500 }).notNull().default(''),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type RichSnippetsSettings = typeof richSnippetsSettings.$inferSelect;
export type NewRichSnippetsSettings = typeof richSnippetsSettings.$inferInsert;
