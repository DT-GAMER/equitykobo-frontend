const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export type AuthUser = {
  id: number;
  email: string;
  full_name: string | null;
  plan: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  expires_at: string;
  user: AuthUser;
};

export type AuthPayload = {
  email: string;
  password: string;
  full_name?: string;
};

export async function signup(payload: AuthPayload): Promise<AuthResponse> {
  return authRequest("/auth/signup", payload);
}

export async function login(payload: AuthPayload): Promise<AuthResponse> {
  return authRequest("/auth/login", payload);
}

export async function loadMe(): Promise<AuthUser> {
  const user = await apiGet<AuthUser>("/auth/me");
  localStorage.setItem("equitykobo.user", JSON.stringify(user));
  return user;
}

async function authRequest(path: string, payload: AuthPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(toUserMessage(error?.detail, "Unable to authenticate. Please try again."));
  }

  return response.json();
}

export function saveAuthSession(auth: AuthResponse) {
  localStorage.setItem("equitykobo.token", auth.access_token);
  localStorage.setItem("equitykobo.user", JSON.stringify(auth.user));
}

export function getStoredUser(): AuthUser | null {
  return parseStored<AuthUser>("equitykobo.user");
}

export function clearAuthSession() {
  localStorage.removeItem("equitykobo.token");
  localStorage.removeItem("equitykobo.user");
}

export function hasAuthToken() {
  return Boolean(localStorage.getItem("equitykobo.token"));
}

export type Score = {
  symbol: string;
  name: string;
  sector: string | null;
  as_of_date: string;
  quality_score: string;
  growth_score: string;
  valuation_score: string;
  dividend_score: string;
  risk_score: string;
  overall_score: string;
  status: string;
  reasons: string;
  risks: string;
};

export type ScanRun = {
  scan_run_id: number;
  as_of_date: string;
  results: Score[];
};

export type LatestPrice = {
  symbol: string;
  name: string;
  trade_date: string;
  close_price: string;
  previous_close: string | null;
  price_change: string | null;
  price_change_percent: string | null;
  volume: number | null;
  reviewed: boolean;
};

export type InvestmentRule = {
  symbol: string;
  name: string;
  sector: string | null;
  stock_types: string[];
  fundamental_style: string;
  technical_signal: string;
  decision_guardrails: string[];
  data_warnings: string[];
  checklist: {
    question: string;
    passed: boolean;
    detail: string;
  }[];
  ngx_market_rules: {
    price_band_status: string;
    daily_change_percent: string | null;
    latest_close: string | null;
    latest_volume: number | null;
  };
};

export type Digest = {
  generated_date: string;
  pending_review: {
    prices: number;
    financial_statements: number;
    dividends: number;
    total: number;
  };
  open_alerts: unknown[];
  next_actions: string[];
};

export type ExitSignal = {
  symbol: string;
  action: string;
  confidence: string;
  reasons: string[];
  risks: string[];
  next_action: string;
};

export type ExitIntelligence = {
  generated_date: string;
  signals: ExitSignal[];
};

export type PriceHistoryItem = {
  id: number;
  symbol: string;
  trade_date: string;
  close_price: string;
  volume: number | null;
  reviewed: boolean;
};

export type CompanyLivePrice = {
  latest_price: string | null;
  previous_close: string | null;
  price_change: string | null;
  price_change_percent: string | null;
  trade_date: string | null;
  direction: "up" | "down" | "flat" | "unknown" | string;
  label: string;
  summary: string;
};

export type CompanyPerformanceWindow = {
  window: string;
  available: boolean;
  start_date: string | null;
  end_date: string | null;
  start_price: string | null;
  end_price: string | null;
  return_percent: string | null;
  summary: string;
};

export type CompanyLiveNewsItem = {
  title: string;
  source_name: string | null;
  published_at: string | null;
  url: string | null;
  summary: string | null;
  item_type: "news" | "disclosure" | string;
};

export type CompanyLiveInsightCard = {
  key: string;
  title: string;
  tone: string;
  summary: string;
  points: string[];
  source_count: number;
  generated_from: string[];
};

export type CompanyLivePerformance = {
  headline: string;
  summary: string;
  sector_rank_1m: number | null;
  sector_peer_count: number | null;
  fifty_two_week_high: string | null;
  fifty_two_week_low: string | null;
  position_in_52_week_range_percent: string | null;
  windows: CompanyPerformanceWindow[];
};

