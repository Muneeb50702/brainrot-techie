/* All the math. Averages are public, widely cited rates. Everything runs on-device. */

export const RATES = {
  heartPerMin: 80, // average resting heart rate across a lifetime (kids run higher, adults ~60-100)
  breathsPerMin: 16, // adult average at rest
  blinksPerMinAwake: 15,
  awakeShare: 2 / 3, // ~8h sleep a day
  orbitKmPerSec: 29.78, // Earth's average orbital speed around the Sun
  scrollMetersPerScreenHour: 40, // rough: ~90 m of feed per ~2.3h daily social use
  everestKm: 8.849,
  litersPerHeartbeat: 0.07,
};

const DAY = 86_400_000;
const YEAR = 365.2425 * DAY;
export const IPHONE = new Date("2007-06-29T00:00:00");

/** Tech + culture moments for the "born closer to X than to today" punchline and the timeline chips. */
export const EVENTS: { date: string; label: string; emoji: string }[] = [
  { date: "1903-12-17", label: "the first airplane flight", emoji: "✈️" },
  { date: "1927-09-07", label: "the first TV", emoji: "📺" },
  { date: "1947-12-23", label: "the transistor", emoji: "🔌" },
  { date: "1957-10-04", label: "Sputnik", emoji: "🛰️" },
  { date: "1969-07-20", label: "the moon landing", emoji: "🌕" },
  { date: "1977-05-25", label: "the first Star Wars movie", emoji: "⭐" },
  { date: "1980-05-22", label: "Pac-Man", emoji: "👾" },
  { date: "1983-01-01", label: "the internet (TCP/IP day)", emoji: "🌐" },
  { date: "1984-01-24", label: "the first Macintosh", emoji: "🖥️" },
  { date: "1985-09-13", label: "Super Mario Bros", emoji: "🍄" },
  { date: "1989-04-21", label: "the Game Boy", emoji: "🎮" },
  { date: "1991-08-06", label: "the first website", emoji: "🕸️" },
  { date: "1992-12-03", label: "the first text message", emoji: "💬" },
  { date: "1994-12-03", label: "the first PlayStation", emoji: "🕹️" },
  { date: "1995-08-24", label: "Windows 95", emoji: "💾" },
  { date: "1998-09-04", label: "Google", emoji: "🔍" },
  { date: "2001-01-15", label: "Wikipedia", emoji: "📚" },
  { date: "2001-10-23", label: "the iPod", emoji: "🎧" },
  { date: "2004-02-04", label: "Facebook", emoji: "👍" },
  { date: "2005-02-14", label: "YouTube", emoji: "▶️" },
  { date: "2007-06-29", label: "the iPhone", emoji: "📱" },
  { date: "2009-05-17", label: "Minecraft", emoji: "⛏️" },
  { date: "2010-10-06", label: "Instagram", emoji: "📸" },
  { date: "2017-07-25", label: "Fortnite", emoji: "🪂" },
  { date: "2018-08-02", label: "TikTok going global", emoji: "🎵" },
  { date: "2022-11-30", label: "ChatGPT", emoji: "🤖" },
].map((e) => ({ ...e, date: e.date }));

const eventTime = (d: string) => new Date(d + "T00:00:00").getTime();

