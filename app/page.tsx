import Link from "next/link";
import { SITE, CALCULATORS } from "./site-config";

export default function HomePage() {
  const featuredCalculators = CALCULATORS.filter((c) => c.featured);
  const otherCalculators = CALCULATORS.filter((c) => !c.featured);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-slate-900 tracking-tight"
          >
            {SITE.name}
          </Link>
          <span className="text-sm text-slate-400">{SITE.tagline}</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 border-b border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Free Financial Calculators
          </h1>
          <p className="text-lg text-slate-500 max-w-xl">
            Calculate taxes, estimate payments, and plan your finances with our
            free, accurate tools built for US freelancers and self-employed
            professionals.
          </p>
        </div>
      </section>

      {/* Featured Calculators */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {featuredCalculators.length > 0 && (
          <section className="mb-12">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
              Featured Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredCalculators.map((calc) => {
                const IconComponent = calc.icon;
                return (
                  <Link
                    key={calc.id}
                    href={`/${calc.id}`}
                    className="group flex items-start gap-4 p-6 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                      <IconComponent className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {calc.name}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {calc.description}
                      </p>
                      <p className="text-xs text-indigo-600 mt-2 font-medium">
                        Updated for {SITE.year} →
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Other Calculators (for future expansion) */}
        {otherCalculators.length > 0 && (
          <section className="mb-12">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
              More Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {otherCalculators.map((calc) => {
                const IconComponent = calc.icon;
                return (
                  <Link
                    key={calc.id}
                    href={`/${calc.id}`}
                    className="group flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                      <IconComponent className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">
                        {calc.shortName}
                      </p>
                      <p className="text-xs text-slate-400">{calc.category}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Ad Placeholder */}
        <section className="my-12">
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-sm text-slate-400">Advertisement</p>
          </div>
        </section>

        {/* SEO Content */}
        <section className="mt-16 prose prose-slate max-w-none">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Why Use FinCalc?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-600">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">
                ✓ 2025 IRS Rates
              </h3>
              <p>
                Updated with the latest federal tax brackets and self-employment
                tax limits for accurate calculations.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">
                ✓ 100% Free
              </h3>
              <p>
                No signup, no hidden fees. Calculate your taxes instantly
                without providing personal information.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">
                ✓ Freelancer Focused
              </h3>
              <p>
                Built specifically for 1099 contractors, freelancers, and
                self-employed professionals.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm text-slate-400">
          <p className="mb-2">
            © {SITE.year} {SITE.name}. For informational purposes only.
          </p>
          <p>
            Consult a qualified tax professional for personalized advice.
          </p>
        </div>
      </footer>

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.name,
            description: SITE.description,
            url: "https://fin-calc.vercel.app",
          }),
        }}
      />
    </div>
  );
}
