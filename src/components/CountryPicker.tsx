"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  Globe2,
  Search,
  X,
} from "lucide-react";

import styles from "./CountryPicker.module.css";

export type CountryOption = {
  code: string;
  name: string;
};

type CountryPickerProps = {
  label: string;
  value: string;
  options: readonly CountryOption[];
  placeholder: string;
  onChange: (countryCode: string) => void;
};

export function CountryPicker({
  label,
  value,
  options,
  placeholder,
  onChange,
}: CountryPickerProps) {
  const labelId = useId();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedCountry = options.find(
    (country) => country.code === value,
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("en");

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((country) =>
      `${country.name} ${country.code}`
        .toLocaleLowerCase("en")
        .includes(normalizedQuery),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnOutsidePointer(event: PointerEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    searchRef.current?.focus();

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOnOutsidePointer,
      );
    };
  }, [open]);

  function closePicker(restoreFocus = false) {
    setOpen(false);
    setQuery("");

    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  function selectCountry(countryCode: string) {
    onChange(countryCode);
    closePicker(true);
  }

  return (
    <div
      className={styles.root}
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          closePicker(true);
        }
      }}
    >
      <span className={styles.label} id={labelId}>
        {label}
      </span>

      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={`${label}: ${selectedCountry?.name ?? placeholder}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={styles.selection}>
          {selectedCountry && selectedCountry.code !== "ZZ" ? (
            <Image
              src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
              alt=""
              width={24}
              height={18}
              unoptimized
              className={styles.flag}
            />
          ) : (
            <span className={styles.globe}>
              <Globe2 size={17} aria-hidden="true" />
            </span>
          )}

          <span data-placeholder={!selectedCountry || undefined}>
            {selectedCountry?.name ?? placeholder}
          </span>
        </span>

        <ChevronDown
          size={17}
          aria-hidden="true"
          className={open ? styles.chevronOpen : undefined}
        />
      </button>

      {open && (
        <div className={styles.popover}>
          <div className={styles.searchField}>
            <Search size={16} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              placeholder="Search country or code"
              aria-label={`Search ${label.toLowerCase()}`}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear country search"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          <div
            className={styles.options}
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((country) => {
                const selected = country.code === value;

                return (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={styles.option}
                    onClick={() => selectCountry(country.code)}
                  >
                    {country.code !== "ZZ" ? (
                      <Image
                        src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                        alt=""
                        width={25}
                        height={18}
                        unoptimized
                        className={styles.flag}
                      />
                    ) : (
                      <span className={styles.globe}>
                        <Globe2 size={16} aria-hidden="true" />
                      </span>
                    )}

                    <span className={styles.optionName}>
                      <strong>{country.name}</strong>
                      <small>{country.code}</small>
                    </span>

                    {selected && (
                      <Check
                        size={16}
                        aria-hidden="true"
                        className={styles.check}
                      />
                    )}
                  </button>
                );
              })
            ) : (
              <p className={styles.empty}>No matching country</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
