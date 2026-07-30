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
    throw new Error(error?.detail ?? "Unable to authenticate. Please try again.");
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

export type InvestmentBrief = {
  symbol: string;
  name: string;
  sector: string | null;
  latest_score: Score | null;
  checklist: string[];
  note_count: number;
};

export type CompanyResearchData = {
  rule: InvestmentRule;
  brief: InvestmentBrief | null;
  history: PriceHistoryItem[];
};

export type OpportunityDeskData = {
  scan: ScanRun;
  prices: LatestPrice[];
  rules: InvestmentRule[];
  digest: Digest;
  exits: ExitIntelligence;
};

export type OnboardingPayload = {
  goal: string;
  experience: string;
  capital: string;
  sectors: string[];
  watchlist: string[];
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
  const [scan, prices] = await Promise.all([
    apiGet<ScanRun>("/scans/latest?limit=100"),
    apiGet<LatestPrice[]>("/prices/latest?limit=200"),
  ]);
  const [rules, digest, exits] = await Promise.all([
    apiGet<InvestmentRule[]>("/rules/investment?limit=100", 5000).catch(() => []),
    apiGet<Digest>("/digest/weekly", 3500).catch(() => ({
      generated_date: new Date().toISOString().slice(0, 10),
      pending_review: { prices: 0, financial_statements: 0, dividends: 0, total: 0 },
      open_alerts: [],
      next_actions: [],
    })),
    apiGet<ExitIntelligence>("/portfolio/exit-intelligence", 3500).catch(() => ({
      generated_date: new Date().toISOString().slice(0, 10),
      signals: [],
    })),
  ]);

  return { scan, prices, rules, digest, exits };
}

export async function loadCompanyResearch(symbol: string): Promise<CompanyResearchData> {
  const normalized = symbol.toUpperCase();
  const [rule, brief, history] = await Promise.all([
    apiGet<InvestmentRule>(`/rules/investment/${normalized}`),
    apiGet<InvestmentBrief>(`/research/${normalized}/brief`, 5000).catch(() => null),
    apiGet<PriceHistoryItem[]>(`/prices/${normalized}/history?limit=30`, 5000).catch(() => []),
  ]);

  return { rule, brief, history };
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
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await responseError(response, `Unable to save ${path}`));
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
    return error.detail;
  }
  if (Array.isArray(error?.detail)) {
    return error.detail
      .map((item: { msg?: string; loc?: string[] }) => [item.loc?.join("."), item.msg].filter(Boolean).join(": "))
      .filter(Boolean)
      .join("; ");
  }
  return fallback;
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
