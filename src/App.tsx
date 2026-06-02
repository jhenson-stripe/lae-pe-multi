import React, { useEffect, useMemo, useState } from 'react';
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = fetch('/config')
  .then((response) => response.json() as Promise<{ publishableKey: string }>)
  .then(({ publishableKey }) => loadStripe(publishableKey));

type Step = 'contact' | 'payment';
type EmailDefaultTarget = 'none' | 'lae' | 'pe';

type DemoOptions = {
  defaultEmail: string;
  emailDefaultTarget: EmailDefaultTarget;
};

const initialOptions: DemoOptions = {
  defaultEmail: 'alex@example.com',
  emailDefaultTarget: 'none',
};

const emailDefaultTargets: EmailDefaultTarget[] = ['none', 'lae', 'pe'];

const isEmailDefaultTarget = (value: string | null): value is EmailDefaultTarget =>
  Boolean(value && emailDefaultTargets.includes(value as EmailDefaultTarget));

const readDemoOptionsFromUrl = (): DemoOptions => {
  const params = new URLSearchParams(window.location.search);
  const emailDefaultTarget = params.get('email_default_target');

  return {
    defaultEmail: params.get('default_email') ?? initialOptions.defaultEmail,
    emailDefaultTarget: isEmailDefaultTarget(emailDefaultTarget) ? emailDefaultTarget : initialOptions.emailDefaultTarget,
  };
};

const writeDemoOptionsToUrl = (options: DemoOptions) => {
  const url = new URL(window.location.href);

  if (options.defaultEmail === initialOptions.defaultEmail) {
    url.searchParams.delete('default_email');
  } else {
    url.searchParams.set('default_email', options.defaultEmail);
  }

  if (options.emailDefaultTarget === initialOptions.emailDefaultTarget) {
    url.searchParams.delete('email_default_target');
  } else {
    url.searchParams.set('email_default_target', options.emailDefaultTarget);
  }

  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
};

const elementAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#0f172a',
    colorBackground: '#ffffff',
    colorText: '#0f172a',
    colorDanger: '#b91c1c',
    borderRadius: '8px',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  },
  rules: {
    '.Input': {
      border: '1px solid #d6d3d1',
      boxShadow: 'none',
    },
    '.Input:focus': {
      borderColor: '#0f172a',
      boxShadow: '0 0 0 2px rgba(15, 23, 42, 0.12)',
    },
    '.Label': {
      fontWeight: '600',
    },
  },
};

const orderItems = [
  { label: 'Angle task lamp', detail: 'Warm LED, matte black', amount: '$89.00' },
  { label: 'Grid notebook', detail: 'A5, 160 pages', amount: '$40.00' },
];

const StepIndicator = ({ step }: { step: Step }) => {
  const steps: Array<{ key: Step; label: string }> = [
    { key: 'contact', label: 'Contact' },
    { key: 'payment', label: 'Payment' },
  ];

  return (
    <ol className="grid grid-cols-2 overflow-hidden rounded-lg border border-stone-300 bg-white text-sm">
      {steps.map((item, index) => {
        const active = item.key === step;
        const complete = step === 'payment' && item.key === 'contact';

        return (
          <li
            className={`flex items-center gap-2 px-4 py-3 ${
              active ? 'bg-slate-950 text-white' : complete ? 'bg-emerald-50 text-emerald-800' : 'text-stone-600'
            }`}
            key={item.key}
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                active ? 'bg-white text-slate-950' : complete ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {complete ? '✓' : index + 1}
            </span>
            <span className="font-semibold">{item.label}</span>
          </li>
        );
      })}
    </ol>
  );
};

const OrderSummary = () => (
  <aside className="rounded-lg border border-stone-300 bg-[#fffdf8] p-5">
    <p className="text-xs font-semibold uppercase text-stone-600">Order</p>
    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Studio supply kit</h2>
    <div className="mt-5 space-y-4">
      {orderItems.map((item) => (
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4 last:border-0 last:pb-0" key={item.label}>
          <div>
            <p className="font-semibold text-slate-950">{item.label}</p>
            <p className="text-sm text-stone-600">{item.detail}</p>
          </div>
          <p className="font-semibold text-slate-950">{item.amount}</p>
        </div>
      ))}
    </div>
    <div className="mt-5 flex items-center justify-between border-t border-stone-300 pt-4 text-lg font-semibold">
      <span>Total</span>
      <span>$129.00</span>
    </div>
  </aside>
);

const DemoControls = ({
  options,
  setOptions,
}: {
  options: DemoOptions;
  setOptions: React.Dispatch<React.SetStateAction<DemoOptions>>;
}) => (
  <section className="mt-6 rounded-lg border border-stone-300 bg-white p-4">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase text-stone-600">Options</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-950">Element initialization</h2>
      </div>
      <span className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600">Remounts Elements</span>
    </div>

    <div className="mt-4 space-y-4">
      <label className="block text-sm">
        <span className="font-semibold text-slate-800">Default email</span>
        <input
          className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          onChange={(event) => {
            setOptions((current) => ({ ...current, defaultEmail: event.target.value }));
          }}
          type="email"
          value={options.defaultEmail}
        />
      </label>

      <label className="block text-sm">
        <span className="font-semibold text-slate-800">Pass email to default values</span>
        <select
          className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          onChange={(event) => {
            setOptions((current) => ({
              ...current,
              emailDefaultTarget: event.target.value as EmailDefaultTarget,
            }));
          }}
          value={options.emailDefaultTarget}
        >
          <option value="none">Do not pass email</option>
          <option value="lae">Link Authentication Element</option>
          <option value="pe">Payment Element</option>
        </select>
      </label>
    </div>
  </section>
);

