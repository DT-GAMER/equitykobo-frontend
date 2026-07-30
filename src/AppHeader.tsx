import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BriefcaseBusiness,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Target,
} from "lucide-react";
import { AuthUser, clearAuthSession, getStoredUser } from "./api";

const navItems = [
  { to: "/app", label: "Opportunity Desk", icon: LayoutDashboard },
  { to: "/watchlists", label: "Watchlists", icon: ListChecks },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/portfolio-plan", label: "Portfolio Plan", icon: Target },
  { to: "/portfolio", label: "Portfolio", icon: BriefcaseBusiness },
];

const logoMark =
  "https://res.cloudinary.com/dofiyn7bw/image/upload/v1785268787/WhatsApp_Image_2026-07-28_at_20.51.17_k8eetf.jpg";

function AppHeader() {
  const user = getStoredUser();
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem("equitykobo.sidebar") === "closed");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", isCollapsed);
    localStorage.setItem("equitykobo.sidebar", isCollapsed ? "closed" : "open");
    return () => document.body.classList.remove("sidebar-collapsed");
  }, [isCollapsed]);

  function logout() {
    clearAuthSession();
    window.location.href = "/";
  }

  return (
    <>
      <button
        aria-label="Open navigation"
        className="mobile-sidebar-trigger"
        onClick={() => setIsMobileOpen(true)}
        type="button"
      >
        <Menu size={20} />
        <span>EquityKobo</span>
      </button>
      {isMobileOpen && (
        <button
          aria-label="Close navigation overlay"
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
          type="button"
        />
      )}
      <aside className={isMobileOpen ? "app-sidebar mobile-open" : "app-sidebar"}>
      <NavLink className="brand" to="/app">
        <img className="brand-mark" src={logoMark} alt="" />
        <span className="brand-name">EquityKobo</span>
      </NavLink>
      <div className="sidebar-controls">
        <button
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="sidebar-toggle desktop-only"
          onClick={() => setIsCollapsed((current) => !current)}
          type="button"
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
      <nav className="app-nav" aria-label="Workspace navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              className={({ isActive }) => (isActive ? "app-nav-link active" : "app-nav-link")}
              key={item.to}
              to={item.to}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="account-chip">
        <span>{accountInitials(user)}</span>
        <strong>{user?.full_name || user?.email || "Account"}</strong>
        <button aria-label="Logout" onClick={logout} type="button">
          <LogOut size={17} />
        </button>
      </div>
    </aside>
    </>
  );
}

function accountInitials(user: AuthUser | null) {
  const label = user?.full_name || user?.email || "EK";
  return label
    .split(/[ @.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default AppHeader;