export type CompanyLiveInsights = {
  symbol: string;
  name: string;
  sector: string | null;
  generated_at: string;
  price: CompanyLivePrice;
  performance: CompanyLivePerformance;
  cards: CompanyLiveInsightCard[];
  recent_news: CompanyLiveNewsItem[];
  recent_disclosures: CompanyLiveNewsItem[];
  data_notes: string[];
};

export type InvestmentBrief = {
  symbol: string;
  name: string;
  sector: string | null;
  latest_score: Score | null;
  checklist: string[];
  note_count: number;
};

export type CompanyResearchData = {
  decisionCard: DecisionCard;
  liveInsights: CompanyLiveInsights | null;
  rule: InvestmentRule | null;
  brief: InvestmentBrief | null;
  history: PriceHistoryItem[];
};

export type IntelligenceScoreBreakdown = {
  business_quality: string;
  growth: string;
  valuation: string;
  dividend: string;
  financial_risk: string;
  momentum: string;
  liquidity: string;
  data_confidence: string;
  overall: string;
};

export type CompanyMemory = {
  symbol: string;
  name: string;
  sector: string | null;
  market_board: string | null;
  latest_price: string | null;
  latest_price_date: string | null;
  price_records: number;
  dividend_records: number;
  fundamentals_records: number;
  financial_statement_records: number;
  disclosure_records: number;
  annual_report_records: number;
  latest_fundamental_date: string | null;
  latest_statement_period_end: string | null;
};

export type IntelligenceOpportunity = {
  symbol: string;
  name: string;
  sector: string | null;
  as_of_date: string;
  final_label: string;
  stock_types: string[];
  scores: IntelligenceScoreBreakdown;
  reasons: string[];
  risks: string[];
  missing_data: string[];
  next_actions: string[];
  decision_change_triggers: string[];
  metrics: Record<string, string | number | null>;
  memory: CompanyMemory;
};

export type DecisionCardMetric = {
  label: string;
  status: string;
  score: string | null;
  detail: string;
  evidence: string[];
};

export type DecisionCardSection = {
  title: string;
  summary: string;
  points: string[];
};

export type DecisionCardValuationDisplay = {
  is_available: boolean;
  latest_price: string | null;
  fair_value_low: string | null;
  fair_value_mid: string | null;
  fair_value_high: string | null;
  valuation_label: string;
  valuation_tone: string;
  margin_of_safety_percent: string | null;
  expected_return_low_percent: string | null;
  expected_return_high_percent: string | null;
  valuation_confidence: string;
  confidence_score: string;
  price_position_percent: string | null;
  methods_used: string[];
  explanation: string;
  warnings: string[];
  missing_data: string[];
};

export type DecisionCardHealthDisplay = {
  label: string;
  status: string;
  tone: string;
  detail: string;
  score: string | null;
  evidence: string[];
};

export type DecisionCardDividendYear = {
  year: number;
  amount_per_share: string;
  event_count: number;
};

export type DecisionCardDividendDisplay = {
  is_available: boolean;
  current_yield: string | null;
  dividend_strength: string;
  payout_safety: string;
  projected_next_payout: string | null;
  years_with_dividends: number;
  annual_history: DecisionCardDividendYear[];
  explanation: string;
  warnings: string[];
  missing_data: string[];
};

export type DecisionCardMoatDisplay = {
  rating: string;
  label: string;
  tone: string;
  peer_strength_score: string | null;
  summary: string;
  factors: string[];
  warnings: string[];
};

export type DecisionCardSourceGap = {
  data_layer: string;
  status: string;
  priority: string;
  why_it_matters: string;
  current_coverage: string;
  suggested_source: string;
  next_step: string;
};

export type ValuationMethod = {
  name: string;
  fair_value_low: string | null;
  fair_value_mid: string | null;
  fair_value_high: string | null;
  confidence_score: string;
  reason: string;
  assumptions: string[];
  warnings: string[];
};

export type CompanyValuation = {
  symbol: string;
  name: string;
  sector: string | null;
  as_of_date: string;
  latest_price: string | null;
  latest_price_date: string | null;
  fair_value_low: string | null;
  fair_value_mid: string | null;
  fair_value_high: string | null;
  margin_of_safety_percent: string | null;
  expected_return_low_percent: string | null;
  expected_return_high_percent: string | null;
  valuation_label: string;
  valuation_confidence: string;
  confidence_score: string;
  methods: ValuationMethod[];
  assumptions: string[];
  reasons: string[];
  warnings: string[];
  missing_data: string[];
  metrics: Record<string, string | number | null>;
  source_summary: Record<string, string | number | null>;
};

