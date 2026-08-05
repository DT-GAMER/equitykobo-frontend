import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BriefcaseBusiness, CheckCircle2, LoaderCircle, Plus } from "lucide-react";
import AppHeader from "./AppHeader";
import {
  PortfolioSummary,
  PortfolioTransaction,
  createMyPortfolioTransaction,
  loadMyPortfolioSummary,
  loadMyPortfolioTransactions,
} from "./api";
import { starterCompanies } from "./onboardingData";

const emptySummary: PortfolioSummary = {
  total_cost_basis: "0",
  total_market_value: "0",
  total_unrealized_gain_loss: "0",
  total_unrealized_gain_loss_percent: null,
  total_dividends_received: "0",
  positions: [],
  sector_allocation: [],
  warnings: [],
};

function PortfolioPage() {
  const [summary, setSummary] = useState<PortfolioSummary>(emptySummary);
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>([]);
  const [draft, setDraft] = useState({
    symbol: "",
    transaction_date: new Date().toISOString().slice(0, 10),
    transaction_type: "BUY" as "BUY" | "SELL" | "DIVIDEND",
    quantity: "",
    price_per_share: "",
    fees: "0",
    cash_amount: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    setIsLoading(true);
    setError("");
    try {
      const [nextSummary, nextTransactions] = await Promise.all([
        loadMyPortfolioSummary(),
        loadMyPortfolioTransactions(),
      ]);
      setSummary(nextSummary);
      setTransactions(nextTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load portfolio.");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSaving(true);
    try {
      await createMyPortfolioTransaction({
        symbol: draft.symbol.toUpperCase(),
        transaction_date: draft.transaction_date,
        transaction_type: draft.transaction_type,
        quantity: draft.transaction_type === "DIVIDEND" ? "0" : draft.quantity,
        price_per_share: draft.transaction_type === "DIVIDEND" ? null : draft.price_per_share,
        fees: draft.fees || "0",
        cash_amount: draft.transaction_type === "DIVIDEND" ? draft.cash_amount : null,
        notes: draft.notes,
      });
      setDraft((current) => ({
        ...current,
        quantity: "",
        price_per_share: "",
        fees: "0",
        cash_amount: "",
        notes: "",
      }));
      await loadPortfolio();
      setNotice("Transaction saved to your account.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save transaction.");
    } finally {
      setIsSaving(false);
    }
  }

  const gainClass = useMemo(
    () => (Number(summary.total_unrealized_gain_loss) >= 0 ? "positive" : "negative"),
    [summary.total_unrealized_gain_loss],
  );

  return (
    <main className="portfolio-page">
      <AppHeader />

      <section className="portfolio-layout">
        <div className="portfolio-main">
          <div className="desk-heading">
            <div>
              <p className="eyebrow">My Portfolio</p>
              <h1>Track what you actually own.</h1>
            </div>
            <div className="desk-date">
              <span>Market value</span>
              <strong>{moneyText(summary.total_market_value)}</strong>
            </div>
          </div>

          {isLoading && (
            <div className="state-panel">
              <LoaderCircle className="spin" size={24} />
              Loading portfolio...
            </div>
          )}

          {error && (
            <div className="state-panel error-state">
              <AlertTriangle size={24} />
              {error}
            </div>
          )}

          {notice && (
            <div className="state-panel success-state">
              <CheckCircle2 size={22} />
              {notice}
            </div>
          )}

          {!isLoading && (
            <>
              <div className="desk-stats">
                <Stat label="Cost basis" value={moneyText(summary.total_cost_basis)} />
                <Stat label="Market value" value={moneyText(summary.total_market_value)} />
                <Stat
                  className={gainClass}
                  label="Unrealized"
                  value={moneyText(summary.total_unrealized_gain_loss)}
                />
                <Stat label="Dividends" value={moneyText(summary.total_dividends_received)} />
              </div>

              {summary.warnings.length > 0 && (
                <div className="planner-warning-list">
                  {summary.warnings.map((warning) => (
                    <span key={warning}>
                      <AlertTriangle size={16} />
                      {warning}
                    </span>
                  ))}
                </div>
              )}

              <section className="portfolio-section">
                <h2>Positions</h2>
                {summary.positions.length ? (
                  <div className="portfolio-table" role="table" aria-label="Portfolio positions">
                    <div className="portfolio-row table-head" role="row">
                      <span>Company</span>
                      <span>Qty</span>
                      <span>Avg cost</span>
                      <span>Latest</span>
                      <span>Value</span>
                      <span>Weight</span>
                    </div>
                    {summary.positions.map((position) => (
                      <div className="portfolio-row" key={position.symbol} role="row">
                        <span data-label="Company">
                          <strong>{position.symbol}</strong>
                          <small>{position.name}</small>
                        </span>
                        <span data-label="Qty">{numberText(position.quantity)}</span>
                        <span data-label="Avg cost">{moneyText(position.average_cost)}</span>
                        <span data-label="Latest">{moneyText(position.latest_price)}</span>
                        <span data-label="Value">{moneyText(position.market_value)}</span>
                        <span data-label="Weight">{percentText(position.portfolio_weight)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="state-panel">
                    <BriefcaseBusiness size={24} />
                    No holdings yet. Add your first buy transaction.
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <aside className="portfolio-aside">
          <form className="journal-form" onSubmit={saveTransaction}>
            <div className="journal-form-head">
              <BriefcaseBusiness size={22} />
              <div>
                <h2>Add transaction</h2>
                <p>Record buys, sells, and dividends so EquityKobo can calculate exposure.</p>
              </div>
            </div>

            <label>
              Symbol
              <input
                list="portfolio-symbols"
                onChange={(event) => setDraft((current) => ({ ...current, symbol: event.target.value }))}
                placeholder="GTCO"
                required
                value={draft.symbol}
              />
            </label>
            <div className="journal-form-grid">
              <label>
                Type
                <select
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      transaction_type: event.target.value as "BUY" | "SELL" | "DIVIDEND",
                    }))
                  }
                  value={draft.transaction_type}
                >
                  <option>BUY</option>
                  <option>SELL</option>
                  <option>DIVIDEND</option>
                </select>
              </label>
              <label>
                Date
                <input
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, transaction_date: event.target.value }))
                  }
                  required
                  type="date"
                  value={draft.transaction_date}
                />
              </label>
            </div>

            {draft.transaction_type !== "DIVIDEND" && (
              <div className="journal-form-grid">
                <label>
                  Quantity
                  <input
                    inputMode="decimal"
                    onChange={(event) => setDraft((current) => ({ ...current, quantity: event.target.value }))}
                    placeholder="100"
                    required
                    value={draft.quantity}
                  />
                </label>
                <label>
                  Price/share
                  <input
                    inputMode="decimal"
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, price_per_share: event.target.value }))
                    }
                    placeholder="131.10"
                    required
                    value={draft.price_per_share}
                  />
                </label>
              </div>
            )}

            {draft.transaction_type === "DIVIDEND" && (
              <label>
                Cash received
                <input
                  inputMode="decimal"
                  onChange={(event) => setDraft((current) => ({ ...current, cash_amount: event.target.value }))}
                  placeholder="5000"
                  required
                  value={draft.cash_amount}
                />
              </label>
            )}

            <label>
              Fees
              <input
                inputMode="decimal"
                onChange={(event) => setDraft((current) => ({ ...current, fees: event.target.value }))}
                placeholder="0"
                value={draft.fees}
              />
            </label>
            <label>
              Notes
              <textarea
                onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Why did you make this transaction?"
                value={draft.notes}
              />
            </label>

            <datalist id="portfolio-symbols">
              {starterCompanies.map((company) => (
                <option key={company.symbol} value={company.symbol}>
                  {company.name}
                </option>
              ))}
            </datalist>

            <button className="button journal-submit" disabled={isSaving} type="submit">
              <Plus size={18} />
              {isSaving ? "Saving" : "Save transaction"}
            </button>
          </form>

          <section className="panel-section">
            <h3>Sector exposure</h3>
            <div className="sector-allocation-list">
              {summary.sector_allocation.length ? (
                summary.sector_allocation.map((sector) => (
                  <span key={sector.sector}>
                    <strong>{sector.sector}</strong>
                    <small>{percentText(sector.portfolio_weight)}</small>
                    <i style={{ width: `${Math.min(Number(sector.portfolio_weight), 100)}%` }} />
                  </span>
                ))
              ) : (
                <p>No sector exposure yet.</p>
              )}
            </div>
          </section>

          <section className="panel-section">
            <h3>Recent transactions</h3>
            <div className="transaction-list">
              {transactions.slice(0, 6).map((transaction) => (
                <span key={transaction.id}>
                  <strong>
                    {transaction.symbol} {transaction.transaction_type}
                  </strong>
                  <small>
                    {transaction.transaction_date} · {numberText(transaction.quantity)} units
                  </small>
                </span>
              ))}
              {!transactions.length && <p>No transactions yet.</p>}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Stat({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <article className={`desk-stat ${className}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function moneyText(value?: string | null) {
  if (!value) {
    return "₦0";
  }
  return `₦${Number(value).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

function numberText(value?: string | null) {
  if (!value) {
    return "0";
  }
  return Number(value).toLocaleString("en-NG", { maximumFractionDigits: 2 });
}

function percentText(value?: string | null) {
  if (!value) {
    return "0%";
  }
  return `${Number(value).toLocaleString("en-NG", { maximumFractionDigits: 1 })}%`;
}

export default PortfolioPage;
