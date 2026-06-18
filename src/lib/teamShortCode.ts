// Short country/team codes for compact match cards.
// Falls back to first two uppercase letters of the team name.

const SHORT_CODES: Record<string, string> = {
  // Football – nations
  switzerland: "CH", "bosnia": "BA", "bosnia and herzegovina": "BA",
  canada: "CA", qatar: "QA", mexico: "MX", "south korea": "KR", "north korea": "KP",
  korea: "KR", "republic of korea": "KR",
  brazil: "BR", argentina: "AR", germany: "DE", france: "FR", spain: "ES",
  england: "EN", italy: "IT", portugal: "PT", netherlands: "NL", belgium: "BE",
  croatia: "HR", serbia: "RS", denmark: "DK", sweden: "SE", norway: "NO",
  poland: "PL", austria: "AT", "czech republic": "CZ", czechia: "CZ", greece: "GR",
  turkey: "TR", türkiye: "TR", ukraine: "UA", russia: "RU", romania: "RO",
  hungary: "HU", scotland: "SC", wales: "WL", ireland: "IE", iceland: "IS",
  finland: "FI", japan: "JP", australia: "AU", "new zealand": "NZ", usa: "US",
  "united states": "US", uruguay: "UY", chile: "CL", colombia: "CO", peru: "PE",
  ecuador: "EC", paraguay: "PY", venezuela: "VE", bolivia: "BO",
  egypt: "EG", morocco: "MA", tunisia: "TN", algeria: "DZ", "south africa": "ZA",
  nigeria: "NG", ghana: "GH", senegal: "SN", "ivory coast": "CI", "côte d'ivoire": "CI",
  cameroon: "CM", kenya: "KE", "saudi arabia": "SA", iran: "IR", iraq: "IQ",
  uae: "AE", "united arab emirates": "AE", jordan: "JO", lebanon: "LB",
  india: "IN", pakistan: "PK", bangladesh: "BD", "sri lanka": "LK", afghanistan: "AF",
  china: "CN", thailand: "TH", vietnam: "VN", indonesia: "ID", malaysia: "MY",
  philippines: "PH", singapore: "SG",
};

export function teamShortCode(team: string): string {
  if (!team) return "—";
  const key = team.trim().toLowerCase();
  if (SHORT_CODES[key]) return SHORT_CODES[key];

  // Strip common club suffixes/prefixes for clubs
  const cleaned = team
    .replace(/\b(fc|cf|sc|ac|afc|cfc|sk|fk|bk)\b/gi, "")
    .replace(/[^\p{L}\s]/gu, "")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
