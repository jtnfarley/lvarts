export const HANDLE_MIN_LENGTH = 3;
export const HANDLE_MAX_LENGTH = 30;
export const HANDLE_REGEX = /^[a-z0-9_]{3,30}$/;

const HANDLE_FIRST = [
  "Ash",  "Bay", "Basil", "Bear",  "Brook", "Canyon",
  "Cedar", "Clay", "Clover", "Coral", "Dale", "Dove",
  "Ember", "Everest", "Falcon", "Fern", "Finch", "Flint",
  "Forest", "Fox", "Garnet", "Glenn", "Gray", "Harbor", "Haven", "Hawk",
  "Heath", "Holly", "Indigo", "Iris", "Jade", "Jasper", "Juniper",
  "Lark", "Leaf", "Linden", "Meadow", "Mercury", "Mica", "Moss",
  "Navy", "Oak", "Olive", "Onyx", "Opal", "Orion",
  "Pearl", "Pine", "Quill", "Rain", "Raven", "Reed", 
  "Rocky", "Rose", "Sable","Scout", "Shale",
  "Silver", "Sky", "Slate", "Sol", "Sorrel", "Sparrow", "Spring", "Sterling",
  "Stone", "Storm", "Summer","Teal", "Thorn", "Timber", "Vale",
  "Valley", "Wells", "West", "Willow", "Zephyr", "Arrow",
  "Atlas", "Blue", "Cove", "Story",
  "Addison","Amari", "Arden", "Aspen",
  "Avery", "Bailey", "Bellamy","Briar", 
  "Campbell","Dakota",
  "Dallas", "Eden", "Emery","Gale", "Harley",
  "Hollis", "Indy", 
  "Justice", "Kali",
  "Lane", "Lennon", "Marley", "Milan", "Monroe",
  "Morgan", "Noel", "Oakley", "Ocean", "Parker", "Paris", "Pat",
  "Phoenix", "Quinn", "Reagan", "Reese", "Remy", "River",
  "Robin","Rowan", "Sage","Sawyer", "Shiloh",
  "Sidney", "Skyler", "Sunny", "Tatum", "Taylor", 
  "Winter", "Wren", "Zion"
];

const HANDLE_MIDDLE = [
  "alpine", "banyan", "cinder", "driftwood", "estuary", "falcon", "garnet", "harvest",
  "iris", "jubilee", "kelp", "lattice", "monsoon", "nutmeg", "obelisk", "petal",
  "quarry", "riddle", "sundial", "thicket", "upland", "verdant", "wayfinder", "xylem",
  "yew", "zircon", "aviary", "brisket", "crescent", "dune", "easel", "fennel",
  "gossamer", "hearth", "indigo", "jetstream", "kindling", "loon", "mesa", "nimbus",
  "outpost", "plume", "quill", "runestone", "silo", "tulip", "undertow", "vessel",
  "warbler", "xenial", "yonderly", "zinnia", "arbor", "brook", "citrine", "dewdrop",
  "emberglow", "fir", "glade", "honeycomb", "ironwood", "jade", "kingfisher", "lumen",
  "mistral", "northstar", "overture", "pinecone", "quartzite", "rosemary", "starling", "timber",
  "uplink", "verdigris", "windswept", "xiphoid", "yam", "zest", "antler", "bluebell",
  "cattail", "delphinium", "everglade", "foxglove", "grit", "halyard", "islet", "joist",
  "kestrel", "lodestone", "moonrise", "nightjar", "osprey", "primrose", "quickstep", "redwood",
  "solstice", "tarn", "unison", "valerian"
];

const HANDLE_LAST = [
  "alloy", "banjo", "cabin", "dandelion", "echo", "flint", "grove", "helium",
  "igloo", "juniper", "keystone", "lagoon", "murmur", "noodle", "onyx", "pebble",
  "quilt", "raven", "sprout", "thimble", "uplift", "veranda", "walnut", "yacht",
  "zenith", "asteroid", "blossom", "canopy", "domino", "elm", "fable", "ginger",
  "hammock", "inlet", "jasmine", "koala", "locket", "meteor", "nickel", "oasis",
  "picnic", "quasar", "robin", "saffron", "teacup", "urchin", "velour", "waterfall",
  "xerox", "yucca", "zucchini", "atrium", "biscuit", "clover", "duvet", "egret",
  "figment", "glacier", "hazel", "iodine", "jackal", "kayak", "lemonade", "mulberry",
  "nocturne", "otter", "pyramid", "quicksand", "runway", "seashell", "taproot", "uniform",
  "vortex", "windmill", "xenon", "yolk", "zigzag", "almond", "bramble", "citadel",
  "daybreak", "evergreen", "fjord", "goblet", "hedgehog", "iridescent", "javelin", "kiwi",
  "labyrinth", "mooring", "nebula", "origami", "porch", "quince", "railway", "skylark",
  "tangent", "updraft", "vinyl", "wisteria"
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
};

export const isValidHandle = (handle: string): boolean => {
  return HANDLE_REGEX.test(handle);
};

export const getRandomHandleBase = (): string => {
  return normalizeHandle(`${randomItem(HANDLE_FIRST)}_${randomItem(HANDLE_MIDDLE)}_${randomItem(HANDLE_LAST)}`);
};
