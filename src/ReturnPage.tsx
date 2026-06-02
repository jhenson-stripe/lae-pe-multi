const statusCopy: Record<string, { title: string; body: string; tone: string }> = {
  succeeded: {
    title: 'Payment complete',
    body: 'The Payment Element confirmed the PaymentIntent successfully.',
    tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  processing: {
    title: 'Payment processing',
    body: 'Stripe is still processing the payment method.',
    tone: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  requires_payment_method: {
    title: 'Payment not completed',
    body: 'The payment method was not accepted. Return to the demo and try another test card.',
    tone: 'text-red-700 bg-red-50 border-red-200',
  },
};

const ReturnPage = () => {
  const params = new URLSearchParams(window.location.search);
  const redirectStatus = params.get('redirect_status') ?? 'succeeded';
  const copy = statusCopy[redirectStatus] ?? statusCopy.succeeded;

  return (
    <main className="min-h-screen bg-[#f6f3ee] px-5 py-10 text-slate-950">
      <section className="mx-auto max-w-xl">
        <div className={`rounded-lg border p-5 ${copy.tone}`}>
          <p className="text-xs font-semibold uppercase">Return status</p>
          <h1 className="mt-2 text-2xl font-semibold">{copy.title}</h1>
          <p className="mt-2 text-sm">{copy.body}</p>
        </div>
        <a
          className="mt-5 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          href="/"
        >
          Back to demo
        </a>
      </section>
    </main>
  );
};

export default ReturnPage;
