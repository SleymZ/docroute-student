import Link from "next/link";

import { Compass, Flag, Globe2, MessageSquareHeart, Signpost } from "lucide-react";

import { AuthNavigation } from "./AuthNavigation";
import { LogoMark, LogoWord } from "./Logo";
import styles from "./Header.module.css";

const navigation = [
  {
    label: "Explore",
    href: "/explore",
    icon: Compass,
  },
  {
    label: "Countries",
    href: "/countries",
    icon: Globe2,
  },
  {
    label: "My route",
    href: "/my-route",
    icon: Flag,
  },
  {
    label: "Stories",
    href: "/stories",
    icon: MessageSquareHeart,
  },
  {
    label: "How it works",
    href: "/how-it-works",
    icon: Signpost,
  },
];

export function Header() {
  return (
    <header className={styles.header} data-print-hide="">
      <Link
        href="/home"
        className={styles.brand}
        aria-label="DocRoute — home"
      >
        <LogoMark size={40} className={styles.brandMark} />

        <span className={styles.brandText}>
          <LogoWord className={styles.brandName} />
          <span className={styles.brandCaption}>
            EUROPE
            <span className={styles.betaBadge}>BETA</span>
          </span>
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
