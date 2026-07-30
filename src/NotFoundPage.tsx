import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import AppHeader from "./AppHeader";
import { hasAuthToken } from "./api";

function NotFoundPage() {
  const isAuthenticated = hasAuthToken();

  if (isAuthenticated) {
    return (
      <main className="not-found-page">
        <AppHeader />
        <section className="not-found-panel">
          <Compass size={32} />
          <p className="eyebrow">Page not found</p>
          <h1>This EquityKobo page does not exist.</h1>
          <Link className="button" to="/app">
            <ArrowLeft size={18} />
            Back to Opportunity Desk
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="not-found-page public">
      <section className="not-found-panel">
        <Compass size={32} />
        <p className="eyebrow">Page not found</p>
        <h1>This EquityKobo page does not exist.</h1>
        <Link className="button" to="/">
          <ArrowLeft size={18} />
          Back to home
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;
