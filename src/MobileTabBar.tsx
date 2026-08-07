import { NavLink } from "react-router-dom";
import { BriefcaseBusiness, Compass, Eye, NotebookPen, Target } from "lucide-react";

/**
 * Thumb-reachable navigation for phones and the installed PWA.
 *
 * The five primary destinations only. Anything secondary — Admin, account,
 * logout — stays in the drawer, because a tab bar that grows past five items
 * stops being scannable and the targets get too narrow to hit.
 *
 * Hidden above the phone breakpoint in CSS, where the sidebar is present.
 */
const tabs = [
  { to: "/app", label: "Desk", icon: Compass, end: true },
  { to: "/watchlists", label: "Watchlist", icon: Eye },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/portfolio-plan", label: "Plan", icon: Target },
  { to: "/portfolio", label: "Portfolio", icon: BriefcaseBusiness },
];

function MobileTabBar() {
  return (
    <nav className="mobile-tab-bar" aria-label="Primary">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            className={({ isActive }) => (isActive ? "mobile-tab active" : "mobile-tab")}
            end={tab.end}
            key={tab.to}
            to={tab.to}
          >
            <Icon aria-hidden="true" size={21} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default MobileTabBar;
