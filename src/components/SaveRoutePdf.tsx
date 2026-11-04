"use client";

import Link from "next/link";
import { FileDown, FileImage, LockKeyhole } from "lucide-react";

import { useAccess } from "@/hooks/useAccess";
import { renderRoutePng, routeImageFileName, type ImageStage } from "@/lib/route-image";

import styles from "./SaveRoutePdf.module.css";

/**
 * "Save as PDF" and "Save as PNG" (Plus). PDF opens the browser's print
 * dialog, where "Save as PDF" is a destination; a print stylesheet hides the
 * site chrome and forces the light theme. PNG is drawn on a canvas from the
 * route's stages. Nothing leaves the device. On the Free plan a locked
 * button links to /plus instead.
 */
export function SaveRoutePdf({
  title,
  block = false,
  stages,
  completed,
  asOfDate,
}: {
  title: string;
  block?: boolean;
  stages?: ImageStage[];
  completed?: ReadonlySet<string>;
  asOfDate?: string;
}) {
  const access = useAccess();

  if (!access.plus) {
    return (
      <Link
        href="/plus"
        className={styles.button}
        data-block={block ? "true" : undefined}
        data-locked="true"
        data-print-hide=""
      >
        <LockKeyhole size={15} aria-hidden="true" />
        PDF &amp; PNG · Plus
      </Link>
    );
  }

  function savePdf() {
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

  function savePng() {
    if (!stages) return;
    const canvas = renderRoutePng(title, stages, completed ?? new Set(), asOfDate ?? new Date().toISOString().slice(0, 10));
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = routeImageFileName(title);
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  return (
    <span className={styles.group} data-block={block ? "true" : undefined} data-print-hide="">
      <button type="button" className={styles.button} onClick={savePdf}>
        <FileDown size={16} aria-hidden="true" />
        Save as PDF
      </button>
      {stages && (
        <button type="button" className={styles.button} onClick={savePng}>
          <FileImage size={16} aria-hidden="true" />
          PNG
        </button>
      )}
    </span>
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
