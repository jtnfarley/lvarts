export const HANDLE_MIN_LENGTH = 3;
export const HANDLE_MAX_LENGTH = 30;
export const HANDLE_REGEX = /^[a-z0-9_]{3,30}$/;

const HANDLE_FIRST_NAMES = [
  "ada",
  "alex",
  "aria",
  "asher",
  "billie",
  "bram",
  "cass",
  "cleo",
  "dana",
  "dylan",
  "ella",
  "elliot",
  "ember",
  "felix",
  "finn",
  "flora",
  "harper",
  "hazel",
  "iris",
  "ivy",
  "jade",
  "juno",
  "kai",
  "lena",
  "leo",
  "lila",
  "luca",
  "mara",
  "milo",
  "mina",
  "nico",
  "nova",
  "ollie",
  "otis",
  "phoebe",
  "quinn",
  "ruby",
  "sage",
  "sasha",
  "theo",
  "violet",
  "willa",
];

const HANDLE_WORDS = [
  "amp",
  "anthem",
  "arc",
  "atlas",
  "beat",
  "bird",
  "bloom",
  "blue",
  "bridge",
  "cascade",
  "chime",
  "chorus",
  "cinder",
  "comet",
  "echo",
  "ember",
  "field",
  "flare",
  "fox",
  "glow",
  "grove",
  "harbor",
  "haze",
  "hollow",
  "jet",
  "lane",
  "lighthouse",
  "loop",
  "meadow",
  "mixer",
  "moon",
  "moth",
  "night",
  "nova",
  "oak",
  "orbit",
  "patch",
  "pine",
  "pulse",
  "quartz",
  "radio",
  "reed",
  "river",
  "signal",
  "spark",
  "static",
  "stone",
  "tide",
  "tone",
  "trail",
  "vinyl",
  "wave",
  "willow",
];

const randomItem = (items: string[]) => {
  return items[Math.floor(Math.random() * items.length)];
};

export const normalizeHandle = (input: string): string => {
  return input
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, HANDLE_MAX_LENGTH);
};

export const isValidHandle = (handle: string): boolean => {
  return HANDLE_REGEX.test(handle);
};

export const getRandomHandleBase = (): string => {
  return normalizeHandle(`${randomItem(HANDLE_FIRST_NAMES)}_${randomItem(HANDLE_WORDS)}`);
};
