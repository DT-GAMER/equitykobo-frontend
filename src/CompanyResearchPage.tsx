import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import AppHeader from "./AppHeader";
import { CompanyResearchData, loadCompanyResearch } from "./api";

function CompanyResearchPage() {
  const { symbol = "" } = useParams();
  const [data, setData] = useState<CompanyResearchData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        setData(await loadCompanyResearch(symbol));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load company research.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [symbol]);

  const latestScore = data?.brief?.latest_score;
  const latestPrice = data?.rule.ngx_market_rules.latest_close;
  const historySummary = useMemo(() => priceHistorySummary(data?.history ?? []), [data?.history]);

  return (
    <main className="research-page">
      <AppHeader />

      {isLoading && (
        <section className="research-state">
          <LoaderCircle className="spin" size={24} />
          Loading company research...
        </section>
      )}

      {error && (
        <section className="research-state error-state">
          <AlertTriangle size={24} />
          {error}
        </section>
      )}

      {data && !isLoading && (
        <section className="research-layout">
          <div className="research-main">
            <div className="research-hero">
              <p className="eyebrow">Company research</p>
              <h1>{data.rule.symbol}</h1>
              <p>{data.rule.name}</p>
              <div className="type-tags">
                {data.rule.stock_types.map((type) => (
                  <span key={type}>{type}</span>
                ))}
              </div>
              <Link className="button research-action" to={`/journal?symbol=${symbol.toUpperCase()}`}>
                Create buy plan
              </Link>
            </div>

            <div className="research-grid">
              <MetricCard label="Latest price" value={moneyText(latestPrice)} />
              <MetricCard label="Overall score" value={numberText(latestScore?.overall_score)} />
              <MetricCard label="Price band" value={data.rule.ngx_market_rules.price_band_status} />
              <MetricCard label="Price history" value={historySummary} />
            </div>

            <section className="research-section">
              <h2>Decision Summary</h2>
              <div className="decision-summary-grid">
                <article>
                  <ShieldCheck size={22} />
                  <h3>Fundamental style</h3>
                  <p>{data.rule.fundamental_style}</p>
                </article>
                <article>
                  <TrendingUp size={22} />
                  <h3>Technical signal</h3>
                  <p>{data.rule.technical_signal}</p>
                </article>
                <article>
                  <CircleAlert size={22} />
                  <h3>Guardrail</h3>
                  <p>{data.rule.decision_guardrails[0] ?? "No hard rule-based block."}</p>
                </article>
              </div>
            </section>

            <section className="research-section">
              <h2>Beginner Checklist</h2>
              <div className="research-checklist">
                {data.rule.checklist.map((item) => (
                  <article className={item.passed ? "passed" : "failed"} key={item.question}>
                    <CheckCircle2 size={18} />
                    <div>
                      <h3>{item.question}</h3>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="research-section">
              <h2>NGX Market Rule Check</h2>
              <div className="market-rule-grid">
                <MetricCard
                  label="Daily change"
                  value={percentText(data.rule.ngx_market_rules.daily_change_percent)}
                />
                <MetricCard
                  label="Latest volume"
                  value={data.rule.ngx_market_rules.latest_volume?.toLocaleString("en-NG") ?? "N/A"}
                />
                <MetricCard label="Band status" value={data.rule.ngx_market_rules.price_band_status} />
              </div>
            </section>
          </div>

          <aside className="research-aside">
            <section className="panel-section">
              <h3>Data warnings</h3>
              {(data.rule.data_warnings.length ? data.rule.data_warnings : ["No warnings returned."]).map(
                (warning) => (
                  <p key={warning}>{warning}</p>
                ),
              )}
            </section>
            <section className="panel-section">
              <h3>Scanner risks</h3>
              {splitLines(latestScore?.risks).map((risk) => (
                <p key={risk}>{risk}</p>
              ))}
            </section>
            <section className="panel-section">
              <h3>Scanner reasons</h3>
              {splitLines(latestScore?.reasons).map((reason) => (
                <p key={reason}>{reason}</p>
              ))}
            </section>
          </aside>
        </section>
      )}
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function splitLines(value?: string) {
  return value?.split("\n").filter(Boolean) ?? ["No scanner detail available yet."];
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
  return `${Number(value).toLocaleString("en-NG", { maximumFractionDigits: 2 })}%`;
}

function priceHistorySummary(history: { close_price: string }[]) {
  if (history.length < 2) {
    return `${history.length} day`;
  }
  return `${history.length} days`;
}

export default CompanyResearchPage;
