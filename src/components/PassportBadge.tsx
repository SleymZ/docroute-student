import Image from "next/image";
import { Globe2 } from "lucide-react";

import { isCitizenshipCode, regionName } from "@/data/region-names";
import { isEuEeaSwissCitizen } from "@/lib/profile-options";
import { flagSrc } from "@/lib/flags";

import styles from "./PassportBadge.module.css";

/**
 * A clear label on every route: whose passport the route is built for
 * ("Route for citizens of India"), with the flag. Visa, documents and
 * restrictions on the page depend on it, so the reader sees at once that
 * the steps are not generic.
 */
export function PassportBadge({
  citizenship,
  verified = true,
}: {
  citizenship: string | null | undefined;
  /** False for guides built only from official links: the passport notes
   *  are added, but the procedure itself is not checked step by step. */
  verified?: boolean;
}) {
  const code = (citizenship ?? "").toUpperCase();
  if (!code) return null;
  // EU, EEA and Swiss citizens move under free movement: these routes are
  // for other passports, so the label would promise checks that do not
  // apply to them (the screens say so in their own notice).
  if (!isCitizenshipCode(code) || isEuEeaSwissCitizen(code)) return null;
  const other = code === "ZZ";
  // The same short name the route's own passport stage uses ("Russia").
  const name = code === "PS" ? "Palestinian territories" : regionName(code);

  return (
    <p className={styles.badge} data-passport={code}>
      {other ? (
        <span className={styles.globe}>
          <Globe2 size={16} aria-hidden="true" />
        </span>
      ) : (
        <Image src={flagSrc(code)} alt="" width={28} height={21} unoptimized className={styles.flag} />
      )}
      <span className={styles.text}>
        <strong>{other ? "Route for citizens of another country" : `Route for citizens of ${name}`}</strong>
        <small>
          {verified
            ? "Visa, documents and restrictions on this page are checked for this citizenship."
            : "The passport notes on this page are for this citizenship; the procedure itself is not checked step by step."}
        </small>
      </span>
    </p>
  );
}
