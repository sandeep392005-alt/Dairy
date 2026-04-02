import Link from 'next/link';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/our-farm', label: 'Our Farm' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-sage/30 bg-[#f2ebdd] text-stone-700">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        <section>
          <h3 className="font-[Fraunces] text-2xl text-meadow">PureDairy</h3>
          <p className="mt-2 text-sm leading-6">
            Fresh milk, butter, curd, paneer, and buttermilk delivered directly from local farms.
          </p>
        </section>

        <section>
          <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-bark">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-meadow">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-bark">Business Hours</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Mon - Sat: 6:00 AM - 8:00 PM</li>
            <li>Sunday: 7:00 AM - 1:00 PM</li>
            <li>Same-day delivery slots available</li>
          </ul>
        </section>

        <section>
          <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-bark">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Phone: +91 98765 43210</li>
            <li>Email: hello@puredairy.in</li>
            <li>Instagram | Facebook | YouTube</li>
          </ul>
        </section>
      </div>
    </footer>
  );
}
