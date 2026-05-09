// Curated whitelist of popular teams/players. Uses word-boundary matching
// to avoid false positives like "Inter Turku" matching "inter" (Inter Milan)
// or "Real Salt Lake" matching "real" (Real Madrid).
export const POPULAR_TEAMS: string[] = [
  // Football clubs (use full phrases to avoid generic-token false positives)
  "real madrid", "real sociedad", "real betis",
  "barcelona", "atletico madrid", "athletic bilbao", "athletic club",
  "manchester city", "manchester united", "man city", "man utd", "man united",
  "arsenal", "liverpool", "chelsea", "tottenham", "newcastle",
  "bayern munich", "bayern", "borussia dortmund", "dortmund", "leverkusen",
  "psg", "paris saint-germain", "paris saint germain", "marseille",
  "juventus", "inter milan", "inter miami", "ac milan",
  "napoli", "as roma",
  // National football teams
  "brazil", "argentina", "france", "germany", "spain", "england", "portugal", "italy", "netherlands",
  // Cricket nations
  "india", "pakistan", "australia", "new zealand", "south africa", "sri lanka", "bangladesh", "west indies",
  // IPL
  "mumbai indians", "chennai super kings", "csk", "rcb", "royal challengers", "kkr", "kolkata knight",
  "delhi capitals", "rajasthan royals", "punjab kings", "sunrisers", "gujarat titans", "lucknow super",
  // Basketball
  "lakers", "celtics", "warriors", "bulls", "heat", "nets", "knicks", "nuggets", "bucks", "76ers", "suns",
  // Tennis players
  "alcaraz", "sinner", "djokovic", "nadal", "federer", "medvedev", "zverev", "rublev",
  "swiatek", "sabalenka", "gauff", "rybakina",
];

const norm = (s: string) => (s || "").toLowerCase().trim();

// Word-boundary match: tokenizes name and matches phrase against contiguous tokens.
function matchesEntry(name: string, entry: string): boolean {
  const nameTokens = name.split(/[^a-z0-9]+/).filter(Boolean);
  const entryTokens = entry.split(/[^a-z0-9]+/).filter(Boolean);
  if (entryTokens.length === 0) return false;
  for (let i = 0; i <= nameTokens.length - entryTokens.length; i++) {
    let ok = true;
    for (let j = 0; j < entryTokens.length; j++) {
      if (nameTokens[i + j] !== entryTokens[j]) { ok = false; break; }
    }
    if (ok) return true;
  }
  return false;
}

export function isPopularMatch(teamA: string, teamB: string): boolean {
  const a = norm(teamA);
  const b = norm(teamB);
  return POPULAR_TEAMS.some((t) => matchesEntry(a, t) || matchesEntry(b, t));
}
