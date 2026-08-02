# E-commerce Redesign Prompts (for Antigravity)

**Project stack:** Next.js (App Router) + Prisma + Neon Postgres + Tailwind CSS, deployed on Vercel.
**Reference site:** https://ghorerbazar.com/ — a Bangladeshi grocery/organic-food store. Match its UX patterns and structure, not its exact branding/copy/logo.

**Build order and why:**
1. Design System (foundation) — every other page depends on this, do it first
2. Homepage — establishes the product card, category card, and layout patterns reused everywhere
3. Search / Category Listing Page — reuses the homepage's product grid + card, adds filters
4. Single Product Page — reuses product card patterns, introduces PDP-specific UI
5. Cart Page — depends on product data shape already defined in steps 2–4
6. Checkout Page — depends on cart page's data and flow
7. Admin Panel — fully separate layout/auth context, most complex, do last so the customer-facing design language is already locked in

Feed these sections to Antigravity **one at a time, in this order**, in separate sessions/prompts. Don't paste the whole file at once — each section assumes the previous ones are already built and asks the agent to reuse those components.

---

## 0. Design System (do this first, before any page)

```
Before redesigning any pages, set up a shared design system for this Next.js + Tailwind + Prisma ecommerce project.

TASKS:
- Define/confirm a Tailwind theme extension (tailwind.config.js) with brand colors (primary, secondary, accent, success, danger, warning, neutral grays), following a fresh grocery/organic-food palette (green/earth tones) unless brand colors are already defined elsewhere in the project — check first.
- Set up typography: a clean sans-serif for English + "Hind Siliguri" or "Noto Sans Bengali" for Bangla text, loaded via next/font, with a fluid type scale (text-sm to text-4xl).
- Create shared, reusable UI primitives in /components/ui/: Button (primary/secondary/outline/ghost variants), Badge (for "Best Selling", "New Arrival", "Save X%", "Stock Out"), Card, Input, PriceTag (handles ৳ formatting + strikethrough original price when discounted), StarRating, Skeleton loader.
- Create a shared ProductCard component in /components/product/ProductCard.tsx — this will be reused on the homepage, search page, and category carousels. Props: product image, name, price, discountPrice, badge, stock status, onAddToCart, onBuyNow.
- Confirm currency formatting utility: BDT as ৳1,650 (no decimals unless needed).
- Set up next/image config for remote product image domains if not already done.
- Don't build any page yet — just the design tokens and shared components. List every file created/modified when done.
```

---

## 1. Homepage

```
Redesign the homepage using the design system and shared components already set up (Button, Badge, PriceTag, ProductCard, etc. from /components/ui and /components/product). Reference site: https://ghorerbazar.com/ for structure — keep our own branding/content.

SECTIONS (top to bottom):
1. Top utility bar (desktop only, optional): Track Order, About Us, FAQ, Call/WhatsApp icons
2. Sticky header: logo, search bar (expandable on mobile), Wishlist/Account/Cart icons (cart shows item count badge), category mega-menu below header with subcategory dropdowns (horizontal scroll on mobile)
3. Hero banner carousel: 2-3 full-width auto-rotating slides, each linking to a collection, swipeable on mobile
4. Featured Categories strip: 6-10 circular/rounded-square category icons, horizontal scroll on mobile, grid on desktop
5. Top Selling section: heading + "View All" link, ProductCard grid (4-5 cols desktop, 2 cols mobile)
6. Brand logos strip: horizontal row + "See All" link
7. Category product carousels (repeat for 3-4 categories): title + "View All", horizontally scrollable ProductCards, optional countdown badge for timed offers
8. Promotional banner: single full-width image/CTA
9. Combo Deals section: bundle cards (2+ products combined), "Save X%" badge, bundle vs original price, "View Details" CTA
10. "Just For You" recommended section: same ProductCard grid, near bottom
11. Customer testimonials carousel: star rating, short quote, name + role, avatar
12. Footer: logo + tagline, address/phone/email, social icons, app store badges, 4-column link groups (Information, Shop By, Support, Consumer Policy), payment icons, copyright

REQUIREMENTS:
- Use only the shared components already built — don't recreate ProductCard, Button, etc.
- Pull categories/products from Prisma via server components — don't hardcode. If schema fields are missing (discountPrice, badge, isBestSeller, isNewArrival, isStockOut), propose the Prisma migration first and show it before writing UI code.
- Mobile-first, Tailwind breakpoints, lazy-load below-fold images, next/image everywhere.
- Sticky "Add to Cart" with a small toast/mini-cart preview on click.

Don't ask clarifying questions — make reasonable assumptions and note them as comments. Start by listing files to create/modify, then Prisma changes if any, then implement section by section (header + hero first).
```

