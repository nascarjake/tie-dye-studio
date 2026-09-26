const blockedWords = new Set([
  "asshole",
  "bastard",
  "bitch",
  "bullshit",
  "cunt",
  "dick",
  "faggot",
  "fuck",
  "motherfucker",
  "nigger",
  "piss",
  "pussy",
  "shit",
  "slut",
  "whore",
]);
const urlPattern = /(?:https?:\/\/|www\.|\b[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?\.(?:com|net|org|io|co|dev|app|gg|me|tv|info|biz|xyz|us|uk)\b)/i;

export function publicTextError(value, maxLength) {
  if (typeof value !== "string" || value.length > maxLength)
    return `Keep this to ${maxLength} characters or fewer.`;
  if (urlPattern.test(value)) return "Links and web addresses aren’t allowed.";
  const words = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[013457@$!]/g, (character) =>
      ({ 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", "@": "a", "$": "s", "!": "i" })[
        character
      ],
    )
    .replace(/[^a-z]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.some((word) => blockedWords.has(word)))
    return "Please choose family-friendly wording.";
  return "";
}

export function validEntry(entry) {
  return (
    entry &&
    typeof entry.id === "string" &&
    typeof entry.image === "string" &&
    /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(entry.image) &&
    entry.image.length < 350000 &&
    typeof entry.name === "string" &&
    !publicTextError(entry.name, 32) &&
    typeof entry.title === "string" &&
    !publicTextError(entry.title, 48)
  );
}
