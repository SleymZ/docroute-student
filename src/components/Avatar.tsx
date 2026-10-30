import { avatarPublicUrl, initials } from "@/lib/stories";

import styles from "./Stories.module.css";

/** Round profile picture, or the person's initials when there is none. */
export function Avatar({
  name,
  path,
  size = 44,
}: {
  name: string;
  path: string | null;
  size?: number;
}) {
  const url = avatarPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", path);

  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      aria-hidden="true"
    >
      {url && process.env.NEXT_PUBLIC_SUPABASE_URL ? (
        // eslint-disable-next-line @next/next/no-img-element -- small public image from Supabase Storage, already resized on upload
        <img src={url} alt="" width={size} height={size} loading="lazy" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
