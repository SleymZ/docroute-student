import type { Metadata } from "next";

import { AuthScreen } from "@/components/AuthScreen";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Create your DocRoute account or return to your saved university application routes.",
  robots: {
    index: false,
    follow: false,
  },
};

type AuthPageProps = {
  searchParams: Promise<{
    mode?: string | string[];
    next?: string | string[];
    error?: string | string[];
  }>;
};

export default async function AuthPage({
  searchParams,
}: AuthPageProps) {
  const query = await searchParams;
  const rawMode = Array.isArray(query.mode)
    ? query.mode[0]
    : query.mode;
  const rawNext = Array.isArray(query.next)
    ? query.next[0]
    : query.next;
  const rawError = Array.isArray(query.error)
    ? query.error[0]
    : query.error;

  const initialMode = rawMode === "signup" ? "signup" : "login";

  return (
    <AuthScreen
      initialMode={initialMode}
      nextPath={rawNext}
      initialMessage={rawError ?? ""}
    />
  );
}
