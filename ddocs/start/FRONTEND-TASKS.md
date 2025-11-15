# Frontend Implementation Tasks (an-front)

**Project:** DSHome E-commerce Frontend
**Date Created:** 2025-11-14
**Status:** Planning Phase

---

## Overview

This document outlines all tasks required to integrate the **an-front** Next.js template with the **dshome-docker** backend API. The frontend template has many pre-built pages and components that need to be connected to real backend data.

---

## 🎯 Priority 1: Critical Integration Tasks

### 1. API Infrastructure Setup

**Location:** `src/lib/`

#### 1.1 Create API Client
- [ ] Create `src/lib/api.ts` - Axios instance with base configuration
  - Base URL from environment variable
  - Request/response interceptors
  - Error handling
  - Authentication token management

#### 1.2 Create Service Layer
- [ ] `src/lib/services/products.service.ts`
  - getProducts() - list with filters, pagination
  - getProduct(id) - single product details
  - searchProducts(query)
  - getProductsByCategory(categoryId)
  - getProductsByBrand(brandId)

- [ ] `src/lib/services/categories.service.ts`
  - getCategories() - tree structure
  - getCategory(id)
  - getCategoryWithProducts(id)

- [ ] `src/lib/services/brands.service.ts`
  - getBrands()
  - getBrand(id)
  - getBrandWithProducts(id)

- [ ] `src/lib/services/reviews.service.ts`
  - getProductReviews(productId)
  - createReview(data)
  - voteHelpful(reviewId, isHelpful)

- [ ] `src/lib/services/product-qa.service.ts`
  - getProductQuestions(productId)
  - askQuestion(data)
  - addAnswer(questionId, data)

- [ ] `src/lib/services/cart.service.ts` (if backend cart)
  - getCart()
  - addToCart(productId, quantity)
  - updateCartItem(itemId, quantity)
  - removeFromCart(itemId)
  - clearCart()

- [ ] `src/lib/services/customers.service.ts`
  - register(data)
  - login(email, password)
  - getProfile()
  - updateProfile(data)
  - changePassword(data)

- [ ] `src/lib/services/orders.service.ts`
  - getOrders() - customer's orders
  - getOrder(id)
  - createOrder(data)
  - trackOrder(orderNumber)

- [ ] `src/lib/services/blog.service.ts` (when blog module exists)
  - getPosts()
  - getPost(slug)
  - getPostsByCategory(categoryId)

#### 1.3 TypeScript Types
- [ ] `src/types/Product.ts` - replace static ProductType
- [ ] `src/types/Category.ts`
- [ ] `src/types/Brand.ts`
- [ ] `src/types/Review.ts`
- [ ] `src/types/ProductQA.ts`
- [ ] `src/types/Customer.ts`
- [ ] `src/types/Order.ts`
- [ ] `src/types/Cart.ts`

---

## 🛍️ Products Module Integration

### 2. Product Listing Pages

**Location:** `src/app/shop/`

- [ ] Connect to backend API instead of static Product.json
- [ ] Implement real pagination
- [ ] Implement filters:
  - By category
  - By brand
  - By price range
  - By attributes (color, size, etc.)
  - By availability
- [ ] Implement sorting (price, name, newest, popularity)
- [ ] Implement search functionality
- [ ] Show real product count

### 3. Product Detail Pages

**Location:** `src/app/product/` and `src/components/Product/Detail/`

- [ ] Fetch product data from API by ID or slug
- [ ] Display real product images from backend
- [ ] Display real price, stock status
- [ ] Display product attributes (colors, sizes)
- [ ] Display product variations
- [ ] Implement "Add to Cart" with real API
- [ ] Show related products from API
- [ ] Display breadcrumbs with real category path

---

## ⭐ Reviews & Q&A Integration

### 4. Product Reviews

**Location:** `src/components/Product/Reviews/` (new)

#### 4.1 Components to Create
- [ ] `ReviewsList.tsx` - display all reviews with pagination
- [ ] `ReviewItem.tsx` - single review display
  - Star rating
  - Review content
  - Reviewer name with verified badge
  - Review images gallery
  - Helpful vote buttons
  - Store reply display
  - Date formatting

- [ ] `ReviewForm.tsx` - write a review
  - Star rating selector (1-5)
  - Title input
  - Content textarea (min length validation)
  - Image upload (multiple)
  - Reviewer name/email inputs
  - Submit to API

- [ ] `ReviewStats.tsx` - statistics sidebar
  - Average rating (large display)
  - Total review count
  - Rating breakdown (5★ to 1★ with bars)
  - Percentage calculations

