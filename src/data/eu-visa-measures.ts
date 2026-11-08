import type { RestrictionNote } from "@/data/russia-belarus";
import { SCHENGEN } from "@/data/russia-belarus";
import type { RouteSource } from "@/types/route-preview";

// Restrictive visa measures the EU Council adopts under Article 25a of the
// Visa Code when a country does not cooperate on readmission. Checked on
// 2026-11-08: in force for The Gambia (Implementing Decision (EU)
// 2021/1781; only the increased fee was repealed in 2024). The measures
// for Ethiopia were repealed on 18 May 2026. Short-stay (C) visas only.

const gambiaDecision: RouteSource = {
  id: "eu-dec-impl-2021-1781",
  title: "Council Implementing Decision (EU) 2021/1781 on the suspension of certain provisions of the Visa Code with respect to The Gambia",
  publisher: "EUR-Lex, European Union",
  url: "https://eur-lex.europa.eu/eli/dec_impl/2021/1781/oj",
  checkedAt: "2026-11-08",
  authority: "official",
};

const gambiaFeeRepealed: RouteSource = {
  id: "eu-dec-impl-2024-1231",
  title: "Council Implementing Decision (EU) 2024/1231 repealing the increased visa fee for The Gambia (Decision 2021/1781 stays in force)",
  publisher: "EUR-Lex, European Union",
  url: "https://eur-lex.europa.eu/eli/dec_impl/2024/1231/oj",
  checkedAt: "2026-11-08",
  authority: "official",
};

export function euVisaMeasureNotes(citizenship: string, destination: string): RestrictionNote[] {
  if (citizenship.toUpperCase() !== "GM" || !SCHENGEN.has(destination.toUpperCase())) return [];
  return [
    {
      id: "gm-eu-visa-measures",
      title: "EU visa restrictions for citizens of The Gambia",
      description:
        "Under Council Implementing Decision (EU) 2021/1781, Schengen short-stay visa applications from Gambian citizens cannot have supporting documents waived, the 15-day standard processing time does not apply and multiple-entry visas are not issued under the usual rules.",
      severity: "restricted",
      solution: "Apply early with every supporting document. This concerns short-stay (C) visas; long-stay visas and residence permits follow the destination's own rules.",
      sources: [gambiaDecision, gambiaFeeRepealed],
    },
  ];
}
