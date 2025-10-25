# Frontend Guideline Document

This document describes how to build and maintain the frontend (Admin Dashboard) for Léa, the WhatsApp conversational assistant for your parapharmacy. It’s written in simple, everyday language so that anyone can understand how the pieces fit together.

## 1. Frontend Architecture

### Frameworks and Libraries
- **Next.js 14 (App Router):** The foundation of our dashboard. It gives us file-based routing, built-in performance optimizations, and a mix of server and client components.
- **TypeScript:** Adds type safety to JavaScript, helping catch bugs early.
- **Tailwind CSS:** A utility-first CSS framework for fast styling without leaving your HTML.
- **shadcn/ui:** A set of ready-made, accessible React components (built on Radix and Tailwind) that speed up UI development.
- **Supabase Client:** For talking to our PostgreSQL database and handling authentication.

### How It Supports Scalability, Maintainability, and Performance
- **Scalability:** Next.js splits code per page and pre-renders what it can, so as your user base grows, load times stay fast. Supabase scales your database automatically.
- **Maintainability:** TypeScript plus a component-based structure makes it easy to find, fix, or extend features. Tailwind’s utility classes keep styles consistent.
- **Performance:** Server components offload work to the server. Next.js optimizes images, bundles, and uses caching (CDN) by default.

## 2. Design Principles

1. **Usability:** Clear labels, simple flows, and minimal clicks. Every screen answers “What do I do next?”
2. **Accessibility:** All interactive elements are keyboard friendly, color contrasts meet WCAG AA, and we use semantic HTML.
3. **Responsiveness:** The dashboard adjusts to different screen sizes (desktop, tablet) so support staff can use it on the go.
4. **Consistency:** Buttons, inputs, and messages follow the same look, reducing the learning curve.

How we apply them:
- Forms use clear field labels and inline validation messages.
- Navigation uses a sidebar with clear icons + text.
- Color contrasts are tested with a11y tools.

## 3. Styling and Theming

### Approach
- **Tailwind CSS:** Utility-first approach for quick, consistent styling.
- **PostCSS:** Default with Next.js to process Tailwind.

### Theming
- We keep a single source of truth in `tailwind.config.js` for colors, fonts, and spacing.

### Visual Style
- **Overall Style:** Modern flat design with subtle shadows and rounded corners.
- **Glassmorphism:** Used sparingly for pop-up modals (semi-transparent backgrounds).

### Color Palette
- **Primary Green:** #3BA55C
- **Secondary White:** #FFFFFF
- **Accent Light Gray:** #F5F5F5
- **Text Dark Gray:** #333333
- **Error Red:** #E53E3E
- **Success Green:** #38A169

### Typography
- **Font Family:** Inter (fallback: Roboto, sans-serif)
- **Base Font Size:** 16px
- **Headings:** Use `font-semibold` with consistent scale (e.g., H1 = 2rem, H2 = 1.5rem, H3 = 1.25rem)

## 4. Component Structure

### Organization
```text
src/
├─ app/
│  ├─ layout.tsx        # Global layout (header, footer, sidebar)
│  ├─ page.tsx          # Dashboard home
│  ├─ products/         # Product CRUD pages
│  ├─ reports/          # KPI and analytics pages
│  └─ compliance/       # RGPD consent logs and data requests
├─ components/
│  ├─ ui/               # shadcn/ui wrappers and custom variants
│  ├─ ProductCard.tsx   # Reusable product display
│  ├─ ConsentTable.tsx  # Reusable RGPD logs table
│  └─ ...
└─ lib/
   ├─ supabaseClient.ts # Supabase setup
   └─ helpers.ts        # Utility functions
```

### Reusability & Maintainability
- Small, focused components (one job each).
- Shared UI primitives in `components/ui/` for buttons, modals, forms.
- Domain components (ProductCard, OrderList) live next to their pages.
- Consistent naming: PascalCase for components, kebab-case for files.

## 5. State Management

### Approach
- **Server Components (Next.js):** Fetch data (e.g., product lists, reports) on the server to reduce client bundle size.
- **Client Components:** Local UI state (open/close modals, form inputs) is managed via React `useState` or `useReducer`.
- **React Context:** Share authentication/session info (user roles) across components.

### Data Fetching & Caching
- **Supabase Client inside Next.js:** We call Supabase from server components or API routes.
- **SWR (optional):** For real-time updates or client-side revalidation (product changes, conversation stats).

## 6. Routing and Navigation

- **Next.js App Router:** Each folder under `app/` is a route.
- **Nested Layouts:** Shared sidebar and header in `app/layout.tsx` so the UI stays consistent.
- **Dynamic Routes:** `[productId]/page.tsx` for editing/viewing a single product.
- **Protected Routes:** Middleware checks Supabase Auth session and role, redirecting unauthorized users.

## 7. Performance Optimization

1. **Code Splitting & Lazy Loading:** Next.js auto-splits code per route. Use `dynamic()` to lazy-load heavy components (charts).
2. **Image Optimization:** `next/image` for product photos and icons.
3. **Tailwind JIT:** Generates only the CSS you use, keeping bundle sizes small.
4. **Server Components:** Offload data fetching to the server for faster initial loads.
5. **Caching & CDN:** Next.js pre-renders pages and caches them at the edge.

## 8. Testing and Quality Assurance

### Unit & Integration Tests
- **Jest:** Run JavaScript/TypeScript tests.
- **React Testing Library:** For testing component behavior (forms, buttons, state changes).

### End-to-End (E2E)
- **Cypress or Playwright:** Simulate user flows (logging in as Admin, editing a product, viewing reports).

### Linting & Formatting
- **ESLint:** Enforce code quality and catch errors early.
- **Prettier:** Auto-format code on save.
- **Husky & lint-staged:** Run lint/prettier before each commit.

## 9. Conclusion and Overall Frontend Summary

This guide covers everything you need to know about the Léa Admin Dashboard’s frontend—from the big picture architecture to the tiny details like button styles and testing tools. We use Next.js with TypeScript and Tailwind to keep things fast, scalable, and easy to maintain. Our component-based approach, paired with clear design principles (usability, accessibility, responsiveness), ensures that both developers and support staff have a smooth experience. Finally, testing and performance strategies keep the dashboard reliable and snappy, even as it grows.

With these guidelines in hand, any new team member or third-party developer can quickly get up to speed and contribute confidently to Léa’s frontend.