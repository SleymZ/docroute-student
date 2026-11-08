"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, ShieldAlert, Sparkles, Route as RouteIcon } from "lucide-react";

import { citizenshipCountryOptions } from "@/data/applicant-countries";
import { purposeRoute, type CountryPurpose } from "@/lib/country-list";
import { passportTrack, type TrackKind } from "@/lib/passport-track";

import styles from "@/app/countries/Countries.module.css";
import { PassportWarning } from "@/components/PassportWarning";
import { passportWarnings } from "@/data/russia-belarus";

const icons: Record<TrackKind, typeof Sparkles> = {
  own: BadgeCheck,
  eu: Sparkles,
  easier: Sparkles,
  standard: RouteIcon,
  harder: ShieldAlert,
};

const purposes: CountryPurpose[] = ["work", "family", "business"];
const purposeNames: Record<CountryPurpose, string> = { work: "Work", family: "Family", business: "Business" };

/** "Path by passport": pick a citizenship, see whether the move is easier
 *  (free movement or an official relief), standard or harder (extra
 *  national restrictions), and open the routes with that passport. */
export function PassportTrackBlock({ code, name }: { code: string; name: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const citizenship = (searchParams.get("citizenship") ?? "").toUpperCase();
  const track = citizenship ? passportTrack(citizenship, code, name) : null;
  const Icon = track ? icons[track.kind] : RouteIcon;
  // Points already shown in the red warning above are not repeated.
  const warned = citizenship ? passportWarnings(citizenship, code).map((item) => item.title) : [];
  const points = track ? track.points.filter((point) => !warned.some((title) => point.text.startsWith(title))) : [];

  function choose(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("citizenship", value);
    else params.delete("citizenship");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <section className={styles.passport} aria-labelledby="passport-title">
      <div className={styles.passportHead}>
        <div>
          <p className={styles.sectionEyebrow}>PATH BY PASSPORT</p>
          <h2 id="passport-title">What your passport changes in {name}</h2>
        </div>
        <label className={styles.passportPicker}>
          <span>Your citizenship</span>
          <select value={citizenship} onChange={(event) => choose(event.target.value)}>
            <option value="">Choose…</option>
            {citizenshipCountryOptions
              .filter((option) => option.code !== "ZZ")
              .map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
          </select>
        </label>
      </div>

      {!track ? (
        <p className={styles.muted}>
          Choose your citizenship to see whether your move is easier (EU free movement or an official relief for your
          nationality), standard, or harder because of extra national restrictions.
        </p>
      ) : (
        <>
        <PassportWarning citizenship={citizenship} destination={code} />
        <div className={styles.track} data-kind={track.kind}>
          <p className={styles.trackLabel}>
            <Icon size={15} aria-hidden="true" />
            {track.label}
          </p>
          <h3>{track.title}</h3>
          {points.length > 0 && (
            <ul>
              {points.map((point) => (
                <li key={point.text}>
                  {point.text}
                  {point.sources.length > 0 && (
                    <span className={styles.trackSources}>
                      {point.sources.map((source) => (
                        <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                          {source.publisher}
                        </a>
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {track.kind !== "own" && (
            <div className={styles.trackLinks}>
              {purposes.map((purpose) => {
                const route = purposeRoute(code, purpose);
                const href = `${route.href}&citizenship=${citizenship}`;
                return (
                  <Link key={purpose} href={href} className={styles.chip}>
                    {purposeNames[purpose]} route for this passport
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        </>
      )}
    </section>
  );
}
