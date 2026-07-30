import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpenCheck, CheckCircle2, Plus, Search, Trash2 } from "lucide-react";
import AppHeader from "./AppHeader";
import { createMyJournalEntry, deleteMyJournalEntry, loadMyJournal } from "./api";
import { starterCompanies } from "./onboardingData";

type JournalEntry = {
  id: string | number;
  symbol: string;
  thesis: string;
  goal: string;
  horizon: string;
  targetEntry?: string | null;
  exitRule?: string | null;
  risk?: string | null;
  status: "Watching" | "Ready to research" | "Bought" | "Rejected";
  createdAt: string;
  remote?: boolean;
};

const storageKey = "equitykobo.journal";

const emptyEntry: Omit<JournalEntry, "id" | "createdAt"> = {
  symbol: "",
  thesis: "",
  goal: "Capital growth",
  horizon: "3 to 5 years",
  targetEntry: "",
  exitRule: "",
  risk: "",
  status: "Watching",
};

function JournalPage() {
  const [searchParams] = useSearchParams();
  const initialSymbol = searchParams.get("symbol")?.toUpperCase() ?? "";
  const [entries, setEntries] = useState<JournalEntry[]>(loadEntries);
  const [draft, setDraft] = useState({ ...emptyEntry, symbol: initialSymbol });
  const [query, setQuery] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function loadRemoteEntries() {
      try {
        const remoteEntries = await loadMyJournal();
        const normalizedEntries = remoteEntries.map((entry) => ({
          id: entry.id,
          symbol: entry.symbol,
          thesis: entry.thesis,
          goal: entry.goal,
          horizon: entry.horizon,
          targetEntry: entry.target_entry,
          exitRule: entry.exit_rule,
          risk: entry.risk,
          status: entry.status,
          createdAt: entry.created_at,
          remote: true,
        }));
        setEntries(normalizedEntries);
        storeEntries(normalizedEntries);
        setSyncStatus("Synced to account");
      } catch {
        setSyncStatus("Saved locally until account sync is available");
        setNotice("Journal is showing local data because account sync is unavailable.");
      }
    }

    loadRemoteEntries();
  }, []);

  const visibleEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter(
      (entry) =>
        !normalized ||
        entry.symbol.toLowerCase().includes(normalized) ||
        entry.thesis.toLowerCase().includes(normalized) ||
        entry.status.toLowerCase().includes(normalized),
    );
  }, [entries, query]);

  const stats = useMemo(
    () => ({
      total: entries.length,
      watching: entries.filter((entry) => entry.status === "Watching").length,
      ready: entries.filter((entry) => entry.status === "Ready to research").length,
      bought: entries.filter((entry) => entry.status === "Bought").length,
    }),
    [entries],
  );

  async function saveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSymbol = draft.symbol.trim().toUpperCase();
    if (!normalizedSymbol || !draft.thesis.trim()) {
      return;
    }

    const localEntry: JournalEntry = {
      ...draft,
      id: crypto.randomUUID(),
      symbol: normalizedSymbol,
      thesis: draft.thesis.trim(),
      targetEntry: draft.targetEntry?.trim(),
      exitRule: draft.exitRule?.trim(),
      risk: draft.risk?.trim(),
      createdAt: new Date().toISOString(),
      remote: false,
    };
    let nextEntry = localEntry;
    try {
      const remoteEntry = await createMyJournalEntry({
        symbol: localEntry.symbol,
        thesis: localEntry.thesis,
        goal: localEntry.goal,
        horizon: localEntry.horizon,
        target_entry: localEntry.targetEntry,
        exit_rule: localEntry.exitRule,
        risk: localEntry.risk,
        status: localEntry.status,
      });
      nextEntry = {
        ...localEntry,
        id: remoteEntry.id,
        createdAt: remoteEntry.created_at,
        remote: true,
      };
      setSyncStatus("Synced to account");
      setNotice("Buy plan saved to your account.");
    } catch {
      setSyncStatus("Saved locally until account sync is available");
      setNotice("Buy plan saved locally. It will sync when the backend is available.");
    }
    const nextEntries = [nextEntry, ...entries];
    setEntries(nextEntries);
    storeEntries(nextEntries);
    setDraft({ ...emptyEntry, symbol: normalizedSymbol });
  }

  async function removeEntry(entry: JournalEntry) {
    if (!window.confirm(`Delete the ${entry.symbol} buy plan?`)) {
      return;
    }
    if (entry.remote && typeof entry.id === "number") {
      await deleteMyJournalEntry(entry.id).catch(() => null);
    }
    const id = entry.id;
    const nextEntries = entries.filter((entry) => entry.id !== id);
    setEntries(nextEntries);
    storeEntries(nextEntries);
    setNotice("Buy plan deleted.");
  }

  return (
    <main className="journal-page">
      <AppHeader />

      <section className="journal-layout">
        <div className="journal-main">
          <div className="desk-heading">
            <div>
              <p className="eyebrow">Decision Journal</p>
              <h1>Write the reason before you risk the money.</h1>
            </div>
            <div className="desk-date">
              <span>{syncStatus || "Saved plans"}</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="desk-stats">
            <Stat label="Watching" value={String(stats.watching)} />
            <Stat label="Ready research" value={String(stats.ready)} />
            <Stat label="Bought" value={String(stats.bought)} />
            <Stat label="Max focus" value="10" />
          </div>

          {notice && (
            <div className="state-panel success-state">
              <CheckCircle2 size={22} />
              {notice}
            </div>
          )}

          <form className="journal-form" onSubmit={saveEntry}>
            <div className="journal-form-head">
              <BookOpenCheck size={22} />
              <div>
                <h2>Create a buy plan</h2>
                <p>Record your thesis, entry condition, risk, and sell rule before you act.</p>
              </div>
            </div>

            <div className="journal-form-grid">
              <label>
                Symbol
                <input
                  list="journal-symbols"
                  onChange={(event) => setDraft((current) => ({ ...current, symbol: event.target.value }))}
                  placeholder="GTCO"
                  value={draft.symbol}
                />
              </label>
              <label>
                Goal
                <select
                  onChange={(event) => setDraft((current) => ({ ...current, goal: event.target.value }))}
                  value={draft.goal}
                >
                  <option>Capital growth</option>
                  <option>Dividend income</option>
                  <option>Balanced growth and dividends</option>
                  <option>Sector exposure</option>
                </select>
              </label>
              <label>
                Time horizon
                <select
                  onChange={(event) => setDraft((current) => ({ ...current, horizon: event.target.value }))}
                  value={draft.horizon}
                >
                  <option>6 to 12 months</option>
                  <option>1 to 3 years</option>
                  <option>3 to 5 years</option>
                  <option>5+ years</option>
                </select>
              </label>
              <label>
                Status
                <select
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      status: event.target.value as JournalEntry["status"],
                    }))
                  }
                  value={draft.status}
                >
                  <option>Watching</option>
                  <option>Ready to research</option>
                  <option>Bought</option>
                  <option>Rejected</option>
                </select>
              </label>
            </div>

            <label>
              Why this company deserves attention
              <textarea
                onChange={(event) => setDraft((current) => ({ ...current, thesis: event.target.value }))}
                placeholder="Example: Strong bank, consistent dividends, but I want to confirm valuation and sector exposure."
                value={draft.thesis}
              />
            </label>

            <div className="journal-form-grid">
              <label>
                Target entry condition
                <input
                  onChange={(event) => setDraft((current) => ({ ...current, targetEntry: event.target.value }))}
                  placeholder="Example: Buy only below my fair-value range"
                  value={draft.targetEntry ?? ""}
                />
              </label>
              <label>
                Main risk
                <input
                  onChange={(event) => setDraft((current) => ({ ...current, risk: event.target.value }))}
                  placeholder="Example: Banking sector concentration"
                  value={draft.risk ?? ""}
                />
              </label>
            </div>

            <label>
              Sell or review rule
              <textarea
                onChange={(event) => setDraft((current) => ({ ...current, exitRule: event.target.value }))}
                placeholder="Example: Review if the thesis breaks, target is reached, valuation becomes stretched, or a better opportunity appears."
                value={draft.exitRule ?? ""}
              />
            </label>

            <datalist id="journal-symbols">
              {starterCompanies.map((company) => (
                <option key={company.symbol} value={company.symbol}>
                  {company.name}
                </option>
              ))}
            </datalist>

            <div className="form-actions">
              <button className="button journal-submit" type="submit">
                <Plus size={18} />
                Save buy plan
              </button>
              <Link className="button button-muted journal-submit" to="/portfolio-plan">
                Plan allocation
              </Link>
            </div>
          </form>

          <div className="journal-toolbar">
            <label className="search-field desk-search">
              <Search size={18} />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search journal"
                type="search"
                value={query}
              />
            </label>
          </div>

          <div className="journal-list">
            {visibleEntries.length ? (
              visibleEntries.map((entry) => (
                <article className="journal-entry" key={entry.id}>
                  <div className="journal-entry-head">
                    <div>
                      <strong>{entry.symbol}</strong>
                      <span>{entry.status}</span>
                    </div>
                    <button
                      aria-label={`Delete ${entry.symbol} plan`}
                      className="icon-only-button"
                      onClick={() => removeEntry(entry)}
                      type="button"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <p>{entry.thesis}</p>
                  <div className="journal-entry-grid">
                    <span>
                      <small>Goal</small>
                      <strong>{entry.goal}</strong>
                    </span>
                    <span>
                      <small>Horizon</small>
                      <strong>{entry.horizon}</strong>
                    </span>
                    <span>
                      <small>Entry</small>
                      <strong>{entry.targetEntry || "Not set"}</strong>
                    </span>
                    <span>
                      <small>Risk</small>
                      <strong>{entry.risk || "Not set"}</strong>
                    </span>
                  </div>
                  <section>
                    <h3>Sell or review rule</h3>
                    <p>{entry.exitRule || "No rule recorded yet."}</p>
                  </section>
                  <Link className="row-link" to={`/company/${entry.symbol}`}>
                    Open research
                  </Link>
                </article>
              ))
            ) : (
              <div className="state-panel">
                <BookOpenCheck size={24} />
                No journal plans yet. Start with one company you are tempted to buy.
              </div>
            )}
          </div>
        </div>

        <aside className="journal-aside">
          <p className="eyebrow">Decision discipline</p>
          <h2>Your journal is your anti-hype system.</h2>
          <p>
            Before buying, write the thesis, the entry condition, the risk, and the sell rule.
            That one habit helps separate research from social media noise.
          </p>
          <div className="watchlist-principles">
            <span>
              <CheckCircle2 size={16} />
              Know why you buy
            </span>
            <span>
              <CheckCircle2 size={16} />
              Define when you review
            </span>
            <span>
              <CheckCircle2 size={16} />
              Avoid indefinite holding
            </span>
          </div>
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

function loadEntries() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function storeEntries(entries: JournalEntry[]) {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

export default JournalPage;