export type DecisionDashboardSummary = {
  companies_scanned: number;
  research_candidates: number;
  dividend_candidates: number;
  undervalued_quality: number;
  sector_leaders: number;
  watch_for_entry: number;
  avoid_or_needs_data: number;
};

export type DecisionDashboardOpportunity = {
  symbol: string;
  name: string;
  sector: string | null;
  as_of_date: string;
  answer: string;
  tone: "positive" | "warning" | "speculative" | "danger" | string;
  final_label: string;
  invest_score: string;
  confidence: string;
  confidence_score: string;
  risk_level: string;
  suggested_horizon: string;
  latest_price: string | null;
  latest_price_date: string | null;
  fair_value_mid: string | null;
  margin_of_safety_percent: string | null;
  valuation_label: string | null;
  valuation_confidence: string | null;
  peer_rank: number | null;
  peer_count: number | null;
  peer_label: string | null;
  best_peer_symbol: string | null;
  stock_types: string[];
  category_tags: string[];
  why_attention: string;
  main_risk: string;
  next_action: string;
  reasons: string[];
  risks: string[];
  next_actions: string[];
  missing_data: string[];
  scores: IntelligenceScoreBreakdown;
  metrics: Record<string, string | number | null>;
};

export type DecisionDashboardSpotlight = {
  key: string;
  title: string;
  subtitle: string;
  opportunity: DecisionDashboardOpportunity | null;
};

export type DecisionDashboardCategory = {
  key: string;
  title: string;
  summary: string;
  items: DecisionDashboardOpportunity[];
};

export type OpportunityDeskData = {
  as_of_date: string;
  generated_at: string;
  market_summary: DecisionDashboardSummary;
  spotlight_cards: DecisionDashboardSpotlight[];
  categories: DecisionDashboardCategory[];
  ranked: DecisionDashboardOpportunity[];
  data_notes: string[];
};

export type PeerCategoryWinner = {
  category: string;
  symbol: string | null;
  name: string | null;
  value: string | null;
  detail: string;
};

export type PeerMetricComparison = {
  metric: string;
  company_value: string | null;
  sector_median: string | null;
  best_symbol: string | null;
  best_value: string | null;
  rank: number | null;
  peer_count: number;
  interpretation: string;
};

export type PeerComparisonRow = {
  symbol: string;
  name: string;
  sector: string | null;
  final_label: string;
  stock_types: string[];
  sector_rank: number | null;
  peer_score: string;
  overall_score: string;
  business_quality_score: string;
  growth_score: string;
  valuation_score: string;
  dividend_score: string;
  financial_risk_score: string;
  liquidity_score: string;
  data_confidence_score: string;
  latest_price: string | null;
  pe_ratio: string | null;
  roe: string | null;
  profit_margin: string | null;
  dividend_yield: string | null;
  margin_of_safety_percent: string | null;
  valuation_label: string | null;
};

export type CompanyPeerComparison = {
  symbol: string;
  name: string;
  sector: string | null;
  as_of_date: string;
  peer_count: number;
  sector_rank: number | null;
  sector_percentile: string | null;
  comparison_label: string;
  best_overall_peer_symbol: string | null;
  best_overall_peer_name: string | null;
  category_winners: PeerCategoryWinner[];
  metric_comparisons: PeerMetricComparison[];
  peers: PeerComparisonRow[];
  strengths: string[];
  weaknesses: string[];
  reasons: string[];
  warnings: string[];
  next_actions: string[];
  metrics: Record<string, string | number | null>;
  source_summary: Record<string, string | number | null>;
};

