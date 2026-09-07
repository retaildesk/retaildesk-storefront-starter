<h1 align="center">
  RetailDesk Storefront Starter
</h1>

<p align="center">
A Next.js 15 storefront starter for RetailDesk's Storefront API - a Medusa.js v2 Store API-compatible backend for RetailDesk webshops. Fork this to build a fully custom, headless storefront instead of RetailDesk's own drag-and-drop builder.</p>

Based on [medusajs/nextjs-starter-medusa](https://github.com/medusajs/nextjs-starter-medusa), adapted for RetailDesk's Storefront API. See what's different below.

# Prerequisites

1. Create a webshop in your [RetailDesk backoffice](https://backoffice.retaildesk.com) with the **"Developer API"** option (instead of "Eenvoudige bouwer"). This gives you a publishable API key and the exact `.env.local` values for this starter.
2. Full endpoint reference and Postman/OpenAPI export: see the Storefront API docs, linked from your webshop's settings page.

# Quickstart

### Setting up the environment variables

```shell
cd retaildesk-storefront-starter/
cp .env.template .env.local
```

Fill in `.env.local` with the values shown after creating your webshop (publishable key, backend URL, region).

### Install dependencies

```shell
yarn
```

### Start developing

```shell
yarn dev
```

Your site is now running at http://localhost:8000!

# What's different from a standard Medusa storefront

- **Payment**: checkout redirects to a hosted payment page (iDEAL, Bancontact, credit card) instead of an embedded payment form. See `src/modules/checkout/components/payment-button` for the redirect-based flow.
- **Wallet & coupons**: customers can pay (part of) an order from their RetailDesk wallet balance and/or a coupon/gift-voucher code, combined with a normal payment method for whatever remains. See `src/modules/account/components/wallet` and `src/modules/checkout/components/discount-code`.
- **Returns**: guest and account-based order returns are supported out of the box (`src/app/[countryCode]/(main)/returns`, `src/app/[countryCode]/(main)/account/@dashboard/returns`).
- **Single region**: no `/nl/`-style locale prefix in URLs - clean paths for a single-region storefront. Product names/descriptions come back in the webshop's default language; add your own translations via the `x-medusa-locale` header if you need multilingual content (see the Storefront API docs).

# Overview

Built with:

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

Features:

- Product detail & overview pages, collections, cart, checkout
- Redirect-based payment (iDEAL, Bancontact, credit card)
- Wallet balance + coupon codes at checkout
- Customer accounts, order details, order returns
- App Router, Server Components, Server Actions, streaming, static pre-rendering

# Resources

- [RetailDesk backoffice](https://backoffice.retaildesk.com)
- [Next.js docs](https://nextjs.org/docs)
- Based on [medusajs/nextjs-starter-medusa](https://github.com/medusajs/nextjs-starter-medusa) - see [Medusa's docs](https://docs.medusajs.com/) for anything not specific to RetailDesk's API.
