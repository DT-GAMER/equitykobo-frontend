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
import useScrollReveal from "./useScrollReveal";

const logoMark =
  "https://res.cloudinary.com/dofiyn7bw/image/upload/v1785268787/WhatsApp_Image_2026-07-28_at_20.51.17_k8eetf.jpg";

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
    reason: "Strong profitability, meaningful dividend evidence and attractive valuation versus financial-sector peers.",
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
    reason: "Penny/speculative profile means price movement alone is not enough evidence for a confident buy decision.",
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
  useScrollReveal();

  return (
    <main className="landing-v2">
      <header className="landing-v2-header">
        <Link className="landing-v2-brand" to="/" aria-label="EquityKobo home">
          <img src={logoMark} alt="" />
          <span>
            <strong>EquityKobo</strong>
            <small>NGX research desk</small>
          </span>
        </Link>

        <nav className="landing-v2-nav" aria-label="Landing navigation">
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
        <div className="landing-v2-hero-inner">
          <div className="landing-v2-hero-copy">
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

            <div className="landing-v2-stats" aria-label="EquityKobo market coverage">
              <span>
                <small>Companies scanned</small>
                <strong>153</strong>
              </span>
              <span className="decision-label-stat">
                <small>Decision labels</small>
                <strong>YES / WAIT / NO</strong>
              </span>
              <span>
                <small>Core market</small>
                <strong>NGX</strong>
              </span>
            </div>
          </div>

          <div className="landing-v2-preview" aria-label="Sample EquityKobo decision cards">
            <div className="landing-v2-preview-head">
              <span>Sample decision cards</span>
              <strong>Latest scan</strong>
            </div>
            <div className="landing-v2-sample-list">
              {sampleCards.map((card) => (
                <article className="landing-v2-sample-card" key={card.symbol}>
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

      <section className="landing-v2-proof-strip" aria-label="EquityKobo decision model" data-reveal>
        <article>
          <span>Answer first</span>
          <strong>Should I invest?</strong>
          <p>Users see the decision label before the ratios, because clarity is the product.</p>
        </article>
        <article>
          <span>Evidence next</span>
          <strong>Why and why not</strong>
          <p>Reasons, risks, fair value and peer rank sit on the same decision card.</p>
        </article>
        <article>
          <span>Action last</span>
          <strong>Watch, plan, journal</strong>
          <p>The workflow pushes users to record a thesis instead of copying social media tips.</p>
        </article>
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
              <img src={logoMark} alt="" />
              <span>
                <strong>EquityKobo</strong>
                <small>Plain-English NGX equity research</small>
              </span>
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
              EquityKobo is an educational research and decision-support tool. It does not provide
              personalized investment advice, broker recommendations, guaranteed returns or trade
              execution.
            </p>
          </article>
          <article>
            <h3>Data responsibility</h3>
            <p>
              Market data, company information, generated scores and classifications should be
              reviewed against official filings, exchange publications and licensed data sources
              before any investment decision.
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