export type DecisionCard = {
  symbol: string;
  name: string;
  sector: string | null;
  as_of_date: string;
  latest_price: string | null;
  latest_price_date: string | null;
  stock_types: string[];
  answer: string;
  invest_score: string;
  confidence: string;
  confidence_score: string;
  risk_level: string;
  suggested_horizon: string;
  valuation_status: string;
  financial_health: string;
  dividend_quality: string;
  moat_rating: string;
  one_paragraph_summary: string;
  decision_summary: string;
  score_breakdown: IntelligenceScoreBreakdown;
  valuation_snapshot: CompanyValuation | null;
  peer_comparison: CompanyPeerComparison | null;
  health_checks: DecisionCardMetric[];
  valuation_display: DecisionCardValuationDisplay;
  health_display: DecisionCardHealthDisplay[];
  dividend_display: DecisionCardDividendDisplay;
  moat_display: DecisionCardMoatDisplay;
  source_gaps: DecisionCardSourceGap[];
  valuation: DecisionCardSection;
  why_buy: DecisionCardSection;
  why_not_buy: DecisionCardSection;
  growth_drivers: DecisionCardSection;
  threats: DecisionCardSection;
  dividend: DecisionCardSection;
  moat: DecisionCardSection;
  future_outlook: DecisionCardSection;
  stress_test: DecisionCardSection;
  portfolio_fit: DecisionCardSection;
  what_changed: DecisionCardSection;
  what_would_change_decision: DecisionCardSection;
  missing_data: string[];
  data_quality_notes: string[];
};

export type OnboardingPayload = {
  goal: string;
  experience: string;
  capital: string;
  sectors: string[];
  watchlist: string[];
};

export type Company = {
  id: number;
  symbol: string;
  name: string;
  sector: string | null;
  market_board: string | null;
  is_active: boolean;
};

export type NgxPulseSyncResult = {
  endpoint: string;
  imported: number;
  updated_prices: number;
  updated_companies: number;
  skipped: number;
  errors: string[];
};

