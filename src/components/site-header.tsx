import { Link } from "@tanstack/react-router";
import type { SimpleIcon } from "simple-icons";

import { socialLinks } from "../config";

function SimpleIcon({ icon }: Readonly<{ icon: SimpleIcon }>) {
  return (
    <svg
      aria-hidden="true"
      className="site-header-icon"
      role="img"
      viewBox="0 0 24 24"
    >
      <path d={icon.path} />
    </svg>
  );
}

export function HeaderActions() {
  return (
    <nav className="header-actions" aria-label="Primary">
      <ul>
        <li>
          <Link to="/about">ABOUT</Link>
        </li>
        {socialLinks.map((link) => (
          <li key={link.label}>
            <a
              aria-label={link.label}
              className="header-action-icon-link"
              href={link.href}
              rel="noreferrer"
              target="_blank"
              title={link.label}
            >
              <SimpleIcon icon={link.icon} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
