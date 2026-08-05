import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, LoaderCircle, Search } from "lucide-react";
import AppHeader from "./AppHeader";
import { loadMyWatchlist, loadOpportunityDesk } from "./api";
import type { DecisionDashboardOpportunity } from "./api";
import { starterCompanies } from "./onboardingData";

type WatchlistItem = {
  symbol: string;
  name: string;
  sector: string;
  opportunity?: DecisionDashboardOpportunity;
  decision: string;
  reason: string;
  risk: string;
};

function WatchlistsPage() {
  const watchlistSymbols = useMemo<string[]>(() => {
    const onboarding = localStorage.getItem("equitykobo.onboarding");
    if (!onboarding) {
      return [];
    }

    try {
      const parsedOnboarding = JSON.parse(onboarding);
      return Array.isArray(parsedOnboarding?.watchlist)
        ? parsedOnboarding.watchlist.filter((symbol: unknown): symbol is string => typeof symbol === "string")
        : [];
    } catch {
      return [];
    }
  }, []);
  const [remoteWatchlistSymbols, setRemoteWatchlistSymbols] = useState<string[] | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof loadOpportunityDesk>> | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const [desk, watchlist] = await Promise.all([
          loadOpportunityDesk(),
          loadMyWatchlist().catch(() => null),
        ]);
        setData(desk);
        setRemoteWatchlistSymbols(watchlist?.symbols ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load watchlist intelligence.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const items = useMemo(() => {
    if (!data) {
      return [];
    }
    const opportunities = new Map(data.ranked.map((opportunity) => [opportunity.symbol, opportunity]));
    const fallbackUniverse = starterCompanies.slice(0, 10).map((company) => company.symbol);
    const symbols = remoteWatchlistSymbols?.length
      ? remoteWatchlistSymbols
      : watchlistSymbols.length
        ? watchlistSymbols
        : fallbackUniverse;

    return symbols.map((symbol) => {
      const fallback = starterCompanies.find((company) => company.symbol === symbol);
      const opportunity = opportunities.get(symbol);
      return {
        symbol,
        name: opportunity?.name ?? fallback?.name ?? symbol,
        sector: opportunity?.sector ?? fallback?.sector ?? "Unknown",
        opportunity,
        decision: opportunity?.answer ?? "Needs Data",
        reason: opportunity?.why_attention || "Keep watching for clearer data.",
        risk: opportunity?.main_risk || "Confirm fundamentals before buying.",
      };
    });
  }, [data, remoteWatchlistSymbols, watchlistSymbols]);

  const visibleItems = items.filter((item) => {
    const normalized = query.trim().toLowerCase();
    return (
      !normalized ||
      item.symbol.toLowerCase().includes(normalized) ||
      item.name.toLowerCase().includes(normalized)
    );
  });

  return (
    <main className="watchlist-page">
      <AppHeader />

      <section className="watchlist-layout">
        <div className="watchlist-main">
          <div className="desk-heading">
            <div>
              <p className="eyebrow">Smart Watchlist</p>
              <h1>Watch first. Buy only when the entry makes sense.</h1>
            </div>
            <div className="desk-date">
              <span>Focus limit</span>
              <strong>{items.length}/10</strong>
            </div>
          </div>

          {items.length > 10 && (
            <div className="state-panel error-state">
              <AlertTriangle size={22} />
              Keep beginner watchlists near 10 names so attention stays focused.
            </div>
          )}

          <label className="search-field desk-search">
            <Search size={18} />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your watchlist"
              type="search"
              value={query}
            />
          </label>

          {isLoading && (
            <div className="state-panel">
              <LoaderCircle className="spin" size={24} />
              Loading watchlist signals...
            </div>
          )}

          {error && (
            <div className="state-panel error-state">
              <AlertTriangle size={24} />
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="watchlist-grid">
              {visibleItems.map((item) => (
                <WatchlistCard item={item} key={item.symbol} />
              ))}
            </div>
          )}
        </div>

        <aside className="watchlist-aside">
          <p className="eyebrow">Beginner rule</p>
          <h2>Do not confuse interest with entry.</h2>
          <p>
            A watchlist is not a buy list. It is where EquityKobo helps you monitor price,
            valuation, data confidence, and risks until the decision becomes clearer.
          </p>
          <div className="watchlist-principles">
            <span>
              <CheckCircle2 size={16} />
              Keep it focused
            </span>
            <span>
              <CheckCircle2 size={16} />
              Track the reason
            </span>
            <span>
              <CheckCircle2 size={16} />
              Wait for better entry
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}

function WatchlistCard({ item }: { item: WatchlistItem }) {
  return (
    <article className="watchlist-card">
      <div className="watchlist-card-head">
        <div>
          <strong>{item.symbol}</strong>
          <span>{item.name}</span>
        </div>
        <DecisionBadge label={item.decision} />
      </div>
      <div className="watchlist-card-metrics">
        <span>
          <small>Price</small>
          <strong>{moneyText(item.opportunity?.latest_price)}</strong>
        </span>
        <span>
          <small>Score</small>
          <strong>{numberText(item.opportunity?.invest_score)}</strong>
        </span>
        <span>
          <small>Sector</small>
          <strong>{item.sector}</strong>
        </span>
      </div>
      <section>
        <h3>Why watch</h3>
        <p>{item.reason}</p>
      </section>
      <section>
        <h3>What to check</h3>
        <p>{item.risk}</p>
      </section>
      <div className="type-tags">
        {(item.opportunity?.stock_types ?? ["Classification unavailable"]).slice(0, 3).map((type) => (
          <span key={type}>{type}</span>
        ))}
      </div>
      <Link className="row-link" to={`/company/${item.symbol}`}>
        Open research
      </Link>
      <Link className="row-link" to={`/journal?symbol=${item.symbol}`}>
        Create buy plan
      </Link>
    </article>
  );
}

function DecisionBadge({ label }: { label: string }) {
  return <span className={`decision-pill ${decisionClass(label)}`}>{label}</span>;
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

function decisionClass(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default WatchlistsPage;
