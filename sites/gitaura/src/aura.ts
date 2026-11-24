import type { GhData } from "./github";

export type AuraItem = { emoji: string; label: string; points: number };

export type Tier = { key: string; name: string; emoji: string; color: string; verdict: string };

export type AuraResult = {
  total: number;
  items: AuraItem[];
  tier: Tier;
  best?: AuraItem;
  worst?: AuraItem;
  stats: { stars: number; followers: number; repos: number; years: number; commitsRead: number; topLang: string | null };
};

const TIERS: (Tier & { min: number })[] = [
  { min: 3000, key: "boss", name: "github final boss", emoji: "👑", color: "#c6ff3d", verdict: "we are not worthy. the aura is visible from orbit." },
  { min: 1800, key: "sigma", name: "sigma dev", emoji: "🗿", color: "#3de8ff", verdict: "recruiters fear and respect you. mostly fear." },
  { min: 1000, key: "farmer", name: "aura farmer", emoji: "🌾", color: "#7c5cff", verdict: "certified aura farmer. the grind is showing." },
  { min: 500, key: "mid", name: "mid (respectfully)", emoji: "😐", color: "#f3efe6", verdict: "not cooked, not cooking. simmering." },
  { min: 0, key: "npc", name: "npc", emoji: "🫥", color: "#8b8b9c", verdict: "background character energy. the commits exist. the aura doesn't." },
  { min: -Infinity, key: "negative", name: "negative aura", emoji: "☠️", color: "#ff3da5", verdict: "the aura is in debt. github is sending collectors." },
];

const LAZY_RE = /^(fix(es|ed)?|update[sd]?|wip|changes?|asdf+|test(ing)?|\.+|minor|stuff|final( final)*|lol|commit|done|temp|tmp|misc|edit|save|idk|work|working|small fix|bug ?fix|fix bug|added files|add files via upload|update readme\.md|create readme\.md|initial commit)$/i;
const EMOTIONAL_RE = /\b(pls|plz|please work|why+|omg|bruh+|idk|hopefully|finally|ugh+|help|i hate|kill me|dont ask|don't ask|it works|actually works|no idea|lmao|sorry)\b/i;
const CONVENTIONAL_RE = /^(feat|fix|chore|docs|refactor|style|test|perf|build|ci|revert)(\([^)]*\))?!?:/i;
const TUTORIAL_RE = /(todo|to-do|calculator|weather|tic-?tac|portfolio|clone|tutorial|hello-?world|my-?app|demo|practice|learning|landing-?page|netflix|amazon|spotify|crud|first-?project)/i;
const BUZZ_RE = /\b(ai|web3|blockchain|founder|ceo|10x|ninja|guru|rockstar|crypto|visionary|serial|thought leader|evangelist|wizard|hustl\w*|grind\w*)\b/i;

const LANG: Record<string, [number, string]> = {
  Rust: [200, "rust main (will mention it unprompted)"],
  Zig: [250, "zig main. too cool for school"],
  Haskell: [300, "haskell main. understands monads, allegedly"],
  C: [150, "c main. segfault survivor"],
  "C++": [140, "c++ main. emotionally damaged by templates"],
  Go: [110, "go main. if err != nil enjoyer"],
  TypeScript: [60, "typescript main. types enjoyer"],
  Python: [40, "python main. import solutions"],
  Shell: [90, "shell main. bash wizard"],
  Ruby: [80, "ruby main. vintage drip"],
  Kotlin: [60, "kotlin main"],
  Swift: [60, "swift main. apple tax payer"],
  Elixir: [180, "elixir main. lowkey cracked"],
  OCaml: [220, "ocaml main. who even are you"],
  Lua: [70, "lua main. roblox origin story?"],
  PHP: [69, "php main. respect the grind"],
  Dart: [40, "dart main. flutter fr"],
  "C#": [40, "c# main. unity or enterprise, no in between"],
  Java: [-50, "java main. AbstractAuraFactoryBean"],
  JavaScript: [-42, "javascript main. npm crimes acknowledged"],
  HTML: [-69, "html main. it's not a programming language (we said it)"],
  CSS: [-30, "css main. centering divs for a living"],
  "Jupyter Notebook": [30, "jupyter main. cell-by-cell goblin"],
  Vue: [30, "vue main. the chill framework"],
  Assembly: [400, "assembly main. talks to the cpu directly"],
};

