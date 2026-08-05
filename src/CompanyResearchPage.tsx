import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Eye,
  LoaderCircle,
  Newspaper,
  NotebookPen,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import AppHeader from "./AppHeader";
import { loadCompanyResearch } from "./api";
import type {
  CompanyLiveInsightCard,
  CompanyLiveInsights,
  CompanyLiveNewsItem,
  CompanyPeerComparison,
  CompanyResearchData,
  DecisionCard,
  DecisionCardDividendDisplay,
  DecisionCardHealthDisplay,
  DecisionCardMoatDisplay,
  DecisionCardSection,
  DecisionCardSourceGap,
  DecisionCardValuationDisplay,
  PeerComparisonRow,
} from "./api";

function CompanyResearchPage() {
  const { symbol = "" } = useParams();
  const [data, setData] = useState<CompanyResearchData | null>(null);
  const [activeInsight, setActiveInsight] = useState<CompanyLiveInsightCard | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        setData(await loadCompanyResearch(symbol));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load company decision card.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [symbol]);

  const card = data?.decisionCard;
  const valuationDisplay = useMemo(
    () => (card ? card.valuation_display ?? fallbackValuationDisplay(card) : null),
    [card],
  );
  const healthDisplay = useMemo(
    () => (card ? card.health_display ?? fallbackHealthDisplay(card) : []),
    [card],
  );
  const dividendDisplay = useMemo(
    () => (card ? card.dividend_display ?? fallbackDividendDisplay(card) : null),
    [card],
  );
  const moatDisplay = useMemo(
    () => (card ? card.moat_display ?? fallbackMoatDisplay(card) : null),
    [card],
  );
  const sourceGaps = useMemo(
    () => (card ? card.source_gaps ?? fallbackSourceGaps(card) : []),
    [card],
  );

  return (
    <main className="research-page">
      <AppHeader />

      {isLoading && (
        <section className="research-state">
          <LoaderCircle className="spin" size={24} />
          Loading company decision card...
        </section>
      )}

      {error && (
        <section className="research-state error-state">
          <AlertTriangle size={24} />
          {error}
        </section>
      )}

      {data && card && valuationDisplay && dividendDisplay && moatDisplay && !isLoading && (
        <section className="company-decision-page">
          <CompanyTopBar card={card} />
          <CompanyIdentityCard card={card} valuation={valuationDisplay} />
          <LiveMarketSection
            history={data.history}
            insights={data.liveInsights}
            onOpenInsight={setActiveInsight}
          />
          <AnswerCard card={card} />

          <div className="company-decision-two-column">
            <FairValueCard display={valuationDisplay} />
            <HealthChecksCard items={healthDisplay} />
          </div>

          <BothSidesCard buy={card.why_buy} careful={card.why_not_buy} />

          {card.peer_comparison ? (
            <PeerComparisonSection comparison={card.peer_comparison} />
          ) : (
            <UnavailablePanel
              eyebrow="Is this better than its sector?"
              title="Peer comparison is not ready yet"
              items={sourceGaps.filter((gap) => gap.data_layer.includes("peer")).slice(0, 3)}
            />
          )}

          <div className="decision-triplet-grid">
            <CompactDecisionCard
              eyebrow="What could go right"
              section={card.growth_drivers}
              title="Likely growth drivers"
            />
            <CompactDecisionCard
              eyebrow="What could go wrong"
              section={card.threats}
              title="Threats"
            />
            <CompactDecisionCard
              eyebrow="Watch these"
              section={card.what_would_change_decision}
              title="What would change this decision"
            />
          </div>

          <div className="company-decision-two-column">
            <DividendView display={dividendDisplay} />
            <MoatView display={moatDisplay} />
          </div>

          <ScoreLayers card={card} />
          <SourceGapSection gaps={sourceGaps} notes={card.data_quality_notes} />
          <ActionCard card={card} />
          {activeInsight && data.liveInsights && (
            <InsightModal
              card={activeInsight}
              insights={data.liveInsights}
              onClose={() => setActiveInsight(null)}
            />
          )}
        </section>
      )}
    </main>
  );
}

