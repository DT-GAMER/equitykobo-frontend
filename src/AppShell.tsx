import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import AppHeader from "./AppHeader";
import { InvestmentRule, Score, loadOpportunityDesk } from "./api";

const filters = [
  "All",
  "Research Now",
  "Dividend stocks",
  "Value stocks",
  "Growth stocks",
  "Needs Research",
  "Do Not Chase",
];

function AppShell() {
  const [data, setData] = useState<Awaited<ReturnType<typeof loadOpportunityDesk>> | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setError("");
    try {
      const desk = await loadOpportunityDesk();
      setData(desk);
      setSelectedSymbol(desk.scan.results[0]?.symbol ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load Opportunity Desk.");
    } finally {
      setIsLoading(false);
    }
  }

  const opportunities = useMemo(() => {
    if (!data) {
      return [];
    }
    const prices = new Map(data.prices.map((price) => [price.symbol, price]));
    const rules = new Map(data.rules.map((rule) => [rule.symbol, rule]));
    return data.scan.results.map((score) => {
      const rule = rules.get(score.symbol);
      const decision = decisionLabel(score, rule);
      return {
        score,
        price: prices.get(score.symbol),
        rule,
        decision,
        primaryReason: firstLine(score.reasons) || rule?.fundamental_style || "No strong signal yet.",
        primaryRisk: firstLine(score.risks) || rule?.data_warnings[0] || "Review data before investing.",
      };
    });
  }, [data]);

  const visibleOpportunities = opportunities.filter((item) => {
    const normalized = query.trim().toLowerCase();
    const matchesQuery =
      !normalized ||
      item.score.symbol.toLowerCase().includes(normalized) ||
      item.score.name.toLowerCase().includes(normalized);
    const stockTypes = item.rule?.stock_types.join(" ").toLowerCase() ?? "";
    const matchesFilter =
      activeFilter === "All" ||
      item.decision === activeFilter ||
      stockTypes.includes(activeFilter.toLowerCase().replace(" stocks", " stock")) ||
      (activeFilter === "Needs Research" && item.score.status === "Insufficient data");
    return matchesQuery && matchesFilter;
  });

  const selected = opportunities.find((item) => item.score.symbol === selectedSymbol) ?? opportunities[0];

  return (
    <main className="app-shell">
      <AppHeader />

      <section className="opportunity-layout">
        <div className="opportunity-main">
          <div className="desk-heading">
            <div>
              <p className="eyebrow">Opportunity Desk</p>
              <h1>Which Nigerian companies deserve attention today?</h1>
            </div>
            {data && (
              <div className="desk-date">
                <span>Scan date</span>
                <strong>{data.scan.as_of_date}</strong>
                <button className="mini-refresh" onClick={loadData} type="button">
                  <RefreshCw size={15} />
                  Refresh
                </button>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="state-panel">
              <LoaderCircle className="spin" size={24} />
              Loading research signals...
            </div>
          )}

          {error && (
            <div className="state-panel error-state">
              <AlertTriangle size={24} />
              {error}
            </div>
          )}

          {data && !isLoading && (
            <>
              <div className="desk-stats">
                <Stat label="Companies scanned" value={String(data.scan.results.length)} />
                <Stat label="Pending review" value={String(data.digest.pending_review.total)} />
                <Stat label="Open alerts" value={String(data.digest.open_alerts.length)} />
                <Stat label="Exit signals" value={String(data.exits.signals.length)} />
              </div>

              <div className="desk-toolbar">
                <label className="search-field desk-search">
                  <Search size={18} />
                  <input
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search company or symbol"
                    type="search"
                    value={query}
                  />
                </label>
                <div className="filter-row" aria-label="Opportunity filters">
                  {filters.map((filter) => (
                    <button
                      className={filter === activeFilter ? "filter-chip active" : "filter-chip"}
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      type="button"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="opportunity-table" role="table" aria-label="Research opportunities">
                <div className="opportunity-row table-head" role="row">
                  <span>Company</span>
                  <span>Decision</span>
                  <span>Score</span>
                  <span>Price</span>
                  <span>Type</span>
                </div>
                {visibleOpportunities.map((item) => (
                  <div
                    className={
                      selected?.score.symbol === item.score.symbol
                        ? "opportunity-row selected"
                        : "opportunity-row"
                    }
                    key={item.score.symbol}
                    onClick={() => setSelectedSymbol(item.score.symbol)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        setSelectedSymbol(item.score.symbol);
                      }
                    }}
                    role="row"
                    tabIndex={0}
                  >
                    <span>
                      <strong>{item.score.symbol}</strong>
                      <small>{item.score.name}</small>
                      <Link className="row-link" to={`/company/${item.score.symbol}`}>
                        Open research
                      </Link>
                    </span>
                    <DecisionPill label={item.decision} />
                    <span>{numberText(item.score.overall_score)}</span>
                    <span>{moneyText(item.price?.close_price)}</span>
                    <span>{item.rule?.stock_types[0] ?? "Unclassified"}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="decision-panel">
          {selected ? (
            <>
              <p className="eyebrow">Selected company</p>
              <h2>{selected.score.symbol}</h2>
              <p className="panel-company-name">{selected.score.name}</p>
              <DecisionPill label={selected.decision} />

              <div className="panel-metrics">
                <Metric label="Overall" value={numberText(selected.score.overall_score)} />
                <Metric label="Quality" value={numberText(selected.score.quality_score)} />
                <Metric label="Valuation" value={numberText(selected.score.valuation_score)} />
                <Metric label="Dividend" value={numberText(selected.score.dividend_score)} />
              </div>

              <section className="panel-section">
                <h3>Why it deserves attention</h3>
                <p>{selected.primaryReason}</p>
              </section>

              <section className="panel-section">
                <h3>Main risk</h3>
                <p>{selected.primaryRisk}</p>
              </section>

              <section className="panel-section">
                <h3>Stock types</h3>
                <div className="type-tags">
                  {(selected.rule?.stock_types ?? ["Unclassified"]).map((type) => (
                    <span key={type}>{type}</span>
                  ))}
                </div>
              </section>

              <section className="panel-section">
                <h3>Beginner checklist</h3>
                <div className="checklist-list">
                  {(selected.rule?.checklist ?? []).slice(0, 5).map((item) => (
                    <span className={item.passed ? "passed" : "failed"} key={item.question}>
                      <CheckCircle2 size={16} />
                      {item.question}
                    </span>
                  ))}
                </div>
              </section>

              <Link className="button research-link-button" to={`/company/${selected.score.symbol}`}>
                Open full research page
              </Link>
              <Link className="button button-muted research-link-button" to={`/journal?symbol=${selected.score.symbol}`}>
                Create buy plan
              </Link>
            </>
          ) : (
            <p>Select a company to inspect its decision signals.</p>
          )}

          {data && data.exits.signals.length > 0 && (
            <section className="panel-section exit-box">
              <h3>
                <Bell size={18} />
                Portfolio exit signals
              </h3>
              {data.exits.signals.slice(0, 3).map((signal) => (
                <p key={signal.symbol}>
                  <strong>{signal.symbol}</strong>: {signal.action}
                </p>
              ))}
            </section>
          )}
        </aside>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="desk-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function DecisionPill({ label }: { label: string }) {
  return <span className={`decision-pill ${label.toLowerCase().replaceAll(" ", "-")}`}>{label}</span>;
}

function decisionLabel(score: Score, rule?: InvestmentRule) {
  if (rule?.decision_guardrails.some((guardrail) => guardrail.toLowerCase().includes("do not chase"))) {
    return "Do Not Chase";
  }
  if (score.status === "Insufficient data") {
    return "Needs Research";
  }
  if (score.status === "Needs source review") {
    return "Needs Research";
  }
  if (Number(score.overall_score) >= 70 && Number(score.valuation_score) >= 65) {
    return "Research Now";
  }
  if (Number(score.overall_score) >= 55) {
    return "Watch Closely";
  }
  return "Needs Research";
}

function firstLine(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
}

function moneyText(value?: string | null) {
  if (!value) {
    return "N/A";
  }
  return `₦${Number(value).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

function numberText(value?: string | null) {
  if (!value) {
    return "0";
  }
  return Number(value).toLocaleString("en-NG", { maximumFractionDigits: 1 });
}

export default AppShell;
