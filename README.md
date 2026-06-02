# LAE + PE Multi-step Demo

Standalone Stripe Elements demo for a two-step flow:

1. Link Authentication Element
2. Payment Element

## Environment

Set these variables in CodeSandbox:

```bash
STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
```

The server also accepts the local playground names `STRIPE_PUBLISHABLE_KEY_AGENT` and `STRIPE_SECRET_KEY_AGENT`.

## Run

```bash
pnpm install
pnpm start
```

Use query params to persist demo options:

```text
?default_email=buyer%40example.com&email_default_target=pe
```
