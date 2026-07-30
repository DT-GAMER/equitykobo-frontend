import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, LoaderCircle, Search } from "lucide-react";
import AppHeader from "./AppHeader";
import { InvestmentRule, Score, loadMyWatchlist, loadOpportunityDesk } from "./api";
import { starterCompanies } from "./onboardingData";

type WatchlistItem = {
  symbol: string;
  name: string;
  sector: string;
  score?: Score;
  rule?: InvestmentRule;
  price?: string;
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
    const scores = new Map(data.scan.results.map((score) => [score.symbol, score]));
    const rules = new Map(data.rules.map((rule) => [rule.symbol, rule]));
    const prices = new Map(data.prices.map((price) => [price.symbol, price.close_price]));
    const fallbackUniverse = starterCompanies.slice(0, 10).map((company) => company.symbol);
    const symbols = remoteWatchlistSymbols?.length
      ? remoteWatchlistSymbols
      : watchlistSymbols.length
        ? watchlistSymbols
        : fallbackUniverse;

    return symbols.map((symbol) => {
      const fallback = starterCompanies.find((company) => company.symbol === symbol);
      const score = scores.get(symbol);
      const rule = rules.get(symbol);
      const decision = entryDecision(score, rule);
      return {
        symbol,
        name: score?.name ?? rule?.name ?? fallback?.name ?? symbol,
        sector: score?.sector ?? rule?.sector ?? fallback?.sector ?? "Unknown",
        score,
        rule,
        price: prices.get(symbol),
        decision,
        reason: firstLine(score?.reasons) || rule?.fundamental_style || "Keep watching for clearer data.",
        risk: firstLine(score?.risks) || rule?.data_warnings[0] || "Confirm fundamentals before buying.",
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
          <strong>{moneyText(item.price)}</strong>
        </span>
        <span>
          <small>Score</small>
          <strong>{numberText(item.score?.overall_score)}</strong>
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
        {(item.rule?.stock_types ?? ["Needs classification"]).slice(0, 3).map((type) => (
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
  return <span className={`decision-pill ${label.toLowerCase().replaceAll(" ", "-")}`}>{label}</span>;
}

function entryDecision(score?: Score, rule?: InvestmentRule) {
  if (!score || score.status === "Insufficient data") {
    return "Needs Research";
  }
  if (rule?.decision_guardrails.some((guardrail) => guardrail.toLowerCase().includes("do not chase"))) {
    return "Do Not Chase";
  }
  if (Number(score.overall_score) >= 70 && Number(score.valuation_score) >= 65) {
    return "Research Now";
  }
  if (Number(score.overall_score) >= 55) {
    return "Watch Closely";
  }
  return "Still Watching";
}

function firstLine(value?: string) {
  return value
    ?.split("\n")
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

export default WatchlistsPage;
