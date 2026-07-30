import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Save } from "lucide-react";
import AppHeader from "./AppHeader";
import { loadMyJournal, loadMyPortfolioPlan, saveMyPortfolioPlan } from "./api";
import { starterCompanies } from "./onboardingData";

type JournalEntry = {
  id: string;
  symbol: string;
  thesis: string;
  goal: string;
  status: string;
};

type PlannedAmount = Record<string, string>;

const journalStorageKey = "equitykobo.journal";
const plannerStorageKey = "equitykobo.portfolioPlan";

function PortfolioPlannerPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(loadJournalEntries);
  const [plannedAmounts, setPlannedAmounts] = useState<PlannedAmount>(loadPlannedAmounts);
  const symbols = useMemo(() => uniqueSymbols(journalEntries, plannedAmounts), [
    journalEntries,
    plannedAmounts,
  ]);
  const [syncStatus, setSyncStatus] = useState("");
  const [notice, setNotice] = useState("");
  const allocations = useMemo(() => buildAllocations(symbols, journalEntries, plannedAmounts), [
    journalEntries,
    plannedAmounts,
    symbols,
  ]);
  const totalPlanned = allocations.reduce((sum, item) => sum + item.amount, 0);
  const sectorAllocations = useMemo(() => buildSectorAllocations(allocations, totalPlanned), [
    allocations,
    totalPlanned,
  ]);
  const warnings = useMemo(() => buildWarnings(allocations, sectorAllocations), [allocations, sectorAllocations]);

  useEffect(() => {
    async function loadRemotePlan() {
      try {
        const [remoteJournal, remotePlan] = await Promise.all([
          loadMyJournal(),
          loadMyPortfolioPlan(),
        ]);
        const nextJournal = remoteJournal.map((entry) => ({
          id: String(entry.id),
          symbol: entry.symbol,
          thesis: entry.thesis,
          goal: entry.goal,
          status: entry.status,
        }));
        const nextAmounts = Object.fromEntries(
          remotePlan.items.map((item) => [item.symbol, String(item.planned_amount)]),
        );
        setJournalEntries(nextJournal);
        setPlannedAmounts(nextAmounts);
        localStorage.setItem(journalStorageKey, JSON.stringify(nextJournal));
        localStorage.setItem(plannerStorageKey, JSON.stringify(nextAmounts));
        setSyncStatus("Synced to account");
      } catch {
        setSyncStatus("Saved locally until account sync is available");
        setNotice("Planner is showing local data because account sync is unavailable.");
      }
    }

    loadRemotePlan();
  }, []);

  function updateAmount(symbol: string, value: string) {
    setPlannedAmounts((current) => ({ ...current, [symbol]: value }));
  }

  async function savePlan() {
    localStorage.setItem(plannerStorageKey, JSON.stringify(plannedAmounts));
    try {
      await saveMyPortfolioPlan({
        name: "Default Plan",
        items: Object.entries(plannedAmounts).map(([symbol, plannedAmount]) => ({
          symbol,
          planned_amount: String(numberFromInput(plannedAmount)),
        })),
      });
      setSyncStatus("Synced to account");
      setNotice("Allocation plan saved to your account.");
    } catch {
      setSyncStatus("Saved locally until account sync is available");
      setNotice("Allocation plan saved locally. It will sync when the backend is available.");
    }
  }

  return (
    <main className="planner-page">
      <AppHeader />

      <section className="planner-layout">
        <div className="planner-main">
          <div className="desk-heading">
            <div>
              <p className="eyebrow">Portfolio Planner</p>
              <h1>Check concentration before you buy.</h1>
            </div>
            <div className="desk-date">
              <span>{syncStatus || "Total planned"}</span>
              <strong>{moneyText(totalPlanned)}</strong>
            </div>
          </div>

          <div className="desk-stats">
            <Stat label="Planned stocks" value={String(allocations.length)} />
            <Stat label="Sectors" value={String(sectorAllocations.length)} />
            <Stat label="Stock limit" value="30%" />
            <Stat label="Sector limit" value="50%" />
          </div>

          {notice && (
            <div className="state-panel success-state">
              <CheckCircle2 size={22} />
              {notice}
            </div>
          )}

          {symbols.length === 0 && (
            <div className="state-panel">
              <BarChart3 size={24} />
              Create buy plans in the journal first, then return here to plan allocation.
            </div>
          )}

          {symbols.length > 0 && (
            <>
              <div className={warnings.length ? "planner-warning-list" : "planner-clear-list"}>
                {warnings.length ? (
                  warnings.map((warning) => (
                    <span key={warning}>
                      <AlertTriangle size={16} />
                      {warning}
                    </span>
                  ))
                ) : (
                  <span>
                    <CheckCircle2 size={16} />
                    No concentration warning based on the current plan.
                  </span>
                )}
              </div>

              <div className="planner-table" role="table" aria-label="Portfolio allocation plan">
                <div className="planner-row table-head" role="row">
                  <span>Company</span>
                  <span>Sector</span>
                  <span>Planned amount</span>
                  <span>Weight</span>
                  <span>Status</span>
                </div>
                {allocations.map((item) => (
                  <div className="planner-row" key={item.symbol} role="row">
                    <span>
                      <strong>{item.symbol}</strong>
                      <small>{item.thesis || "No thesis recorded."}</small>
                    </span>
                    <span>{item.sector}</span>
                    <label className="amount-input">
                      <input
                        inputMode="decimal"
                        onChange={(event) => updateAmount(item.symbol, event.target.value)}
                        placeholder="100000"
                        value={plannedAmounts[item.symbol] ?? ""}
                      />
                    </label>
                    <span>{percentText(item.weight)}</span>
                    <span className={item.weight > 30 ? "allocation-status danger" : "allocation-status"}>
                      {item.weight > 30 ? "Reduce" : "Okay"}
                    </span>
                  </div>
                ))}
              </div>

              <button className="button planner-save" onClick={savePlan} type="button">
                <Save size={18} />
                Save allocation plan
              </button>
            </>
          )}
        </div>

        <aside className="planner-aside">
          <p className="eyebrow">Beginner guardrail</p>
          <h2>Diversification is a risk control, not decoration.</h2>
          <p>
            EquityKobo flags stock and sector concentration so a good idea does not quietly become
            your entire portfolio.
          </p>
          <div className="sector-allocation-list">
            {sectorAllocations.length ? (
              sectorAllocations.map((sector) => (
                <span key={sector.sector}>
                  <strong>{sector.sector}</strong>
                  <small>{percentText(sector.weight)}</small>
                  <i style={{ width: `${Math.min(sector.weight, 100)}%` }} />
                </span>
              ))
            ) : (
              <p>No planned sector exposure yet.</p>
            )}
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

function loadJournalEntries(): JournalEntry[] {
  const stored = localStorage.getItem(journalStorageKey);
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

function loadPlannedAmounts(): PlannedAmount {
  const stored = localStorage.getItem(plannerStorageKey);
  if (!stored) {
    return {};
  }

  try {
    const parsed = JSON.parse(stored);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function uniqueSymbols(entries: JournalEntry[], plannedAmounts: PlannedAmount) {
  return [
    ...new Set([
      ...entries.map((entry) => entry.symbol),
      ...Object.keys(plannedAmounts),
    ].filter(Boolean)),
  ].sort();
}

function buildAllocations(symbols: string[], entries: JournalEntry[], plannedAmounts: PlannedAmount) {
  const total = symbols.reduce((sum, symbol) => sum + numberFromInput(plannedAmounts[symbol]), 0);
  return symbols.map((symbol) => {
    const entry = entries.find((item) => item.symbol === symbol);
    const company = starterCompanies.find((item) => item.symbol === symbol);
    const amount = numberFromInput(plannedAmounts[symbol]);
    return {
      symbol,
      sector: company?.sector ?? "Unknown",
      thesis: entry?.thesis ?? "",
      amount,
      weight: total > 0 ? (amount / total) * 100 : 0,
    };
  });
}

function buildSectorAllocations(
  allocations: ReturnType<typeof buildAllocations>,
  totalPlanned: number,
) {
  const bySector = new Map<string, number>();
  allocations.forEach((item) => {
    bySector.set(item.sector, (bySector.get(item.sector) ?? 0) + item.amount);
  });
  return [...bySector.entries()]
    .map(([sector, amount]) => ({
      sector,
      amount,
      weight: totalPlanned > 0 ? (amount / totalPlanned) * 100 : 0,
    }))
    .sort((left, right) => right.weight - left.weight);
}

function buildWarnings(
  allocations: ReturnType<typeof buildAllocations>,
  sectorAllocations: ReturnType<typeof buildSectorAllocations>,
) {
  const stockWarnings = allocations
    .filter((item) => item.weight > 30)
    .map((item) => `${item.symbol} is ${percentText(item.weight)} of planned capital.`);
  const sectorWarnings = sectorAllocations
    .filter((item) => item.weight > 50)
    .map((item) => `${item.sector} is ${percentText(item.weight)} of planned capital.`);
  return [...stockWarnings, ...sectorWarnings];
}

function numberFromInput(value?: string) {
  if (!value) {
    return 0;
  }
  return Number(value.replaceAll(",", "")) || 0;
}

function moneyText(value: number) {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function percentText(value: number) {
  return `${value.toLocaleString("en-NG", { maximumFractionDigits: 1 })}%`;
}

export default PortfolioPlannerPage;
