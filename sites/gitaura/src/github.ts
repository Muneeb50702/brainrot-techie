/* Public GitHub API, called straight from the browser. Unauthenticated = 60 req/hr
   per visitor IP, and one lookup costs ~5, so every visitor gets ~12 checks an hour. */

export type GhUser = {
  login: string;
  id: number;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  type: "User" | "Organization";
};

export type GhRepo = {
  name: string;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string | null;
  size: number;
};

export type CommitLite = { message: string; date: string };

export type GhData = { user: GhUser; repos: GhRepo[]; commits: CommitLite[]; fetchedAt: number };

export type GhErrorKind = "notfound" | "ratelimit" | "network" | "org" | "invalid";

export class GhError extends Error {
  kind: GhErrorKind;
  resetAt?: number;
  constructor(kind: GhErrorKind, resetAt?: number) {
    super(kind);
    this.kind = kind;
    this.resetAt = resetAt;
  }
}

const API = "https://api.github.com";
const USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const CACHE_MS = 30 * 60 * 1000;

async function gh<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API + path, { headers: { Accept: "application/vnd.github+json" } });
  } catch {
    throw new GhError("network");
  }
  if (res.status === 404) throw new GhError("notfound");
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    throw new GhError("ratelimit", reset ? reset * 1000 : undefined);
  }
  if (!res.ok) throw new GhError("network");
  return res.json() as Promise<T>;
}

/** Normalize "https://github.com/foo/", "@foo", " foo " → "foo". */
export function cleanUsername(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
    .trim();
}

export function isValidUsername(u: string) {
  return USERNAME_RE.test(u);
}

type PushEvent = { type: string; created_at: string; payload?: { commits?: { message: string }[] } };
type CommitRes = { commit: { message: string; author: { date: string } | null } };

export async function fetchGitHub(rawName: string): Promise<GhData> {
  const username = cleanUsername(rawName);
  if (!isValidUsername(username)) throw new GhError("invalid");

  const key = `gitaura:v1:${username.toLowerCase()}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key) || "null") as GhData | null;
    if (cached && Date.now() - cached.fetchedAt < CACHE_MS) return cached;
  } catch {
    /* ignore bad cache */
  }

  const user = await gh<GhUser>(`/users/${username}`);
  if (user.type === "Organization") throw new GhError("org");

  const [repos, events] = await Promise.all([
    gh<GhRepo[]>(`/users/${user.login}/repos?per_page=100&sort=pushed&type=owner`),
    gh<PushEvent[]>(`/users/${user.login}/events/public?per_page=100`).catch(() => [] as PushEvent[]),
  ]);

  const commits: CommitLite[] = [];
  for (const e of events) {
    if (e.type !== "PushEvent") continue;
    for (const c of e.payload?.commits ?? []) commits.push({ message: c.message, date: e.created_at });
  }

  // Event payloads can be thin. Top up from the two most recently pushed repos.
  if (commits.length < 20) {
    const recent = repos.filter((r) => !r.fork && r.size > 0).slice(0, 2);
    const lists = await Promise.all(
      recent.map((r) =>
        gh<CommitRes[]>(`/repos/${user.login}/${r.name}/commits?author=${user.login}&per_page=50`).catch(
          () => [] as CommitRes[],
        ),
      ),
    );
    for (const list of lists)
      for (const c of list)
        if (c.commit.author?.date) commits.push({ message: c.commit.message, date: c.commit.author.date });
  }

  const seen = new Set<string>();
  const unique = commits.filter((c) => {
    const k = c.date + c.message;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const data: GhData = { user, repos, commits: unique, fetchedAt: Date.now() };
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* storage full / private mode */
  }
  return data;
}