export type NgxPulseMarketStatus = {
  data: {
    status?: string;
    message?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
};

export type AutomationStatus = {
  enabled: boolean;
  is_running: boolean;
  runs: number;
  last_started_at: string | null;
  last_finished_at: string | null;
  last_error: string | null;
  last_result: Record<string, number> | null;
  current_step: string | null;
  current_index: number | null;
  current_total: number | null;
  interval_minutes: number;
  run_on_startup: boolean;
  dividend_sync_enabled: boolean;
};

export type UploadedReport = {
  id: number;
  source_document_id: number;
  company_id: number | null;
  original_filename: string;
  stored_path: string;
  content_type: string | null;
  file_size: number;
  sha256: string;
  status: string;
};

export type ReportTextExtraction = {
  id: number;
  uploaded_report_id: number;
  extraction_method: string;
  page_count: number;
  character_count: number;
  status: string;
  warnings: string | null;
  text_preview: string;
};

export type ExtractionDraft = {
  id: number;
  company_id: number | null;
  source_document_id: number | null;
  uploaded_report_id: number | null;
  extraction_type: string;
  provider: string;
  model: string;
  parsed_data: Record<string, unknown> | null;
  status: string;
  notes: string | null;
};

export type ApplyDraftResult = {
  draft_id: number;
  financial_statement_id: number;
  dividend_ids: number[];
  reviewed: boolean;
};

export type PendingReviewItem = {
  record_type: "prices" | "financial_statements" | "dividends";
  record_id: number;
  symbol: string;
  summary: string;
  source_name: string | null;
  source_url: string | null;
};

export type ReviewResult = {
  record_type: string;
  record_id: number;
  action: string;
  reviewed: boolean;
};

export type UserProfile = {
  id: number;
  user_id: number;
  investor_goal: string | null;
  experience_level: string | null;
  capital_range: string | null;
  preferred_sectors: string[];
  onboarding_completed: boolean;
};

export type UserWatchlist = {
  id: number;
  name: string;
  symbols: string[];
};

export type JournalEntryPayload = {
  symbol: string;
  thesis: string;
  goal: string;
  horizon: string;
  target_entry?: string | null;
  exit_rule?: string | null;
  risk?: string | null;
  status: "Watching" | "Ready to research" | "Bought" | "Rejected";
};

export type UserJournalEntry = JournalEntryPayload & {
  id: number;
  created_at: string;
  updated_at: string;
};

export type PortfolioPlanPayload = {
  name: string;
  items: {
    symbol: string;
    planned_amount: string;
  }[];
};

export type UserPortfolioPlan = {
  id: number;
  name: string;
  items: {
    id: number;
    symbol: string;
    planned_amount: string;
  }[];
};

export type PortfolioTransactionPayload = {
  symbol: string;
  transaction_date: string;
  transaction_type: "BUY" | "SELL" | "DIVIDEND";
  quantity: string;
  price_per_share?: string | null;
  fees: string;
  cash_amount?: string | null;
  notes?: string | null;
};

export type PortfolioTransaction = PortfolioTransactionPayload & {
  id: number;
};

export type PortfolioPosition = {
  symbol: string;
  name: string;
  sector: string | null;
  quantity: string;
  average_cost: string | null;
  cost_basis: string;
  latest_price: string | null;
  market_value: string | null;
  unrealized_gain_loss: string | null;
  unrealized_gain_loss_percent: string | null;
  portfolio_weight: string | null;
  dividends_received: string;
};

export type PortfolioSummary = {
  total_cost_basis: string;
  total_market_value: string;
  total_unrealized_gain_loss: string;
  total_unrealized_gain_loss_percent: string | null;
  total_dividends_received: string;
  positions: PortfolioPosition[];
  sector_allocation: {
    sector: string;
    market_value: string;
    portfolio_weight: string;
  }[];
  warnings: string[];
};

export async function saveOnboarding(payload: OnboardingPayload) {
  const [profile, watchlist] = await Promise.all([
    apiPut<UserProfile>("/me/profile", {
      investor_goal: payload.goal,
      experience_level: payload.experience,
      capital_range: payload.capital,
      preferred_sectors: payload.sectors,
      onboarding_completed: true,
    }),
    apiPut<UserWatchlist>("/me/watchlist", {
      name: "Starter Watchlist",
      symbols: payload.watchlist,
    }),
  ]);
  return { profile, watchlist };
}

export async function loadMyWatchlist(): Promise<UserWatchlist> {
  return apiGet<UserWatchlist>("/me/watchlist");
}

export async function loadMyJournal(): Promise<UserJournalEntry[]> {
  return apiGet<UserJournalEntry[]>("/me/journal");
}

export async function createMyJournalEntry(payload: JournalEntryPayload): Promise<UserJournalEntry> {
  return apiPost<UserJournalEntry>("/me/journal", payload);
}

export async function deleteMyJournalEntry(id: number): Promise<void> {
  await apiDelete(`/me/journal/${id}`);
}

export async function loadMyPortfolioPlan(): Promise<UserPortfolioPlan> {
  return apiGet<UserPortfolioPlan>("/me/portfolio-plan");
}

export async function saveMyPortfolioPlan(payload: PortfolioPlanPayload): Promise<UserPortfolioPlan> {
  return apiPut<UserPortfolioPlan>("/me/portfolio-plan", payload);
}

export async function loadMyPortfolioSummary(): Promise<PortfolioSummary> {
  return apiGet<PortfolioSummary>("/me/portfolio/summary");
}

export async function loadMyPortfolioTransactions(): Promise<PortfolioTransaction[]> {
  return apiGet<PortfolioTransaction[]>("/me/portfolio/transactions");
}

export async function createMyPortfolioTransaction(
  payload: PortfolioTransactionPayload,
): Promise<PortfolioTransaction> {
  return apiPost<PortfolioTransaction>("/me/portfolio/transactions", payload);
}

export async function syncLocalAccountData() {
  const onboarding = parseStored<OnboardingPayload>("equitykobo.onboarding");
  const journalEntries = parseStored<
    {
      symbol: string;
      thesis: string;
      goal: string;
      horizon: string;
      targetEntry?: string | null;
      exitRule?: string | null;
      risk?: string | null;
      status: JournalEntryPayload["status"];
      remote?: boolean;
    }[]
  >("equitykobo.journal");
  const portfolioPlan = parseStored<Record<string, string>>("equitykobo.portfolioPlan");

  if (onboarding) {
    await saveOnboarding(onboarding).catch(() => null);
    localStorage.removeItem("equitykobo.pendingOnboardingSync");
  }

  if (journalEntries?.length) {
    const localEntries = journalEntries.filter((entry) => !entry.remote);
    await Promise.all(
      localEntries.map((entry) =>
        createMyJournalEntry({
          symbol: entry.symbol,
          thesis: entry.thesis,
          goal: entry.goal,
          horizon: entry.horizon,
          target_entry: entry.targetEntry,
          exit_rule: entry.exitRule,
          risk: entry.risk,
          status: entry.status,
        }).catch(() => null),
      ),
    );
  }

  if (portfolioPlan) {
    await saveMyPortfolioPlan({
      name: "Default Plan",
      items: Object.entries(portfolioPlan).map(([symbol, plannedAmount]) => ({
        symbol,
        planned_amount: String(Number(plannedAmount.replaceAll(",", "")) || 0),
      })),
    }).catch(() => null);
  }
}

export async function loadOpportunityDesk(): Promise<OpportunityDeskData> {
  return apiGet<OpportunityDeskData>("/decision/opportunities", 30000);
}

export async function loadCompanyResearch(symbol: string): Promise<CompanyResearchData> {
  const normalized = symbol.toUpperCase();
  const [decisionCard, liveInsights, rule, brief, history] = await Promise.all([
    apiGet<DecisionCard>(`/intelligence/company/${normalized}/decision-card`, 10000),
    apiGet<CompanyLiveInsights>(`/intelligence/company/${normalized}/live-insights`, 7000).catch(() => null),
    apiGet<InvestmentRule>(`/rules/investment/${normalized}`, 5000).catch(() => null),
    apiGet<InvestmentBrief>(`/research/${normalized}/brief`, 5000).catch(() => null),
    apiGet<PriceHistoryItem[]>(`/prices/${normalized}/history?limit=30`, 5000).catch(() => []),
  ]);

  return { decisionCard, liveInsights, rule, brief, history };
}

export async function loadCompanies(): Promise<Company[]> {
  return apiGet<Company[]>("/companies");
}

export async function loadNgxPulseMarketStatus(): Promise<NgxPulseMarketStatus> {
  return apiGet<NgxPulseMarketStatus>("/integrations/ngxpulse/market-status");
}

export async function loadAutomationStatus(): Promise<AutomationStatus> {
  return apiGet<AutomationStatus>("/automation/status");
}

export type AutomationRunResult = {
  status: string;
  result?: Record<string, number>;
  error?: string;
  error_code?: string;
};

export async function runAutomationNow(): Promise<AutomationRunResult> {
  const result = await apiPost<AutomationRunResult>("/automation/run-now", null);
  if (result.status === "failed") {
    throw new Error(
      toUserMessage(
        result.error,
        "Automatic market intelligence could not finish. The technical details were logged on the server.",
      ),
    );
  }
  return result;
}

export async function syncNgxPulseFundamentals(symbols?: string): Promise<NgxPulseSyncResult> {
  const query = symbols ? `?symbols=${encodeURIComponent(symbols)}` : "";
  return apiPost<NgxPulseSyncResult>(`/integrations/ngxpulse/sync/fundamentals${query}`, null);
}

export async function syncNgxPulseDividends(symbol: string): Promise<NgxPulseSyncResult> {
  return apiPost<NgxPulseSyncResult>(`/integrations/ngxpulse/sync/dividends/${symbol}`, null);
}

export async function syncNgxPulseDisclosures(limit = 50): Promise<NgxPulseSyncResult> {
  return apiPost<NgxPulseSyncResult>(`/integrations/ngxpulse/sync/disclosures?limit=${limit}`, null);
}

export async function syncNgxPulseIndices(): Promise<NgxPulseSyncResult> {
  return apiPost<NgxPulseSyncResult>("/integrations/ngxpulse/sync/indices", null);
}

export async function syncNgxPulseEtfs(): Promise<NgxPulseSyncResult> {
  return apiPost<NgxPulseSyncResult>("/integrations/ngxpulse/sync/etfs", null);
}

export async function syncNgxPulseBonds(): Promise<NgxPulseSyncResult> {
  return apiPost<NgxPulseSyncResult>("/integrations/ngxpulse/sync/bonds", null);
}

export async function syncNgxPulseBondAuctions(limit = 50): Promise<NgxPulseSyncResult> {
  return apiPost<NgxPulseSyncResult>(`/integrations/ngxpulse/sync/bond-auctions?limit=${limit}`, null);
}

export async function syncNgxPulseNasdOtcStocks(): Promise<NgxPulseSyncResult> {
  return apiPost<NgxPulseSyncResult>("/integrations/ngxpulse/sync/nasd-otc/stocks", null);
}

export async function syncNgxPulseMarketNews(limit = 50): Promise<NgxPulseSyncResult> {
  return apiPost<NgxPulseSyncResult>(`/integrations/ngxpulse/sync/news?limit=${limit}`, null);
}

export async function loadReports(limit = 100): Promise<UploadedReport[]> {
  return apiGet<UploadedReport[]>(`/reports?limit=${limit}`);
}

export async function deleteReport(reportId: number): Promise<void> {
  await apiDelete(`/reports/${reportId}`);
}

export async function uploadReport(payload: {
  symbol: string;
  name: string;
  documentType: string;
  notes?: string;
  file: File;
}): Promise<UploadedReport> {
  const form = new FormData();
  form.append("symbol", payload.symbol);
  form.append("name", payload.name);
  form.append("document_type", payload.documentType);
  if (payload.notes) {
    form.append("notes", payload.notes);
  }
  form.append("file", payload.file);
  return apiPostForm<UploadedReport>("/reports/upload", form);
}

export async function extractReportText(reportId: number): Promise<ReportTextExtraction> {
  return apiPost<ReportTextExtraction>(`/reports/${reportId}/extract-text`, null);
}

export async function createReportExtractionDraft(reportId: number): Promise<ExtractionDraft> {
  return apiPost<ExtractionDraft>(`/reports/${reportId}/extraction-drafts`, null);
}

export async function createManualExtractionDraft(payload: {
  symbol: string;
  sourceDocumentId?: number | null;
  uploadedReportId?: number | null;
  sourceName?: string | null;
  reportYear?: number | null;
  reportText: string;
  notes?: string | null;
}): Promise<ExtractionDraft> {
  return apiPost<ExtractionDraft>("/llm/extraction-drafts/from-text", {
    symbol: payload.symbol,
    source_document_id: payload.sourceDocumentId ?? null,
    uploaded_report_id: payload.uploadedReportId ?? null,
    source_name: payload.sourceName ?? null,
    report_year: payload.reportYear ?? null,
    report_text: payload.reportText,
    notes: payload.notes ?? null,
  });
}

export async function applyExtractionDraft(draftId: number): Promise<ApplyDraftResult> {
  return apiPost<ApplyDraftResult>(`/llm/extraction-drafts/${draftId}/apply`, null);
}

export async function loadExtractionDrafts(limit = 100): Promise<ExtractionDraft[]> {
  return apiGet<ExtractionDraft[]>(`/llm/extraction-drafts?limit=${limit}`);
}

export async function loadPendingReview(limit = 100): Promise<PendingReviewItem[]> {
  return apiGet<PendingReviewItem[]>(`/review/pending?limit=${limit}`);
}

export async function approveReviewItem(item: PendingReviewItem, notes?: string): Promise<ReviewResult> {
  return apiPost<ReviewResult>(`/review/${item.record_type}/${item.record_id}/approve`, {
    notes: notes || null,
  });
}

async function apiGet<T>(path: string, timeoutMs = 12000): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(),
    signal: controller.signal,
  }).finally(() => window.clearTimeout(timeout));
  if (!response.ok) {
    throw new Error(await responseError(response, `Unable to load ${path}`));
  }
  return response.json();
}

