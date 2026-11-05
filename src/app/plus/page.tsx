import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, Sparkles } from "lucide-react";

import { Header } from "@/components/Header";
import storyStyles from "@/components/Stories.module.css";
import { FREE_STEPS_PER_STAGE } from "@/lib/access";

import styles from "./Plus.module.css";

export const metadata: Metadata = {
  title: "Plans",
  description: "What you can do on DocRoute without an account, with a free account and with Plus.",
  alternates: { canonical: "/plus" },
};

type Cell = boolean | string;

const rows: { label: string; guest: Cell; free: Cell; plus: Cell }[] = [
  { label: "Browse universities, Top 100 and the country map", guest: true, free: true, plus: true },
  { label: "Read moving stories", guest: true, free: true, plus: true },
  { label: "Build a route (study, work, family, business)", guest: false, free: true, plus: true },
  {
    label: "Steps in each stage",
    guest: false,
    free: `First ${FREE_STEPS_PER_STAGE}`,
    plus: "All",
  },
  { label: "Your own move date and a date for every step", guest: false, free: false, plus: true },
  { label: "Email reminders before deadlines", guest: false, free: false, plus: "At launch" },
  { label: "Route saved in My route", guest: false, free: false, plus: true },
  { label: "PDF and PNG of your route", guest: false, free: false, plus: true },
];

function Value({ value }: { value: Cell }) {
  if (value === true) return <Check size={17} aria-label="Yes" className={styles.yes} />;
  if (value === false) return <Minus size={17} aria-label="No" className={styles.no} />;
  return <span>{value}</span>;
}

export default function PlansPage() {
  return (
    <main>
      <Header />
      <div className={storyStyles.page}>
        <header className={storyStyles.hero}>
          <div>
            <p className={storyStyles.eyebrow}>PLANS</p>
            <h1>
              Start free. Go further with <span>Plus.</span>
            </h1>
            <p className={storyStyles.lead}>
              Browsing is open to everyone. Building a route needs a free account; Plus adds your dates, reminders,
              the full checklist and saving.
            </p>
          </div>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">What you get</th>
                <th scope="col">No account</th>
                <th scope="col">Free</th>
                <th scope="col" className={styles.plusHead}>
                  <Sparkles size={14} aria-hidden="true" /> Plus
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td><Value value={row.guest} /></td>
                  <td><Value value={row.free} /></td>
                  <td className={styles.plusCell}><Value value={row.plus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className={styles.note}>
          <h2>How to get Plus</h2>
          <p>
            Plus is not on sale yet: DocRoute is a free, non-commercial beta. During the beta, Plus is given to beta
            testers. Tell us what you would want from it in the{" "}
            <Link href="/feedback">feedback form</Link>.
          </p>
          <div className={styles.actions}>
            <Link href="/auth?mode=signup&next=/home" className={storyStyles.primary}>
              Create a free account
            </Link>
            <Link href="/explore" className={storyStyles.secondary}>
              Browse universities
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