function CompanyTopBar({ card }: { card: DecisionCard }) {
  return (
    <header className="company-topbar">
      <div>
        <p className="eyebrow">{card.symbol} decision card</p>
        <h1>{card.name}</h1>
      </div>
      <div className="company-topbar-actions">
        <Link className="topbar-button" to="/app">
          <ArrowLeft size={17} />
          Desk
        </Link>
        <span className="synced-pill">
          <CheckCircle2 size={15} />
          Synced {formatDate(card.as_of_date)}
        </span>
      </div>
    </header>
  );
}

function CompanyIdentityCard({
  card,
  valuation,
}: {
  card: DecisionCard;
  valuation: DecisionCardValuationDisplay;
}) {
  return (
    <section className="company-identity-card">
      <div>
        <div className="company-symbol-line">
          <h2>{card.symbol}</h2>
          {card.sector && <span>{card.sector}</span>}
        </div>
        <p>{card.name}</p>
        <div className="type-tags company-type-tags">
          {card.stock_types.map((type) => (
            <span key={type}>{shortStockType(type)}</span>
          ))}
        </div>
      </div>

      <div className="company-price-block">
        <strong>{moneyText(valuation.latest_price ?? card.latest_price)}</strong>
        <span>Last NGX close</span>
        <small>Scanned {formatDate(card.as_of_date)}</small>
      </div>
    </section>
  );
}

function AnswerCard({ card }: { card: DecisionCard }) {
  return (
    <section className={`company-answer-card ${answerTone(card.answer)}`}>
      <div className="answer-grid-panel">
        <span>Should I invest?</span>
        <h2>{card.answer}</h2>
        <div className="answer-metric-row">
          <AnswerMetric label="Invest score" value={`${numberText(card.invest_score)}/100`} />
          <AnswerMetric label="Confidence" value={card.confidence} />
          <AnswerMetric label="Risk" value={card.risk_level} />
          <AnswerMetric label="Suggested horizon" value={card.suggested_horizon} />
        </div>
      </div>

      <div className="plain-english-panel">
        <span>In plain English</span>
        <p>{card.one_paragraph_summary}</p>
      </div>
    </section>
  );
}

