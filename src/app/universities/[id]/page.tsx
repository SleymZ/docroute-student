import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { UniversityImage } from "@/components/UniversityImage";
import catalog from "@/data/universities.json";

import styles from "./UniversityPage.module.css";

type UniversityPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    program?: string | string[];
  }>;
};

function findUniversity(id: string) {
  return catalog.universities.find(
    (university) => university.id === id,
  );
}

export async function generateMetadata({
  params,
}: Pick<UniversityPageProps, "params">): Promise<Metadata> {
  const { id } = await params;
  const university = findUniversity(id);

  if (!university) {
    return {
      title: "University not found | DocRoute",
    };
  }

  return {
    title: `${university.name} | DocRoute`,
    description: `Explore admission information and document requirements for ${university.name}.`,
  };
}

export default async function UniversityPage({
  params,
  searchParams,
}: UniversityPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const university = findUniversity(id);

  if (!university) {
    notFound();
  }

  const rawProgram = query.program;

  const selectedProgram =
    (Array.isArray(rawProgram)
      ? rawProgram[0]
      : rawProgram
    )?.trim() || null;

  const resultsHref = selectedProgram
    ? `/explore/universities?${new URLSearchParams({
        country: university.countryCode,
        program: selectedProgram,
      }).toString()}`
    : "/explore";

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href={resultsHref}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to universities
        </Link>

        <span>/</span>
        <span>{university.country}</span>
        <span>/</span>
        <strong>{university.name}</strong>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroVisual}>
          <UniversityImage
            name={university.name}
            country={university.country}
            showCredit
          />

          <span className={styles.imageLabel}>
            <Building2 size={16} aria-hidden="true" />
            University profile
          </span>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.location}>
            <Image
              src={`https://flagcdn.com/w80/${university.countryCode.toLowerCase()}.png`}
              alt={`${university.country} flag`}
              width={32}
              height={24}
              unoptimized
            />

            <span>
              {university.country}
              {university.region
                ? ` · ${university.region}`
                : ""}
            </span>
          </div>

          <p className={styles.eyebrow}>
            DOCROUTE UNIVERSITY PROFILE
          </p>

          <h1>{university.name}</h1>

          <p className={styles.heroDescription}>
            Explore available study information and build a
            verified route from university application to student
            residence.
          </p>

          <div className={styles.heroActions}>
            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryAction}
            >
              Official website
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>

            <a
              href="#admission-requirements"
              className={styles.secondaryAction}
            >
              View requirements
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section
        className={styles.facts}
        aria-label="University overview"
      >
        <article>
          <span className={styles.factIcon}>
            <MapPin size={19} aria-hidden="true" />
          </span>

          <div>
            <small>DESTINATION</small>
            <strong>{university.country}</strong>
            <p>{university.region || "Location not specified"}</p>
          </div>
        </article>

        <article>
          <span className={styles.factIcon}>
            <BookOpen size={19} aria-hidden="true" />
          </span>

          <div>
            <small>STUDY INTEREST</small>
            <strong>{selectedProgram || "Not selected"}</strong>
            <p>Program availability requires verification</p>
          </div>
        </article>

        <article>
          <span className={styles.factIcon}>
            <ShieldCheck size={19} aria-hidden="true" />
          </span>

          <div>
            <small>DATA STATUS</small>
            <strong>Profile available</strong>
            <p>Admissions verification in progress</p>
          </div>
        </article>
      </section>

      <div className={styles.contentLayout}>
        <section
          id="admission-requirements"
          className={styles.requirementsPanel}
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>
                APPLICATION ROUTE
              </p>

              <h2>Admission requirements</h2>
            </div>

            <span className={styles.pendingStatus}>
              Verification pending
            </span>
          </div>

          <div className={styles.pendingBox}>
            <span className={styles.pendingIcon}>
              <Clock3 size={22} aria-hidden="true" />
            </span>

            <div>
              <h3>
                We are reviewing the official requirements
              </h3>

              <p>
                Document requirements will only appear here after
                they have been checked against an official
                university source.
              </p>
            </div>
          </div>

          <div className={styles.requirementPreview}>
            <div>
              <span>01</span>
              <p>Application documents</p>
            </div>

            <div>
              <span>02</span>
              <p>Entrance requirements</p>
            </div>

            <div>
              <span>03</span>
              <p>Documents after admission</p>
            </div>
          </div>
        </section>

        <aside className={styles.routePanel}>
          <p className={styles.eyebrow}>YOUR ROUTE</p>
          <h2>From interest to arrival</h2>

          <ol className={styles.routeSteps}>
            <li>
              <span>1</span>

              <div>
                <strong>Choose a program</strong>
                <p>Confirm the exact degree and language.</p>
              </div>
            </li>

            <li>
              <span>2</span>

              <div>
                <strong>Prepare documents</strong>
                <p>Follow verified application requirements.</p>
              </div>
            </li>

            <li>
              <span>3</span>

              <div>
                <strong>Plan residence</strong>
                <p>Continue after receiving admission.</p>
              </div>
            </li>
          </ol>

          <div className={styles.routeNotice}>
            <CheckCircle2 size={18} aria-hidden="true" />

            <p>
              Sources and verification dates will be shown beside
              every requirement.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}