export function parseBirthday(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

export type BirthdayError = "future" | "ancient" | "invalid";
export function validateBirthday(d: Date | null, now = Date.now()): BirthdayError | null {
  if (!d) return "invalid";
  if (d.getTime() > now) return "future";
  if (now - d.getTime() > 120 * YEAR) return "ancient";
  return null;
}

/** "you were born closer to X than to today": the oldest event E (before birth) with birth − E < now − birth. */
export function bornCloserTo(birth: Date, now = Date.now()) {
  const b = birth.getTime();
  const threshold = 2 * b - now;
  const hit = EVENTS.find((e) => eventTime(e.date) > threshold && eventTime(e.date) < b);
  return hit ? { ...hit, year: new Date(eventTime(hit.date)).getFullYear() } : null;
}

export function timeline(birth: Date) {
  const b = birth.getTime();
  const tech = EVENTS.filter((e) => eventTime(e.date) >= eventTime("1980-01-01"));
  return {
    olderThanYou: tech.filter((e) => eventTime(e.date) < b).slice(-4),
    youngerThanYou: tech.filter((e) => eventTime(e.date) >= b).slice(0, 8),
  };
}

export type Uptime = { years: number; days: number; hours: number; minutes: number; seconds: number };

export function uptime(birth: Date, now = Date.now()): Uptime {
  // Calendar-correct years (handles leap years), then the remainder in days/h/m/s.
  let years = new Date(now).getFullYear() - birth.getFullYear();
  const anniv = (y: number) => new Date(birth.getFullYear() + y, birth.getMonth(), birth.getDate()).getTime();
  if (anniv(years) > now) years -= 1;
  let rest = Math.floor((now - anniv(years)) / 1000);
  const days = Math.floor(rest / 86400);
  rest -= days * 86400;
  const hours = Math.floor(rest / 3600);
  rest -= hours * 3600;
  const minutes = Math.floor(rest / 60);
  return { years, days, hours, minutes, seconds: rest - minutes * 60 };
}

export function liveStats(birth: Date, now = Date.now()) {
  const sec = (now - birth.getTime()) / 1000;
  const min = sec / 60;
  const heartbeats = min * RATES.heartPerMin;
  return {
    seconds: sec,
    heartbeats,
    breaths: min * RATES.breathsPerMin,
    blinks: min * RATES.awakeShare * RATES.blinksPerMinAwake,
    spaceKm: sec * RATES.orbitKmPerSec,
    bloodLiters: heartbeats * RATES.litersPerHeartbeat,
    daysAlive: (now - birth.getTime()) / DAY,
  };
}

/** Phone life: counted from age 12 or from the iPhone launch, whichever is later. */
export function phoneStats(birth: Date, screenHoursPerDay: number, now = Date.now()) {
  const age12 = new Date(birth.getFullYear() + 12, birth.getMonth(), birth.getDate()).getTime();
  const since = Math.max(age12, IPHONE.getTime());
  const days = Math.max(0, (now - since) / DAY);
  const hours = days * screenHoursPerDay;
  const years = hours / 24 / 365.2425;
  const scrolledKm = (hours * RATES.scrollMetersPerScreenHour) / 1000;
  const sleepYears = ((now - birth.getTime()) / YEAR) * (1 - RATES.awakeShare);
  // projection: phone years by age 80 at this rate
  const age80 = new Date(birth.getFullYear() + 80, birth.getMonth(), birth.getDate()).getTime();
  const projectedYears = (Math.max(0, (age80 - since) / DAY) * screenHoursPerDay) / 24 / 365.2425;
  return { since: new Date(since), years, scrolledKm, everests: scrolledKm / RATES.everestKm, sleepYears, projectedYears };
}

export function milestones(birth: Date, now = Date.now()) {
  const b = birth.getTime();
  const at = (ms: number) => new Date(b + ms);
  let next = new Date(new Date(now).getFullYear(), birth.getMonth(), birth.getDate());
  if (next.getTime() <= now) next = new Date(next.getFullYear() + 1, birth.getMonth(), birth.getDate());
  return {
    billionSeconds: at(1e9 * 1000),
    tenThousandDays: at(10_000 * DAY),
    billionHeartbeats: at((1e9 / RATES.heartPerMin) * 60_000),
    nextBirthday: next,
  };
}

export const fmtInt = (n: number) => Math.floor(n).toLocaleString("en-US");
export const fmtCompact = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "long", maximumFractionDigits: 1 }).format(n);
export const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
export const pad = (n: number) => String(n).padStart(2, "0");

export function countdown(to: Date, now = Date.now()) {
  let s = Math.max(0, Math.floor((to.getTime() - now) / 1000));
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  return `${d}d ${pad(h)}:${pad(m)}:${pad(s - m * 60)}`;
}
