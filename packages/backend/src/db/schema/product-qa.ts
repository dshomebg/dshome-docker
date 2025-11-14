import { pgTable, uuid, varchar, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { products } from './products';
import { customers } from './customers';

export const questionStatusEnum = pgEnum('question_status', ['pending', 'approved']);
export const answerStatusEnum = pgEnum('answer_status', ['pending', 'approved']);

// Product Questions
export const productQuestions = pgTable('product_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }), // Nullable for guest questions

  // Question content
  questionText: text('question_text').notNull(),

  // Asker info (for guests)
  askerName: varchar('asker_name', { length: 255 }).notNull(),
  askerEmail: varchar('asker_email', { length: 255 }).notNull(), // Required for email notifications

  // Status
  status: questionStatusEnum('status').notNull().default('pending'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Product Answers
export const productAnswers = pgTable('product_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').notNull().references(() => productQuestions.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }), // Nullable for store official answers

  // Answer content
  answerText: text('answer_text').notNull(),

  // Answerer info
  answererName: varchar('answerer_name', { length: 255 }).notNull(),
  answererEmail: varchar('answerer_email', { length: 255 }),

  // Store official indicator
  isStoreOfficial: boolean('is_store_official').notNull().default(false), // true when admin answers

  // Status
  status: answerStatusEnum('status').notNull().default('pending'), // Customer answers need approval

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Q&A Settings (singleton table)
export const productQaSettings = pgTable('product_qa_settings', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Moderation settings
  autoApproveQuestions: boolean('auto_approve_questions').notNull().default(false),
  autoApproveCustomerAnswers: boolean('auto_approve_customer_answers').notNull().default(false),

  // Email notification template
  emailTemplateId: uuid('email_template_id'), // Reference to email_templates table

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});
