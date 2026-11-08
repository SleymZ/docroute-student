/**
 * Country flags are served from the site itself (public/flags, SVGs from
 * the MIT-licensed flag-icons project, see public/flags/LICENSE.txt), so a
 * visitor's browser never contacts a third-party flag host. A test keeps
 * the folder in step with every country the site can show.
 */
export function flagSrc(code: string): string {
  return `/flags/${code.toLowerCase()}.svg`;
}