- [ ] `ReviewFilters.tsx`
  - Filter by rating (All, 5★, 4★, 3★, 2★, 1★)
  - Filter by verified purchase
  - Sort by (Newest, Highest rated, Most helpful)

- [ ] `HelpfulVote.tsx` - vote buttons
  - "Helpful" / "Not helpful" buttons
  - Vote count display
  - Handle duplicate vote prevention

#### 4.2 Integration Points
- [ ] Replace static reviews in `Default.tsx` with `ReviewsList`
- [ ] Add average rating display in product header
- [ ] Add review count in product meta
- [ ] Add "Write a Review" button that opens `ReviewForm`

### 5. Product Q&A

**Location:** `src/components/Product/QA/` (new)

#### 5.1 Components to Create
- [ ] `QuestionsList.tsx` - all questions with answers
- [ ] `QuestionItem.tsx` - single question display
  - Question text
  - Asker name and date
  - Answers list below
  - "Answer this question" button

- [ ] `AnswerItem.tsx` - single answer display
  - Answer text
  - Answerer name
  - Store official badge (if applicable)
  - Date

- [ ] `AskQuestionForm.tsx` - ask a question
  - Question text input (min length)
  - Asker name/email
  - Submit to API

- [ ] `AnswerForm.tsx` - answer a question
  - Answer text input
  - Name/email inputs
  - Submit to API

- [ ] `QASearch.tsx` - search existing questions
  - Search input
  - Live search results
  - "Ask your question" if no results

#### 5.2 Integration Points
- [ ] Add "Questions & Answers" tab in product detail
- [ ] Show Q&A count in tab header
- [ ] Implement tab switching logic

---

## 🛒 Cart & Checkout

### 6. Shopping Cart

**Location:** `src/app/cart/` and `src/context/CartContext`

- [ ] Connect cart to backend API (if implemented) OR keep localStorage
- [ ] Fetch real product data for cart items
- [ ] Update prices dynamically
- [ ] Check stock availability
- [ ] Calculate totals with real prices
- [ ] Implement cart persistence (logged-in users)

### 7. Checkout Process

**Location:** `src/app/checkout/`

- [ ] Integrate with backend Orders API
- [ ] Fetch available shipping methods (couriers)
- [ ] Calculate shipping costs via API
- [ ] Fetch available payment methods
- [ ] Create order via API
- [ ] Handle order confirmation
- [ ] Send confirmation email (backend handles this)

---

## 👤 Customer Account

### 8. Authentication

**Location:** `src/app/login/`, `src/app/register/`

- [ ] Implement real login with backend API
- [ ] Implement registration with validation
- [ ] Store JWT token in secure storage
- [ ] Implement "Remember me" functionality
- [ ] Implement "Forgot password" flow
- [ ] Add authentication interceptor to API client

### 9. My Account Pages

**Location:** `src/app/my-account/`

- [ ] Dashboard - order summary, account info
- [ ] Order History - fetch from backend
- [ ] Order Details - single order view
- [ ] Profile Settings - update customer info
- [ ] Change Password
- [ ] Saved Addresses (if backend supports)
- [ ] Wishlist (if moving from localStorage to backend)

### 10. Order Tracking

**Location:** `src/app/order-tracking/`

- [ ] Implement order tracking by order number
- [ ] Fetch order status from backend
- [ ] Display order timeline/status updates
- [ ] Show tracking number if available

---

## 📝 Blog Module (Future - Backend Needed First)

### 11. Blog Infrastructure (BLOCKED - Backend Module Required)

**Status:** ⏸️ Waiting for backend blog module

Once backend blog module is created:

- [ ] Create blog service
- [ ] Blog listing pages (grid, list layouts)
- [ ] Blog detail page (detail1, detail2 layouts)
- [ ] Blog categories
- [ ] Blog tags
- [ ] Blog search
- [ ] Blog comments (if implemented)
- [ ] Related posts
- [ ] Author info display

---

## 📄 Static Pages & CMS

### 12. Static Content (Future - CMS Module Needed)

**Status:** ⏸️ Consider implementing simple CMS or keep pages static

- [ ] About page - connect to CMS or keep static
- [ ] Contact page - implement contact form API
- [ ] FAQs - fetch from backend or keep static
- [ ] Store Locations - if physical stores exist, create backend module

---

## 🔍 Search Functionality

### 13. Search Integration

**Location:** `src/app/search-result/`

- [ ] Connect to backend search API (products)
- [ ] Implement autocomplete/suggestions
- [ ] Search filters (categories, brands, price)
- [ ] Search result pagination
- [ ] Search history (optional)
- [ ] Integration with Meilisearch if available

---

## ❤️ Wishlist & Compare

### 14. Wishlist

