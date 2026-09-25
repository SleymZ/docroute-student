import type { Metadata } from "next";

import { AuthScreen } from "@/components/AuthScreen";

export const metadata: Metadata = {
  title: "Account | DocRoute Student",
  description:
    "Create your DocRoute account or return to your saved university application routes.",
};

type AuthPageProps = {
  searchParams: Promise<{
    mode?: string | string[];
  }>;
};

export default async function AuthPage({
  searchParams,
}: AuthPageProps) {
  const query = await searchParams;
  const rawMode = Array.isArray(query.mode)
    ? query.mode[0]
    : query.mode;

  const initialMode = rawMode === "signup" ? "signup" : "login";

  return <AuthScreen initialMode={initialMode} />;
}
