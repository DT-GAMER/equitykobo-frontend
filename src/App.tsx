import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  DatabaseZap,
  LineChart,
  ListChecks,
  LockKeyhole,
  NotebookPen,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

const logoPrimary =
  "https://res.cloudinary.com/dofiyn7bw/image/upload/v1785268787/WhatsApp_Image_2026-07-28_at_20.51.17_1_zn2yic.jpg";

const logoMark =
  "https://res.cloudinary.com/dofiyn7bw/image/upload/v1785268787/WhatsApp_Image_2026-07-28_at_20.51.17_k8eetf.jpg";

const opportunityRows = [
  {
    symbol: "GTCO",
    label: "Research Now",
    quality: "84",
    valuation: "72",
    risk: "Low",
  },
  {
    symbol: "MTNN",
    label: "Watch Entry",
    quality: "78",
    valuation: "56",
    risk: "Medium",
  },
  {
    symbol: "PRESCO",
    label: "Dividend Review",
    quality: "81",
    valuation: "69",
    risk: "Medium",
  },
];

const decisions = [
  {
    label: "Research Now",
    detail: "Quality, valuation and risk checks are strong enough for deeper review.",
    tone: "green",
  },
  {
    label: "Watch for Better Entry",
    detail: "Interesting company, but today’s price may not be attractive.",
    tone: "amber",
  },
  {
    label: "Do Not Chase",
    detail: "Price movement looks stretched or close to NGX daily-band risk.",
    tone: "red",
  },
];

const features = [
  {
    icon: ListChecks,
    title: "Opportunity Desk",
    text: "Scan NGX companies and separate attention-worthy names from weak data, stretched prices and noisy tips.",
  },
  {
    icon: NotebookPen,
    title: "Decision Journal",
    text: "Record thesis, entry condition, risk and review rule before money leaves your account.",
  },
  {
    icon: Target,
    title: "Portfolio Guardrails",
    text: "Plan allocations, track actual holdings and flag stock or sector concentration before it gets uncomfortable.",
  },
  {
    icon: DatabaseZap,
    title: "Source-Aware Research",
    text: "Separate trusted market data from uploaded, extracted and review-pending fundamentals.",
  },
];

const stockTypes = [
  "Value stocks",
  "Dividend stocks",
  "Growth stocks",
  "Blue-chip candidates",
  "Penny stocks",
  "Sector-specific stocks",
];

const workflow = [
  "Sync NGX market data",
  "Rank companies by research opportunity",
  "Classify each stock type",
  "Watch before buying",
  "Set investment goals",
  "Review when to hold, trim, or sell",
];

