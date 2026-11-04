// DocRoute logo mark: an orange "D" with a road leading to a pin. The road
// and pin are cut out of the D (even-odd fill), so they show whatever is
// behind the logo and work in both themes. Drawn from the owner's logo
// (2026-11-04).

export const BRAND_ORANGE = "#FF7A00";

export const logoMarkPath =
  "M20 6H55C77 6 93 24 93 50C93 76 77 94 55 94H8Z" +
  "M13 94C19 75 36 57 64 43.5L68 49.5C48 62 37 77 33 94Z" +
  "M68.5 31.5a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0 -15 0Z";

export const logoRoadPath = "M23 94C28 77 42 61 66 46.5";

export function LogoMark({
  size = 36,
  className,
  title,
}: {
  size?: number;
  className?: string;
  // give a title only when the mark stands alone (no "DocRoute" text next to it)
  title?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path fill={BRAND_ORANGE} fillRule="evenodd" d={logoMarkPath} />
      <path
        d={logoRoadPath}
        fill="none"
        stroke={BRAND_ORANGE}
        strokeWidth={2.4}
        strokeDasharray="5 4.2"
      />
    </svg>
  );
}
