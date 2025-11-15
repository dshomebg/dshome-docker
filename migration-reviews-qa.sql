-- Migration: Add Reviews and Product Q&A modules
-- Date: 2025-11-14

-- Create ENUMs
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE question_status AS ENUM ('pending', 'approved');
CREATE TYPE answer_status AS ENUM ('pending', 'approved');

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Review content
  rating INTEGER NOT NULL,
  title VARCHAR(200),
  content TEXT NOT NULL,

  -- Reviewer info
  reviewer_name VARCHAR(255) NOT NULL,
  reviewer_email VARCHAR(255),

  -- Review metadata
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,

  -- Images
  images JSON DEFAULT '[]'::json,

  -- Helpful votes
  helpful_count INTEGER NOT NULL DEFAULT 0,
  not_helpful_count INTEGER NOT NULL DEFAULT 0,

  -- Store reply
  store_reply TEXT,
  store_reply_date TIMESTAMP,
  store_replied_by UUID,

  -- Status
  status review_status NOT NULL DEFAULT 'pending',

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Review helpful votes table
CREATE TABLE review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Product questions table
CREATE TABLE product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Question content
  question_text TEXT NOT NULL,

  -- Asker info
  asker_name VARCHAR(255) NOT NULL,
  asker_email VARCHAR(255) NOT NULL,

  -- Status
  status question_status NOT NULL DEFAULT 'pending',

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Product answers table
CREATE TABLE product_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES product_questions(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Answer content
  answer_text TEXT NOT NULL,

  -- Answerer info
  answerer_name VARCHAR(255) NOT NULL,
  answerer_email VARCHAR(255),

  -- Store official indicator
  is_store_official BOOLEAN NOT NULL DEFAULT false,

  -- Status
  status answer_status NOT NULL DEFAULT 'pending',

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Product Q&A settings table
CREATE TABLE product_qa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Moderation settings
  auto_approve_questions BOOLEAN NOT NULL DEFAULT false,
  auto_approve_customer_answers BOOLEAN NOT NULL DEFAULT false,

  -- Email template
  email_template_id UUID,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

CREATE INDEX idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);

CREATE INDEX idx_product_questions_product_id ON product_questions(product_id);
CREATE INDEX idx_product_questions_status ON product_questions(status);
CREATE INDEX idx_product_questions_created_at ON product_questions(created_at DESC);

CREATE INDEX idx_product_answers_question_id ON product_answers(question_id);
CREATE INDEX idx_product_answers_status ON product_answers(status);

-- Insert default Q&A settings
INSERT INTO product_qa_settings (auto_approve_questions, auto_approve_customer_answers)
VALUES (false, false);