**Location:** `src/app/wishlist/` and `src/context/WishlistContext`

**Decision Required:** Keep localStorage or move to backend?

If backend:
- [ ] Create wishlist API endpoints in backend
- [ ] Create wishlist service
- [ ] Sync wishlist with backend for logged-in users
- [ ] Keep localStorage fallback for guests

### 15. Product Compare

**Location:** `src/app/compare/` and `src/context/CompareContext`

**Decision Required:** Keep localStorage or move to backend?

If backend:
- [ ] Create compare API endpoints
- [ ] Create compare service
- [ ] Fetch product comparison data from API

---

## 🎨 UI/UX Enhancements

### 16. Loading States & Error Handling

- [ ] Add loading skeletons for all data-fetching components
- [ ] Implement error boundaries
- [ ] Add toast notifications for user actions
- [ ] Add retry logic for failed requests

### 17. Performance Optimization

- [ ] Implement image lazy loading
- [ ] Use Next.js Image component for product images
- [ ] Implement code splitting
- [ ] Add caching strategies for API calls
- [ ] Use React.memo for expensive components

---

## 🔐 Security & Best Practices

### 18. Security

- [ ] Implement CSRF protection
- [ ] Sanitize user inputs
- [ ] Secure JWT token storage
- [ ] Implement rate limiting on forms
- [ ] Add input validation on all forms

### 19. SEO Optimization

- [ ] Add proper meta tags for all pages
- [ ] Implement structured data (JSON-LD)
- [ ] Generate sitemap dynamically
- [ ] Add OpenGraph tags
- [ ] Implement canonical URLs

---

## 📱 Responsive & Accessibility

### 20. Mobile Optimization

- [ ] Test all pages on mobile devices
- [ ] Optimize touch interactions
- [ ] Optimize images for mobile
- [ ] Test checkout flow on mobile

### 21. Accessibility (a11y)

- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation works
- [ ] Add alt text to all images
- [ ] Ensure sufficient color contrast
- [ ] Test with screen readers

---

## 🧪 Testing & Quality Assurance

### 22. Testing

- [ ] Write unit tests for services
- [ ] Write integration tests for critical flows
- [ ] E2E tests for checkout process
- [ ] Test error scenarios
- [ ] Cross-browser testing

---

## 📦 Deployment

### 23. Production Readiness

- [ ] Environment variables configuration
- [ ] Build optimization
- [ ] CDN setup for static assets
- [ ] Error monitoring (Sentry or similar)
- [ ] Analytics integration (Google Analytics)
- [ ] Performance monitoring

---

## 📊 Priority Matrix

### Must Have (P0) - Launch Blockers
1. API Infrastructure Setup
2. Product Listing & Detail Integration
3. Shopping Cart Integration
4. Checkout Process
5. Authentication & Login
6. Basic My Account (Orders, Profile)

### Should Have (P1) - Post-Launch Priority
1. Reviews & Q&A Integration
2. Order Tracking
3. Search Functionality
4. Profile Management
5. Loading States & Error Handling

### Nice to Have (P2) - Future Enhancements
1. Blog Module (requires backend first)
2. Wishlist Backend Integration
3. Compare Backend Integration
4. Advanced Filters
5. CMS for Static Pages

### Future Consideration (P3)
1. Store Locations Module
2. Advanced Analytics
3. A/B Testing
4. Personalization Features

---

## 📝 Notes

- **Backend First:** Some features require backend modules to be built first (Blog, CMS)
- **localStorage vs Backend:** Decision needed for Wishlist and Compare - keep in localStorage or move to backend?
- **Image Management:** Frontend needs to properly handle image URLs from backend upload system
- **Authentication Flow:** Ensure JWT refresh token logic is implemented properly
- **Error Handling:** Consistent error messages and user feedback across all forms

---

## 🔄 Current Status

**Backend Modules Completed:**
- ✅ Products
- ✅ Categories
- ✅ Brands
- ✅ Attributes
- ✅ Customers
- ✅ Orders
- ✅ Reviews
- ✅ Product Q&A

**Backend Modules TODO:**
- ❌ Blog
- ❌ CMS/Static Pages
- ❌ Wishlist (optional - can use localStorage)
- ❌ Compare (optional - can use localStorage)
- ❌ Store Locations (if needed)

**Frontend Status:**
- ⏳ Not started - using static template data
- 📋 This task list created on 2025-11-14

---

## 📞 Contact & Questions

For questions about implementation details, refer to:
- Backend API documentation: `/packages/backend/README.md`
- Admin panel implementation: `/packages/admin/`
- Architecture docs: `/ddocs/ARCHITECTURE.md`
