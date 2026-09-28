import { redirect } from "next/navigation";

type RawSearchParams = Record<
  string,
  string | string[] | undefined
>;

type LegacyApplicantProfilePageProps = {
  searchParams: Promise<RawSearchParams>;
};

export default async function LegacyApplicantProfilePage({
  searchParams,
}: LegacyApplicantProfilePageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }

  const suffix = params.size > 0
    ? `?${params.toString()}`
    : "";

  redirect(`/route/profile${suffix}`);
}