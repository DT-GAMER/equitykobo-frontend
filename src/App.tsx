import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Coins,
  Compass,
  FileSearch,
  Layers,
  LockKeyhole,
  ShieldCheck,
  Target,
  TrendingDown,
} from "lucide-react";
import Carousel from "./Carousel";
import HeroBackground from "./HeroBackground";
import useDocumentMeta from "./useDocumentMeta";
import useScrollReveal from "./useScrollReveal";
import { logoIcon, logoLockup, logoSrcSet, logoUrl } from "./brand";
import { cdn, cdnSrcSet, founder, personas, testimonials } from "./landingPeople";

const sampleCards = [
  {
    symbol: "ZENITHBANK",
    name: "Zenith Bank Plc",
    answer: "YES - research now",
    score: 76,
    price: "₦125.90",
    valuation: "Deeply Undervalued",
    margin: "+67.8%",
    peer: "2/12",
    tone: "yes",
    reason:
      "Strong profitability, meaningful dividend evidence and attractive valuation versus financial-sector peers.",
  },
  {
    symbol: "TANTALIZER",
    name: "Tantalizers Plc",
    answer: "WAIT - better entry",
    score: 49,
    price: "₦4.65",
    valuation: "Watch Entry",
    margin: "N/A",
    peer: "N/A",
    tone: "wait",
    reason:
      "Penny/speculative profile means price movement alone is not enough evidence for a confident buy decision.",
  },
];

const marketTiles = [
  { key: "research", label: "Research candidates", count: "28", icon: Award },
  { key: "value", label: "Undervalued quality", count: "14", icon: TrendingDown },
  { key: "income", label: "Dividend candidates", count: "31", icon: Coins },
];

const pillars = [
  {
    icon: Compass,
    title: "One clear answer",
    body: "Every company gets a plain YES, WAIT, NO or SPECULATIVE signal with the evidence written out.",
  },
  {
    icon: BarChart3,
    title: "Fair value, not hype",
    body: "Valuation methods produce a range, so you can see whether today's price leaves a margin of safety.",
  },
  {
    icon: Layers,
    title: "Ranked inside sectors",
    body: "A bank is judged against banks, not cement or oil stocks. Peer context is part of the core scoring.",
  },
  {
    icon: FileSearch,
    title: "Sourced research memory",
    body: "Prices, fundamentals, dividends, annual reports and disclosures are tracked as a company memory layer.",
  },
  {
    icon: BookOpenCheck,
    title: "Decision discipline",
    body: "Write the thesis, entry rule, position size and exit trigger before committing capital.",
  },
  {
    icon: ShieldCheck,
    title: "Risks beside reasons",
    body: "The upside and the danger sit together: liquidity, concentration, valuation, FX exposure and missing data.",
  },
];

const steps = [
  {
    step: "01",
    title: "We scan the NGX universe",
    body: "EquityKobo syncs market data, builds intelligence snapshots and ranks the full list instead of stopping at the popular names.",
  },
  {
    step: "02",
    title: "You browse by intent",
    body: "Start from value, dividend, sector leader, watch-for-entry, or speculative groups depending on the goal for your money.",
  },
  {
    step: "03",
    title: "You decide with a record",
    body: "Open the decision card, compare peers, write the thesis and plan the allocation before the trade happens.",
  },
];

