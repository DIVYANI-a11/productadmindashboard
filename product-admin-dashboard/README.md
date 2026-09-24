# Product admin dashboard

A small admin dashboard for logging in and managing products, built on the free [DummyJSON](https://dummyjson.com) API.

Next.js (App Router) · React · Tailwind CSS · Axios

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000. Log in with:

- username: `emilys`
- password: `emilyspass`

To deploy: push this repo to GitHub, then import it into Vercel or Netlify (no environment variables needed — the DummyJSON base URL is set in `lib/axios.js`).

## Project layout

```
app/
  login/page.js            login form
  products/layout.js       route guard + navbar for everything under /products
  products/page.js         list, search, filter, sort, pagination
  products/[id]/page.js    product details + reviews, "not found" state
  products/[id]/edit/page.js
  products/new/page.js
lib/
  axios.js                 the one shared Axios instance (token + error handling)
  api/                     auth.js and products.js — all network calls live here
  localOverrides.js        simulates persistence for add/edit/delete (see below)
  queryParams.js           safe parsing of page/pageSize/order from the URL
components/                small, single-purpose UI pieces
context/AuthContext.js     login state, persisted to localStorage
hooks/useDebounce.js       debounced value for the search box
```

## What's finished

- Login with the DummyJSON credentials, error message on wrong details, logout button, and route protection so `/products/*` redirects to `/login` if you're not signed in.
- Product list as a table on desktop and cards on mobile, showing image, title, category, price, rating and stock.
- Pagination with page numbers, Previous/Next, a page-size selector (10/20/50), and a "Showing X–Y of Z" line.
- Debounced search (`/products/search`) that resets to page 1 and never lets a slow, stale response overwrite a newer one.
- Category filter (`/products/categories`) and sorting by price, rating or title, both ascending and descending.
- Product details page with an image gallery, description, price and reviews, plus a real "not found" state for a bad id.
- Add and edit forms with validation (required title/category, positive price, whole-number stock, valid image URL), and a confirm popup before deleting.
- Loading, empty and error states everywhere data is fetched, with a Retry button on errors.
- Page, search, category, sort and order are all kept in the URL, so refreshing or sharing the link reproduces the same view. Bad values like `?page=abc` or `?page=999` fall back to something sane instead of breaking.
- One shared Axios instance that attaches the token to every request and turns every kind of failure into one consistent error shape.

## Design decisions worth explaining

**Search vs. category filter.** DummyJSON can't search and filter by category in the same request. Search wins: typing a query switches to `/products/search` and disables the category dropdown (with a note explaining why) until the search is cleared. This matches what most people expect — typing "phone" should look everywhere, not just inside whichever category happens to be selected.

**Add, edit and delete aren't really saved by the API.** DummyJSON's `add`/`update`/`delete` endpoints respond as if they worked, but nothing changes if you fetch the list again. The app still makes the real network calls (so the request/response is genuine), and then layers the change on top locally, in `lib/localOverrides.js`, backed by `localStorage`:
- new products get a negative local id and are shown at the top of the unfiltered first page;
- edits are stored as `{ id: { changed fields } }` and merged onto whatever the API returns for that id;
- deletes just add the id to a "hidden" list.

This means the dashboard behaves like a normal admin tool for the length of your session (and even across refreshes, since it's in `localStorage`), without pretending the demo API has real persistence it doesn't have.

**Race conditions on search.** Each product fetch uses an `AbortController` plus an incrementing request counter. Starting a new request cancels whatever was still in flight, and a response is only applied if it belongs to the most recent request. Typing fast (or testing with `&delay=2000`) can't make an old response flash in after a newer one has already rendered.

**Double-submit protection.** Login and the product form both use a `ref` guard that's checked synchronously before the async request starts, so a burst of clicks on "Sign in" or "Save" before the button has a chance to re-render as disabled still only sends one request.
