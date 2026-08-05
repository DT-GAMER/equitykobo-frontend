import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  Eye,
  LineChart,
  LoaderCircle,
  PanelRightClose,
  PanelRightOpen,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import AppHeader from "./AppHeader";
import { getStoredUser, loadOpportunityDesk } from "./api";
import type {
  DecisionDashboardOpportunity,
  DecisionDashboardSpotlight,
} from "./api";

function AppShell() {
  const [data, setData] = useState<Awaited<ReturnType<typeof loadOpportunityDesk>> | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [activeCategory, setActiveCategory] = useState("top_research");
  const [query, setQuery] = useState("");
  const [rankingQuery, setRankingQuery] = useState("");
  const [rankingPage, setRankingPage] = useState(1);
  const [rankingPageSize, setRankingPageSize] = useState(20);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(
    () => localStorage.getItem("equitykobo.inspector") !== "closed",
  );
  const user = getStoredUser();
  const firstName = (user?.full_name || user?.email || "Investor").split(/[ @]/)[0];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem("equitykobo.inspector", isInspectorOpen ? "open" : "closed");
  }, [isInspectorOpen]);

  useEffect(() => {
    setRankingPage(1);
  }, [rankingPageSize, rankingQuery]);

  async function loadData() {
    setIsLoading(true);
    setError("");
    try {
      const desk = await loadOpportunityDesk();
      setData(desk);
      const firstSpotlight = desk.spotlight_cards.find((card) => card.opportunity)?.opportunity;
      setSelectedSymbol(firstSpotlight?.symbol ?? desk.ranked[0]?.symbol ?? "");
      setActiveCategory(desk.categories[0]?.key ?? "top_research");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load Opportunity Desk.");
    } finally {
      setIsLoading(false);
    }
  }

  const selected = useMemo(() => {
    if (!data) {
      return null;
    }
    return data.ranked.find((item) => item.symbol === selectedSymbol) ?? data.ranked[0] ?? null;
  }, [data, selectedSymbol]);

  const rankingMatches = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.ranked.filter((item) => matchesQuery(item, rankingQuery));
  }, [data, rankingQuery]);

  const rankingTotalPages = Math.max(1, Math.ceil(rankingMatches.length / rankingPageSize));
  const activeRankingPage = Math.min(rankingPage, rankingTotalPages);
  const rankingStartIndex = (activeRankingPage - 1) * rankingPageSize;
  const paginatedRanked = rankingMatches.slice(rankingStartIndex, rankingStartIndex + rankingPageSize);
  const rankingStart = rankingMatches.length ? rankingStartIndex + 1 : 0;
  const rankingEnd = Math.min(rankingStartIndex + rankingPageSize, rankingMatches.length);

  const activeCategoryData = useMemo(() => {
    if (!data) {
      return null;
    }
    return data.categories.find((category) => category.key === activeCategory) ?? data.categories[0] ?? null;
  }, [activeCategory, data]);

  const categoryItems = useMemo(() => {
    return activeCategoryData?.items.filter((item) => matchesQuery(item, query)) ?? [];
  }, [activeCategoryData, query]);

  function inspectSymbol(symbol: string) {
    setSelectedSymbol(symbol);
    setIsInspectorOpen(true);
  }

  return (
    <main className="app-shell">
      <AppHeader />

      <section className={isInspectorOpen ? "dashboard-layout" : "dashboard-layout inspector-closed"}>
        <div className="dashboard-main">
          <section className="desk-surface">
            <div className="desk-surface-main">
              <div className="hero-copy">
                <p className="eyebrow">Welcome back, {firstName}</p>
                <h1>Start with the companies worth your attention.</h1>
              </div>
            </div>

            <div className="desk-summary-strip" aria-label="Market decision summary">
              <SummaryTile
                icon={<Target size={19} />}
                label="Research candidates"
                value={data?.market_summary.research_candidates ?? 0}
                tone="positive"
                onClick={() => setActiveCategory("top_research")}
              />
              <SummaryTile
                icon={<LineChart size={19} />}
                label="Undervalued quality"
                value={data?.market_summary.undervalued_quality ?? 0}
                tone="positive"
                onClick={() => setActiveCategory("undervalued_quality")}
              />
              <SummaryTile
                icon={<Award size={19} />}
                label="Sector leaders"
                value={data?.market_summary.sector_leaders ?? 0}
                tone="neutral"
                onClick={() => setActiveCategory("sector_leaders")}
              />
              <SummaryTile
                icon={<Clock size={19} />}
                label="Watch for entry"
                value={data?.market_summary.watch_for_entry ?? 0}
                tone="warning"
                onClick={() => setActiveCategory("watch_for_entry")}
              />
              <SummaryTile
                icon={<CircleAlert size={19} />}
                label="Avoid / needs data"
                value={data?.market_summary.avoid_or_needs_data ?? 0}
                tone="danger"
                onClick={() => setActiveCategory("avoid_or_speculative")}
              />
            </div>
          </section>

          {isLoading && (
            <div className="state-panel dashboard-state">
              <LoaderCircle className="spin" size={24} />
              Loading decision dashboard...
            </div>
          )}

          {error && (
            <div className="state-panel error-state dashboard-state">
              <AlertTriangle size={24} />
              {error}
            </div>
          )}

          {data && !isLoading && (
            <>
              <section className="spotlight-section">
                <div className="section-title-split">
                  <div>
                    <p className="eyebrow">Start here</p>
                    <h2>Three answers before any table</h2>
                  </div>
                  <label className="search-field dashboard-search">
                    <Search size={18} />
                    <input
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search company or symbol"
                      type="search"
                      value={query}
                    />
                  </label>
                </div>

                <div className="spotlight-grid">
                  {data.spotlight_cards.map((card) => (
                    <SpotlightCard
                      card={card}
                      isSelected={card.opportunity?.symbol === selected?.symbol}
                      key={card.key}
                      onSelect={inspectSymbol}
                    />
                  ))}
                </div>
              </section>

              <section className="category-desk">
                <div className="section-title-split">
                  <div>
                    <p className="eyebrow">Beginner categories</p>
                    <h2>Choose the kind of opportunity you understand</h2>
                  </div>
                </div>

                <div className="category-tab-row" aria-label="Dashboard opportunity categories">
                  {data.categories.map((category) => (
                    <button
                      className={category.key === activeCategory ? "category-tab active" : "category-tab"}
                      key={category.key}
                      onClick={() => setActiveCategory(category.key)}
                      type="button"
                    >
                      {category.title}
                      <span>{category.items.length}</span>
                    </button>
                  ))}
                </div>

                {activeCategoryData && (
                  <div className="category-panel">
                    <div className="category-panel-head">
                      <div>
                        <h3>{activeCategoryData.title}</h3>
                        <p>{activeCategoryData.summary}</p>
                      </div>
                    </div>

                    {categoryItems.length > 0 ? (
                      <div className="opportunity-card-grid">
                        {categoryItems.slice(0, 6).map((item) => (
                          <OpportunityCard
                            isSelected={item.symbol === selected?.symbol}
                            item={item}
                            key={item.symbol}
                            onSelect={inspectSymbol}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="state-panel muted-state">
                        <Eye size={20} />
                        No matching companies in this category yet.
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="ranking-section">
                <div className="section-title-split">
                  <div>
                    <p className="eyebrow">Full ranking</p>
                    <h2>All companies, sorted by decision strength</h2>
                  </div>
                  <span className="ranking-count">
                    {rankingStart}-{rankingEnd} of {rankingMatches.length}
                  </span>
                </div>

                <div className="ranking-toolbar">
                  <label className="search-field ranking-search">
                    <Search size={18} />
                    <input
                      onChange={(event) => setRankingQuery(event.target.value)}
                      placeholder="Search all companies, symbols, or sectors"
                      type="search"
                      value={rankingQuery}
                    />
                  </label>

                  <label className="page-size-control">
                    <span>Rows</span>
                    <select
                      onChange={(event) => setRankingPageSize(Number(event.target.value))}
                      value={rankingPageSize}
                    >
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </label>
                </div>

                <div className="dashboard-table" role="table" aria-label="Full opportunity ranking">
                  <div className="dashboard-row dashboard-row-head" role="row">
                    <span>Company</span>
                    <span>Answer</span>
                    <span>Score</span>
                    <span>Valuation</span>
                    <span>Peer</span>
                    <span>Action</span>
                  </div>
                  {paginatedRanked.map((item) => (
                    <RankingRow
                      isSelected={item.symbol === selected?.symbol}
                      item={item}
                      key={item.symbol}
                      onSelect={inspectSymbol}
                    />
                  ))}
                </div>

                {rankingMatches.length > 0 ? (
                  <div className="pagination-row">
                    <button
                      className="pagination-button"
                      disabled={activeRankingPage === 1}
                      onClick={() => setRankingPage((page) => Math.max(1, page - 1))}
                      type="button"
                    >
                      <ChevronLeft size={17} />
                      Previous
                    </button>
                    <span>
                      Page {activeRankingPage} of {rankingTotalPages}
                    </span>
                    <button
                      className="pagination-button"
                      disabled={activeRankingPage === rankingTotalPages}
                      onClick={() => setRankingPage((page) => Math.min(rankingTotalPages, page + 1))}
                      type="button"
                    >
                      Next
                      <ChevronRight size={17} />
                    </button>
                  </div>
                ) : (
                  <div className="state-panel muted-state">
                    <Search size={20} />
                    No company matches that full-ranking search.
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {isInspectorOpen ? (
          <aside className="dashboard-side-panel">
            <button
              aria-label="Collapse decision inspector"
              className="panel-collapse-button"
              onClick={() => setIsInspectorOpen(false)}
              type="button"
            >
              <PanelRightClose size={18} />
              Collapse inspector
            </button>
            {selected ? (
              <DecisionInspector item={selected} />
            ) : (
              <p>Select a company to inspect its decision signal.</p>
            )}
          </aside>
        ) : (
          <button
            aria-label="Open decision inspector"
            className="inspector-open-button"
            onClick={() => setIsInspectorOpen(true)}
            type="button"
          >
            <PanelRightOpen size={18} />
            Open inspector
          </button>
        )}
      </section>
    </main>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  tone,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone: "positive" | "warning" | "danger" | "neutral";
  onClick?: () => void;
}) {
  return (
    <button className={`summary-tile ${tone}`} onClick={onClick} type="button">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </button>
  );
}

function SpotlightCard({
  card,
  isSelected,
  onSelect,
}: {
  card: DecisionDashboardSpotlight;
  isSelected: boolean;
  onSelect: (symbol: string) => void;
}) {
  const item = card.opportunity;
  return (
    <article className={isSelected ? "spotlight-card selected" : "spotlight-card"}>
      <span className="spotlight-label">{card.title}</span>
      <h3>{item?.symbol ?? "Not available"}</h3>
      <p>{item ? item.name : card.subtitle}</p>
      {item ? (
        <>
          <div className="spotlight-score-line">
            <DecisionPill label={item.answer} tone={item.tone} />
            <strong>{numberText(item.invest_score)}</strong>
          </div>
          <p className="spotlight-reason">{item.why_attention}</p>
          <button className="inspect-button" onClick={() => onSelect(item.symbol)} type="button">
            Inspect signal
            <ArrowRight size={16} />
          </button>
        </>
      ) : (
        <small>{card.subtitle}</small>
      )}
    </article>
  );
}

function OpportunityCard({
  item,
  isSelected,
  onSelect,
}: {
  item: DecisionDashboardOpportunity;
  isSelected: boolean;
  onSelect: (symbol: string) => void;
}) {
  return (
    <article className={`decision-opportunity-card ${item.tone} ${isSelected ? "selected" : ""}`}>
      <div className="opportunity-card-head">
        <div>
          <strong>{item.symbol}</strong>
          <span>{item.name}</span>
        </div>
        <div className={`card-score-ring ${item.tone}`}>
          <span>{numberText(item.invest_score)}</span>
        </div>
      </div>

      <DecisionPill label={item.answer} tone={item.tone} />

      <div className="mini-metric-grid">
        <MiniMetric label="Confidence" value={item.confidence} />
        <MiniMetric label="Valuation" value={item.valuation_label ?? "N/A"} />
        <MiniMetric label="Peer rank" value={rankText(item.peer_rank, item.peer_count)} />
      </div>

      <section className="reason-risk-block">
        <p>
          <CheckCircle2 size={15} />
          {item.why_attention}
        </p>
        <p>
          <AlertTriangle size={15} />
          {item.main_risk}
        </p>
      </section>

      <div className="type-tags compact-tags">
        {item.category_tags.slice(0, 3).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="card-action-row">
        <button className="inspect-button" onClick={() => onSelect(item.symbol)} type="button">
          Inspect
        </button>
        <Link className="row-link" to={`/company/${item.symbol}`}>
          Full research
        </Link>
      </div>
    </article>
  );
}

function RankingRow({
  item,
  isSelected,
  onSelect,
}: {
  item: DecisionDashboardOpportunity;
  isSelected: boolean;
  onSelect: (symbol: string) => void;
}) {
  return (
    <div
      className={isSelected ? "dashboard-row selected" : "dashboard-row"}
      role="row"
    >
      <Link className="ranking-company-link" to={`/company/${item.symbol}`}>
        <strong>{item.symbol}</strong>
        <small>{item.name}</small>
      </Link>
      <DecisionPill label={item.answer} tone={item.tone} />
      <span>{numberText(item.invest_score)}</span>
      <span>
        <strong>{item.valuation_label ?? "N/A"}</strong>
        <small>{percentText(item.margin_of_safety_percent)} margin</small>
      </span>
      <span>{rankText(item.peer_rank, item.peer_count)}</span>
      <span className="ranking-actions">
        <small>{item.next_action}</small>
        <span>
          <button className="ranking-action-button" onClick={() => onSelect(item.symbol)} type="button">
            Inspect
          </button>
          <Link className="ranking-action-button primary" to={`/company/${item.symbol}`}>
            Research
          </Link>
        </span>
      </span>
    </div>
  );
}

function DecisionInspector({ item }: { item: DecisionDashboardOpportunity }) {
  return (
    <>
      <p className="eyebrow">Decision inspector</p>
      <h2>{item.symbol}</h2>
      <p className="panel-company-name">{item.name}</p>
      <DecisionPill label={item.answer} tone={item.tone} />

      <div className="inspector-score">
        <span>Invest Score</span>
        <strong>{numberText(item.invest_score)}</strong>
        <small>{item.confidence} confidence</small>
      </div>

      <div className="panel-metrics">
        <Metric label="Price" value={moneyText(item.latest_price)} />
        <Metric label="Fair value" value={moneyText(item.fair_value_mid)} />
        <Metric label="Margin" value={percentText(item.margin_of_safety_percent)} />
        <Metric label="Peer" value={rankText(item.peer_rank, item.peer_count)} />
      </div>

      <section className="panel-section">
        <h3>
          <CheckCircle2 size={18} />
          Why it deserves attention
        </h3>
        <p>{item.why_attention}</p>
      </section>

      <section className="panel-section">
        <h3>
          <AlertTriangle size={18} />
          Main risk
        </h3>
        <p>{item.main_risk}</p>
      </section>

      <section className="panel-section">
        <h3>
          <Target size={18} />
          Next action
        </h3>
        <p>{item.next_action}</p>
      </section>

      <section className="panel-section">
        <h3>
          <ShieldCheck size={18} />
          Stock types
        </h3>
        <div className="type-tags">
          {item.stock_types.map((type) => (
            <span key={type}>{type}</span>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>
          <TrendingUp size={18} />
          Score layers
        </h3>
        <div className="panel-metrics memory-metrics">
          <Metric label="Quality" value={numberText(item.scores.business_quality)} />
          <Metric label="Growth" value={numberText(item.scores.growth)} />
          <Metric label="Dividend" value={numberText(item.scores.dividend)} />
          <Metric label="Liquidity" value={numberText(item.scores.liquidity)} />
        </div>
      </section>

      <Link className="button research-link-button" to={`/company/${item.symbol}`}>
        Open full decision card
      </Link>
      <Link className="button button-muted research-link-button" to={`/journal?symbol=${item.symbol}`}>
        Create buy plan
      </Link>
    </>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
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

function DecisionPill({ label, tone }: { label: string; tone?: string }) {
  return <span className={`decision-pill ${tone || decisionClass(label)}`}>{label}</span>;
}

function matchesQuery(item: DecisionDashboardOpportunity, query: string) {
  const normalized = query.trim().toLowerCase();
  return (
    !normalized ||
    item.symbol.toLowerCase().includes(normalized) ||
    item.name.toLowerCase().includes(normalized) ||
    item.sector?.toLowerCase().includes(normalized)
  );
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

function percentText(value?: string | null) {
  if (!value) {
    return "N/A";
  }
  return `${Number(value).toLocaleString("en-NG", { maximumFractionDigits: 1 })}%`;
}

function rankText(rank?: number | null, peerCount?: number | null) {
  if (!rank || !peerCount) {
    return "N/A";
  }
  return `${rank} of ${peerCount}`;
}

function decisionClass(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default AppShell;
