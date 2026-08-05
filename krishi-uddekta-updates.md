# Krishi Uddokta Website - Update Task List

Target site: https://krishiuddekta.vercel.app/
Stack:
- Next.js (App Router) deployed on **Vercel free tier**
- Database: **Neon Postgres** (serverless)
- Product/order data lives in Neon, so content fixes (weights, images, links) may be **database updates**, not just code edits.

Goal: Apply the fixes below to the site source code and redeploy.

---

## 0. Stack-Specific Notes (Vercel free tier + Neon)

- **Admin password:** Do NOT hardcode in client code. Use a Vercel environment variable (e.g. `ADMIN_PASSWORD`) or store a hashed value in Neon. `.env.local` is already gitignored.
- **DB access from serverless functions:** Vercel free tier has cold starts and function duration limits. Use the Neon **serverless driver** (`@neondatabase/serverless`) with connection pooling; never open long-lived `pg` connections per request.
- **Content vs code:** Items like the Strawberry Pickle weight, product images, combos, and phone/email in the DB should be fixed as data. Items like the brand name, typos, duplicate sections, and meta tags are code changes.
- **Re-deploy:** After changes, Vercel auto-deploys on push to the connected branch. Verify on the production URL, not just localhost.

---

## 1. Security: Change Admin Password

- The admin panel (`/admin`) currently uses the password `admin123`.
- **Requirement:** Change the admin password to a strong, long random value (min 16 chars, mix of upper/lowercase, numbers, symbols).
- Do NOT commit the new password to the repository or hardcode it in client-side code. Store it as a Vercel env var `ADMIN_PASSWORD` (server-only) or a hashed value in Neon.
- Keep the login flow working after the change and test it.
- This is likely in an API route (e.g. `app/api/admin/...`); ensure the env var is read server-side only.

## 2. Fix Broken Helpline Link

- The hero section button "Call Helpline" links to `tel:01700000000` (placeholder number).
- **Requirement:** Change it to the real helpline number used across the site: `tel:+8801604649648`.
- Update the link text to match the header format: `+880 1604-649648`.

## 3. Standardize Brand Name

The brand is currently spelled inconsistently:

- "Krishi Uddokta" (page title tag)
- "Krishi Uddekta" (domain, footer, bottom brand line)
- "কৃষি উদ্যোক্তা" (Bengali)

**Requirement:** Choose ONE English spelling and use it consistently everywhere (header, footer, title tags, meta, brand sections).

- Recommended: keep "Krishi Uddokta" as the English brand and "কৃষি উদ্যোক্তা" as the Bengali brand.
- Update domain-dependent text where possible (domain itself cannot change, but displayed text should be consistent).

## 4. Fix Bengali Typos

- "১০০% খাঁটি অর্গানিক **পন্য**" should be "১০০% খাঁটি অর্গানিক **পণ্য**".
- Occurs in two places: hero headline tagline and footer tagline.
- **Requirement:** Replace all occurrences of "পন্য" with "পণ্য" across the entire codebase/content.

## 5. Fix Strawberry Pickle Weight Mismatch

- Product title says: "Strawberry Pickle **700g** | স্ট্রবেরি আচার **৭০০ গ্রাম**"
- Product description says: "নিট ওজন: **৫০০ গ্রাম**" (net weight 500g).
- **Requirement:** Confirm the actual weight with the owner, then make the title, image alt text, and description agree on ONE value (either 700g/৭০০ গ্রাম or 500g/৫০০ গ্রাম).
- Since products live in **Neon**, this is likely a direct UPDATE on the `products` table — fix both title and description fields so they match.

## 6. Remove Dead Social Links

- All 4 social icons in the footer link to `#`.
- **Requirement:** Either add real profile URLs (Facebook, YouTube, WhatsApp, etc.) or remove the empty icons entirely.

## 7. Remove Duplicate Phone Entry

- The "Contact Us" footer section lists `01604-649648` twice.
- **Requirement:** Keep a single phone entry (and optionally add the alternate format `+880 1604-649648` only once).

## 8. Remove Duplicate "Top Selling" Section

- "Top Selling Agro Products" appears twice on the homepage (once after "Featured Categories", once after the hero banner).
- **Requirement:** Keep only ONE "Top Selling Agro Products" section and remove the duplicate.

## 9. Fix Product Image Consistency

- Most products use Unsplash image URLs, but "Strawberry Pickle" uses `/api/product-image/prod-1785676451087`.
- **Requirement:** Ensure every product uses its own properly uploaded product image (serve via the product-image API or a consistent CDN path), with matching `alt` text.
- In Neon, update the `image_url` field for the Strawberry Pickle row so it points to a real uploaded image like the other products.

## 10. Replace Personal Contact Email

- Contact email is `abulkasem@gmail.com`.
- **Requirement:** Replace with a business email (e.g. `info@krishiuddekta.com`) if available, or confirm with the owner. Update all places where the email is shown — check both the footer component and any `contact` / `settings` table in Neon if it's stored there.

## 11. Fix Combo Deal Links

- "Complete Farming Starter Combo" and "Rooftop Garden Care Package" both link to `/search`.
- **Requirement:** Link each combo to its own product/combo detail page, or create combo pages for them. If combos are rows in Neon (e.g. a `combos` table), ensure they have proper slug/link fields and pages to render them.

## 12. SEO Improvements

- **Requirement:** Add a unique `<meta name="description">` for the homepage (Bengali + English) summarizing the business.
- Add JSON-LD structured data for products (Product schema: name, image, price `৳`, availability).
- Use consistent `<title>` format: `BrandName | Page Section`.

## 13. Trust Signals in Header

- Delivery charge and refund policy links currently only exist in the footer.
- **Requirement:** Add prominent links/announcement in the header area for:
  - ডেলিভারি চার্জ (delivery charge)
  - রিফান্ড পলিসি (refund policy)
  - Cash on Delivery nationwide notice

---

## After Implementing

1. Run a production build locally and fix any errors.
2. Verify each fixed item on the homepage, product page, and footer.
3. Test the admin login still works with the new password.
4. Deploy to Vercel and confirm:
   - Homepage renders without duplicate sections.
   - Helpline `tel:` link opens the correct number.
   - No "পন্য" typos remain.
   - No `#` social links remain.

## Files Likely Touched (verify against actual project)

- Admin login / API route (password change) — likely `app/api/admin/...` using `ADMIN_PASSWORD` env var
- Homepage component (hero, top-selling, combos)
- Footer component (brand, contact, social links, tagline)
- Header/announcement bar (helpline, trust links)
- `app/layout.tsx` or `app/page.tsx` (meta tags, structured data)
- **Neon database** (content fixes): `products` table (Strawberry Pickle weight + image), `combos` table (links), possibly a `settings` table (phone/email)
- Vercel env vars: `ADMIN_PASSWORD`, `DATABASE_URL` (Neon) — verify these are set in the Vercel dashboard
- `.env.example` (placeholder for `ADMIN_PASSWORD`, never the real value)
