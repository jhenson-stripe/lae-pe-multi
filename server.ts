import express from 'express';
import Stripe from 'stripe';
import ViteExpress from 'vite-express';

const getEnv = (names: string[]) => {
  const value = names.map((name) => process.env[name]).find((entry) => entry);

  if (!value) {
    throw new Error(`Missing required environment variable. Set one of: ${names.join(', ')}`);
  }

  return value;
};

const publishableKey =
  getEnv(['STRIPE_PUBLISHABLE_KEY', 'STRIPE_PUBLISHABLE_KEY_AGENT']);
const secretKey = getEnv(['STRIPE_SECRET_KEY', 'STRIPE_SECRET_KEY_AGENT']);

const stripe = new Stripe(secretKey);

const app = express();
app.use(express.json());

const port = process.env.PORT ? parseInt(process.env.PORT) : 4242;

app.get('/config', (_req, res) => {
  res.json({ publishableKey });
});

app.post('/create-payment-intent', async (_req, res) => {
  const intent = await stripe.paymentIntents.create({
    amount: 12900,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    description: 'Desk lamp and notebook bundle',
  });

  res.json({ clientSecret: intent.client_secret });
});

ViteExpress.listen(app, port, () => {
  console.log(`Multi-step Elements demo running on http://localhost:${port}`);
});