function App() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="EquityKobo home">
          <img src={logoMark} alt="" />
          <span>EquityKobo</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-actions">
          <a className="text-link" href="/login">
            Login
          </a>
          <a className="button button-small" href="/signup">
            Sign up
          </a>
        </div>
      </header>

      <section id="top" className="hero-section">
        <div className="hero-media finance-hero-scene" aria-hidden="true">
          <img src={logoPrimary} alt="" />
          <div className="market-board">
            <div className="board-topline">
              <span>NGX Research Scan</span>
              <strong>Live workspace</strong>
            </div>
            <div className="board-grid">
              {opportunityRows.map((row) => (
                <div className="board-row" key={row.symbol}>
                  <strong>{row.symbol}</strong>
                  <span>{row.label}</span>
                  <small>Q {row.quality}</small>
                  <small>V {row.valuation}</small>
                  <small>{row.risk}</small>
                </div>
              ))}
            </div>
            <div className="board-footer">
              <span>Portfolio weight check</span>
              <strong>Financial Services 42%</strong>
            </div>
          </div>
        </div>
        <div className="hero-content">
          <p className="eyebrow">Nigerian equity research platform</p>
          <h1>EquityKobo</h1>
          <p className="hero-copy">
            A private research desk that helps long-term investors identify high-quality Nigerian
            companies, understand entry risk, document decisions and track portfolio exposure.
          </p>
          <div className="hero-actions">
            <a className="button" href="/signup">
              Open your research desk
              <ArrowRight size={18} />
            </a>
            <a className="button button-secondary" href="#decision-preview">
              See how decisions work
            </a>
          </div>
          <div className="trust-row" aria-label="EquityKobo principles">
            <span>
              <LockKeyhole size={16} />
              Private research workspace
            </span>
            <span>
              <ShieldCheck size={16} />
              Source-aware data
            </span>
            <span>
              <LineChart size={16} />
              Built for NGX investors
            </span>
          </div>
        </div>
      </section>

      <section id="decision-preview" className="decision-band">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Before the buy button</p>
            <h2>The first screen answers one question.</h2>
          </div>
          <p>
            Which Nigerian companies deserve attention before you invest? EquityKobo turns the
            market into a ranked research queue with plain decision labels and visible risks.
          </p>
        </div>
        <div className="decision-tape" aria-label="EquityKobo research summary">
          <span>
            <strong>146</strong>
            companies tracked
          </span>
          <span>
            <strong>NGX</strong>
            market data source
          </span>
          <span>
            <strong>30%</strong>
            single-stock guardrail
          </span>
          <span>
            <strong>50%</strong>
            sector guardrail
          </span>
        </div>
        <div className="section-heading compact decision-copy">
          <p className="eyebrow">No more noisy stock tips</p>
          <h2>Every label comes with a reason and a warning.</h2>
          <p>
            The system does not shout buy or sell. It shows why a company is interesting, what
            could break the thesis, and what should happen before you act.
          </p>
        </div>
        <div className="decision-grid">
          {decisions.map((decision) => (
            <article className={`decision-card ${decision.tone}`} key={decision.label}>
              <span>{decision.label}</span>
              <p>{decision.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="feature-section">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Built for disciplined investors</p>
            <h2>One workflow from watchlist to portfolio review.</h2>
          </div>
          <p>
            EquityKobo gives beginners structure without hiding the seriousness of investing:
            research first, plan allocation, track what you own, and review the thesis.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="feature-card" key={feature.title}>
                <Icon size={24} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="stock-types-section">
        <div>
          <p className="eyebrow">Stock-type intelligence</p>
          <h2>Not every cheap stock is value. Not every popular stock is quality.</h2>
          <p>
            EquityKobo groups companies into familiar categories, then adds risk checks so a
            beginner does not confuse a cheap price with a good investment.
          </p>
        </div>
        <div className="type-list" aria-label="Supported stock categories">
          {stockTypes.map((type) => (
            <span key={type}>
              <CheckCircle2 size={17} />
              {type}
            </span>
          ))}
        </div>
      </section>

      <section id="workflow" className="workflow-section">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Decision workflow</p>
            <h2>Research becomes a habit, not a guess.</h2>
          </div>
          <p>
            The product is designed around the way a careful investor should behave every week:
            scan, shortlist, write a thesis, size the position, then review the portfolio.
          </p>
        </div>
        <ol className="workflow-list">
          {workflow.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <section id="pricing" className="pricing-section">
        <div className="pricing-copy">
          <p className="eyebrow">Pricing-ready</p>
          <h2>Start with discipline. Upgrade when the data depth expands.</h2>
          <p>
            The first release can start with free accounts, then expand into paid plans for
            automation, alerts, portfolio intelligence, and advanced research workflows.
          </p>
        </div>
        <div className="pricing-grid">
          <article className="price-card">
            <span className="plan-name">Free</span>
            <strong>₦0</strong>
            <p>For learning, watchlists, latest prices, and beginner research signals.</p>
            <a href="/signup">Create account</a>
          </article>
          <article className="price-card featured">
            <span className="plan-name">Pro</span>
            <strong>Coming soon</strong>
            <p>For smart alerts, portfolio exit intelligence, advanced scans, and automation.</p>
            <a href="/signup">Join waitlist</a>
          </article>
        </div>
      </section>

      <section id="faq" className="faq-section">
        <div className="section-heading compact">
          <p className="eyebrow">Investor discipline</p>
          <h2>EquityKobo supports decisions. It does not replace judgment.</h2>
        </div>
        <div className="faq-grid">
          <article>
            <BarChart3 size={22} />
            <h3>Does it tell me what to buy?</h3>
            <p>
              It ranks companies that deserve research and explains reasons, risks, and next
              actions. You still make the final investment decision.
            </p>
          </article>
          <article>
            <TrendingUp size={22} />
            <h3>Can beginners use it?</h3>
            <p>
              Yes. The interface starts with plain labels and explanations, then lets users open
              the deeper ratios when they are ready.
            </p>
          </article>
          <article>
            <CircleDollarSign size={22} />
            <h3>Is it for short-term trading?</h3>
            <p>
              No. EquityKobo is built for watchlists, valuation discipline, portfolio review, and
              long-term research habits.
            </p>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-panel">
            <a className="brand" href="#top" aria-label="EquityKobo home">
              <img src={logoMark} alt="" />
              <span>EquityKobo</span>
            </a>
            <p>
              A private Nigerian equities research platform for watchlists, valuation discipline,
              portfolio guardrails and decision journaling.
            </p>
            <div className="footer-badges" aria-label="EquityKobo operating principles">
              <span>Research, not advice</span>
              <span>Source-aware data</span>
              <span>Long-term focused</span>
            </div>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <div>
              <h3>Platform</h3>
              <a href="#decision-preview">Opportunity Desk</a>
              <a href="#features">Watchlists</a>
              <a href="#workflow">Decision Journal</a>
              <a href="#pricing">Plans</a>
            </div>
            <div>
              <h3>Research</h3>
              <a href="#features">Fundamentals</a>
              <a href="#decision-preview">Valuation Signals</a>
              <a href="#workflow">Portfolio Rules</a>
              <a href="#faq">Investor FAQ</a>
            </div>
            <div>
              <h3>Account</h3>
              <a href="/login">Login</a>
              <a href="/signup">Create account</a>
              <a href="/signup">Join Pro waitlist</a>
            </div>
          </nav>
        </div>

        <div className="footer-compliance">
          <div>
            <h3>Important Notice</h3>
            <p>
              EquityKobo is an educational research and decision-support tool. It does not provide
              personalized investment advice, broker recommendations, guaranteed returns, or trade
              execution. Nigerian equities can rise or fall in value, and past performance does not
              guarantee future results.
            </p>
          </div>
          <div>
            <h3>Data Responsibility</h3>
            <p>
              Market data, company information and generated classifications should be reviewed
              against official filings, exchange publications and licensed data sources before you
              make an investment decision.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 EquityKobo. All rights reserved.</p>
          <div>
            <a href="#faq">Disclosures</a>
            <a href="#faq">Privacy</a>
            <a href="#faq">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default App;
