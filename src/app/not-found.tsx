import type { Metadata } from "next";

import { StatusPage } from "@/components/StatusPage";

export const metadata: Metadata = {
  title: "Page not found",
  // Replaces the site-wide "index, follow" so the page does not send two
  // opposite robots tags.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <StatusPage eyebrow="404" title="Page not found">
      <p>
        This address does not lead to a page on DocRoute. It may be mistyped,
        or the page has moved. Start again from one of the pages below.
      </p>
    </StatusPage>
  );
}
