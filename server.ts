import express from "express";
import Stripe from "stripe";
import ViteExpress from "vite-express";

const normalizeEnvValue = (name: string, value: string) => {
  const trimmed = value.trim();
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed;
  const assignmentPrefix = `${name}=`;

  return unquoted.startsWith(assignmentPrefix)
    ? unquoted.slice(assignmentPrefix.length).trim()
    : unquoted;
};

const getEnv = (names: string[], expectedPrefix: string) => {
  const value = names
    .map((name) => {
      const rawValue = process.env[name];
      return rawValue ? normalizeEnvValue(name, rawValue) : undefined;
    })
    .find((entry) => entry);

  if (!value) {
    throw new Error(
      `Missing required environment variable. Set one of: ${names.join(", ")}`
    );
  }

  if (!value.startsWith(expectedPrefix)) {
    throw new Error(
      `Invalid value for environment variable. ${names.join(
        " or "
      )} must start with ${expectedPrefix}`
    );
  }

  return value;
};

const publishableKey = getEnv(
  ["STRIPE_PUBLISHABLE_KEY", "STRIPE_PUBLISHABLE_KEY_AGENT"],
  "pk_"
);
const secretKey = getEnv(
  ["STRIPE_SECRET_KEY", "STRIPE_SECRET_KEY_AGENT"],
  "sk_"
);

const stripe = new Stripe(secretKey);

const app = express();
app.use(express.json());

const port = process.env.PORT ? parseInt(process.env.PORT) : 4242;

app.get("/config", (_req, res) => {
  res.json({ publishableKey });
});

app.post("/create-payment-intent", async (_req, res) => {
  const intent = await stripe.paymentIntents.create({
    amount: 12900,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    description: "Desk lamp and notebook bundle",
  });

  res.json({ clientSecret: intent.client_secret });
});

ViteExpress.listen(app, port, () => {
  console.log(`Multi-step Elements demo running on http://localhost:${port}`);
});
