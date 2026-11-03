"use client";

import Link from "next/link";
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
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  CircleDashed,
  Code2,
  Globe2,
  GraduationCap,
  Scale,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import {
  destinationOptions,
  documentCountryOptions,
  programOptions,
} from "@/data/demo-destinations";

import { movePurposes } from "@/data/move-purposes";
import type { MovePurpose } from "@/data/move-purposes";
import type { Destination } from "@/types/destination";
import styles from "./RouteForm.module.css";

type RouteFormProps = {
  purpose: MovePurpose;
  onPurposeChange: (value: MovePurpose) => void;
  documentCountry: string;
  destination: Destination;
  program: string;
  routeAvailable: boolean;
  // Residence route only: university programmes there are not verified.
  residenceOnly?: boolean;
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
  Austria: "at",
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
    Law: Scale,
    "Economics & Business": TrendingUp,
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

const purposeIcons: Record<MovePurpose, typeof GraduationCap> = {
  study: GraduationCap,
  work: BriefcaseBusiness,
  family: UsersRound,
  business: Building2,
};

// Every purpose with checked sources is selectable; a purpose without
// them would show as "coming soon" without pretending a route exists.
function PurposeSelector({
  value,
  onChange,
}: {
  value: MovePurpose;
  onChange: (value: MovePurpose) => void;
}) {
  const labelId = useId();
  const available = movePurposes.filter((purpose) => purpose.available);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const index = available.findIndex((purpose) => purpose.id === value);
    const step = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    const next = available[(index + step + available.length) % available.length];
    onChange(next.id);
    document.getElementById(`${labelId}-${next.id}`)?.focus();
  }

  return (
    <div className={styles.purposeRow}>
      <span id={labelId} className={styles.label}>
        Moving for
      </span>
      <div
        className={styles.purposeOptions}
        role="radiogroup"
        aria-labelledby={labelId}
      >
        {movePurposes.map((purpose) => {
          const Icon = purposeIcons[purpose.id];
          const selected = purpose.id === value;

          return (
            <button
              key={purpose.id}
              id={`${labelId}-${purpose.id}`}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={!purpose.available}
              tabIndex={selected ? 0 : -1}
              title={purpose.available ? undefined : "Coming soon"}
              className={[
                styles.purpose,
                selected ? styles.purposeSelected : "",
                purpose.available ? "" : styles.purposeSoon,
              ]
                .filter(Boolean)
                .join(" ")}
              onKeyDown={handleKeyDown}
              onClick={(event) => {
                event.preventDefault();
                if (purpose.available) onChange(purpose.id);
              }}
            >
              <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
              {purpose.label}
              {!purpose.available && (
                <span className={styles.srOnly}>, coming soon</span>
              )}
            </button>
          );
        })}
      </div>
      {movePurposes.some((purpose) => !purpose.available) && (
        <p className={styles.purposeNote}>
          {movePurposes
            .filter((purpose) => !purpose.available)
            .map((purpose) => purpose.label)
            .join(" and ")}{" "}
          routes are coming soon.
        </p>
      )}
    </div>
  );
}

export function RouteForm({
  purpose,
  onPurposeChange,
  documentCountry,
  destination,
  program,
  routeAvailable,
  residenceOnly = false,
  onDocumentCountryChange,
  onDestinationChange,
  onProgramChange,
  onSubmit,
}: RouteFormProps) {
  return (
    <form className="route-form" onSubmit={onSubmit}>
      <PurposeSelector value={purpose} onChange={onPurposeChange} />

      <div className={purpose === "study" ? "form-grid" : "form-grid form-grid-two"}>
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
          label={
            purpose === "work"
              ? "I want to work in"
              : purpose === "family"
                ? "I want to join family in"
                : purpose === "business"
                  ? "I want to do business in"
                  : "I want to study in"
          }
          name="destination"
          value={destination}
          options={destinationOptions}
          onChange={onDestinationChange}
          renderIcon={(country) => (
            <CountryFlag country={country} />
          )}
        />

        {purpose === "study" && (
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
        )}
      </div>

      <button
        type="submit"
        className="primary-button route-button"
        disabled={purpose !== "study" && !routeAvailable}
      >
        {purpose !== "study"
          ? routeAvailable
            ? `Build my ${purpose} route`
            : `${purpose.charAt(0).toUpperCase() + purpose.slice(1)} route not verified yet`
          : routeAvailable
            ? residenceOnly
              ? "Build my residence route"
              : "Build my route"
            : "Explore universities"}
        <ArrowRight size={18} aria-hidden="true" />
      </button>

      <div className="trust-row">
        <span>
          {routeAvailable ? (
            <ShieldCheck size={16} aria-hidden="true" />
          ) : (
            <CircleDashed size={16} aria-hidden="true" />
          )}
          {routeAvailable
            ? residenceOnly
              ? "Residence route verified · University admission not verified yet"
              : "Verified route available · Official sources included"
            : purpose === "work"
              ? "Work routes cover Slovakia, Czechia and Austria so far"
              : purpose !== "study"
                ? "Family and business: verified for Slovakia, Czechia and Austria"
              : "Personalised route coverage in progress · Public directory available"}
        </span>
        {(purpose === "family" || purpose === "business") && (
          <Link href={`/route/guide?purpose=${purpose}`}>
            Other EU countries and Switzerland
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    </form>
  );
}