const CheckoutFlow = ({ demoOptions }: { demoOptions: DemoOptions }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [step, setStep] = useState<Step>('contact');
  const [email, setEmail] = useState(demoOptions.emailDefaultTarget === 'lae' ? demoOptions.defaultEmail : '');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const laeOptions = useMemo(
    () =>
      demoOptions.emailDefaultTarget === 'lae' && demoOptions.defaultEmail
        ? { defaultValues: { email: demoOptions.defaultEmail } }
        : {},
    [demoOptions.defaultEmail, demoOptions.emailDefaultTarget]
  );
  const paymentOptions = useMemo(
    () =>
      demoOptions.emailDefaultTarget === 'pe' && demoOptions.defaultEmail
        ? {
            layout: 'tabs' as const,
            defaultValues: {
              billingDetails: {
                email: demoOptions.defaultEmail,
              },
            },
          }
        : { layout: 'tabs' as const },
    [demoOptions.defaultEmail, demoOptions.emailDefaultTarget]
  );

  const continueToPayment = () => {
    setMessage('');

    if (!email) {
      setMessage('Enter an email address before continuing.');
      return;
    }

    setStep('payment');
  };

  const confirmPayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setMessage('');

    const submitResult = await elements.submit();
    if (submitResult.error) {
      setMessage(submitResult.error.message ?? 'Review the payment details and try again.');
      setSubmitting(false);
      return;
    }

    const response = await fetch('/create-payment-intent', { method: 'POST' });
    const { clientSecret } = (await response.json()) as { clientSecret?: string };

    if (!clientSecret) {
      setMessage('The server did not return a PaymentIntent client secret.');
      setSubmitting(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        receipt_email: email,
        return_url: `${window.location.origin}/return`,
      },
    });

    if (error) {
      setMessage(error.message ?? 'Payment confirmation failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-stone-300 bg-white p-5 shadow-sm">
      <StepIndicator step={step} />

      {step === 'contact' ? (
        <div className="mt-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-950">Contact</h2>
            <p className="mt-1 text-sm text-stone-600">Link Authentication Element is collected before payment.</p>
          </div>

          <div className="space-y-5">
            <LinkAuthenticationElement
              options={laeOptions}
              onChange={(event) => {
                setEmail(event.value.email);
              }}
            />
          </div>
        </div>
      ) : null}

      {step === 'payment' ? (
        <div className="mt-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-950">Payment</h2>
            <p className="mt-1 text-sm text-stone-600">The Payment Element is isolated on this step and uses the contact details already collected.</p>
          </div>
          <PaymentElement options={paymentOptions} />
        </div>
      ) : null}

      {message ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
          {message}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {step === 'payment' ? (
          <button
            className="rounded-md border border-stone-300 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-stone-50"
            disabled={submitting}
            onClick={() => {
              setMessage('');
              setStep('contact');
            }}
            type="button"
          >
            Back
          </button>
        ) : (
          <span className="text-xs font-medium text-stone-500">Amount charged on the payment step.</span>
        )}

        {step === 'contact' ? (
          <button
            className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            onClick={continueToPayment}
            type="button"
          >
            Continue to payment
          </button>
        ) : (
          <button
            className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-stone-400"
            disabled={!stripe || !elements || submitting}
            onClick={confirmPayment}
            type="button"
          >
            {submitting ? 'Processing...' : 'Pay $129.00'}
          </button>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [demoOptions, setDemoOptions] = useState<DemoOptions>(readDemoOptionsFromUrl);
  useEffect(() => {
    writeDemoOptionsToUrl(demoOptions);
  }, [demoOptions]);

  const options = useMemo(
    () => ({
      mode: 'payment' as const,
      amount: 12900,
      currency: 'usd',
      appearance: elementAppearance,
    }),
    []
  );
  const elementsKey = `${demoOptions.emailDefaultTarget}-${demoOptions.defaultEmail}`;

  return (
    <main className="min-h-screen bg-[#f6f3ee] px-5 py-8 text-slate-950">
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold uppercase text-emerald-700">Elements standalone demo</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Multi-step payment flow</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-stone-700">
            Link Authentication lives on the first step. The Payment Element lives on the second step.
          </p>
          <div className="mt-6">
            <OrderSummary />
          </div>
          <DemoControls options={demoOptions} setOptions={setDemoOptions} />
        </div>

        <Elements key={elementsKey} stripe={stripePromise} options={options}>
          <CheckoutFlow demoOptions={demoOptions} />
        </Elements>
      </section>
    </main>
  );
};

export default App;
