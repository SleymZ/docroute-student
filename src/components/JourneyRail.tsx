"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ContactRound,
  FileCheck2,
  Languages,
} from "lucide-react";
import styles from "./JourneyRail.module.css";

const steps = [
  {
    id: "admission",
    number: "01",
    title: "University application",
    description: "Understand what your chosen program requires.",
    action: "Explore admission",
    icon: FileCheck2,
    details:
      "This stage will bring together entry requirements, application dates and document checklists for your selected university and program.",
  },
  {
    id: "documents",
    number: "02",
    title: "Document preparation",
    description: "Connect your documents to the next steps.",
    action: "Explore documents",
    icon: Languages,
    details:
      "This stage will show how your existing documents connect to application requirements, including translations and certifications where required by verified sources.",
  },
  {
    id: "residence",
    number: "03",
    title: "Student residence",
    description: "Plan the steps that follow your admission.",
    action: "Explore residence",
    icon: ContactRound,
    details:
      "This stage will organise residence requirements for your destination and circumstances, with official sources and the date each requirement was checked.",
  },
];

export function JourneyRail() {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <section
      className={styles.section}
      id="how-it-works"
      aria-labelledby="journey-heading"
    >
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>FROM APPLICATION TO ARRIVAL</p>

          <h2 id="journey-heading">One journey. Three clear stages.</h2>
        </div>

        <p className={styles.intro}>
          Explore each stage of your study route.
        </p>
      </div>

      <div className={styles.grid}>
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const detailsId = `journey-details-${step.id}`;

          return (
            <div
              key={step.id}
              id={step.id === "residence" ? "residence" : undefined}
              className={`${styles.card} ${
                isActive ? styles.activeCard : ""
              }`}
            >
              <button
                type="button"
                className={styles.cardButton}
                aria-expanded={isActive}
                aria-controls={detailsId}
                onClick={() =>
                  setActiveStep(isActive ? null : step.id)
                }
              >
                <span className={styles.cardTop}>
                  <span className={styles.icon}>
                    <Icon size={25} aria-hidden="true" />
                  </span>

                  <span className={styles.number}>{step.number}</span>
                </span>

                <span className={styles.title}>{step.title}</span>

                <span className={styles.description}>
                  {step.description}
                </span>

                <span className={styles.action}>
                  {isActive ? "Close details" : step.action}

                  {isActive ? (
                    <ArrowDown size={18} aria-hidden="true" />
                  ) : (
                    <ArrowUpRight size={18} aria-hidden="true" />
                  )}
                </span>
              </button>

              <div
                id={detailsId}
                className={styles.details}
                hidden={!isActive}
              >
                <p>{step.details}</p>
                <span>Product preview · Verified guidance coming later</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