---

## 2. Search / Category Listing Page

```
Build the search results / category listing page, reusing ProductCard and the design system from the homepage. This page is used both for search results (?q=...) and category browsing (/collections/[slug]).

SECTIONS:
1. Reuse the sticky header + search bar from the homepage (should already be a shared layout component — extract it into /components/layout/Header.tsx if it isn't already).
2. Breadcrumb (Home / Category / Subcategory) or "Showing results for '[query]'" heading with result count.
3. Sidebar filters (desktop) / bottom-sheet or drawer filters (mobile):
   - Price range slider
   - Category/subcategory checkboxes
   - Brand checkboxes
   - Availability (In Stock / Stock Out toggle)
   - Rating filter
4. Sort dropdown: Relevance, Price Low-High, Price High-Low, Newest, Best Selling
5. Product grid using the shared ProductCard (4-5 cols desktop, 2 cols mobile), with pagination or "Load More" button matching the reference site's pattern
6. Empty state: friendly "No products found" illustration + suggestion to browse categories
7. Loading state: Skeleton grid while fetching

REQUIREMENTS:
- Use Prisma queries with proper indexing-friendly filtering (search by name/description, filter by category/brand/price/stock, sort).
- If it's a search query, use a simple ILIKE/full-text search against product name/description — note if we should upgrade to a proper search solution later.
- URL should reflect filter/sort state via query params so it's shareable and back-button-friendly.
- Reuse Header/Footer layout components — don't duplicate.
- Mobile filters should be a slide-in drawer, not a separate page.

Don't ask clarifying questions — make reasonable assumptions and note them. Start by listing files, then Prisma query logic, then UI.
```

---

## 3. Single Product Page

```
Build the single product detail page (/products/[slug]), reusing the design system and layout components already built.

SECTIONS:
1. Header/Footer (shared components)
2. Breadcrumb: Home / Category / Product name
3. Product gallery: main image + thumbnail row, zoom-on-hover (desktop), swipeable (mobile)
4. Product info panel:
   - Name, badges (Best Selling / New Arrival / Save X%)
   - Price (PriceTag component: current + strikethrough original if discounted)
   - Star rating + review count (links to reviews section)
   - Short description
   - Variant selector if applicable (size/weight — e.g. 500g / 1kg), using existing schema or propose one
   - Quantity stepper
   - "Add to Cart" (primary) + "Buy Now" (secondary) buttons, sticky on mobile scroll
   - Stock status indicator
   - Delivery info (estimated delivery, COD availability if relevant to BD market)
5. Tabs or accordion: Description, Specifications, Reviews
6. Reviews section: list of reviews with rating, name, comment, date; "Write a Review" CTA (auth-gated)
7. "Related Products" / "You may also like" carousel using shared ProductCard
8. "Frequently Bought Together" or combo suggestion if the product has any (optional, matches combo deal pattern from homepage)

REQUIREMENTS:
- Fetch product by slug via Prisma with related data (category, brand, reviews, related products) in a single server-side query where possible.
- Handle out-of-stock state clearly (disable Add to Cart, show "Notify Me" if that flow exists).
- SEO: proper metadata (title, description, OG image) generated from product data.
- Reuse ProductCard, Button, Badge, PriceTag, StarRating from the design system.
- Mobile: sticky bottom bar with price + Add to Cart button while scrolling.

Don't ask clarifying questions — make reasonable assumptions and note them. Start by listing files, then any Prisma schema additions needed (e.g. variants, reviews), then UI implementation.
```

---

## 4. Cart Page

```
Build the cart page (/cart), reusing the design system and PriceTag/Button components.

SECTIONS:
1. Header/Footer (shared)
2. Page heading: "Shopping Cart (N items)"
3. Cart item list:
   - Product image, name, variant (if any), unit price
   - Quantity stepper (+/-) with live subtotal update
   - Remove item (with confirm or undo toast)
   - "Move to Wishlist" option (optional)
4. Empty cart state: illustration + "Continue Shopping" CTA (matches the reference site's empty-cart pattern)
5. Order summary panel (sticky on desktop sidebar, bottom sheet on mobile):
   - Subtotal, discount applied, delivery fee estimate, total
   - Coupon/promo code input
   - "Proceed to Checkout" button (primary, full-width on mobile)
   - Free-delivery progress bar if the store has a minimum-order-for-free-delivery promo (reference site shows "Add ৳X more to unlock free delivery" — implement similarly if applicable)
6. "You may also like" upsell carousel below the cart using shared ProductCard (optional but matches reference site pattern)

REQUIREMENTS:
- Cart state: use existing cart state management if already in the project (context/store/cookies) — don't introduce a new state library unless none exists; then propose the lightest option (React Context + localStorage, or Zustand) and confirm.
- All price calculations must handle discounts and must not drift from server-validated prices — note that final totals should be re-validated at checkout.
- Reuse Button, PriceTag components.
- Mobile: order summary as a collapsible bottom sheet, not pushed below the fold.

Don't ask clarifying questions — make reasonable assumptions and note them. Start by listing files, confirm/propose cart state approach, then implement UI.
```

