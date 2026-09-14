import { Route } from "lucide-react";

export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#">
        <span className="brand-icon">
          <Route size={20} />
        </span>
        <span>DocRoute Student</span>
      </a>

      <nav className="navigation">
        <a href="#explore">Explore</a>
        <a href="#universities">Universities</a>
        <a href="#residence">Residence routes</a>
        <a href="#how-it-works">How it works</a>
      </nav>

      <div className="header-actions">
        <button className="login-button">Log in</button>
        <a className="primary-button compact" href="#route-builder">
          Build my route
        </a>
      </div>
    </header>
  );
}