export const LETTER_MAP = {
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

// Helper function to calculate Lo Shu Grid from DOB
export const calculateLoShuGrid = (dob) => {
  if (!dob) return Array(9).fill(0);
  const digits = dob.replace(/-/g, "").split("").map(Number);
  const grid = Array(9).fill(0);

  digits.forEach((digit) => {
    if (digit > 0 && digit <= 9) {
      grid[digit - 1]++;
    }
  });

  return grid;
};

// Helper function to get missing numbers
export const getMissingNumbers = (grid) => {
  const missing = [];
  for (let i = 0; i < 9; i++) {
    if (grid[i] === 0) {
      missing.push(i + 1);
    }
  }
  return missing;
};

// Helper function to get present numbers
export const getPresentNumbers = (grid) => {
  const present = [];
  for (let i = 0; i < 9; i++) {
    if (grid[i] > 0) {
      present.push({ num: i + 1, count: grid[i] });
    }
  }
  return present;
};

// Helper: reduce a number to single digit by summing its digits
const reduceToSingle = (num) => {
  while (num > 9) {
    num = String(num).split("").reduce((a, d) => a + parseInt(d), 0);
  }
  return num;
};

// Mulank: sum of date digits only (e.g. 17 → 1+7 = 8)
export const calcMulank = (dob) => {
  if (!dob) return 0;
  // dob format: YYYY-MM-DD
  const day = dob.split("-")[2] || "";
  const digitSum = day.split("").reduce((a, d) => a + parseInt(d), 0);
  return reduceToSingle(digitSum);
};

// Bhagyank: sum of ALL digits in the full DOB (e.g. 17-04-1972 → 1+7+0+4+1+9+7+2 = 31 → 4)
export const calcBhagyank = (dob) => {
  if (!dob) return 0;
  const digits = dob.replace(/-/g, "").split("").map(Number);
  const total = digits.reduce((a, d) => a + d, 0);
  return reduceToSingle(total);
};

// Calculate Kua number
// Kua year sum = sum of ALL 4 year digits (e.g. 1972 → 1+9+7+2 = 19 → 1+0 = 1)
// Man:   kua = 11 - yearSum  (reduce if > 9)
// Woman: kua = 4  + yearSum  (reduce if > 9)
export const calculateKua = (dob, gender) => {
  if (!dob) return 0;
  const yearStr = dob.split("-")[0] || "";
  const yearDigitSum = yearStr.split("").reduce((a, d) => a + parseInt(d), 0);
  const reduced = reduceToSingle(yearDigitSum);

  if (gender === "female") {
    return reduceToSingle(4 + reduced);
  } else {
    return reduceToSingle(11 - reduced);
  }
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
  const lifePath = calcLifePath(dob);        // full DOB digit sum (same as Bhagyank)
  const expression = calcExpression(name);
  const soulUrge = calcSoulUrge(name);
  const personality = calcPersonality(name);
  const birthday = calcBirthday(dob);
  const personalYear = calcPersonalYear(dob);
  const mulank = calcMulank(dob);            // date digits only
  const bhagyank = calcBhagyank(dob);        // all DOB digits

  const lifePathTraits = getTraits(lifePath);
  const expressionTraits = getTraits(expression);
  
  const loShuGrid = calculateLoShuGrid(dob);
  const presentNumbers = getPresentNumbers(loShuGrid);

  return {
    name,
    dob,
    gender,
    mulank,
    bhagyank,
    lifePath,
    expression,
    soulUrge,
    personality,
    birthday,
    personalYear,
    lifePathTraits: {
      ...lifePathTraits,
      keyTraits: [
        "Leadership qualities, can easily dominate people",
        "Problem solvers who tackle every situation easily",
        "Very positive, strong, determined, good initiators",
        "Ability to change dreams into reality",
        "Occupy higher positions in society",
      ],
    },
    expressionTraits: {
      ...expressionTraits,
      keyTraits: [
        "Most feminine number, signifies human soul",
        "Extremely sensitive and emotional",
        "Imaginative, intuitive, deep thinkers",
        "Ability to think out of the box",
        "Good presenters and ability to convince",
      ],
    },
    dateInfluencer: {
      title: `Date Influencer - Born on ${parseInt(dob.split("-")[2])}`,
      desc: `People born on ${parseInt(dob.split("-")[2])}, ${parseInt(dob.split("-")[2]) + 9}, ${parseInt(dob.split("-")[2]) + 18}, ${parseInt(dob.split("-")[2]) + 27} (any month)`,
      content: "These people give importance to other's point of view as well but have a rational mind. Due to the presence of 2, Moon, they will have a pleasing personality.",
    },
    personalityAnalysis: {
      title: `Life Path ${lifePath} + Destiny ${expression}`,
      content: "You will fulfil all that you take up in life provided you have good name number. You will work far more efficiently for others than if you work independently. In case you work independently, you will remain confused between the choices to make. You are physically strong but mentally emotional or sensitive. You will get a lot of attention from the opposite sex.",
    },
    luckyElements: {
      luckyDates: "1, 10, 19, 28",
      unluckyDates: "8, 17, 26",
      luckyColor: "Orange",
      unluckyColor: "Black & Brown",
      luckyDirection: "East",
      element: "Fire",
    },
    repeatedNumbersAnalysis: presentNumbers.filter(n => n.count > 1).map(n => ({
      num: n.num,
      count: n.count,
      influence: n.num === 1 ? "Strong willpower and determination. Can be authoritative." : 
                 n.num === 2 ? "High sensitivity and intuition. Deeply emotional." : 
                 "Enhanced qualities of the core number."
    })),
    suitableProfessions: [
      "Leadership roles",
      "Creative arts",
      "Social services",
      "Consulting"
    ],
    missingNumbersRemedies: [
      {
        num: 4,
        planet: "Rahu",
        effects: "Avoids physical work, needs constant motivation, highly unorganized, not hardworking, believes in shortcuts, misses opportunities",
        crystal: "Rudraksh and Crystal Bracelet",
        benefits: ["Brings stability and structure to life", "Helps overcome sudden obstacles and challenges", "Improves focus and organizational skills"]
      },
      {
        num: 5,
        planet: "Mercury",
        effects: "Most confused personality, frequent changes, afraid of new things, less adventurous, highly insecure, difficulty adapting",
        crystal: "Green Aventurine Bracelet",
        benefits: ["Attracts luck, abundance, and prosperity", "Enhances communication and business skills", "Promotes emotional healing"]
      }
    ],
    futurePredictions: {
      year1: {
        year: new Date().getFullYear(),
        title: "THE YEAR OF HARD WORK, DISCIPLINE AND BUILDING FOUNDATIONS",
        desc: "A serious year requiring hard work and discipline. Focus on building solid foundations in all areas of life. Health needs attention."
      },
      year2: {
        year: new Date().getFullYear() + 1,
        title: "THE YEAR OF CHANGE, FREEDOM AND NEW EXPERIENCES",
        desc: "A dynamic year of change, travel, and new experiences. The unexpected happens. Embrace freedom and variety."
      }
    },
    affirmations: getAffirmations(lifePath),
    customPage1: {
      title: "Note Page 1",
      content: "",
    },
    customPage2: {
      title: "Note Page 2",
      content: "",
    },
    customPage3: {
      title: "Note Page 3",
      content: "",
    },
  };
};