async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: jsonHeaders(),
    body: payload === null ? undefined : JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await responseError(response, `Unable to save ${path}`));
  }
  return response.json();
}

async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  if (!response.ok) {
    throw new Error(await responseError(response, `Unable to upload ${path}`));
  }
  return response.json();
}

async function apiPut<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await responseError(response, `Unable to save ${path}`));
  }
  return response.json();
}

async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error(await responseError(response, `Unable to delete ${path}`));
  }
}

async function responseError(response: Response, fallback: string) {
  const error = await response.json().catch(() => null);
  if (typeof error?.detail === "string") {
    return toUserMessage(error.detail, fallback);
  }
  if (Array.isArray(error?.detail)) {
    const message = error.detail
      .map((item: { msg?: string; loc?: string[] }) => [item.loc?.join("."), item.msg].filter(Boolean).join(": "))
      .filter(Boolean)
      .join("; ");
    return toUserMessage(message, fallback);
  }
  return fallback;
}

const TECHNICAL_ERROR_MARKERS = [
  "psycopg.",
  "sqlalchemy.",
  "[SQL:",
  "[parameters:",
  "background on this error",
  "duplicate key value violates",
  "unique constraint",
  "foreign key constraint",
  "traceback",
];

export function toUserMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const trimmed = message.trim();
  if (!trimmed || isTechnicalError(trimmed)) {
    return fallback;
  }
  return trimmed;
}

function isTechnicalError(message: string) {
  const normalized = message.toLowerCase();
  return TECHNICAL_ERROR_MARKERS.some((marker) => normalized.includes(marker.toLowerCase()));
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("equitykobo.token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function jsonHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
}

function parseStored<T>(key: string): T | null {
  const stored = localStorage.getItem(key);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}
