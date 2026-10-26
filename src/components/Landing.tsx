import { Building2, ChevronDown, ExternalLink } from 'lucide-react';
import content from '../seo/content.json';
import { AuthModal } from './AuthModal';

/** Public landing page shown to signed-out visitors (and crawlers). Copy lives in src/seo/content.json. */
export function Landing() {
  const c = content;
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold">
            <span className="p-2 bg-indigo-600 rounded-xl text-white"><Building2 className="w-5 h-5" /></span>
            <span>智慧房東</span>
          </a>
          <nav aria-label="頁面導覽" className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <a href="/#features" className="hover:text-indigo-600">{c.nav.features}</a>
            <a href="/#faq" className="hover:text-indigo-600">{c.nav.faq}</a>
            <a href="/#resources" className="hidden sm:inline hover:text-indigo-600">{c.nav.resources}</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 py-12 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{c.h1}</h1>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">{c.lead}</p>
            <img src="/hero.svg" alt={c.heroAlt} width={640} height={400} className="mt-8 w-full max-w-lg rounded-3xl hidden sm:block" fetchPriority="high" />
          </div>
          <AuthModal embedded />
        </section>

        {c.sections.map((s) => (
          <section key={s.id} id={s.id} className="max-w-6xl mx-auto px-4 py-10 scroll-mt-4">
            <h2 className="text-2xl font-bold">{s.h2}</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {s.items.map((i) => (
                <li key={i.t} className="bg-white border border-slate-200 rounded-2xl p-5">
                  <h3 className="font-bold">{i.t}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{i.d}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section id="faq" className="max-w-3xl mx-auto px-4 py-10 scroll-mt-4">
          <h2 className="text-2xl font-bold">{c.faqTitle}</h2>
          <div className="mt-6 space-y-3">
            {c.faq.map((f) => (
              <details key={f.q} className="group bg-white border border-slate-200 rounded-2xl p-4">
                <summary className="flex items-center justify-between cursor-pointer font-semibold">
                  {f.q}<ChevronDown className="w-4 h-4 transition group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="resources" className="max-w-3xl mx-auto px-4 py-10 pb-16 scroll-mt-4">
          <h2 className="text-2xl font-bold">{c.refsTitle}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[...c.refs, ...c.related].map((r) => (
              <li key={r.href}>
                <a href={r.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
                  {r.label}<ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} 智慧房東 · 試算與範本僅供參考，簽約前請自行確認條款
      </footer>
    </div>
  );
}
