export const HANDLE_MIN_LENGTH = 3;
export const HANDLE_MAX_LENGTH = 30;
export const HANDLE_REGEX = /^[a-z0-9_]{3,30}$/;

const HANDLE_FIRST = [
  "Ash", "Basil", "Bear",  "Brook", "Canyon",
  "Cedar", "Clay", "Clover", "Coral", "Dale", "Dove",
  "Ember", "Fern", "Finch", "Flint",
  "Forest", "Fox", "Garnet", "Glenn", "Gray", "Harbor", "Haven", "Hawk",
  "Heath", "Holly", "Indigo", "Iris", "Jade", "Jasper", "Juniper",
  "Lark", "Leaf", "Linden", "Meadow", "Mica", "Moss",
  "Navy", "Olive", "Onyx", "Opal", "Orion",
  "Pearl", "Rain", "Raven", "Reed", 
  "Rocky", "Rose", "Sable","Scout", "Shale",
  "Silver", "Sky", "Slate", "Sol", "Sorrel", "Sparrow", "Spring", "Sterling",
  "Stone", "Storm", "Summer","Teal", "Thorn", "Timber", "Vale",
  "Valley", "Wells", "West", "Willow", "Zephyr", "Arrow",
  "Atlas", 
  "Addison","Amari", "Aspen",
  "Bailey", "Briar", 
  "Campbell","Dakota",
  "Dallas", "Eden", "Emery","Gale", "Harley",
  "Hollis", "Indy", "hazel",
  "Justice", "Kali",
  "Lennon", "Marley", "Milan", "Monroe",
  "Morgan", "Noel", "Ocean", "Parker", "Paris", "Pat",
  "Phoenix", "Quinn", "Reagan", "Reese", "Remy", "River",
  "Robin","Rowan", "Sage","Sawyer", "Shiloh", "veranda",
  "Sidney", "Skyler", "Sunny", "Tatum", "Taylor", "wisteria","verdigris","xiphoid", 
  "Winter", "Wren", "Zion", "primrose","tulip","saffron","jubilee","rosemary",  "zinnia", "gossamer", "indigo"
];

const HANDLE_MIDDLE = [
  "alpine", "cinder", "falcon", "garnet", "harvest",
 "kelp", "lattice", "monsoon", "nutmeg", "obelisk", "petal",
  "yew", "zircon", "aviary", "brisket", "crescent", "dune", "easel", "fennel",
   "loon", "mesa", "nimbus",
  "plume", "quill", "runestone", "silo", 
 "arbor", "citrine", "dewdrop","Blue", 
  "emberglow", "glade", "honeycomb", "ironwood", "jade", "kingfisher", "lumen",
  "mistral", "northstar", "starling", "timber",
 "windswept", "yam", "zest", "antler", "bluebell",
  "cattail", "everglade", "foxglove", "grit", "joist", "moist",
  "moonrise", "nightjar", "osprey", "quickstep", "redwood",
  "solstice", "burger","clown", "monkey", "vinyl","koala","jackal","yucca","zesty"
];

const HANDLE_LAST = [
  "alloy", "banjo", "dandelion", "flint", "grove", "estuary","Cove",
  "igloo", "keystone", "lagoon", "murmur", "noodle", "onyx", "pebble",
  "quilt", "sprout", "thimble", "walnut", "yacht", "Story",
  "zenith", "asteroid", "blossom", "canopy", "domino", "elm", "fable", "ginger",
  "hammock", "meteor", "oasis", "banyan", "driftwood","labyrinth",
  "quasar",  "teacup", "urchin", "velour", "waterfall",
 "zucchini", "biscuit", "clover", "duvet", "egret",
  "glacier", "kayak", "lemonade", "mulberry","Lane", 
  "nocturne", "otter", "pyramid", "quicksand", "seashell", "taproot",
  "vortex", "yolk", "zigzag",  "bramble", "citadel",
  "daybreak", "fjord", "goblet", "hedgehog", "iridescent", "javelin", "kiwi",
   "mooring", "nebula", "origami", "quince", "skylark",
  "tangent",  "overture", "pinecone", "quartzite",  "undertow","lodestone", 
  "warbler","quarry", "riddle", "sundial", "thicket", "wayfinder", "jetstream", "kindling"
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
