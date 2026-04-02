export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-sage/30 bg-white/85 p-8 shadow-soft">
        <p className="text-xs uppercase tracking-[0.2em] text-soil">Get in Touch</p>
        <h1 className="mt-2 text-4xl text-meadow">We are here to help</h1>
        <p className="mt-3 text-stone-700">Have questions on products, delivery slots, or subscriptions? Reach out to us.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-cream/70 p-4">
            <h2 className="font-semibold text-bark">Phone</h2>
            <p className="mt-1 text-sm text-stone-700">+91 98765 43210</p>
          </div>
          <div className="rounded-xl bg-cream/70 p-4">
            <h2 className="font-semibold text-bark">Email</h2>
            <p className="mt-1 text-sm text-stone-700">hello@puredairy.in</p>
          </div>
        </div>
      </section>
    </main>
  );
}
