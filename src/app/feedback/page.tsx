import type { Metadata } from "next";

import { FeedbackForm } from "@/components/FeedbackForm";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Tell DocRoute what is missing, wrong or confusing. Anonymous; no account needed.",
  alternates: { canonical: "/feedback" },
};

export default function FeedbackPage() {
  return (
    <LegalPage
      eyebrow="FEEDBACK"
      title="Help improve DocRoute"
      summary={
        <p>
          DocRoute is a free beta. If a rule looks wrong, a step is missing or
          something is hard to understand, say so here. It is anonymous and
          needs no account.
        </p>
      }
    >
      <FeedbackForm title="How useful is DocRoute for you?" />
    </LegalPage>
  );
}
