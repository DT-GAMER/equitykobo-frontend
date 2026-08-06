import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import AdminPage from "./AdminPage";
import AppShell from "./AppShell";
import AuthPage from "./AuthPage";
import CompanyResearchPage from "./CompanyResearchPage";
import JournalPage from "./JournalPage";
import NotFoundPage from "./NotFoundPage";
import OnboardingPage from "./OnboardingPage";
import PortfolioPage from "./PortfolioPage";
import PortfolioPlannerPage from "./PortfolioPlannerPage";
import ProtectedRoute from "./ProtectedRoute";
import WatchlistsPage from "./WatchlistsPage";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:symbol"
          element={
            <ProtectedRoute>
              <CompanyResearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <JournalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio-plan"
          element={
            <ProtectedRoute>
              <PortfolioPlannerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <PortfolioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watchlists"
          element={
            <ProtectedRoute>
              <WatchlistsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
