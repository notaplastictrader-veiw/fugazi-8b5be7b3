// Curated whitelist of popular teams/players. Match if either side contains a token.
export const POPULAR_TEAMS: string[] = [
  // Football clubs
  "real madrid", "barcelona", "atletico madrid", "atletico", "athletic",
  "manchester city", "manchester united", "man city", "man utd", "man united",
  "arsenal", "liverpool", "chelsea", "tottenham", "newcastle",
  "bayern", "borussia dortmund", "dortmund", "leverkusen",
  "psg", "paris saint", "marseille",
  "juventus", "inter", "milan", "napoli", "roma",
  // National football teams
  "brazil", "argentina", "france", "germany", "spain", "england", "portugal", "italy", "netherlands",
  // Cricket
  "india", "pakistan", "australia", "new zealand", "south africa", "sri lanka", "bangladesh", "west indies",
  "mumbai indians", "chennai super kings", "csk", "rcb", "royal challengers", "kkr", "kolkata knight",
  "delhi capitals", "rajasthan royals", "punjab kings", "sunrisers", "gujarat titans", "lucknow super",
  // Basketball
  "lakers", "celtics", "warriors", "bulls", "heat", "nets", "knicks", "nuggets", "bucks", "76ers", "suns",
  // Tennis players
  "alcaraz", "sinner", "djokovic", "nadal", "federer", "medvedev", "zverev", "rublev",
  "swiatek", "sabalenka", "gauff", "rybakina",
];

const norm = (s: string) => (s || "").toLowerCase();

export function isPopularMatch(teamA: string, teamB: string): boolean {
  const a = norm(teamA);
  const b = norm(teamB);
  return POPULAR_TEAMS.some((t) => a.includes(t) || b.includes(t));
}
