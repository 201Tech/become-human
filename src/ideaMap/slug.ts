const UNSAFE_CHARACTERS = /[^a-z0-9_-]+/g;
const EDGE_DASHES = /^-+|-+$/g;

export function toSlug(project: string): string {
  const slug = project.toLowerCase().replace(UNSAFE_CHARACTERS, "-").replace(EDGE_DASHES, "");

  if (!slug) throw new Error(`Invalid project name: "${project}"`);

  return slug;
}
