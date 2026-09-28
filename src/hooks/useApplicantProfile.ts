"use client";

import { useEffect, useMemo, useState } from "react";

import { parseApplicantProfile } from "@/lib/profile-query";
import { loadApplicantProfile } from "@/lib/supabase/applicant-profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ApplicantProfile } from "@/types/admission";

type SearchParamsReader = {
  get(name: string): string | null;
  getAll(name: string): string[];
  toString(): string;
};

type ProfileOverrides = {
  destinationCountryCode?: string;
  studyCategory?: string;
};

export function useApplicantProfile(
  searchParams: SearchParamsReader,
  overrides: ProfileOverrides = {},
) {
  const profileKey = searchParams.toString();
  const urlProfile = useMemo(
    () =>
      parseApplicantProfile(new URLSearchParams(profileKey)),
    [profileKey],
  );
  const configured = isSupabaseConfigured();
  const [storedProfile, setStoredProfile] =
    useState<ApplicantProfile | null>(null);
  const [loading, setLoading] = useState(
    () => !urlProfile && configured,
  );
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (urlProfile || !configured) {
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || cancelled) {
          if (!cancelled) {
            setLoading(false);
          }
          return;
        }

        const profile = await loadApplicantProfile(supabase, user.id);

        if (!cancelled) {
          setAuthenticated(true);
          setStoredProfile(profile);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [configured, urlProfile]);

  const baseProfile = urlProfile ?? storedProfile;
  const profile = useMemo(() => {
    if (!baseProfile) {
      return null;
    }

    return {
      ...baseProfile,
      destinationCountryCode:
        overrides.destinationCountryCode ||
        baseProfile.destinationCountryCode,
      studyCategory:
        overrides.studyCategory || baseProfile.studyCategory,
    };
  }, [
    baseProfile,
    overrides.destinationCountryCode,
    overrides.studyCategory,
  ]);

  return {
    profile,
    loading,
    authenticated,
    source: urlProfile
      ? ("url" as const)
      : storedProfile
        ? ("account" as const)
        : null,
  };
}