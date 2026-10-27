export type TopSource = {
  title: string;
  url: string;
  checkedAt: string;
};

export type TopAdmissionField =
  | "apply"
  | "deadline"
  | "school"
  | "language"
  | "tuition";

// Reference information for a non-EU applicant to a bachelor's programme.
// It is not a verified route: no matching, no checklist. Every statement
// comes from a listed official page; `intake` says which admission year
// that page describes when it is not 2027/28.
export type TopAdmissionFacts = Partial<Record<TopAdmissionField, string>> & {
  intake?: string;
  notes?: string;
  sources: TopSource[];
};

export type TopCountryGuide = Partial<Record<TopAdmissionField, string>> & {
  intake?: string;
  sources: TopSource[];
};

export type TopUniversity = {
  rank: number;
  leidenId: number;
  name: string;
  country: string;
  countryCode: string;
  website: string;
  catalogId?: string;
  leiden: {
    publications: number;
    topTenPublications: number;
    topTenShare: number;
  };
  admissions: TopAdmissionFacts;
};
