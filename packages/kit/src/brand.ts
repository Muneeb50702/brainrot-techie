/** One place for the brand. Every site reads from here. */
export const BRAND = {
  domain: "muhammadmuneeb.tech",
  series: "a brainrot website every day",
  /** Instagram handle shown on badges and share cards, e.g. "@yourhandle". Empty = hidden. */
  instagram: "",
} as const;

export const siteHost = (slug: string) => `${slug}.${BRAND.domain}`;
export const siteUrl = (slug: string) => `https://${siteHost(slug)}`;
export const dayLabel = (day: number) => `DAY ${String(day).padStart(3, "0")}`;