const pct = (n: number) => Math.round(n * 100);
const fmt = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
const firstLine = (m: string) => m.split("\n")[0].trim();
const mostCommon = (arr: string[]) => {
  const m = new Map<string, number>();
  for (const a of arr) m.set(a, (m.get(a) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
};
const clip = (s: string, n = 34) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function computeAura({ user, repos, commits }: GhData, now = Date.now()): AuraResult {
  const items: AuraItem[] = [];
  const add = (emoji: string, label: string, points: number) => points !== 0 && items.push({ emoji, label, points: Math.round(points) });

  const own = repos.filter((r) => !r.fork);
  const forks = repos.length - own.length;
  const stars = own.reduce((s, r) => s + r.stargazers_count, 0);
  const days = (now - new Date(user.created_at).getTime()) / 86_400_000;
  const years = days / 365.25;
  const msgs = commits.map((c) => firstLine(c.message)).filter(Boolean);
  const dates = commits.map((c) => new Date(c.date));
  const enough = dates.length >= 8;

  add("🧬", "base aura (u exist)", 100);

  // tenure
  if (years < 1) add("🐣", `fresh spawn: account is ${Math.max(1, Math.floor(days))}d old`, 10);
  else add("🧓", `${Math.floor(years)}y on github. og energy`, years * 50);

  // stars + followers (log so megastars don't break the scale)
  if (stars > 0) add("⭐", `${fmt(stars)} stars farmed`, 200 * Math.log10(stars + 1));
  else if (own.length > 3) add("🦗", `0 stars across ${own.length} repos. silence is loud`, -69);

  if (user.followers > 3) add("👥", `${fmt(user.followers)} followers (parasocial army)`, 140 * Math.log10(user.followers + 1));
  else if (user.followers > 0) add("👥", `${user.followers} follower${user.followers > 1 ? "s" : ""} (mom + bots)`, 20);

  if (user.following > 50 && user.following > 3 * user.followers)
    add("🥺", `follows ${fmt(user.following)}, followed by ${fmt(user.followers)}. down bad`, -150);

  // repo count
  if (user.public_repos === 0) add("👻", "0 public repos. ghost behavior", -300);
  else if (user.public_repos >= 100) add("🏭", `${user.public_repos} repos. can't stop won't stop`, 120);

  // 3am energy. GitHub's API only gives UTC timestamps, so hours are read in the
  // VISITOR's timezone (exact when you check yourself), and the label says so.
  if (enough) {
    const goblin = dates.filter((d) => d.getHours() < 5).length / dates.length;
    if (goblin >= 0.25) add("🦇", `${pct(goblin)}% of commits at 12–5am (ur timezone). goblin mode`, 333);
    else if (goblin >= 0.08) add("🌙", `${pct(goblin)}% commits at 12–5am (ur timezone). lowkey menace`, 150);
    else if (goblin === 0) add("☀️", "zero commits at 12–5am (ur timezone). suspiciously healthy", -40);

    const weekend = dates.filter((d) => d.getDay() === 0 || d.getDay() === 6).length / dates.length;
    if (weekend >= 0.4) add("🌱", `${pct(weekend)}% weekend commits. touch grass (respectfully)`, 111);
  }

  // commit message crimes
  if (msgs.length >= 5) {
    const lazy = msgs.filter((m) => LAZY_RE.test(m) || m.length <= 3);
    if (lazy.length >= 3) add("🗑️", `${lazy.length} commits that just say "${clip(mostCommon(lazy) ?? "fix", 18)}"`, -Math.min(420, lazy.length * 21));
    else if (lazy.length === 0 && msgs.length >= 10) add("✍️", "zero lazy commit msgs. rare W", 150);

    const emo = msgs.filter((m) => EMOTIONAL_RE.test(m));
    if (emo.length) add("😭", `emotional damage commit: "${clip(emo[0])}"`, Math.min(3, emo.length) * 69);

    const conv = msgs.filter((m) => CONVENTIONAL_RE.test(m)).length / msgs.length;
    if (conv >= 0.5 && msgs.length >= 10) add("👔", `${pct(conv)}% conventional commits. corporate rizz`, 120);
  }

  // tutorial hell
  const tut = own.filter((r) => TUTORIAL_RE.test(r.name)).length;
  if (tut >= 3) add("🔁", `${tut} todo/weather/clone-type repos. tutorial hell resident`, -Math.min(240, tut * 40));

  // main character
  if (own.some((r) => r.name.toLowerCase() === user.login.toLowerCase())) add("🎬", "has a profile README. main character", 100);

  // bio
  const buzz = user.bio?.match(BUZZ_RE)?.[0];
  if (buzz) add("💼", `bio says "${buzz}". linkedin energy detected`, -100);
  else if (!user.bio?.trim()) add("🕳️", "no bio. mysterious or lazy (lazy)", -30);

  // top language
  const langCount = new Map<string, number>();
  for (const r of own) if (r.language) langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);
  const topLang = [...langCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  if (topLang && LANG[topLang]) add("🧠", LANG[topLang][1], LANG[topLang][0]);
  else if (topLang) add("🧠", `${topLang.toLowerCase()} main. niche king`, 77);

  // forks
  if (forks >= 5 && forks > own.length) add("🍴", `forked ${forks}, built ${own.length}. collector mindset`, -80);

  // recency
  const lastPush = Math.max(0, ...own.map((r) => (r.pushed_at ? new Date(r.pushed_at).getTime() : 0)));
  if (lastPush) {
    const since = Math.floor((now - lastPush) / 86_400_000);
    if (since <= 7) add("⚡", since === 0 ? "pushed today. active rn" : `pushed ${since}d ago. active rn`, 80);
    else if (since >= 365) add("🏛️", `last push ${since} days ago. account is a museum`, -200);
  }

  const total = items.reduce((s, i) => s + i.points, 0);
  const tier = TIERS.find((t) => total >= t.min)!;
  const ranked = items.filter((i) => i.label !== "base aura (u exist)");
  const best = [...ranked].sort((a, b) => b.points - a.points)[0];
  const worst = [...ranked].sort((a, b) => a.points - b.points)[0];

  return {
    total,
    items,
    tier,
    best: best && best.points > 0 ? best : undefined,
    worst: worst && worst.points < 0 ? worst : undefined,
    stats: { stars, followers: user.followers, repos: user.public_repos, years: Math.floor(years), commitsRead: msgs.length, topLang },
  };
}