function LiveMarketSection({
  insights,
  history,
  onOpenInsight,
}: {
  insights: CompanyLiveInsights | null;
  history: CompanyResearchData["history"];
  onOpenInsight: (card: CompanyLiveInsightCard) => void;
}) {
  if (!insights) {
    return (
      <section className="live-market-section">
        <div className="live-market-head">
          <PanelTitle eyebrow="Market pulse" title="What is happening right now?" />
        </div>
        <article className="live-unavailable-card">
          <Activity size={22} />
          <div>
            <strong>Live insight layer is not ready for this company.</strong>
            <p>Sync prices, news, disclosures, then run the intelligence engine to unlock this section.</p>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="live-market-section">
      <div className="live-market-head">
        <PanelTitle eyebrow="Market pulse" title="What is happening right now?" />
        <span>Generated {formatDateTime(insights.generated_at)}</span>
      </div>

      <div className="live-market-grid">
        <article className="live-price-card">
          <div className="live-price-top">
            <div>
              <span>Latest NGX close</span>
              <strong>{moneyText(insights.price.latest_price)}</strong>
            </div>
            <span className={`price-change-line ${insights.price.direction}`}>
              {moveGlyph(insights.price.direction)}
              {signedPercentText(insights.price.price_change_percent)}
              <small>{signedMoneyText(insights.price.price_change)}</small>
            </span>
          </div>

          <MiniPriceChart history={history} direction={insights.price.direction} />
          <p>{insights.price.summary}</p>

          <div className="window-pill-row" aria-label="Performance windows">
            {insights.performance.windows.slice(0, 5).map((window) => (
              <span
                className={`window-pill ${windowTone(window.return_percent)}`}
                key={window.window}
                title={window.summary}
              >
                <small>{window.window}</small>
                <strong>{window.available ? signedPercentText(window.return_percent) : "N/A"}</strong>
              </span>
            ))}
          </div>
        </article>

        <div className="live-insight-card-grid">
          {insights.cards.map((card) => (
            <button
              className={`live-insight-card ${card.tone}`}
              key={card.key}
              onClick={() => onOpenInsight(card)}
              type="button"
            >
              <span>{insightIcon(card.key)}</span>
              <strong>{card.title}</strong>
              <p>{card.summary}</p>
              <small>{card.source_count} source signal{card.source_count === 1 ? "" : "s"}</small>
            </button>
          ))}
        </div>
      </div>

      {insights.data_notes.length > 0 && (
        <div className="live-data-notes">
          {insights.data_notes.slice(0, 3).map((note) => (
            <span key={note}>
              <CircleAlert size={14} />
              {note}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function MiniPriceChart({
  history,
  direction,
}: {
  history: CompanyResearchData["history"];
  direction: string;
}) {
  const points = useMemo(() => {
    const ordered = [...history]
      .sort((first, second) => first.trade_date.localeCompare(second.trade_date))
      .slice(-30);
    if (ordered.length < 2) {
      return { line: "", area: "", min: null as string | null, max: null as string | null };
    }
    const values = ordered.map((item) => Number(item.close_price));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min || 1;
    const line = ordered
      .map((item, index) => {
        const x = (index / Math.max(1, ordered.length - 1)) * 100;
        const y = 74 - ((Number(item.close_price) - min) / spread) * 58;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
    return {
      line,
      area: `0,82 ${line} 100,82`,
      min: String(min),
      max: String(max),
    };
  }, [history]);

  if (!points.line) {
    return <div className="mini-chart-empty">Need more price history for chart</div>;
  }

  return (
    <div className={`mini-price-chart ${direction}`} aria-label="Recent price trend">
      <svg viewBox="0 0 100 86" preserveAspectRatio="none" role="img">
        <polygon points={points.area} />
        <polyline points={points.line} />
      </svg>
      <div>
        <span>Low {moneyText(points.min)}</span>
        <span>High {moneyText(points.max)}</span>
      </div>
    </div>
  );
}

function InsightModal({
  card,
  insights,
  onClose,
}: {
  card: CompanyLiveInsightCard;
  insights: CompanyLiveInsights;
  onClose: () => void;
}) {
  const sources =
    card.key === "news"
      ? [...insights.recent_news, ...insights.recent_disclosures].slice(0, 5)
      : card.key === "risks"
        ? insights.recent_disclosures.slice(0, 5)
        : [];

  return (
    <div className="insight-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className={`insight-modal ${card.tone}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button aria-label="Close insight" className="insight-modal-close" onClick={onClose} type="button">
          <X size={19} />
        </button>
        <div className="insight-modal-title">
          <span>{insightIcon(card.key)}</span>
          <div>
            <p>{insights.symbol}</p>
            <h2>{card.title}</h2>
          </div>
        </div>
        <p className="insight-modal-summary">{card.summary}</p>
        <ul>
          {card.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {sources.length > 0 && <InsightSources items={sources} />}
        <div className="insight-disclaimer">
          <CircleAlert size={16} />
          This is AI-assisted research support, not financial advice. Verify source documents before investing.
        </div>
      </section>
    </div>
  );
}

function InsightSources({ items }: { items: CompanyLiveNewsItem[] }) {
  return (
    <div className="insight-source-list">
      <span>Recent source signals</span>
      {items.map((item) => (
        <a href={item.url ?? "#"} key={`${item.item_type}-${item.title}`} target="_blank" rel="noreferrer">
          <strong>{item.title}</strong>
          <small>
            {item.source_name || item.item_type} {item.published_at ? `· ${formatDateTime(item.published_at)}` : ""}
          </small>
        </a>
      ))}
    </div>
  );
}

function AnswerMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FairValueCard({ display }: { display: DecisionCardValuationDisplay }) {
  const marker = clampPercent(display.price_position_percent);
  return (
    <section className="decision-card-panel fair-value-card">
      <PanelTitle eyebrow="Is the price fair today?" title="Fair value" />

      <div className="fair-value-visual">
        <div className="fair-range-labels">
          <span>{moneyText(display.fair_value_low)}</span>
          <strong>Fair value range</strong>
          <span>{moneyText(display.fair_value_high)}</span>
        </div>
        <div className="fair-range-track" aria-hidden="true">
          <span className="fair-range-fill" />
          {marker !== null && <span className="fair-range-marker" style={{ left: `${marker}%` }} />}
        </div>
        <div className="fair-range-caption">
          <TonePill label={display.valuation_label} tone={display.valuation_tone} />
          <span>{display.explanation}</span>
        </div>
      </div>

      <div className="decision-stat-list">
        <StatLine label="Margin of safety" value={signedPercentText(display.margin_of_safety_percent)} tone="positive" />
        <StatLine
          label="Expected return if fair value is reached"
          value={returnRangeText(display.expected_return_low_percent, display.expected_return_high_percent)}
          tone="positive"
        />
        <StatLine label="Valuation confidence" value={display.valuation_confidence} />
        <StatLine label="Methods used" value={display.methods_used.join(" · ") || "Not available"} />
      </div>

      {display.missing_data.length > 0 && (
        <InlineWarning items={display.missing_data.map((item) => `Missing ${item}`)} />
      )}
      {display.warnings.length > 0 && <InlineWarning items={display.warnings.slice(0, 2)} />}
    </section>
  );
}

function HealthChecksCard({ items }: { items: DecisionCardHealthDisplay[] }) {
  return (
    <section className="decision-card-panel health-display-card">
      <PanelTitle eyebrow="Can I trust this company with my money?" title="Financial health checks" />
      <div className="health-display-list">
        {items.map((item) => (
          <article key={item.label} className={`health-display-row ${item.tone}`}>
            <div>
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </div>
            <TonePill label={item.status} tone={item.tone} />
          </article>
        ))}
      </div>
    </section>
  );
}

function BothSidesCard({
  buy,
  careful,
}: {
  buy: DecisionCardSection;
  careful: DecisionCardSection;
}) {
  return (
    <section className="decision-card-panel both-sides-card">
      <PanelTitle eyebrow="Both sides, honestly" title="Why buy · Why be careful" />
      <div className="both-sides-grid">
        <ReasonBox
          icon={<CheckCircle2 size={21} />}
          title="Why it deserves attention"
          items={buy.points}
          tone="positive"
        />
        <ReasonBox
          icon={<AlertTriangle size={21} />}
          title="Why you should be careful"
          items={careful.points}
          tone="warning"
        />
      </div>
    </section>
  );
}

function ReasonBox({
  icon,
  title,
  items,
  tone,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
  tone: "positive" | "warning";
}) {
  return (
    <article className={`reason-box ${tone}`}>
      <div>
        {icon}
        <strong>{title}</strong>
      </div>
      <ul>
        {items.slice(0, 4).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function PeerComparisonSection({ comparison }: { comparison: CompanyPeerComparison }) {
  const peers = comparison.peers.slice(0, 8);
  const winners = comparison.category_winners.filter((winner) => winner.symbol).slice(0, 4);

  return (
    <section className="decision-card-panel peer-decision-card">
      <PanelTitle eyebrow="Is this better than its sector?" title="Peer comparison" />

      <div className="peer-head-grid">
        <MiniInfo label="Sector rank" value={rankText(comparison.sector_rank, comparison.peer_count)} />
        <MiniInfo label="Current sector leader" value={comparison.best_overall_peer_symbol ?? "N/A"} />
        <div className="category-winner-box">
          <span>Category winners</span>
          <div>
            {winners.length > 0 ? (
              winners.map((winner) => (
                <TonePill
                  key={winner.category}
                  label={`${winner.category}: ${winner.symbol}`}
                  tone={winner.symbol === comparison.symbol ? "positive" : "neutral"}
                />
              ))
            ) : (
              <TonePill label="No winner data yet" tone="neutral" />
            )}
          </div>
        </div>
      </div>

      <div className="peer-pros-cons">
        <PeerList title="Strengths vs peers" items={comparison.strengths} />
        <PeerList title="Weaknesses vs peers" items={comparison.weaknesses} />
      </div>

      <div className="peer-table-wrap decision-peer-table-wrap">
        <table className="peer-table decision-peer-table">
          <thead>
            <tr>
              <th>Peer</th>
              <th>Answer</th>
              <th>Score</th>
              <th>Valuation</th>
              <th>Yield</th>
            </tr>
          </thead>
          <tbody>
            {peers.map((row) => (
              <PeerDecisionRow key={row.symbol} row={row} currentSymbol={comparison.symbol} />
            ))}
          </tbody>
        </table>
      </div>

      {comparison.warnings.length > 0 && <InlineWarning items={comparison.warnings.slice(0, 3)} />}
    </section>
  );
}

function PeerList({ title, items }: { title: string; items: string[] }) {
  return (
    <article>
      <span>{title}</span>
      <ul>
        {items.slice(0, 4).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function PeerDecisionRow({
  row,
  currentSymbol,
}: {
  row: PeerComparisonRow;
  currentSymbol: string;
}) {
  return (
    <tr className={row.symbol === currentSymbol ? "current-peer-row" : undefined}>
      <td>{row.symbol}</td>
      <td><TonePill label={row.final_label.startsWith("Avoid") ? "NO" : "YES"} tone={row.final_label.startsWith("Avoid") ? "danger" : "positive"} /></td>
      <td>{numberText(row.overall_score)}</td>
      <td><TonePill label={row.valuation_label ?? "N/A"} tone={valuationLabelTone(row.valuation_label)} /></td>
      <td>{percentText(row.dividend_yield)}</td>
    </tr>
  );
}

function CompactDecisionCard({
  eyebrow,
  title,
  section,
}: {
  eyebrow: string;
  title: string;
  section: DecisionCardSection;
}) {
  return (
    <section className="decision-card-panel compact-decision-card">
      <PanelTitle eyebrow={eyebrow} title={title} />
      <ul>
        {section.points.slice(0, 4).map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  );
}

function DividendView({ display }: { display: DecisionCardDividendDisplay }) {
  const maxDividend = Math.max(
    ...display.annual_history.map((item) => Number(item.amount_per_share) || 0),
    0,
  );

  return (
    <section className="decision-card-panel dividend-view-card">
      <PanelTitle eyebrow="Income" title="Dividend view" />
      <div className="dividend-yield-line">
        <BarChart3 size={19} />
        <strong>{percentText(display.current_yield)} current yield</strong>
      </div>
      <div className="decision-stat-list">
        <StatLine label="Payout safety" value={display.payout_safety} />
        <StatLine label="Dividend strength" value={display.dividend_strength} />
        <StatLine label="Projected next payout" value={moneyText(display.projected_next_payout)} />
      </div>

      <div className="dividend-bar-chart" aria-label="Dividend history">
        {display.annual_history.length > 0 ? (
          display.annual_history.map((item) => (
            <div key={item.year}>
              <span
                style={{
                  height: `${maxDividend > 0 ? Math.max(18, (Number(item.amount_per_share) / maxDividend) * 86) : 18}px`,
                }}
              />
              <small>{item.year}</small>
            </div>
          ))
        ) : (
          <p>{display.explanation}</p>
        )}
      </div>

      {display.missing_data.length > 0 && (
        <InlineWarning items={display.missing_data.map((item) => `Missing ${item}`)} />
      )}
    </section>
  );
}

function MoatView({ display }: { display: DecisionCardMoatDisplay }) {
  return (
    <section className="decision-card-panel moat-view-card">
      <PanelTitle eyebrow="Quality" title="Moat assessment" />
      <div className="moat-rating-line">
        <ShieldCheck size={18} />
        <TonePill label={display.label} tone={display.tone} />
      </div>
      <ul>
        {display.factors.slice(0, 4).map((factor) => (
          <li key={factor}>{factor}</li>
        ))}
      </ul>
      <div className="moat-score-block">
        <div>
          <span>Peer strength layer</span>
          <strong>{display.peer_strength_score ? `${numberText(display.peer_strength_score)}/100` : "N/A"}</strong>
        </div>
        <ScoreTrack value={display.peer_strength_score} />
      </div>
      {display.warnings.length > 0 && <InlineWarning items={display.warnings.slice(0, 2)} />}
    </section>
  );
}

function ScoreLayers({ card }: { card: DecisionCard }) {
  const scores = [
    ["Business Quality", card.score_breakdown.business_quality],
    ["Growth Strength", card.score_breakdown.growth],
    ["Valuation", card.score_breakdown.valuation],
    ["Dividend Strength", card.score_breakdown.dividend],
    ["Financial Risk Safety", card.score_breakdown.financial_risk],
    ["Momentum", card.score_breakdown.momentum],
    ["Liquidity Safety", card.score_breakdown.liquidity],
    ["Data Confidence", card.score_breakdown.data_confidence],
  ];

  return (
    <section className="decision-card-panel score-layer-panel">
      <PanelTitle eyebrow="Why this score?" title="Score layers" />
      <div className="score-layer-grid">
        {scores.map(([label, value]) => (
          <div className="score-bar" key={label}>
            <div className="score-bar-head">
              <span>{label}</span>
              <strong>{numberText(value)}</strong>
            </div>
            <ScoreTrack value={value} />
          </div>
        ))}
      </div>
    </section>
  );
}

function SourceGapSection({
  gaps,
  notes,
}: {
  gaps: DecisionCardSourceGap[];
  notes: string[];
}) {
  return (
    <section className="decision-card-panel source-gap-panel">
      <PanelTitle eyebrow="Data honesty" title="What data still needs work?" />
      {gaps.length > 0 ? (
        <div className="source-gap-grid">
          {gaps.slice(0, 6).map((gap) => (
            <article key={`${gap.data_layer}-${gap.priority}`}>
              <span>{gap.priority} priority</span>
              <h3>{titleCase(gap.data_layer)}</h3>
              <p>{gap.why_it_matters}</p>
              <small>{gap.current_coverage}</small>
              <strong>{gap.suggested_source}</strong>
              <em>{gap.next_step}</em>
            </article>
          ))}
        </div>
      ) : (
        <p className="muted-copy">No major source gaps are blocking this decision card.</p>
      )}
      {notes.length > 0 && (
        <div className="data-note-row">
          {notes.slice(0, 4).map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
      )}
    </section>
  );
}

function ActionCard({ card }: { card: DecisionCard }) {
  return (
    <section className="decision-card-panel next-action-card">
      <PanelTitle eyebrow="What should I do next?" title={card.what_would_change_decision.summary} />
      <div className="next-action-grid">
        <Link className="button" to="/watchlists">
          <Eye size={18} />
          Add to watchlist
        </Link>
        <Link className="button button-muted" to={`/portfolio-plan?symbol=${card.symbol}`}>
          <Target size={18} />
          Create buy plan
        </Link>
        <Link className="button button-muted" to={`/journal?symbol=${card.symbol}`}>
          <NotebookPen size={18} />
          Write thesis
        </Link>
        <Link className="button button-muted" to="/app">
          <Scale size={18} />
          Compare peers
        </Link>
      </div>
    </section>
  );
}

function UnavailablePanel({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: DecisionCardSourceGap[];
}) {
  return (
    <section className="decision-card-panel unavailable-panel">
      <PanelTitle eyebrow={eyebrow} title={title} />
      <p>EquityKobo will show this section once the required backend data is available.</p>
      {items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.data_layer}>{item.next_step}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PanelTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="company-panel-title">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <article className="mini-info-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function StatLine({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "warning" | "danger";
}) {
  return (
    <div className={`stat-line ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TonePill({ label, tone }: { label: string; tone?: string | null }) {
  return <span className={`tone-pill ${tone || "neutral"}`}>{label}</span>;
}

function InlineWarning({ items }: { items: string[] }) {
  return (
    <div className="inline-warning-list">
      {items.map((item) => (
        <span key={item}>
          <CircleAlert size={14} />
          {item}
        </span>
      ))}
    </div>
  );
}

function ScoreTrack({ value }: { value?: string | null }) {
  const width = clampPercent(value) ?? 0;
  return (
    <div className="score-track" aria-hidden="true">
      <span style={{ width: `${width}%` }} />
    </div>
  );
}

function fallbackValuationDisplay(card: DecisionCard): DecisionCardValuationDisplay {
  const valuation = card.valuation_snapshot;
  return {
    is_available: Boolean(valuation),
    latest_price: valuation?.latest_price ?? card.latest_price,
    fair_value_low: valuation?.fair_value_low ?? null,
    fair_value_mid: valuation?.fair_value_mid ?? null,
    fair_value_high: valuation?.fair_value_high ?? null,
    valuation_label: valuation?.valuation_label ?? card.valuation_status,
    valuation_tone: valuationLabelTone(valuation?.valuation_label ?? card.valuation_status),
    margin_of_safety_percent: valuation?.margin_of_safety_percent ?? null,
    expected_return_low_percent: valuation?.expected_return_low_percent ?? null,
    expected_return_high_percent: valuation?.expected_return_high_percent ?? null,
    valuation_confidence: valuation?.valuation_confidence ?? card.confidence,
    confidence_score: valuation?.confidence_score ?? card.confidence_score,
    price_position_percent: null,
    methods_used: valuation?.methods.map((method) => method.name) ?? [],
    explanation: valuation ? card.valuation.summary : "Valuation display is waiting for a valuation snapshot.",
    warnings: valuation?.warnings ?? [],
    missing_data: valuation?.missing_data ?? card.missing_data,
  };
}

function fallbackHealthDisplay(card: DecisionCard): DecisionCardHealthDisplay[] {
  return card.health_checks.map((item) => ({
    label: item.label === "Profit and earnings" ? "Profit" : item.label,
    status: healthStatus(item.status),
    tone: healthTone(healthStatus(item.status)),
    detail: item.detail,
    score: item.score,
    evidence: item.evidence,
  }));
}

function fallbackDividendDisplay(card: DecisionCard): DecisionCardDividendDisplay {
  return {
    is_available: false,
    current_yield: null,
    dividend_strength: card.dividend_quality,
    payout_safety: "Needs EPS or payout-ratio evidence",
    projected_next_payout: null,
    years_with_dividends: 0,
    annual_history: [],
    explanation: card.dividend.summary,
    warnings: [],
    missing_data: card.missing_data.filter((item) => item.toLowerCase().includes("dividend")),
  };
}

function fallbackMoatDisplay(card: DecisionCard): DecisionCardMoatDisplay {
  return {
    rating: card.moat_rating,
    label: card.moat_rating,
    tone: "neutral",
    peer_strength_score: card.score_breakdown.business_quality,
    summary: card.moat.summary,
    factors: card.moat.points,
    warnings: [],
  };
}

function fallbackSourceGaps(card: DecisionCard): DecisionCardSourceGap[] {
  return card.missing_data.map((item) => ({
    data_layer: item,
    status: "missing_or_thin",
    priority: "Medium",
    why_it_matters: "This data layer would improve the reliability of the company decision card.",
    current_coverage: "Coverage is incomplete.",
    suggested_source: "NGX Pulse, company filings, or admin-uploaded annual reports",
    next_step: `Add or sync ${item}, then rerun intelligence and valuation.`,
  }));
}

function healthStatus(status: string) {
  const normalized = status.toLowerCase();
  if (["strong", "good", "reliable", "high", "low"].some((item) => normalized.includes(item))) {
    return "Healthy";
  }
  if (["weak", "thin"].some((item) => normalized.includes(item))) {
    return "Weak";
  }
  if (normalized.includes("missing")) {
    return "Missing";
  }
  return "Watch";
}

function healthTone(status: string) {
  if (status === "Healthy") {
    return "positive";
  }
  if (status === "Watch") {
    return "warning";
  }
  if (status === "Weak") {
    return "danger";
  }
  return "neutral";
}

function valuationLabelTone(label?: string | null) {
  const normalized = (label || "").toLowerCase();
  if (normalized.includes("undervalued")) {
    return "positive";
  }
  if (normalized.includes("fair")) {
    return "neutral";
  }
  if (normalized.includes("expensive") || normalized.includes("overvalued")) {
    return "danger";
  }
  return "warning";
}

function answerTone(answer: string) {
  const normalized = answer.toLowerCase();
  if (normalized.startsWith("yes")) {
    return "positive";
  }
  if (normalized.startsWith("wait") || normalized.startsWith("only")) {
    return "warning";
  }
  return "danger";
}

function shortStockType(type: string) {
  return type
    .replace(" candidate", "")
    .replace(" stock", "")
    .replace("Sector specific stock: ", "")
    .toUpperCase();
}

function moneyText(value?: string | null) {
  if (!value) {
    return "N/A";
  }
  return `₦${Number(value).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

function signedMoneyText(value?: string | null) {
  if (!value) {
    return "N/A";
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "N/A";
  }
  const sign = numeric > 0 ? "+" : numeric < 0 ? "-" : "";
  return `${sign}₦${Math.abs(numeric).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
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

function signedPercentText(value?: string | null) {
  if (!value) {
    return "N/A";
  }
  const numeric = Number(value);
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric.toLocaleString("en-NG", { maximumFractionDigits: 2 })}%`;
}

function moveGlyph(direction: string) {
  if (direction === "up") {
    return "▲";
  }
  if (direction === "down") {
    return "▼";
  }
  return "■";
}

function windowTone(value?: string | null) {
  if (!value) {
    return "neutral";
  }
  const numeric = Number(value);
  if (numeric >= 5) {
    return "positive";
  }
  if (numeric <= -10) {
    return "danger";
  }
  if (numeric < 0) {
    return "warning";
  }
  return "neutral";
}

function insightIcon(key: string) {
  if (key === "performance") {
    return <TrendingUp size={19} />;
  }
  if (key === "news") {
    return <Newspaper size={19} />;
  }
  if (key === "risks") {
    return <ShieldAlert size={19} />;
  }
  return <Activity size={19} />;
}

function returnRangeText(low?: string | null, high?: string | null) {
  if (!low || !high) {
    return "N/A";
  }
  return `${percentText(low)} to ${percentText(high)}`;
}

function rankText(rank?: number | null, peerCount?: number | null) {
  if (!rank || !peerCount) {
    return "N/A";
  }
  return `${rank} of ${peerCount}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "N/A";
  }
  return new Date(value).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clampPercent(value?: string | null) {
  if (!value) {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return Math.max(0, Math.min(100, numeric));
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default CompanyResearchPage;
