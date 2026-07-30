import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { clearAuthSession, hasAuthToken, loadMe } from "./api";

type ProtectedRouteProps = {
  children: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">(
    hasAuthToken() ? "checking" : "denied",
  );

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (!hasAuthToken()) {
        setStatus("denied");
        return;
      }

      try {
        await loadMe();
        if (!cancelled) {
          setStatus("allowed");
        }
      } catch {
        clearAuthSession();
        if (!cancelled) {
          setStatus("denied");
        }
      }
    }

    verifySession();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <main className="auth-check-page">
        <div className="state-panel">
          <LoaderCircle className="spin" size={24} />
          Checking your EquityKobo session...
        </div>
      </main>
    );
  }

  if (status === "denied") {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