---

## 5. Checkout Page

```
Build the checkout page (/checkout), reusing the design system and cart data/state from the cart page.

SECTIONS:
1. Header (simplified — logo only, no full nav, to reduce checkout distraction) + minimal footer or none
2. Step indicator (optional): Cart → Delivery Info → Payment → Confirmation
3. Delivery information form:
   - Name, phone, address (division/district/upazila dropdowns relevant to Bangladesh), delivery notes
   - Save address option if user is logged in
4. Delivery method selection (if applicable): Standard / Express, with fee shown
5. Payment method selection: Cash on Delivery, bKash, Nagad, Card — as relevant to this store, styled as selectable cards with provider logos
6. Order summary (collapsed/expandable on mobile, sidebar on desktop): item list (read-only), subtotal, discount, delivery fee, total
7. Coupon code field (if not already applied from cart)
8. "Place Order" button — primary, full-width on mobile, with loading state during submission
9. Order confirmation page/state after successful placement: order number, summary, estimated delivery, "Track Order" CTA

REQUIREMENTS:
- Form validation (required fields, phone number format for BD numbers).
- Server-side order creation via Prisma — create Order + OrderItems records, decrement stock, clear cart on success.
- If bKash/Nagad integration doesn't exist yet, stub the payment step with a clear TODO and note what's needed (merchant API keys, webhook endpoint) rather than faking a working integration.
- Reuse Button, Input, PriceTag components.
- Handle and display errors gracefully (out-of-stock item found at checkout, payment failure, network error).

Don't ask clarifying questions — make reasonable assumptions and note them. Start by listing files, then the Prisma order-creation logic, then the UI/form.
```

---

## 6. Admin Panel

```
Redesign the admin panel for this ecommerce project. This is a separate layout/context from the customer-facing site — build it last since it doesn't need to match the storefront design language, but should feel professional and consistent with itself.

SECTIONS:
1. Admin layout: sidebar navigation (Dashboard, Products, Orders, Customers, Categories, Brands, Combos/Offers, Reviews, Settings) + top bar (admin name/avatar, logout, notifications)
2. Dashboard: key metrics cards (today's orders, revenue, low-stock alerts, new customers) + a simple orders-over-time chart
3. Products management: table with search/filter, columns (image, name, category, price, stock, status), add/edit product form (name, description, price, discount price, images, category, brand, variants, stock, badges like Best Selling/New Arrival)
4. Orders management: table (order #, customer, date, total, status), order detail view with status update (Pending → Processing → Shipped → Delivered / Cancelled), and the ability to view/print an invoice
5. Categories & Brands management: simple CRUD tables with image upload
6. Combo/Offers management: create bundle deals (select multiple products, set bundle price, set active date range)
7. Customers: list with basic info, order history per customer
8. Reviews: moderate/approve/delete product reviews

REQUIREMENTS:
- Auth-gate the entire /admin route group — confirm existing auth setup (NextAuth or custom) and restrict by role/isAdmin flag; propose the check if none exists.
- Use a data-table pattern (sortable, paginated, searchable) — reuse one component across Products/Orders/Customers tables rather than building three different tables.
- All mutations (create/update/delete) go through Prisma with proper validation; use optimistic UI or clear loading/success/error states.
- Image uploads: use existing upload solution if one exists in the project (e.g. Vercel Blob, UploadThing, Cloudinary); if none, propose the lightest option that works well with Vercel deployment.
- Keep the admin UI visually distinct from the storefront (e.g. a neutral/dashboard-style palette) but consistent with the shared Button/Input/Badge primitives so it doesn't need a whole separate component set.

Don't ask clarifying questions — make reasonable assumptions and note them. Start by listing files, confirm/propose auth + upload approach, then implement: layout → dashboard → products → orders → the rest.
```
