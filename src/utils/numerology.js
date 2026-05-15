const LETTER_MAP = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 6,
  P: 7,
  Q: 8,
  R: 9,
  S: 1,
  T: 2,
  U: 3,
  V: 4,
  W: 5,
  X: 6,
  Y: 7,
  Z: 8,
};

const VOWELS = ["A", "E", "I", "O", "U"];

const reduce = (num) => {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num)
      .split("")
      .reduce((a, d) => a + parseInt(d), 0);
  }
  return num;
};

export const calcLifePath = (dob) => {
  const parts = dob.split("-"); // YYYY-MM-DD
  const total = parts
    .join("")
    .split("")
    .reduce((a, d) => a + parseInt(d), 0);
  return reduce(total);
};

export const calcExpression = (name) => {
  const letters = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("");
  const total = letters.reduce((a, l) => a + (LETTER_MAP[l] || 0), 0);
  return reduce(total);
};

export const calcSoulUrge = (name) => {
  const letters = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("");
  const vowels = letters.filter((l) => VOWELS.includes(l));
  const total = vowels.reduce((a, l) => a + (LETTER_MAP[l] || 0), 0);
  return reduce(total);
};

export const calcPersonality = (name) => {
  const letters = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("");
  const consonants = letters.filter((l) => !VOWELS.includes(l));
  const total = consonants.reduce((a, l) => a + (LETTER_MAP[l] || 0), 0);
  return reduce(total);
};

export const calcBirthday = (dob) => {
  const day = parseInt(dob.split("-")[2]);
  return reduce(day);
};

export const calcPersonalYear = (dob) => {
  const currentYear = new Date().getFullYear();
  const parts = dob.split("-");
  const mmdd = parts[1] + parts[2];
  const total =
    mmdd.split("").reduce((a, d) => a + parseInt(d), 0) +
    String(currentYear)
      .split("")
      .reduce((a, d) => a + parseInt(d), 0);
  return reduce(total);
};

const TRAITS = {
  1: {
    title: "The Leader",
    desc: "Independent, pioneering, ambitious, original. Born to lead and innovate.",
    lucky: "Sunday",
    gem: "Ruby",
    color: "Red",
    planet: "Sun",
  },
  2: {
    title: "The Diplomat",
    desc: "Sensitive, cooperative, peace-loving, intuitive. Born to unite and harmonize.",
    lucky: "Monday",
    gem: "Pearl",
    color: "White",
    planet: "Moon",
  },
  3: {
    title: "The Communicator",
    desc: "Creative, expressive, joyful, sociable. Born to inspire and entertain.",
    lucky: "Thursday",
    gem: "Yellow Sapphire",
    color: "Yellow",
    planet: "Jupiter",
  },
  4: {
    title: "The Builder",
    desc: "Disciplined, practical, loyal, organized. Born to build and establish.",
    lucky: "Saturday",
    gem: "Blue Sapphire",
    color: "Blue",
    planet: "Rahu",
  },
  5: {
    title: "The Freedom Seeker",
    desc: "Adventurous, dynamic, versatile, curious. Born to explore and change.",
    lucky: "Wednesday",
    gem: "Emerald",
    color: "Green",
    planet: "Mercury",
  },
  6: {
    title: "The Nurturer",
    desc: "Caring, responsible, loving, artistic. Born to serve and beautify.",
    lucky: "Friday",
    gem: "Diamond",
    color: "Pink",
    planet: "Venus",
  },
  7: {
    title: "The Seeker",
    desc: "Analytical, spiritual, introspective, wise. Born to understand mysteries.",
    lucky: "Monday",
    gem: "Cat's Eye",
    color: "Violet",
    planet: "Ketu",
  },
  8: {
    title: "The Achiever",
    desc: "Powerful, ambitious, authoritative, material. Born to manifest abundance.",
    lucky: "Saturday",
    gem: "Blue Sapphire",
    color: "Black",
    planet: "Saturn",
  },
  9: {
    title: "The Humanitarian",
    desc: "Compassionate, generous, idealistic, wise. Born to serve all of humanity.",
    lucky: "Tuesday",
    gem: "Coral",
    color: "Gold",
    planet: "Mars",
  },
  11: {
    title: "The Illuminator",
    desc: "Highly intuitive, inspirational, visionary. A Master Number — spiritual messenger.",
    lucky: "Monday",
    gem: "Moonstone",
    color: "Silver",
    planet: "Moon",
  },
  22: {
    title: "The Master Builder",
    desc: "Visionary, powerful, practical genius. A Master Number — builder of great things.",
    lucky: "Saturday",
    gem: "Blue Sapphire",
    color: "Earthy Brown",
    planet: "Saturn",
  },
  33: {
    title: "The Master Teacher",
    desc: "Compassionate healer, selfless teacher. A Master Number — pure love and wisdom.",
    lucky: "Friday",
    gem: "Emerald",
    color: "Royal Blue",
    planet: "Venus",
  },
};

export const getTraits = (num) => TRAITS[num] || TRAITS[1];

const AFFIRMATIONS = {
  1: [
    "I lead with confidence and purpose.",
    "I am the creator of my own destiny.",
    "My independence is my superpower.",
  ],
  2: [
    "I attract harmony into every relationship.",
    "My sensitivity is a gift.",
    "I create peace wherever I go.",
  ],
  3: [
    "My creativity flows freely and abundantly.",
    "I express myself with joy and confidence.",
    "The universe celebrates my unique voice.",
  ],
  4: [
    "I build my dreams with patience and dedication.",
    "My hard work creates lasting foundations.",
    "I am disciplined, grounded, and unstoppable.",
  ],
  5: [
    "I embrace change as my greatest teacher.",
    "Freedom fuels my highest potential.",
    "Adventure is my natural state of being.",
  ],
  6: [
    "I nurture myself as deeply as I nurture others.",
    "Love flows through me endlessly.",
    "My home is a sanctuary of beauty.",
  ],
  7: [
    "I trust my inner wisdom completely.",
    "The universe reveals its secrets to me.",
    "My spiritual path is unique and sacred.",
  ],
  8: [
    "I attract abundance in all forms.",
    "My power creates positive change.",
    "I am worthy of great success and wealth.",
  ],
  9: [
    "I serve the world with an open heart.",
    "My compassion creates ripples of love.",
    "I release the old to welcome the new.",
  ],
  11: [
    "I am a channel of divine inspiration.",
    "My intuition guides me perfectly.",
    "I illuminate the path for others.",
  ],
  22: [
    "I build bridges between vision and reality.",
    "My work changes the world.",
    "I manifest miracles through dedicated action.",
  ],
  33: [
    "I teach through unconditional love.",
    "My compassion heals hearts.",
    "I am a vessel of divine wisdom.",
  ],
};

export const getAffirmations = (num) => AFFIRMATIONS[num] || AFFIRMATIONS[1];

export const generateReport = (name, dob, gender) => {
  const lifePath = calcLifePath(dob);
  const expression = calcExpression(name);
  const soulUrge = calcSoulUrge(name);
  const personality = calcPersonality(name);
  const birthday = calcBirthday(dob);
  const personalYear = calcPersonalYear(dob);

  return {
    name,
    dob,
    gender,
    lifePath,
    expression,
    soulUrge,
    personality,
    birthday,
    personalYear,
    lifePathTraits: getTraits(lifePath),
    expressionTraits: getTraits(expression),
    soulUrgeTraits: getTraits(soulUrge),
    personalityTraits: getTraits(personality),
    affirmations: getAffirmations(lifePath),
  };
};