function App() {
  // index.html already carries the homepage title, description and Open Graph
  // tags; this only restores them if the user navigates back from another route.
  useDocumentMeta({
    title: "EquityKobo | NGX Stock Research & Decision Cards for Nigerian Investors",
    description:
      "EquityKobo turns Nigerian Exchange (NGX) data, annual reports and dividend records into plain-English decision cards: research, wait, avoid or speculative.",
    canonicalPath: "/",
  });
  useScrollReveal();

  return (
    <main className="landing-v2">
      <header className="landing-v2-header">
        {/* The lockup already carries the wordmark and tagline, so the adjacent
            text block it replaced would have repeated the brand twice.

            Below 560px the lockup's 5.2:1 ratio leaves it squeezed to a third
            of its width by the sign-in buttons, so the icon-only mark takes
            over. <picture> rather than two images toggled in CSS, because a
            display:none <img> is still downloaded. */}
        <Link className="landing-v2-brand" to="/" aria-label="EquityKobo home">
          <picture>
            <source
              media="(max-width: 560px)"
              srcSet={logoSrcSet(logoIcon.path, [120, 240])}
              sizes="42px"
            />
            <img
              alt={logoLockup.alt}
              height={logoLockup.height}
              src={logoUrl(logoLockup.path, 520)}
              srcSet={logoSrcSet(logoLockup.path, [260, 520, 780])}
              sizes="240px"
              width={logoLockup.width}
            />
          </picture>
        </Link>

        <nav className="landing-v2-nav" aria-label="Landing navigation">
          <a href="#who">Who it's for</a>
          <a href="#how">How it works</a>
          <a href="#pillars">What you get</a>
          <a href="#today">Today's desk</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="landing-v2-actions">
          <Link className="landing-v2-text-link" to="/login">
            Login
          </Link>
          <Link className="landing-v2-button small" to="/signup">
            Sign up
          </Link>
        </div>
      </header>

      <section className="landing-v2-hero">
        <HeroBackground />
        <div className="landing-v2-hero-inner">
          <div className="landing-v2-hero-copy">
            <p className="landing-v2-kicker">
              <ShieldCheck size={14} />
              Nigerian Exchange research desk
            </p>
            <h1>Stop guessing which NGX stock to buy.</h1>
            <p>
              EquityKobo turns Nigerian Exchange data, annual reports and dividend records into
              plain-English decision cards: should you research, wait, avoid, or treat the stock as
              speculative?
            </p>

            <div className="landing-v2-hero-actions">
              <Link className="landing-v2-button primary" to="/signup">
                Start researching
                <ArrowUpRight size={18} />
              </Link>
              <Link className="landing-v2-button secondary" to="/login">
                Open existing desk
              </Link>
            </div>
          </div>

          <div className="landing-v2-preview" aria-label="Sample EquityKobo decision cards">
            <div className="landing-v2-preview-head">
              <span>Sample decision cards</span>
              <strong>Latest scan</strong>
            </div>
            <div className="landing-v2-sample-list">
              {sampleCards.map((card) => (
                <article className={`landing-v2-sample-card ${card.tone}`} key={card.symbol}>
                  <div className="landing-v2-sample-top">
                    <span>
                      <strong>{card.symbol}</strong>
                      <small>{card.name}</small>
                    </span>
                    <span>
                      <strong>{card.price}</strong>
                      <small>{card.answer}</small>
                    </span>
                  </div>
                  <div className="landing-v2-meter" aria-label={`${card.symbol} score`}>
                    <span style={{ width: `${card.score}%` }} />
                  </div>
                  <div className="landing-v2-chip-row">
                    <span>{card.valuation}</span>
                    <span>Margin {card.margin}</span>
                    <span>Peer {card.peer}</span>
                  </div>
                  <p>{card.reason}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="who" className="landing-v2-section" data-reveal>
        <div className="landing-v2-section-head">
          <span>Who this is for</span>
          <h2>Built for people who want a reason, not a tip.</h2>
        </div>
        <div className="landing-v2-persona-grid">
          {personas.map((persona) => (
            <article className="landing-v2-persona-card" key={persona.id}>
              <div className="landing-v2-persona-photo">
                <img
                  alt={persona.alt}
                  decoding="async"
                  height={698}
                  loading="lazy"
                  sizes="(min-width: 1181px) 30vw, (min-width: 721px) 45vw, 92vw"
                  src={cdn(persona.path, 800)}
                  srcSet={cdnSrcSet(persona.path)}
                  width={1280}
                />
              </div>
              <h3>{persona.label}</h3>
              <p className="landing-v2-persona-situation">{persona.situation}</p>
              <p>{persona.need}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="landing-v2-section" data-reveal>
        <div className="landing-v2-section-head">
          <span>How it works</span>
          <h2>From 153 tickers to one decision you can explain.</h2>
        </div>
        <Carousel className="step-carousel" label="How it works">
          {steps.map((item) => (
            <article className="landing-v2-step-card" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </Carousel>
      </section>

      <section id="pillars" className="landing-v2-section muted" data-reveal>
        <div className="landing-v2-section-head">
          <span>What you get</span>
          <h2>Research-desk rigour, written for humans.</h2>
        </div>
        <Carousel autoPlayMs={5200} className="pillar-carousel" label="What you get">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article className="landing-v2-pillar-card" key={pillar.title}>
                <span>
                  <Icon size={20} />
                </span>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            );
          })}
        </Carousel>
      </section>

      <section id="today" className="landing-v2-section" data-reveal>
        <div className="landing-v2-title-row">
          <div className="landing-v2-section-head">
            <span>Today's desk</span>
            <h2>What the latest scan is designed to surface.</h2>
          </div>
          <Link className="landing-v2-button outline" to="/signup">
            Open full ranking
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="landing-v2-market-grid">
          {marketTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <article className="landing-v2-market-tile" key={tile.key}>
                <span>
                  <Icon size={20} />
                </span>
                <strong>{tile.count}</strong>
                <p>{tile.label}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Renders only when real, consented users have been added to
          landingPeople.ts. An empty testimonial rail is better than an invented
          one — see the note at the top of that file. */}
      {testimonials.length > 0 && (
        <section id="voices" className="landing-v2-section muted" data-reveal>
          <div className="landing-v2-section-head">
            <span>In their words</span>
            <h2>What changed once the reason came first.</h2>
          </div>
          <Carousel className="testimonial-carousel" label="What people say">
            {testimonials.map((item) => (
              <article className="landing-v2-testimonial" key={item.id}>
                <blockquote>{item.quote}</blockquote>
                <footer>
                  <img
                    alt=""
                    decoding="async"
                    height={240}
                    loading="lazy"
                    src={item.image}
                    width={240}
                  />
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      {item.location} &middot; {item.context}
                    </small>
                  </span>
                </footer>
              </article>
            ))}
          </Carousel>
        </section>
      )}

      <section className="landing-v2-founder" data-reveal>
        <div className="landing-v2-founder-photo">
          <img
            alt={founder.alt}
            decoding="async"
            height={founder.height}
            loading="lazy"
            sizes="(min-width: 961px) 340px, 280px"
            src={cdn(founder.path, 700)}
            srcSet={cdnSrcSet(founder.path, [400, 700, 1000])}
            width={founder.width}
          />
        </div>
        <div className="landing-v2-founder-copy">
          <span>Why I built this</span>
          {founder.body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
          <div className="landing-v2-founder-sign">
            <strong>{founder.name}</strong>
            <small>{founder.role}</small>
          </div>
        </div>
      </section>

      <section id="pricing" className="landing-v2-pricing" data-reveal>
        <div>
          <span>Pricing-ready</span>
          <h2>Start with discipline. Upgrade when the research depth expands.</h2>
          <p>
            EquityKobo can begin with free accounts for watchlists and decision cards, then expand
            into paid plans for automation, alerts, portfolio intelligence and deeper company memory.
          </p>
        </div>
        <div className="landing-v2-price-grid">
          <article>
            <span>Free</span>
            <strong>₦0</strong>
            <p>For learning, watchlists, latest rankings and beginner research discipline.</p>
            <Link to="/signup">Create account</Link>
          </article>
          <article className="featured">
            <span>Pro</span>
            <strong>Coming soon</strong>
            <p>For smart alerts, portfolio exit intelligence, advanced scans and automation.</p>
            <Link to="/signup">Join waitlist</Link>
          </article>
        </div>
      </section>

      <section className="landing-v2-cta" data-reveal>
        <h2>Invest with a reason you can defend.</h2>
        <p>
          Open EquityKobo when you want clarity before putting real naira into a Nigerian company.
        </p>
        <div>
          <Link className="landing-v2-button primary" to="/signup">
            Create account
            <ArrowUpRight size={18} />
          </Link>
          <Link className="landing-v2-button secondary" to="/login">
            Login
          </Link>
        </div>
      </section>

      <footer className="landing-v2-footer">
        <div className="landing-v2-footer-main">
          <div>
            <Link className="landing-v2-brand footer" to="/" aria-label="EquityKobo home">
              <img
                alt={logoLockup.alt}
                height={logoLockup.height}
                loading="lazy"
                src={logoUrl(logoLockup.path, 520)}
                srcSet={logoSrcSet(logoLockup.path, [260, 520, 780])}
                sizes="260px"
                width={logoLockup.width}
              />
            </Link>
            <p>
              Research software for long-term Nigerian equity investors who want evidence,
              valuation discipline and a written decision record before buying.
            </p>
            <div className="landing-v2-footer-badges">
              <span>
                <LockKeyhole size={14} />
                Private workspace
              </span>
              <span>
                <Target size={14} />
                Decision support
              </span>
              <span>
                <CheckCircle2 size={14} />
                Source-aware data
              </span>
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <div>
              <h3>Platform</h3>
              <Link to="/signup">Opportunity Desk</Link>
              <Link to="/signup">Watchlists</Link>
              <Link to="/signup">Portfolio Plan</Link>
              <Link to="/signup">Decision Journal</Link>
            </div>
            <div>
              <h3>Research</h3>
              <a href="#pillars">Fair value</a>
              <a href="#pillars">Peer comparison</a>
              <a href="#pillars">Risk checks</a>
              <a href="#today">Today&apos;s desk</a>
            </div>
            <div>
              <h3>Account</h3>
              <Link to="/login">Login</Link>
              <Link to="/signup">Create account</Link>
              <Link to="/signup">Join Pro waitlist</Link>
            </div>
          </nav>
        </div>

        <div className="landing-v2-compliance">
          <article>
            <h3>Important notice</h3>
            <p>
              EquityKobo is a decision-support tool. It does not provide
              personalized investment advice, broker recommendations, guaranteed returns or trade
              execution.
            </p>
          </article>
        </div>

        <div className="landing-v2-footer-bottom">
          <p>&copy; 2026 EquityKobo. All rights reserved.</p>
          <span>Research, not advice.</span>
        </div>
      </footer>
    </main>
  );
}

export default App;
