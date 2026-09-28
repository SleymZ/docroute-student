import Link from "next/link";

import {
  Compass,
  MapPinned,
  Route,
  Signpost,
} from "lucide-react";

import { AuthNavigation } from "./AuthNavigation";
import styles from "./Header.module.css";

const navigation = [
  {
    label: "Explore",
    href: "/explore",
    icon: Compass,
  },
  {
    label: "Build route",
    href: "/#route-builder",
    icon: Route,
  },
  {
    label: "Residence routes",
    href: "/#residence",
    icon: MapPinned,
  },
  {
    label: "How it works",
    href: "/#how-it-works",
    icon: Signpost,
  },
];

export function Header() {
  return (
    <header className={styles.header}>
      <Link
        href="/"
        className={styles.brand}
        aria-label="DocRoute Student — home"
      >
        <span className={styles.brandMark}>
          <Route
            size={25}
            strokeWidth={1.7}
            aria-hidden="true"
          />
        </span>

        <span className={styles.brandText}>
          <span className={styles.brandName}>DocRoute</span>
          <span className={styles.brandCaption}>STUDENT</span>
        </span>
      </Link>

      <nav
        className={styles.navigation}
        aria-label="Main navigation"
      >
        {navigation.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={styles.navLink}
          >
            <Icon
              size={16}
              strokeWidth={1.7}
              aria-hidden="true"
            />

            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <AuthNavigation />
    </header>
  );
}
