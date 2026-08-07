import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StepProgress from "./StepProgress";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import {
  capitalRanges,
  experienceLevels,
  investorGoals,
  sectors,
  starterCompanies,
} from "./onboardingData";
import { saveOnboarding } from "./api";

type Step = 0 | 1 | 2 | 3 | 4;

type OnboardingState = {
  goal: string;
  experience: string;
  capital: string;
  sectors: string[];
  watchlist: string[];
};

const initialState: OnboardingState = {
  goal: "",
  experience: "",
  capital: "",
  sectors: [],
  watchlist: [],
};

const steps = ["Goal", "Experience", "Capital", "Sectors", "Watchlist"];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [state, setState] = useState(initialState);
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredCompanies = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return starterCompanies.filter((company) => {
      const matchesQuery =
        !normalized ||
        company.symbol.toLowerCase().includes(normalized) ||
        company.name.toLowerCase().includes(normalized);
      const matchesSector = state.sectors.length === 0 || state.sectors.includes(company.sector);
      return matchesQuery && matchesSector;
    });
  }, [query, state.sectors]);

  const canContinue =
    step === 0
      ? Boolean(state.goal)
      : step === 1
        ? Boolean(state.experience)
        : step === 2
          ? Boolean(state.capital)
          : step === 3
            ? state.sectors.length > 0
            : state.watchlist.length > 0;

  async function next() {
    if (step < 4) {
      setStep((current) => (current + 1) as Step);
      return;
    }
    localStorage.setItem("equitykobo.onboarding", JSON.stringify(state));
    setIsSaving(true);
    try {
      await saveOnboarding(state);
    } catch {
      localStorage.setItem("equitykobo.pendingOnboardingSync", "true");
    } finally {
      setIsSaving(false);
    }
    navigate("/app");
  }

  function back() {
    setStep((current) => Math.max(0, current - 1) as Step);
  }

  function toggleSector(sector: string) {
    setState((current) => ({
      ...current,
      sectors: current.sectors.includes(sector)
        ? current.sectors.filter((item) => item !== sector)
        : [...current.sectors, sector],
    }));
  }

  function toggleCompany(symbol: string) {
    setState((current) => {
      if (current.watchlist.includes(symbol)) {
        return {
          ...current,
          watchlist: current.watchlist.filter((item) => item !== symbol),
        };
      }
      if (current.watchlist.length >= 10) {
        return current;
      }
      return { ...current, watchlist: [...current.watchlist, symbol] };
    });
  }

  return (
    <main className="onboarding-page">
      <aside className="onboarding-sidebar">
        <Link className="back-link" to="/">
          <ArrowLeft size={18} />
          Back to home
        </Link>
        <div className="onboarding-intro">
          <p className="eyebrow">Investor setup</p>
          <h1>Let EquityKobo reduce the noise first.</h1>
          <p>
            Your answers shape the first watchlist and how the app explains opportunities before
            you invest.
          </p>
        </div>
        <StepProgress current={step} steps={steps} />
      </aside>

      <section className="onboarding-content">
        <div className="onboarding-card">
          {step === 0 && (
            <StepOptions
              eyebrow="Step 1"
              options={investorGoals}
              selected={state.goal}
              title="What are you investing for?"
              onSelect={(goal) => setState((current) => ({ ...current, goal }))}
            />
          )}

          {step === 1 && (
            <StepOptions
              eyebrow="Step 2"
              options={experienceLevels}
              selected={state.experience}
              title="How should EquityKobo explain things?"
              onSelect={(experience) => setState((current) => ({ ...current, experience }))}
            />
          )}

          {step === 2 && (
            <div>
              <p className="eyebrow">Step 3</p>
              <h2>What capital range are you starting with?</h2>
              <div className="choice-grid compact-choice-grid">
                {capitalRanges.map((range) => (
                  <button
                    className={state.capital === range ? "choice selected" : "choice"}
                    key={range}
                    onClick={() => setState((current) => ({ ...current, capital: range }))}
                    type="button"
                  >
                    <strong>{range}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="eyebrow">Step 4</p>
              <h2>Which sectors do you want to understand first?</h2>
              <p className="onboarding-help">
                Pick a few sectors. You can still research every NGX company later.
              </p>
              <div className="choice-grid compact-choice-grid">
                {sectors.map((sector) => (
                  <button
                    className={state.sectors.includes(sector) ? "choice selected" : "choice"}
                    key={sector}
                    onClick={() => toggleSector(sector)}
                    type="button"
                  >
                    <strong>{sector}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="eyebrow">Step 5</p>
              <h2>Build a focused starter watchlist.</h2>
              <p className="onboarding-help">
                Choose up to 10 companies. The point is to watch before buying.
              </p>
              <label className="search-field">
                <Search size={18} />
                <input
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search symbol or company"
                  type="search"
                  value={query}
                />
              </label>
              <div className="watchlist-counter">{state.watchlist.length}/10 selected</div>
              <div className="company-picker">
                {filteredCompanies.map((company) => (
                  <button
                    className={
                      state.watchlist.includes(company.symbol)
                        ? "company-choice selected"
                        : "company-choice"
                    }
                    key={company.symbol}
                    onClick={() => toggleCompany(company.symbol)}
                    type="button"
                  >
                    <strong>{company.symbol}</strong>
                    <span>{company.name}</span>
                    <small>{company.sector}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="onboarding-actions">
            <button className="button button-muted" disabled={step === 0} onClick={back} type="button">
              Back
            </button>
            <button className="button" disabled={!canContinue || isSaving} onClick={next} type="button">
              {step === 4 ? (isSaving ? "Saving setup" : "Finish setup") : "Continue"}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

type StepOption = {
  id: string;
  label: string;
  description: string;
};

type StepOptionsProps = {
  eyebrow: string;
  options: StepOption[];
  selected: string;
  title: string;
  onSelect: (value: string) => void;
};

function StepOptions({ eyebrow, options, selected, title, onSelect }: StepOptionsProps) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <div className="choice-grid">
        {options.map((option) => (
          <button
            className={selected === option.id ? "choice selected" : "choice"}
            key={option.id}
            onClick={() => onSelect(option.id)}
            type="button"
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default OnboardingPage;
