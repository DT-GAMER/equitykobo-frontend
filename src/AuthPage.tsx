import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, LockKeyhole, Mail, UserRound } from "lucide-react";
import { login, saveAuthSession, signup, syncLocalAccountData } from "./api";

type AuthMode = "login" | "signup";

type AuthPageProps = {
  mode: AuthMode;
};

function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = mode === "signup";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const auth = isSignup
        ? await signup({ email, password, full_name: fullName })
        : await login({ email, password });
      saveAuthSession(auth);
      await syncLocalAccountData();
      const redirectTo =
        typeof location.state === "object" &&
        location.state !== null &&
        "from" in location.state &&
        typeof location.state.from === "object" &&
        location.state.from !== null &&
        "pathname" in location.state.from &&
        typeof location.state.from.pathname === "string"
          ? location.state.from.pathname
          : null;
      navigate(isSignup ? "/onboarding" : (redirectTo ?? "/app"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="back-link" to="/">
          <ArrowLeft size={18} />
          Back to home
        </Link>
        <div className="auth-copy">
          <p className="eyebrow">Private research workspace</p>
          <h1>{isSignup ? "Create your EquityKobo account." : "Welcome back to EquityKobo."}</h1>
          <p>
            {isSignup
              ? "Start with a calmer way to research Nigerian stocks before you invest."
              : "Continue reviewing opportunities, watchlists, goals, and portfolio signals."}
          </p>
        </div>
        <div className="auth-highlights" aria-label="EquityKobo authentication benefits">
          <span>
            <Eye size={17} />
            Watch before buying
          </span>
          <span>
            <LockKeyhole size={17} />
            Keep your research private
          </span>
        </div>
      </section>

      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">{isSignup ? "Sign up" : "Login"}</p>
            <h2>{isSignup ? "Start researching" : "Open your workspace"}</h2>
          </div>

          {isSignup && (
            <label>
              Full name
              <span className="input-wrap">
                <UserRound size={18} />
                <input
                  autoComplete="name"
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your name"
                  type="text"
                  value={fullName}
                />
              </span>
            </label>
          )}

          <label>
            Email
            <span className="input-wrap">
              <Mail size={18} />
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </span>
          </label>

          <label>
            Password
            <span className="input-wrap">
              <LockKeyhole size={18} />
              <input
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
                type="password"
                value={password}
              />
            </span>
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="button auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Please wait..." : isSignup ? "Create account" : "Login"}
          </button>

          <p className="auth-switch">
            {isSignup ? "Already have an account?" : "New to EquityKobo?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Login" : "Create an account"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
