import type {
  ApplicantProfile,
  OfficialSource,
  ProgramMatch,
} from "@/types/admission";

export type RouteTaskStatus =
  | "ready"
  | "action"
  | "attention"
  | "information"
  | "not-applicable";

export type RouteTask = {
  id: string;
  title: string;
  description: string;
  status: RouteTaskStatus;
  dueLabel?: string;
  sourceIds: string[];
};

export type RouteStage = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  timing: string;
  tasks: RouteTask[];
};

export type RouteSource = OfficialSource & {
  authority: "official" | "authoritative-guidance";
};

export type RoutePreview = {
  version: string;
  generatedFor: ApplicantProfile;
  match: ProgramMatch;
  stages: RouteStage[];
  sources: RouteSource[];
  disclaimer: string;
};