"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type {
  FormEvent,
  KeyboardEvent,
  ReactNode,
} from "react";

import Image from "next/image";

import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  FileText,
  Globe2,
  GraduationCap,
  Pill,
  Smile,
  Stethoscope,
} from "lucide-react";

import {
  destinationOptions,
  documentCountryOptions,
  programOptions,
} from "@/data/demo-destinations";

import type { Destination } from "@/types/destination";
import styles from "./RouteForm.module.css";

type RouteFormProps = {
  documentCountry: string;
  destination: Destination;
  program: string;
  onDocumentCountryChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onProgramChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

type VisualSelectProps = {
  label: string;
  name: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  renderIcon: (value: string) => ReactNode;
};

const countryCodes: Record<string, string> = {
  Ukraine: "ua",
  Israel: "il",
  India: "in",
  "United Kingdom": "gb",
  Slovakia: "sk",
  Czechia: "cz",
  Romania: "ro",
  Bulgaria: "bg",
};

function CountryFlag({ country }: { country: string }) {
  const code = countryCodes[country];

  return (
    <span className={styles.icon} aria-hidden="true">
      {code ? (
        <Image
          src={`https://flagcdn.com/w80/${code}.png`}
          alt=""
          width={24}
          height={18}
          unoptimized
          className={styles.flagImage}
        />
      ) : (
        <Globe2 size={19} strokeWidth={1.7} />
      )}
    </span>
  );
}

function ProgramIcon({ program }: { program: string }) {
  const icons = {
    Medicine: Stethoscope,
    Dentistry: Smile,
    Pharmacy: Pill,
    "Computer Science": Code2,
  };

  const Icon =
    icons[program as keyof typeof icons] ?? GraduationCap;

  return (
    <span
      className={`${styles.icon} ${styles.programIcon}`}
      aria-hidden="true"
    >
      <Icon size={19} strokeWidth={1.7} />
    </span>
  );
}

function VisualSelect({
  label,
  name,
  value,
  options,
  onChange,
  renderIcon,
}: VisualSelectProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-list`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const typingRef = useRef({ text: "", time: 0 });

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedIndex = options.indexOf(value);

  function openMenu() {
    setActiveIndex(Math.max(0, selectedIndex));
    typingRef.current = { text: "", time: 0 };
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];

    if (option === undefined) return;

    onChange(option);
    setOpen(false);
    triggerRef.current?.focus();
  }

  // Закрываем список при нажатии вне компонента.
  useEffect(() => {
    if (!open) return;

    function handleOutsidePointer(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsidePointer);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointer,
      );
    };
  }, [open]);

  // Активный пункт остаётся видимым при выборе стрелками.
  useEffect(() => {
    if (!open) return;

    document
      .getElementById(`${listId}-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, listId]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const lastIndex = options.length - 1;

    if (lastIndex < 0) return;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();

        if (!open) {
          openMenu();
          return;
        }

        const direction = event.key === "ArrowDown" ? 1 : -1;

        setActiveIndex((index) =>
          Math.max(0, Math.min(lastIndex, index + direction)),
        );
        return;
      }

      case "Home":
      case "End": {
        event.preventDefault();
        setOpen(true);
        setActiveIndex(event.key === "Home" ? 0 : lastIndex);
        return;
      }

      case "Enter":
      case " ": {
        event.preventDefault();

        if (open) {
          choose(activeIndex);
        } else {
          openMenu();
        }
        return;
      }

      case "Escape": {
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        }
        return;
      }

      case "Tab": {
        setOpen(false);
        return;
      }
    }

    // Быстрый поиск по началу названия при наборе букв.
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();

      const now = Date.now();
      const previous = typingRef.current;

      let text =
        now - previous.time < 700
          ? previous.text + event.key.toLowerCase()
          : event.key.toLowerCase();

      let match = options.findIndex((option) =>
        option.toLowerCase().startsWith(text),
      );

      if (match < 0) {
        text = event.key.toLowerCase();
        match = options.findIndex((option) =>
          option.toLowerCase().startsWith(text),
        );
      }

      typingRef.current = { text, time: now };

      if (match >= 0) {
        setActiveIndex(match);
        setOpen(true);
      }
    }
  }

  return (
    <div
      ref={rootRef}
      className={styles.field}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <span id={labelId} className={styles.label}>
        {label}
      </span>

      <input type="hidden" name={name} value={value} />

      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          open ? `${listId}-${activeIndex}` : undefined
        }
        className={`${styles.trigger} ${
          open ? styles.triggerOpen : ""
        }`}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            openMenu();
          }
        }}
        onKeyDown={handleKeyDown}
      >
        {renderIcon(value)}

        <span className={styles.value} title={value}>
          {value}
        </span>

        <ChevronDown
          size={16}
          className={styles.chevron}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className={styles.menu}
        >
          {options.map((option, index) => {
            const selected = option === value;
            const active = index === activeIndex;

            return (
              <li
                key={option}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={selected}
                className={[
                  styles.option,
                  active ? styles.optionActive : "",
                  selected ? styles.optionSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
              >
                {renderIcon(option)}

                <span className={styles.optionText}>
                  {option}
                </span>

                {selected && (
                  <Check
                    size={16}
                    className={styles.check}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function RouteForm({
  documentCountry,
  destination,
  program,
  onDocumentCountryChange,
  onDestinationChange,
  onProgramChange,
  onSubmit,
}: RouteFormProps) {
  return (
    <form className="route-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <VisualSelect
          label="Documents issued in"
          name="documentCountry"
          value={documentCountry}
          options={documentCountryOptions}
          onChange={onDocumentCountryChange}
          renderIcon={(country) => (
            <CountryFlag country={country} />
          )}
        />

        <VisualSelect
          label="I want to study in"
          name="destination"
          value={destination}
          options={destinationOptions}
          onChange={onDestinationChange}
          renderIcon={(country) => (
            <CountryFlag country={country} />
          )}
        />

        <VisualSelect
          label="Program"
          name="program"
          value={program}
          options={programOptions}
          onChange={onProgramChange}
          renderIcon={(item) => (
            <ProgramIcon program={item} />
          )}
        />
      </div>

      <button
        type="submit"
        className="primary-button route-button"
      >
        Preview my route
        <ArrowRight size={18} aria-hidden="true" />
      </button>

      <div className="trust-row">
        <span>
          <FileText size={16} aria-hidden="true" />
          Interactive demo · Sample data, not application guidance
        </span>
      </div>
    </form>
  );
}