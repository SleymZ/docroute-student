"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./DateInput.module.css";

type DateInputProps = {
  id?: string;
  value: string;
  min?: string;
  disabled?: boolean;
  className?: string;
  onCommit: (value: string) => void;
};

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

// A date field that keeps its own value while the person picks a date.
// The route pages store the date in the address (router.replace), which
// finishes a moment later. Binding the input straight to the address made
// phone pickers jump back: iOS and Android send intermediate values ("" while
// the wheel turns, or the old value before the address updates), and the page
// overwrote what the person was choosing. Here the address only gets complete
// dates; clearing is committed when the field is left empty.
export function DateInput({ id, value, min, disabled, className, onCommit }: DateInputProps) {
  const [draft, setDraft] = useState(value);
  const committed = useRef(value);

  // Follow the address when it changes from elsewhere (back button, link).
  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setDraft(value);
    }
  }, [value]);

  function commit(next: string) {
    if (next === committed.current) return;
    committed.current = next;
    onCommit(next);
  }

  return (
    <input
      id={id}
      type="date"
      className={`${styles.input}${className ? ` ${className}` : ""}`}
      value={draft}
      min={min}
      disabled={disabled}
      data-empty={draft ? undefined : "true"}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        if (isoDate.test(next)) commit(next);
      }}
      onBlur={(event) => {
        const next = event.target.value;
        if (next === "" || isoDate.test(next)) commit(next);
      }}
    />
  );
}
