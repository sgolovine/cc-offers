import { Link } from "@tanstack/react-router";
import type { SimpleIcon } from "simple-icons";

import { Button } from "@/components/ui/button";
import { socialLinks } from "../config";

function SimpleIcon({ icon }: Readonly<{ icon: SimpleIcon }>) {
  return (
    <svg
      aria-hidden="true"
      className="size-4 fill-current"
      role="img"
      viewBox="0 0 24 24"
    >
      <path d={icon.path} />
    </svg>
  );
}

export function HeaderActions() {
  return (
    <nav aria-label="Primary">
      <ul className="flex items-center gap-1">
        <li>
          <Button asChild variant="ghost" size="sm">
            <Link to="/about">About</Link>
          </Button>
        </li>
        {socialLinks.map((link) => (
          <li key={link.label}>
            <Button asChild variant="ghost" size="icon-sm">
              <a
                aria-label={link.label}
                href={link.href}
                rel="noreferrer"
                target="_blank"
                title={link.label}
              >
                <SimpleIcon icon={link.icon} />
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
