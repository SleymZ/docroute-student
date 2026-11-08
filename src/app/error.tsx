"use client";

import { useEffect } from "react";

import { StatusPage } from "@/components/StatusPage";

import styles from "@/components/LegalPage.module.css";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      eyebrow="ERROR"
      title="Something went wrong"
      actions={
        <button type="button" className={styles.retry} onClick={() => retry()}>
          Try again
        </button>
      }
    >
      <p>
        This page could not be shown. Nothing you saved was lost. Try again in
        a moment, or go back to the home page.
      </p>
    </StatusPage>
  );
}
