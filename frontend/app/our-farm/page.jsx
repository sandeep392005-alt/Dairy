export default function OurFarmPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-sage/30 bg-white/85 p-8 shadow-soft">
        <p className="text-xs uppercase tracking-[0.2em] text-soil">Our Story</p>
        <h1 className="mt-2 text-4xl text-meadow">From Local Farmers, With Care</h1>
        <p className="mt-4 text-stone-700">
          We partner with trusted local dairy farmers who practice ethical, natural, and responsible methods.
          Every product is handled with care from milking to delivery.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl bg-cream/70 p-4">
            <h2 className="font-semibold text-bark">No Preservatives</h2>
            <p className="mt-1 text-sm text-stone-600">Only fresh and minimally processed dairy products.</p>
          </article>
          <article className="rounded-xl bg-cream/70 p-4">
            <h2 className="font-semibold text-bark">Daily Sourcing</h2>
            <p className="mt-1 text-sm text-stone-600">Collected fresh each day from partner farms.</p>
          </article>
          <article className="rounded-xl bg-cream/70 p-4">
            <h2 className="font-semibold text-bark">Cold-Chain Delivery</h2>
            <p className="mt-1 text-sm text-stone-600">Quality maintained until it reaches your doorstep.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
