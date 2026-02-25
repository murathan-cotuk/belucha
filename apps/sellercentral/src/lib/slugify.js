/**
 * Title/name → URL-safe handle (slug).
 * Maps special characters: ü→u, ö→o, ı→i, ç→c, ğ→g, ä→ae, ß→ss (and uppercase).
 */
export function titleToHandle(str) {
  if (!str || typeof str !== "string") return "";
  let s = str.trim();
  const map = {
    ü: "u", Ü: "u", ö: "o", Ö: "o", ı: "i", I: "i", İ: "i",
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ä: "ae", Ä: "ae",
    ß: "ss", æ: "ae", Æ: "ae", ø: "o", Ø: "o", å: "a", Å: "a",
  };
  for (const [from, to] of Object.entries(map)) {
    s = s.split(from).join(to);
  }
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
