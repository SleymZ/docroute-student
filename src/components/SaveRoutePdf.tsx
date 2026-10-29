"use client";

import { FileDown } from "lucide-react";

import styles from "./SaveRoutePdf.module.css";

/**
 * "Save as PDF": opens the browser's print dialog, where "Save as PDF" (or
 * "Microsoft Print to PDF") is a destination. A print stylesheet hides the
 * site chrome and forces the light theme, so no PDF library is needed and
 * nothing leaves the device.
 */
export function SaveRoutePdf({
  title,
  block = false,
}: {
  title: string;
  block?: boolean;
}) {
  function save() {
    const previous = document.title;
    // Browsers suggest the document title as the PDF file name.
    document.title = `DocRoute - ${title}`;
    const restore = () => {
      document.title = previous;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  }

  return (
    <button
      type="button"
      className={styles.button}
      data-block={block ? "true" : undefined}
      data-print-hide=""
      onClick={save}
    >
      <FileDown size={16} aria-hidden="true" />
      Save as PDF
    </button>
  );
}

/** Shown only on paper: where the route came from and that it can change. */
export function PrintNote({ asOfDate }: { asOfDate: string }) {
  return (
    <p className={styles.printNote} data-print-only="">
      Saved from DocRoute (docroute-student.vercel.app) on {asOfDate}. Rules
      change: open the live route before you file anything. DocRoute is a
      preparation tool, not legal advice.
    </p>
  );
}
