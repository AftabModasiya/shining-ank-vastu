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
// extraDigits: optional array of additional single-digit numbers to include
// (e.g. Mulank, Bhagyank single digits, and Kua single digits per client spec)
export const calculateLoShuGrid = (dob, extraDigits = []) => {
  if (!dob) return Array(9).fill(0);
  const dobDigits = dob.replace(/-/g, "").split("").map(Number);
  // Decompose each extra number into its individual digits
  const expandedExtra = extraDigits.flatMap(n => String(n).split("").map(Number));
  const allDigits = [...dobDigits, ...expandedExtra];
  const grid = Array(9).fill(0);

  allDigits.forEach((digit) => {
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
  const PLANET_NAMES = { 1:"Sun", 2:"Moon", 3:"Jupiter", 4:"Rahu", 5:"Mercury", 6:"Venus", 7:"Ketu", 8:"Saturn", 9:"Mars" };
  for (let i = 0; i < 9; i++) {
    if (grid[i] > 0) {
      present.push({ num: i + 1, count: grid[i], planet: PLANET_NAMES[i + 1] || "Unknown" });
    }
  }
  return present;
};

// Helper function to detect positive and negative arrows in the grid
export const getArrows = (grid) => {
  const arrowDefs = [
    { numbers: [1, 5, 9], name: "Willpower", posDesc: "Arrow of Willpower (1-5-9)", negDesc: "Arrow of Frustration (Missing 1-5-9)" },
    { numbers: [3, 5, 7], name: "Emotion / Memory", posDesc: "Arrow of Emotion (3-5-7)", negDesc: "Arrow of Weak Memory (Missing 3-5-7)" },
    { numbers: [4, 5, 6], name: "Prosperity / Success", posDesc: "Arrow of Prosperity (4-5-6)", negDesc: "Arrow of Adversity (Missing 4-5-6)" },
    { numbers: [2, 5, 8], name: "Determination", posDesc: "Arrow of Determination (2-5-8)", negDesc: "Arrow of Indecision (Missing 2-5-8)" },
    { numbers: [1, 2, 3], name: "Peace & Art", posDesc: "Arrow of Peace & Art (1-2-3)", negDesc: "Arrow of Instability (Missing 1-2-3)" },
    { numbers: [4, 8, 9], name: "Strategy & Planning", posDesc: "Arrow of Strategy & Planning (4-8-9)", negDesc: "Arrow of Disorganization (Missing 4-8-9)" },
    { numbers: [7, 8, 9], name: "Practical Action", posDesc: "Arrow of Practical Action (7-8-9)", negDesc: "Arrow of Hesitation (Missing 7-8-9)" },
    { numbers: [1, 4, 7], name: "Intellect & Health", posDesc: "Arrow of Intellect & Health (1-4-7)", negDesc: "Arrow of Weak Vitality (Missing 1-4-7)" }
  ];

  const positive = [];
  const negative = [];

  arrowDefs.forEach(arrow => {
    const presentCount = arrow.numbers.filter(n => grid[n - 1] > 0).length;
    if (presentCount === 3) {
      positive.push(arrow.posDesc);
    } else if (presentCount === 0) {
      negative.push(arrow.negDesc);
    }
  });

  return { positive, negative };
};

// Helper function to get repeated numbers and their strengths
export const getRepeatedNumbers = (grid) => {
  const repeated = [];
  for (let i = 0; i < 9; i++) {
    const count = grid[i];
    if (count > 1) {
      let strength = "Normal";
      if (count === 2) strength = "Strong";
      else if (count === 3) strength = "Very Strong";
      else if (count >= 4) strength = "Dominating / Excessive";
      repeated.push({ num: i + 1, count, strength });
    }
  }
  return repeated;
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

// ─────────────────────────────────────────────────────────────────────────────
// LUCKY ELEMENTS — fully dynamic per numerology rules
//
// 1. Lucky Number  = bhagyank (Life Path — sum of all DOB digits reduced)
// 2. Lucky Dates   = bhagyank itself + multiples that reduce back to bhagyank
//                    e.g. bhagyank 3 → 3, 12, 21, 30
// 3. Lucky Colors  = planetary color for bhagyank
// 4. Challenging Colors = planetary color for the non-friend planet of bhagyank
// 5. Lucky Direction = Kua number based direction (vastu)
// 6. Core Element  = element mapped to bhagyank planet
// ─────────────────────────────────────────────────────────────────────────────
const PLANET_COLORS = {
  1: { lucky: "Yellow, Orange, Gold",     challenging: "Dark Blue, Black" },
  2: { lucky: "White, Silver, Light Green", challenging: "Red, Crimson" },
  3: { lucky: "Yellow, Purple, Pink",     challenging: "Dark Green, Black" },
  4: { lucky: "Blue, Grey, Electric Blue", challenging: "White, Pink" },
  5: { lucky: "Green, Light Shades",      challenging: "Dark Red, Black" },
  6: { lucky: "White, Cream, Pastel",     challenging: "Dark Green, Black" },
  7: { lucky: "Smoke Grey, Light Blue",   challenging: "Dark Red, Brown" },
  8: { lucky: "Dark Blue, Black, Dark Brown", challenging: "Red, Orange" },
  9: { lucky: "Red, Crimson, Maroon",     challenging: "Green, Light Blue" },
};

const PLANET_ELEMENTS = {
  1: "Fire (Sun energy)",
  2: "Water (Moon energy)",
  3: "Space / Ether (Jupiter energy)",
  4: "Air / Wood (Rahu energy)",
  5: "Earth (Mercury energy)",
  6: "Space / Metal (Venus energy)",
  7: "Space / Metal (Ketu energy)",
  8: "Earth (Saturn energy)",
  9: "Fire (Mars energy)",
};

const KUA_DIRECTION = {
  1: "North",
  2: "Southwest",
  3: "East",
  4: "Southeast",
  5: "Northeast",  // Male 5 → NE, Female 5 → SW (use Northeast as generic)
  6: "Northwest",
  7: "West",
  8: "Northeast",
  9: "South",
};

export const getLuckyElements = (bhagyank, mulank, kuaNum) => {
  // bhagyank is the Life Path Number (reduced from full DOB)
  const lp = bhagyank || 1;

  // Ruling Planet
  const PLANET_MAP = {
    1: "Sun",
    2: "Moon",
    3: "Jupiter",
    4: "Rahu",
    5: "Mercury",
    6: "Venus",
    7: "Ketu",
    8: "Saturn",
    9: "Mars"
  };
  const planet = PLANET_MAP[lp] || "Sun";

  // Lucky Dates (lp, lp + 9, lp + 18, lp + 27 <= 31)
  const luckyDates = [];
  for (let d = lp; d <= 31; d += 9) {
    luckyDates.push(d);
  }

  // Challenging Dates
  const ENEMY_MAP = {
    1: [6, 8],
    2: [8, 9],
    3: [5, 6],
    4: [1, 8],
    5: [2],
    6: [1, 8],
    7: [8],
    8: [1, 2, 9],
    9: [2, 5, 6]
  };
  const enemies = ENEMY_MAP[lp] || [];
  const challengingDates = [];
  enemies.forEach(e => {
    for (let d = e; d <= 31; d += 9) {
      challengingDates.push(d);
    }
  });
  challengingDates.sort((a, b) => a - b);
  // Ensure unique dates
  const uniqueChallengingDates = [...new Set(challengingDates)];

  // Colors mapping
  const LUCKY_COLORS = {
    1: ["Gold", "Orange", "Yellow"],
    2: ["White", "Cream", "Light Blue"],
    3: ["Yellow", "Purple"],
    4: ["Electric Blue", "Grey"],
    5: ["Green"],
    6: ["Pink", "White", "Sky Blue"],
    7: ["Sea Green", "Light Grey"],
    8: ["Dark Blue", "Black", "Dark Brown"],
    9: ["Red", "Maroon"]
  };
  const CHALLENGING_COLORS = {
    1: ["Black", "Dark Blue", "Pink"],
    2: ["Black", "Dark Blue", "Red", "Maroon"],
    3: ["Green", "Pink", "White"],
    4: ["Gold", "Orange", "Black", "Dark Blue"],
    5: ["White", "Cream"],
    6: ["Gold", "Orange", "Black", "Dark Blue"],
    7: ["Black", "Dark Blue", "Dark Brown"],
    8: ["Red", "Orange", "White"],
    9: ["Green", "White", "Pink"]
  };

  const luckyColors = LUCKY_COLORS[lp] || ["Gold"];
  const challengingColors = CHALLENGING_COLORS[lp] || ["Black"];

  // Direction — use KUA-based Vastu direction (Bug 4 fix)
  const kuaVastu = KUA_VASTU_DATA[kuaNum] || KUA_VASTU_DATA[1];
  const direction = kuaVastu.direction;


  // Kua-based Lucky Colors (override general colors with Vastu-specific ones)
  const kuaLuckyColors = kuaVastu.colors;

  // Element Mapping
  const ELEMENT_MAP = {
    1: "Fire",
    2: "Water",
    3: "Ether / Sky",
    4: "Air",
    5: "Earth",
    6: "Water",
    7: "Air",
    8: "Earth",
    9: "Fire"
  };
  const element = ELEMENT_MAP[lp] || "Fire";

  // Planet Energy
  const planetEnergy = `${planet} Energy`;

  return {
    luckyNumber: lp,
    luckyDates: luckyDates.join(", "),
    unluckyDates: uniqueChallengingDates.join(", ") || "None",
    luckyColor: luckyColors.join(", "),
    unluckyColor: challengingColors.join(", "),
    luckyDirection: direction,
    kuaColors: kuaLuckyColors,
    kuaTheme: kuaVastu.theme,
    element,
    planetEnergy,
    rulingPlanet: planet
  };
};

// getMobileAnalysis: checks phone root digit against BOTH mulank AND bhagyank
// per client specification for Lucky Mobile/Vehicle Number Checker.
export const getMobileAnalysis = (phone, mulank, bhagyank) => {
  if (!phone || phone === "-" || phone.trim() === "") {
    return {
      isValid: false,
      rawPhone: phone || "",
      digits: "",
      totalSum: 0,
      singleDigit: 0,
      vibrationMeaning: "No phone number provided.",
      compatibility: "Neutral",
      isCompatible: false,
      compatibilityDescription: "Please provide a mobile number to see compatibility analysis.",
      zeroCount: 0,
      endsInZero: false,
      zeroAnalysis: "No phone number analyzed.",
      lastFourDigits: "",
      lastFourSum: 0,
      lastFourSingleDigit: 0,
      lastFourMeaning: ""
    };
  }

  // Clean country codes like +91, 91, or leading 0s
  let digits = phone.replace(/\D/g, "");
  // Keep last 10 digits if longer
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }

  if (digits.length === 0) {
    return {
      isValid: false,
      rawPhone: phone,
      digits: "",
      totalSum: 0,
      singleDigit: 0,
      vibrationMeaning: "Invalid phone number.",
      compatibility: "Neutral",
      isCompatible: false,
      compatibilityDescription: "Please enter a valid phone number.",
      zeroCount: 0,
      endsInZero: false,
      zeroAnalysis: "Invalid phone number.",
      lastFourDigits: "",
      lastFourSum: 0,
      lastFourSingleDigit: 0,
      lastFourMeaning: ""
    };
  }

  const totalSum = digits.split("").reduce((sum, d) => sum + parseInt(d, 10), 0);
  const singleDigit = reduce(totalSum);

  const vibrationMeanings = {
    1: "Fosters leadership, independence, and new beginnings. Ideal for entrepreneurs and ambitious professionals seeking authority.",
    2: "Promotes teamwork, harmony, and diplomacy. Great for building relationships, counseling, and customer service.",
    3: "Encourages creativity, communication, and optimism. Excellent for artists, teachers, and social/marketing professionals.",
    4: "Represents hard work, discipline, and stability. Good for people in management, finance, or technical operations.",
    5: "Symbolizes freedom, flexibility, and travel/trade. Perfect for sales professionals, freelancers, and marketers.",
    6: "Focuses on family, love, responsibility, and luxury. Ideal for family businesses and creative/health sectors.",
    7: "Promotes spirituality, deep introspection, and research. Great for scientists, analysts, and spiritual healers.",
    8: "Attracts authority, wealth, and prosperity. Excellent for corporate executives, investors, and business owners.",
    9: "Relates to humanitarianism, completion, and compassion. Best for NGOs, teachers, and social workers."
  };

  const compat_mulank  = getCompatibility(singleDigit, mulank);
  const compat_bhagyank = getCompatibility(singleDigit, bhagyank);

  // Client spec: friend in BOTH = "Highly Compatible / Super Lucky"
  //              in ANY nonFriends = "Incompatible / Avoid"
  let compatibilityLabel = "Neutral";
  let isCompatible = false;
  let compatibilityDescription = "";

  const inMulankFriends   = compat_mulank.status  === "friend";
  const inBhagyankFriends = compat_bhagyank.status === "friend";
  const inAnyEnemy        = compat_mulank.status   === "enemy" || compat_bhagyank.status === "enemy";

  if (inMulankFriends && inBhagyankFriends) {
    compatibilityLabel = "Highly Compatible / Super Lucky";
    isCompatible = true;
    compatibilityDescription = `Your mobile total of ${singleDigit} is friendly to BOTH your Psychic Number ${mulank} and Destiny Number ${bhagyank}. This is a Super Lucky number that supports career progression, financial success, and smooth social/professional interactions.`;
  } else if (inAnyEnemy) {
    compatibilityLabel = "Incompatible / Avoid this Number";
    isCompatible = false;
    compatibilityDescription = `Your mobile total of ${singleDigit} is challenging/non-friendly to your core numbers (Psychic ${mulank} or Destiny ${bhagyank}). This can bring sudden obstacles, delays, or misunderstandings in business dealings. Choose a number whose total is in both your friendly lists.`;
  } else if (inMulankFriends || inBhagyankFriends) {
    compatibilityLabel = "Partially Compatible / Good";
    isCompatible = true;
    compatibilityDescription = `Your mobile total of ${singleDigit} is friendly to one of your core numbers but neutral to the other. Reasonably good, but aligning to a number friendly to BOTH will maximize positive results.`;
  } else {
    compatibilityLabel = "Neutral";
    isCompatible = false;
    compatibilityDescription = `Your mobile total of ${singleDigit} has a neutral connection with your core numbers (Psychic ${mulank} and Destiny ${bhagyank}). To maximize positive results, choose a number whose digit total appears in both your friendly lists.`;
  }

  const zeroCount = (digits.match(/0/g) || []).length;
  const endsInZero = digits.endsWith("0");
  let zeroAnalysis = "";

  if (endsInZero) {
    zeroAnalysis = "Your mobile number ends with '0'. In Vastu and numerology, this represents a void/leakage of energies at the end of efforts, which can cause projects to stagnate or not yield financial returns.";
  } else if (zeroCount > 1) {
    zeroAnalysis = `Your mobile number contains ${zeroCount} zeros. A high frequency of zeros can create emptiness, draining energies, or lack of momentum in communication.`;
  } else {
    zeroAnalysis = "Your mobile number has no critical zeros (or is zero-free), ensuring a progressive and stable energy flow without empty voids.";
  }

  const lastFourDigits = digits.slice(-4);
  const lastFourSum = lastFourDigits.split("").reduce((sum, d) => sum + parseInt(d, 10), 0);
  const lastFourSingleDigit = reduce(lastFourSum);

  const lastFourMeanings = {
    1: "Brings focus on self-reliance, leadership, and independence in relationships.",
    2: "Nurtures partnerships, emotional bonding, and peace in daily life.",
    3: "Attracts social opportunities, creative solutions, and joyful conversations.",
    4: "Provides structure, systematic planning, and physical security.",
    5: "Invites travel, quick changes, and adaptability in finance and connections.",
    6: "Enhances domestic peace, luxury, caring for family, and material comfort.",
    7: "Inclines towards deep research, seeking truth, and private/isolated periods.",
    8: "Creates heavy focus on business, authority, and financial returns (Karma).",
    9: "Promotes broad-minded discussions, selfless sharing, and completing old issues."
  };

  return {
    isValid: true,
    digits,
    totalSum,
    singleDigit,
    vibrationMeaning: vibrationMeanings[singleDigit] || "",
    compatibility: compatibilityLabel,
    isCompatible,
    compatibilityDescription,
    zeroCount,
    endsInZero,
    zeroAnalysis,
    lastFourDigits,
    lastFourSum,
    lastFourSingleDigit,
    lastFourMeaning: lastFourMeanings[lastFourSingleDigit] || "",
  };
};

export const calcChaldeanName = (name) => {
  if (!name) return 0;
  const CHALDEAN_MAP = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8
  };
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").split("");
  const total = letters.reduce((sum, char) => sum + (CHALDEAN_MAP[char] || 0), 0);
  return reduce(total);
};

export const getNameCompatibilityAnalysis = (name, mulank, bhagyank) => {
  if (!name || name.trim() === "") {
    return {
      nameNumber: 0,
      status: "Neutral",
      description: "Please provide a name to analyze name number compatibility."
    };
  }

  const nameNumber = calcChaldeanName(name);
  const mulankCompat = getCompatibility(nameNumber, mulank);
  const bhagyankCompat = getCompatibility(nameNumber, bhagyank);

  let status = "Neutral";
  let description = "";

  const PLANET_NAMES = {
    1: "Sun",
    2: "Moon",
    3: "Jupiter",
    4: "Rahu",
    5: "Mercury",
    6: "Venus",
    7: "Ketu",
    8: "Saturn",
    9: "Mars",
  };

  const namePlanet = PLANET_NAMES[nameNumber] || "Unknown Planet";
  const mulankPlanet = PLANET_NAMES[mulank] || "Unknown Planet";
  const bhagyankPlanet = PLANET_NAMES[bhagyank] || "Unknown Planet";

  if (mulankCompat.status === "friend" && bhagyankCompat.status === "friend") {
    status = "HIGHLY FAVORABLE";
    description = `Your Chaldean Name Number is ${nameNumber} (${namePlanet}). It shares a highly friendly relationship with both your Psychic Number ${mulank} (${mulankPlanet}) and Destiny Number ${bhagyank} (${bhagyankPlanet}). This alignment creates a cosmic harmony that acts as a catalyst, dissolving career blockages and naturally attracting wealth, health, and positive relationships.`;
  } else if (mulankCompat.status === "friend" || bhagyankCompat.status === "friend") {
    if (mulankCompat.status === "enemy" || bhagyankCompat.status === "enemy") {
      status = "NEUTRAL (MIXED VIBRATION)";
      description = `Your Chaldean Name Number is ${nameNumber} (${namePlanet}). It is friendly to one of your core numbers but challenging to the other. For example, it is ${mulankCompat.label} to your Psychic Number ${mulank} and ${bhagyankCompat.label} to your Destiny Number ${bhagyank}. This mixed vibration can cause inconsistent results, where career benefits are offset by personal friction. A slight spelling correction is advised to align it perfectly.`;
    } else {
      status = "FAVORABLE";
      description = `Your Chaldean Name Number is ${nameNumber} (${namePlanet}). It is friendly with your Psychic Number ${mulank} (${mulankPlanet}) and neutral to your Destiny Number ${bhagyank} (${bhagyankPlanet}). This is a supportive vibration that strengthens your personal drive and communication effectiveness.`;
    }
  } else if (mulankCompat.status === "enemy" || bhagyankCompat.status === "enemy") {
    status = "CHALLENGING / NON-FRIENDLY";
    description = `Your Chaldean Name Number is ${nameNumber} (${namePlanet}) shares a challenging/hostile relationship with your core energies (Psychic Number ${mulank} and/or Destiny Number ${bhagyank}). This planetary clash can introduce sudden delays, unnecessary struggles, or recurring obstacles in professional growth and business negotiations. A name spelling correction to align with a friendly number (like 1, 5, or 6) is highly recommended.`;
  } else {
    status = "NEUTRAL";
    description = `Your Chaldean Name Number is ${nameNumber} (${namePlanet}) shares a neutral relationship with your Psychic Number ${mulank} and Destiny Number ${bhagyank}. It does not cause severe obstruction, but it also does not actively propel you. Aligning your name spelling to a friendly number can significantly boost your overall luck.`;
  }

  return {
    nameNumber,
    status,
    description
  };
};

export const getCareerOutlook = (mulank, bhagyank) => {
  const compat = getCompatibility(mulank, bhagyank);
  const status = compat.status === "friend" ? "Highly Compatible" :
                 compat.status === "enemy" ? "Anti" : "Neutral";

  const planetNames = {
    1: "Sun (Surya)",
    2: "Moon (Chandra)",
    3: "Jupiter (Guru)",
    4: "Uranus (Rahu)",
    5: "Mercury (Budh)",
    6: "Venus (Shukar)",
    7: "Neptune (Ketu)",
    8: "Saturn (Shani)",
    9: "Mars (Mangal)"
  };

  const p1 = planetNames[mulank] || "Unknown";
  const p2 = planetNames[bhagyank] || "Unknown";

  let esotericReason = "";
  let workstyle = "";
  let topCareers = [];
  let careersToAvoid = [];
  let goldenRemedy = "";

  // 1 & 8 / 8 & 1 combination
  if ((mulank === 1 && bhagyank === 8) || (mulank === 8 && bhagyank === 1)) {
    esotericReason = "The intense cosmic friction between Sun (absolute power & ego) and Saturn (justice & structural delays) demands that actions be purified by discipline before rewards manifest.";
    workstyle = `The Mulank ${mulank} and Bhagyank ${bhagyank} combination shapes a highly authoritative, determined, and resilient professional profile. You possess immense leadership ambitions (Sun energy) but face systemic delays, heavy initial duties, or early-career friction (Saturn energy). You work best when having absolute independent control over projects, serving as an executive decision-maker, or acting as an independent expert rather than functioning within a rigid subordinate hierarchy.`;
    topCareers = [
      {
        field: "Real Estate & Infrastructure Development",
        explanation: "Prioritizing the Conductor/Destiny energy of Saturn (8) which rules land, iron, concrete, and physical structural assets, aligned with Sun's administrative authority."
      },
      {
        field: "Corporate Law & Judicial Advisory",
        explanation: "Saturn governs justice and evidence, while the Sun provides the administrative authority and leadership presence required to command respect in legal and regulatory frameworks."
      },
      {
        field: "Large-Scale Industrial Management",
        explanation: "Saturn rules heavy manufacturing, mining, and operations, while the Sun provides the executive leadership needed to direct large organizations or corporate entities."
      }
    ];
    careersToAvoid = [
      "Speculative stock trading, quick-money schemes, or gambling ventures where Saturnian lessons can lead to severe sudden financial losses.",
      "Partnership-heavy retail boutiques or design agencies without a clear, legally bounded operating structure."
    ];
    goldenRemedy = "Keep a copper Sun symbol on the East wall of your office workspace. Always write your main business plans or signatures with a royal blue ink pen on green paper to balance solar authority and Saturnian structure.";
  } else {
    // Generate for all other combinations
    // Esoteric Reasons
    if (compat.status === "friend") {
      esotericReason = `The planetary alliance between ${p1} and ${p2} creates an open energetic channel, aligning your core impulses with your life's destiny path.`;
    } else if (compat.status === "enemy") {
      esotericReason = `The opposing vibrations of ${p1} and ${p2} create structural tension, requiring conscious alignment between your daily impulses and destiny path.`;
    } else {
      esotericReason = `A neutral relationship between ${p1} and ${p2} offers a clean slate where professional growth is directly proportional to structured effort.`;
    }

    // Workstyle
    const mulankQualities = {
      1: "independent, authoritative, and pioneering",
      2: "diplomatic, intuitive, and collaborative",
      3: "philosophical, wise, and expressive",
      4: "organized, analytical, and unconventional",
      5: "adaptable, quick-witted, and trade-focused",
      6: "creative, harmony-seeking, and aesthetic",
      7: "introspective, analytical, and research-driven",
      8: "disciplined, administrative, and persistent",
      9: "courageous, dynamic, and goal-oriented"
    };

    const bhagyankInfluence = {
      1: "independent control, executive decisions, and pioneering new projects.",
      2: "partnerships, counseling, public relations, or artistic creation.",
      3: "training, higher advisory, academic research, or financial auditing.",
      4: "systems architecture, technical research, or complex project execution.",
      5: "trading, client negotiations, quick communications, and marketing.",
      6: "design, luxury services, client relationships, and media campaigns.",
      7: "data science, technical research, counseling, or writing.",
      8: "heavy manufacturing, real estate development, legal structures, or operations.",
      9: "defense, engineering execution, sports management, or crisis control."
    };

    workstyle = `Your workstyle is driven by the ${mulankQualities[mulank] || "purposeful"} energy of Mulank ${mulank} and guided by the destiny path of Bhagyank ${bhagyank}. You operate most effectively in environments that allow for ${bhagyankInfluence[bhagyank] || "professional growth"}`;

    // Industry database
    const industries = {
      1: [
        { field: "Government Services & Public Administration", explanation: "Sun (1) rules state power and high authority, making administrative management highly favorable." },
        { field: "Independent Entrepreneurship & CEO Roles", explanation: "Your pioneering spirit demands independent decision-making and business ownership." },
        { field: "Management Consulting & Corporate Leadership", explanation: "You possess a natural capability to direct others and consult on strategic business decisions." }
      ],
      2: [
        { field: "Imports-Exports & Liquid Industries", explanation: "Moon (2) rules water, liquids, and travel, making trade in these sectors highly profitable." },
        { field: "Counseling, Psychology & Human Resources", explanation: "Grants deep emotional intelligence and an intuitive understanding of human nature." },
        { field: "Creative Arts, Writing & Design", explanation: "Enables expression of rich imagination and refined artistic sensibilities." }
      ],
      3: [
        { field: "Higher Education & Academic Research", explanation: "Jupiter (3) represents Guru and wisdom, aligning perfectly with academic training and speaking." },
        { field: "Financial Advisory, Auditing & Banking", explanation: "Enforces strong ethical standards and analytical wisdom for large-scale financial management." },
        { field: "Legal Services & Judicial Practice", explanation: "Jupiter is the guardian of law and order, ensuring success in litigation and advisory roles." }
      ],
      4: [
        { field: "Information Technology & Software Systems", explanation: "Rahu (4) rules future tech, code development, and electronics, supporting technical innovation." },
        { field: "Real Estate Development & Planning", explanation: "Rahu governs physical layouts and building foundations, matching construction sectors." },
        { field: "Occult Sciences & Technical Research", explanation: "Grants unconventional analytical capabilities to decode complex patterns and mysteries." }
      ],
      5: [
        { field: "International Trade, Commerce & Brokerage", explanation: "Mercury (5) governs business transactions and trade channels, boosting commercial success." },
        { field: "Marketing, Journalism & Media Production", explanation: "Grants exceptional verbal intelligence, public relations skills, and quick adaptability." },
        { field: "Travel, Logistics & Tourism Planning", explanation: "Mercury rules movement, making shipping, travel agency, or logistics highly favorable." }
      ],
      6: [
        { field: "Fashion Design & Luxury Goods Retail", explanation: "Venus (6) rules aesthetic beauty, luxury, and style, aligning with premium lifestyle brands." },
        { field: "Hospitality & High-End Services", explanation: "Venus rules comfort and relationship management, promising success in guest relations and hotels." },
        { field: "Media, Cinema & Entertainment Industries", explanation: "Your natural magnetic charisma and creative expression support visual media and performing arts." }
      ],
      7: [
        { field: "Scientific Research & Data Analytics", explanation: "Ketu (7) is the seeker of hidden truths, making analytical research and coding highly suitable." },
        { field: "Spiritual Healing, Yoga & Metaphysical Sciences", explanation: "Grants high intuitive capabilities and affinity for holistic wellness and astrology." },
        { field: "Creative Literature & Philosophic Writing", explanation: "Enables deep introspection, original thought generation, and analytical authorship." }
      ],
      8: [
        { field: "Real Estate, Mining & Heavy Metal Industries", explanation: "Saturn (8) rules earth elements and construction materials, supporting real estate ventures." },
        { field: "Legal Practice & Judicial Services", explanation: "Saturn governs justice and karma, supporting legal advocacy and regulatory compliance." },
        { field: "Manufacturing & Operations Management", explanation: "Rules machinery and structured work systems, ensuring high operational efficiency." }
      ],
      9: [
        { field: "Defense, Law Enforcement & Security Operations", explanation: "Mars (9) represents physical courage, discipline, and security management." },
        { field: "Surgical Medicine & Physical Engineering", explanation: "Rules sharp tools, mechanics, and physical construction engineering." },
        { field: "Sports Administration & Athletic Coaching", explanation: "Mars infuses high physical dynamism, competitive endurance, and team leadership." }
      ]
    };

    topCareers = industries[bhagyank] || industries[1];

    // Careers to Avoid
    const avoidMap = {
      1: "Low-authority service jobs or highly subordinate roles which limit personal identity and growth.",
      2: "Heavy chemical manufacturing, petroleum refining, or iron factories due to high health and accident hazards.",
      3: "Fashion boutique retail or glamorous hospitality where Venusian focus may clash with your Jupiterian principles.",
      4: "Speculative cash lending, short-term stock trading, or unstructured freelance contracts without written agreements.",
      5: "Slow-paced administrative jobs or raw agricultural farming that limit your active mental agility.",
      6: "Academic teaching, high-metal metallurgy, or mining operations which clash with Venusian harmony.",
      7: "High-pressure, daily retail counter sales or short-term day trading which deplete your intuitive nature.",
      8: "Government contracts or partnerships with close friends/family which might trigger legal disputes or delays.",
      9: "Soft, passive desk-bound support roles or liquid trade (chemicals, beverages) which suppress Martian drive."
    };

    careersToAvoid = [
      avoidMap[mulank] || "Speculative day trading or fields with loose regulatory controls.",
      avoidMap[bhagyank] || "Highly stagnant administrative roles with zero growth avenues."
    ];

    // Remedies
    const remedyMap = {
      1: "Face East while working and place a small wooden plant or green aventurine pyramid on your desk to invite progress.",
      2: "Face North while working and place a water fountain or blue glass bottle on the northern corner of your desk.",
      3: "Face North-East while working and keep a clear quartz crystal ball on your desk to enhance clarity.",
      4: "Face South-East while working and place a small green bamboo plant on your desk to invite material abundance.",
      5: "Face Center or North while working and use a green ink pen for all business agreements and documents.",
      6: "Face North-West while working and keep a brass metal bell on your desk to invite luxury and helpful friends.",
      7: "Face West while working and place a metal showpiece or white crystal cluster on your desk.",
      8: "Face North-East while working and keep a grey or black tourmaline stone on your desk for protection.",
      9: "Face South while working and place a red copper pyramid on your desk to boost authority and fame."
    };

    goldenRemedy = remedyMap[bhagyank] || remedyMap[1];
  }

  // Backwards compatible professions list
  const professionsList = topCareers.map(c => c.field);

  // Backwards compatible summary
  const careerIntroText = `Driven by Mulank ${mulank} and Bhagyank ${bhagyank}, you are suited for ${professionsList.slice(0, 2).join(" and ")}. ${workstyle}`;

  return {
    careerIntroText,
    professionsList,
    compatibilityStatus: status,
    esotericReason,
    workstyle,
    topCareers,
    careersToAvoid,
    goldenRemedy
  };
};


// ─────────────────────────────────────────────────────────────────────────────
// 1. CHALDEAN LO SHU COMPATIBILITY CHART
//    Exact reference from client specification.
//    Planet mapping: 1=Sun(Surya), 2=Moon(Chandra), 3=Jupiter(Guru),
//    4=Uranus(Rahu), 5=Mercury(Budh), 6=Venus(Shukar), 7=Neptune(Ketu),
//    8=Saturn(Shani), 9=Mars(Mangal)
// ─────────────────────────────────────────────────────────────────────────────
const COMPATIBILITY_TABLE = {
  1: { friends: [9, 2, 5, 3, 6, 1], nonFriends: [8],       neutral: [4, 7] },
  2: { friends: [1, 5, 3, 2, 7],    nonFriends: [8, 4, 9],  neutral: [6] },
  3: { friends: [1, 5, 3, 7],       nonFriends: [6],         neutral: [4, 8, 9, 2] },
  4: { friends: [7, 1, 5, 6],       nonFriends: [2, 9],      neutral: [3] },
  5: { friends: [1, 2, 3, 6, 5],    nonFriends: [],          neutral: [4, 7, 8, 9] },
  6: { friends: [1, 7, 4, 6, 5],    nonFriends: [3],         neutral: [2, 8, 9] },
  7: { friends: [4, 6, 1, 5, 3],    nonFriends: [],          neutral: [2, 8, 9, 7] },
  8: { friends: [5, 3, 6, 7],       nonFriends: [1, 2],      neutral: [9] },
  9: { friends: [1, 5],             nonFriends: [2, 4],      neutral: [3, 7, 6, 8, 9] }
};

// ─────────────────────────────────────────────────────────────────────────────
// KUA VASTU DATA — exact client-provided Kua → Direction + Colors table
// ─────────────────────────────────────────────────────────────────────────────
const KUA_VASTU_DATA = {
  1: { direction: "North",              colors: "Blue, Black",             theme: "Career Growth" },
  2: { direction: "South-West",         colors: "Yellow, Cream",           theme: "Stability & Relationships" },
  3: { direction: "East",               colors: "Green, Light Green",      theme: "Health & Growth" },
  4: { direction: "South-East",         colors: "Green, Wood Tones",       theme: "Wealth Accumulation" },
  5: { direction: "Center (Brahmasthan)", colors: "Golden, Yellow",        theme: "Overall Balance" },
  6: { direction: "North-West",         colors: "White, Silver, Metallic", theme: "Helpful Friends & Luxury" },
  7: { direction: "West",               colors: "White, Light Gray",       theme: "Creativity & Legacy" },
  8: { direction: "North-East",         colors: "Blue, Gray, Earthy Tones",theme: "Knowledge & Wisdom" },
  9: { direction: "South",              colors: "Red, Orange, Bright Pink",theme: "Fame & Reputation" },
};

export const getKuaVastuData = (kuaNum) => {
  return KUA_VASTU_DATA[kuaNum] || KUA_VASTU_DATA[1];
};

// ─────────────────────────────────────────────────────────────────────────────
// MISSING NUMBER REMEDY DATA — complete lookup for all 9 numbers
// ─────────────────────────────────────────────────────────────────────────────
const MISSING_NUMBER_REMEDIES = {
  1: {
    planet: "Sun (Surya)",
    effects: [
      "Lacks confidence, leadership, and self-assertion",
      "Struggles with identity, faces issues with authority figures, and finds it hard to make independent decisions",
      "Low vital energy and poor relationship with father"
    ],
    remedies: [
      "Wear a Ruby or Red Garnet Bracelet",
      "Offer water to the rising Sun daily",
      "Respect and care for father or father-figures"
    ]
  },
  2: {
    planet: "Moon (Chandra)",
    effects: [
      "Lots of confusion, lack of sensitivity, lack of intuition, creates misunderstanding in life, has to work extremely hard to attain success"
    ],
    remedies: [
      "Wear Crystal/Sphatik/White Quartz Mala or Bracelet",
      "Place a rough Crystal rock in the South-West direction of the house or office"
    ]
  },
  3: {
    planet: "Jupiter (Guru)",
    effects: [
      "Delays or problems in marriage, tough to express feelings, lack of deep thinking ability, poor imaginative power, and lack of creativity"
    ],
    remedies: [
      "Wear Wood, Chandan, Tulsi, or Rudraksh mala/bracelet",
      "Wear more green colored clothes",
      "Use a wooden body pen and hang a wooden clock on the East wall"
    ]
  },
  4: {
    planet: "Uranus (Rahu)",
    effects: [
      "Lack of discipline, poorly organized life, financial instability, struggle in accumulating wealth, and feeling directionless"
    ],
    remedies: [
      "Wear a silver ring or bracelet, keep a green aventurine crystal, or feed birds daily"
    ]
  },
  5: {
    planet: "Mercury (Budh)",
    effects: [
      "Unrealistic expectations from people and life, constant dissatisfaction, poor communication or presentation skills, lack of a sharp business mind, tendencies of laziness"
    ],
    remedies: [
      "Wear Crystal/Sphatik/White Quartz Mala or Bracelet",
      "Place a Green Fluorite or Green Jade crystal in the Center (Brahmasthan) of the house or office"
    ]
  },
  6: {
    planet: "Venus (Shukar)",
    effects: [
      "Poor bonding with family or friends, may face relationship/marriage problems, unexpected or uncontrolled expenditures, lack of luxury, comfort, and creative blocks"
    ],
    remedies: [
      "Wear a Golden Stainless Steel (SS) plated wrist watch on any hand",
      "Place a White rough Quartz crystal in the North or North-West direction"
    ]
  },
  7: {
    planet: "Neptune (Ketu)",
    effects: [
      "Lack of support from friends or children, chaotic practical life, highly unorganized, loses focus easily"
    ],
    remedies: [
      "Wear a watch with a metallic strap, use light gray or metallic colors"
    ]
  },
  8: {
    planet: "Saturn (Shani)",
    effects: [
      "Poor financial planning, poor judgment of people, inability to manage real estate or assets efficiently"
    ],
    remedies: [
      "Wear an Amethyst crystal bracelet, help or donate to construction workers or laborers"
    ]
  },
  9: {
    planet: "Mars (Mangal)",
    effects: [
      "Lack of energy, drive, and enthusiasm. Name and fame are difficult to achieve"
    ],
    remedies: [
      "Keep a red cloth or red wallet, use bright colors"
    ]
  }
};

export const getMissingNumberRemedyData = (num) => {
  const data = MISSING_NUMBER_REMEDIES[num];
  if (!data) {
    return {
      planet: "Unknown",
      effects: "Faces issues related to this energy plane.",
      crystal: "Clear Quartz Bracelet",
      effectsList: ["Faces issues related to this energy plane."],
      remediesList: ["Clear Quartz Bracelet"]
    };
  }
  return {
    planet: data.planet,
    effects: data.effects.map(e => `• ${e}`).join("\n"),
    crystal: data.remedies.map(r => `• ${r}`).join("\n"),
    effectsList: data.effects,
    remediesList: data.remedies
  };
};

export const getCompatibility = (num1, num2) => {
  if (!num1 || !num2) return { status: "unknown", label: "Unknown" };
  const entry = COMPATIBILITY_TABLE[num1];
  if (!entry) return { status: "unknown", label: "Unknown" };
  if (entry.friends.includes(num2))    return { status: "friend",  label: "Friendly" };
  if (entry.nonFriends.includes(num2)) return { status: "enemy",   label: "Non-Friendly" };
  if (entry.neutral.includes(num2))    return { status: "neutral",  label: "Neutral" };
  return { status: "neutral", label: "Neutral" };
};

// Returns a full compatibility analysis between mulank and bhagyank
// Returns a full compatibility analysis between mulank and bhagyank
export const getNumberCompatibilityAnalysis = (mulank, bhagyank) => {
  const compat = getCompatibility(mulank, bhagyank);
  const reverseCompat = getCompatibility(bhagyank, mulank);

  // Bug 5 fix: Full planet names with Indian names
  const planetNames = {
    1: "Sun (Surya)",
    2: "Moon (Chandra)",
    3: "Jupiter (Guru)",
    4: "Uranus (Rahu)",
    5: "Mercury (Budh)",
    6: "Venus (Shukar)",
    7: "Neptune (Ketu)",
    8: "Saturn (Shani)",
    9: "Mars (Mangal)"
  };

  const p1 = planetNames[mulank] || "Unknown";
  const p2 = planetNames[bhagyank] || "Unknown";

  let description = "";

  // 1 & 8 or 8 & 1 specialized combination
  if ((mulank === 1 && bhagyank === 8) || (mulank === 8 && bhagyank === 1)) {
    description = `1. THE CONFLICT & REALITY (The Anti-Relationship):
- Mulank ${mulank} (${mulank === 1 ? 'Sun' : 'Saturn'}) and Bhagyank ${bhagyank} (${bhagyank === 8 ? 'Saturn' : 'Sun'}) are governed by the Sun (Surya) and Saturn (Shani), which are mythological and planetary enemies (Anti).
- This creates intense internal and external friction, often manifesting as: father-son conflicts, delays in achieving major success, identity struggles, and heavy duties or responsibilities before the age of 35.

2. THE NEUTRALIZATION & EVOLUTION:
- Over time, this combination acts as a powerful "Neutralizer". The Sun provides vision and leadership, while Saturn instills ultimate discipline, patience, and execution power.
- After the age of 34-36, the 'Anti' friction transitions into a highly stable, powerful 'Neutral' state where you achieve massive material success, corporate leadership, or public authority through sheer perseverance and grit.

3. LO SHU GRID IMPACT:
- The presence of 1 (Water Element / Career Plane) and 8 (Earth Element / Knowledge Plane) affects the grid structure. Water (1) is the source of flow and career drive, while Earth (8) provides knowledge and stability. The relationship requires balancing, as the dry Earth of 8 can absorb and block the career flow of 1, demanding mental flexibility and continuous learning.

4. 100% SPECIFIC REMEDIES (The Bridge):
- Name Numerology: Bring the spelling total of your name to Number 5 (Mercury) which acts as a friendly bridge for both 1 and 8, or Number 6 (Venus) for material harmony.
- Lucky Colors: Strictly avoid Black and Dark Blue in your clothing/surroundings. Instead, choose Royal Blue, Light Greens, or Saffron.
- Actionable Advice: Respect and serve father/mentor figures. Help, donate to, or support laborers and lower-income workers to balance Saturn's karmic energy.`;
  } else {
    // Generate high quality descriptive markdown for other combinations dynamically
    const relationshipType = compat.status === "friend" ? "Friendly / Harmonious" :
                             compat.status === "enemy" ? "Opposing / Challenging" : "Neutral / Balanced";
    
    let conflictReality = "";
    let evolution = "";
    let gridImpact = "";
    let remedies = "";

    if (compat.status === "friend") {
      conflictReality = `- Mulank ${mulank} (${p1}) and Bhagyank ${bhagyank} (${p2}) share a highly favorable, friendly relationship.
- This creates smooth energy flows between your core personality traits and your destiny path. You encounter fewer roadblocks, experience easy recognition, and enjoy natural support from peers and family.`;
      evolution = `- This combination allows for a natural flow of opportunities. Your natural talents align seamlessly with your destiny's timing.
- Success comes relatively early and smoothly. You are able to leverage resources and relationships with ease, leading to sustained progress and emotional satisfaction.`;
      gridImpact = `- The harmonious interaction between these numbers strengthens the plane they reside on. Your Lo Shu grid functions with high coherence, allowing you to convert your plans into physical realities without energy leakage.`;
      remedies = `- Name Numerology: Align your name spelling total with your Lucky Number (Bhagyank) or Mercury (5) to further amplify your success.
- Lucky Colors: Choose colors associated with the dominant planet to enhance your positive aura.
- Actionable Advice: Practice gratitude, maintain charity work, and share your good fortune to sustain positive planetary blessings.`;
    } else if (compat.status === "enemy") {
      conflictReality = `- Mulank ${mulank} (${p1}) and Bhagyank ${bhagyank} (${p2}) share an opposing, challenging relationship.
- This indicates internal friction between your innate desires and the external path of your destiny. You may face repeated trials, misunderstandings in relationships, or unexpected career transitions.`;
      evolution = `- While challenging, this friction forces you to cultivate strength, resilience, and unique problem-solving abilities.
- Over time (typically after age 30), this friction acts as a crucible, refining your character. If handled with discipline and correct remedies, it can lead to unique achievements and deep wisdom.`;
      gridImpact = `- The tension between these opposing numbers creates dynamic polarities in your grid. It requires conscious effort and balancing elements to prevent the stronger number's energy from overpowering the other.`;
      remedies = `- Name Numerology: The ultimate remedy is to bring your Name Spelling Total to a neutral or friendly "Bridge Number" that harmonizes both ruling planets.
- Lucky Colors: Strictly avoid colors that provoke the opposing planet. Focus on neutral, supportive pastel colors.
- Actionable Advice: Practice mindfulness or meditation to manage inner conflicts. Engage in specific charity acts aligned with the weaker planet.`;
    } else {
      conflictReality = `- Mulank ${mulank} (${p1}) and Bhagyank ${bhagyank} (${p2}) share a neutral, balanced relationship.
- This represents a balanced canvas where results depend heavily on your personal effort and choices rather than predetermined ease or friction.`;
      evolution = `- The neutral flow allows you to choose your direction with free will. There is no active planetary opposition, but there is also no effortless push from destiny.
- Success is stable and builds gradually. Your patience and consistent efforts will determine the height of your achievements.`;
      gridImpact = `- Your grid remains balanced and flexible. The energy flows smoothly but requires active stimulation from other active numbers or remedies to reach full potential.`;
      remedies = `- Name Numerology: Align your name spelling total to a highly active friendly number (such as 1, 5, or 6) to give an extra boost of energy to your destiny.
- Lucky Colors: Use colors that blend well with both planets, avoiding extreme dark shades.
- Actionable Advice: Keep a highly structured routine and actively seek out mentor guidance to maintain focus.`;
    }

    description = `1. THE CONFLICT & REALITY (The ${relationshipType} Relationship):
${conflictReality}

2. THE NEUTRALIZATION & EVOLUTION:
${evolution}

3. LO SHU GRID IMPACT:
${gridImpact}

4. 100% SPECIFIC REMEDIES (The Bridge):
${remedies}`;
  }

  return {
    mulankPlanet: p1,
    bhagyankPlanet: p2,
    mulankToBhagyank: compat,
    bhagyankToMulank: reverseCompat,
    overallStatus: compat.status,
    description
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. HIDDEN INFLUENCE OF LO SHU PLANES
//    The 3 horizontal + 3 vertical planes of the original Lo Shu grid:
//      4-9-2 (Mental Plane),  3-5-7 (Emotional Plane),  8-1-6 (Practical Plane)
//      4-3-8 (Left Column),   9-5-1 (Middle Column),    2-7-6 (Right Column)
//    Logic: For each plane, analyse which numbers are present / absent and
//           produce specific interpretations for every combination.
// ─────────────────────────────────────────────────────────────────────────────
const PLANE_INTERPRETATIONS = {
  // ── Horizontal Planes ──────────────────────────────────────────────────
  "mental": {
    name: "Mental Plane (4-9-2)",
    full: "Your mind is razor-sharp. You possess exceptional analytical ability, planning skills, and academic aptitude. All three energies (Rahu, Mars, Moon) work in unison for intellectual mastery.",
    partial: {
      "4,2":   "Strong material thinking and emotional sensitivity, but Number 9 (Mars) missing weakens strategic aggression. You plan well but may avoid conflicts.",
      "9,2":   "Sharp intuition and emotional intelligence, but Number 4 (Rahu) missing weakens practical execution and stability.",
      "4,9":   "Excellent strategist with strong drive, but Number 2 (Moon) missing reduces emotional sensitivity and people-reading ability.",
      "4":     "Only material-practical mindset active. You think in terms of structure and systems but lack emotional and intuitive depth.",
      "9":     "Only Mars energy of the mental plane is active. Strong drive and ambition but struggles with planning and emotional awareness.",
      "2":     "Only Moon energy active. Emotionally intelligent but lacks the intellectual aggression and planning abilities needed for big goals."
    },
    absent: "The Mental Plane (4-9-2) is entirely absent. You may experience difficulty with concentration, memory, academic performance, and strategic thinking. Focus on education remedies and meditation."
  },
  "emotional": {
    name: "Emotional Plane (3-5-7)",
    full: "You possess a highly developed emotional and spiritual nature. Strong compassion, deep intuition, spiritual inclination, and excellent communication with a balanced inner world.",
    partial: {
      "3,7":   "Spiritual and communicative balance is present, but Number 5 (Mercury) missing creates confusion in decision-making and adaptability.",
      "5,7":   "Mercury and Ketu are active — adaptable and spiritual, but Number 3 (Jupiter) missing reduces wisdom, teaching ability, and financial luck.",
      "3,5":   "Expressive and dynamic communication (Jupiter + Mercury), but Number 7 (Ketu) missing weakens spiritual depth and introspection.",
      "3":     "Only Jupiter energy active. You are expressive and philosophical but lack adaptability and the spiritual detachment of Ketu.",
      "5":     "Only Mercury energy active. Quick-witted but emotionally unstable without Jupiter's wisdom and Ketu's calm introspection.",
      "7":     "Only Ketu energy active. You are deeply spiritual but struggle to communicate or adapt this inner wisdom to the outer world."
    },
    absent: "The Emotional Plane (3-5-7) is entirely absent. This indicates difficulty in expressing emotions, suppressed feelings, spiritual disconnect, and challenges in creative communication. Wear Green Aventurine for remedy."
  },
  "practical": {
    name: "Practical Plane (8-1-6)",
    full: "You are a natural achiever in the material world. Saturn's discipline (8), Sun's leadership (1), and Venus's harmony (6) combine for outstanding real-world success, wealth building, and personal magnetism.",
    partial: {
      "1,6":   "Strong leadership and personal charm, but Number 8 (Saturn) missing weakens patience, discipline, and long-term persistence.",
      "8,6":   "Disciplined and artistic, but Number 1 (Sun) missing weakens confidence, authority, and self-assertion.",
      "8,1":   "Powerful discipline and leadership, but Number 6 (Venus) missing weakens relationships, luxury, and aesthetic sensibilities.",
      "8":     "Only Saturn energy active. You work hard but lack the leadership confidence (1) and relational harmony (6) for full material success.",
      "1":     "Only Sun energy active. Natural leader but lacks Saturn's perseverance and Venus's charm and relational skills.",
      "6":     "Only Venus energy active. Creative and relationship-oriented but lacks the drive (1) and discipline (8) for material achievement."
    },
    absent: "The Practical Plane (8-1-6) is entirely absent. Material world achievements may require double the effort. Financial discipline and career growth need active remedies. Wear Blue Sapphire or Hessonite."
  },
  // ── Vertical Planes ────────────────────────────────────────────────────
  "left": {
    name: "Left Column / Thought Plane (4-3-8)",
    full: "Your thought-to-action pipeline is fully energized. Ideas (3-Jupiter) are grounded by structure (4-Rahu) and executed with persistence (8-Saturn). You are a highly effective thinker and doer.",
    partial: {
      "4,8":   "Structured and persistent, but Number 3 (Jupiter) missing weakens optimism, wisdom, and creative ideation.",
      "3,8":   "Creative and persistent, but Number 4 (Rahu) missing weakens organizational ability and stability.",
      "3,4":   "Idealistic and structured, but Number 8 (Saturn) missing weakens endurance and material manifestation.",
      "4":     "Rahu's organizational energy alone — structured but neither creative nor persistent enough for full results.",
      "3":     "Jupiter's creativity alone — full of ideas but lacks the structure and discipline to bring them to fruition.",
      "8":     "Saturn's persistence alone — hardworking but without creative ideas or structural plans, effort is misdirected."
    },
    absent: "The Left Column (4-3-8) is absent. Thinking and planning abilities need development. You may struggle to turn thoughts into productive actions. Meditation and study disciplines are recommended."
  },
  "middle": {
    name: "Middle Column / Willpower Plane (9-5-1)",
    full: "You possess exceptional willpower and determination. Mars's drive (9), Mercury's adaptability (5), and Sun's confidence (1) create an unstoppable force of purposeful action and success.",
    partial: {
      "9,1":   "Strong drive and leadership, but Number 5 (Mercury) missing creates rigidity and lack of adaptability in changing situations.",
      "5,1":   "Adaptable and confident, but Number 9 (Mars) missing weakens competitive drive and assertiveness.",
      "9,5":   "Dynamic and adaptable, but Number 1 (Sun) missing weakens self-confidence and authority.",
      "9":     "Mars alone active — highly driven but struggles with adaptability and self-direction without Mercury and Sun.",
      "5":     "Mercury alone active — highly adaptable and communicative, but lacks the drive and confidence for bold leadership.",
      "1":     "Sun alone active — confident in identity but lacks the drive and adaptability for flexible success."
    },
    absent: "The Middle Column (9-5-1) is absent. Willpower and confidence building are the key areas of focus. Challenges with self-belief and persistence may arise. Wear Ruby for Sun energy activation."
  },
  "right": {
    name: "Right Column / Sensitivity Plane (2-7-6)",
    full: "Your emotional and spiritual sensitivity is fully awakened. Moon's intuition (2), Ketu's spirituality (7), and Venus's love (6) create a deeply empathetic, artistically gifted, and spiritually connected personality.",
    partial: {
      "2,6":   "Emotionally caring and harmonious, but Number 7 (Ketu) missing weakens spiritual depth and introspective wisdom.",
      "7,6":   "Spiritual and artistic, but Number 2 (Moon) missing weakens emotional attunement and intuitive people skills.",
      "2,7":   "Intuitive and spiritual, but Number 6 (Venus) missing weakens love life, artistic expression, and domestic harmony.",
      "2":     "Moon alone active — emotionally sensitive and intuitive, but lacks spiritual depth and artistic expression.",
      "7":     "Ketu alone active — spiritually inclined but disconnected from emotional warmth and relational harmony.",
      "6":     "Venus alone active — loving and artistic, but lacks the intuition (2) and spiritual depth (7) for well-rounded sensitivity."
    },
    absent: "The Right Column (2-7-6) is absent. Emotional disconnection and lack of artistic expression may occur. Relationships may feel shallow. Wear Pearl and Cat's Eye as remedies."
  }
};

export const getHiddenInfluences = (grid) => {
  const planes = [
    { key: "mental",   numbers: [4, 9, 2] },
    { key: "emotional", numbers: [3, 5, 7] },
    { key: "practical", numbers: [8, 1, 6] },
    { key: "left",     numbers: [4, 3, 8] },
    { key: "middle",   numbers: [9, 5, 1] },
    { key: "right",    numbers: [2, 7, 6] }
  ];

  return planes.map(plane => {
    const info = PLANE_INTERPRETATIONS[plane.key];
    const present = plane.numbers.filter(n => grid[n - 1] > 0);
    const absent  = plane.numbers.filter(n => grid[n - 1] === 0);
    const allPresent  = absent.length === 0;
    const allAbsent   = present.length === 0;

    let interpretation;
    if (allPresent) {
      interpretation = info.full;
    } else if (allAbsent) {
      interpretation = info.absent;
    } else {
      // partial: build key from sorted present numbers
      const partialKey = present.slice().sort((a, b) => a - b).join(",");
      interpretation = info.partial[partialKey] ||
        `Numbers ${present.join(", ")} are active, ${absent.join(", ")} are absent. Partial energy of this plane is engaged.`;
    }

    return {
      key: plane.key,
      name: info.name,
      numbers: plane.numbers,
      present,
      absent,
      isActive: allPresent,
      isPartial: !allPresent && !allAbsent,
      isInactive: allAbsent,
      interpretation
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. PERSONAL YEAR EFFECTS (1 through 9)
//    Formula: reduce(birth_month_digits + birth_day_digits + current_year_digits)
//    Gives effects across Health, Finance, Career, Relationship
// ─────────────────────────────────────────────────────────────────────────────
const PERSONAL_YEAR_DATA = {
  1: {
    title: "Year of New Beginnings & Leadership",
    theme: "A powerful year to start fresh. Plant seeds of new ventures, take initiative, and step into leadership roles.",
    health:       "Vitality is high. Avoid overexertion from excessive ambition. Headaches and stress are possible. Exercise regularly. Lucky stone: Ruby.",
    finance:      "Strong year to start new financial ventures or investments. Avoid impulsive spending in first quarter. Business initiatives started now will flourish.",
    career:       "Ideal year for job changes, promotions, or launching independent ventures. Your leadership energy is at its peak — make bold moves.",
    relationship: "New relationships may form, or existing ones enter a fresh cycle. Be careful not to be too self-focused. Partnerships started this year are long-lasting."
  },
  2: {
    title: "Year of Partnership & Emotional Depth",
    theme: "A year to cooperate, build partnerships, and pay attention to emotions. Patience is key — results come through collaboration.",
    health:       "Emotional health is sensitive. Guard against anxiety and mood swings. Digestive system needs attention. Hydration and rest are crucial.",
    finance:      "Avoid major solo financial risks. Partnership deals and collaborations bring better financial outcomes. Savings grow steadily.",
    career:       "Team projects thrive. Avoid confrontational decisions. Best suited for diplomatic roles, partnerships, and nurturing existing projects.",
    relationship: "A very favorable year for relationships and marriage. Deep emotional bonds form. Existing relationships deepen significantly."
  },
  3: {
    title: "Year of Creativity & Expression",
    theme: "A joyful, expansive year of creative output, social connections, and self-expression. Avoid scattering energy.",
    health:       "Generally healthy and energetic. Guard against overindulgence in food and social activities. Throat and skin need attention.",
    finance:      "Multiple income opportunities arise through creative work, social connections, and communication. Avoid impulsive luxury spending.",
    career:       "Excellent for artists, writers, teachers, and communicators. Creative projects launched this year receive recognition.",
    relationship: "Social life is vibrant. New meaningful friendships form. Romance flourishes. Guard against superficial connections."
  },
  4: {
    title: "Year of Hard Work & Foundation Building",
    theme: "A serious, disciplined year requiring consistent effort. Foundations laid now determine long-term success.",
    health:       "Physical health needs monitoring. Avoid overwork leading to fatigue. Bone and spine health deserve attention. Regular exercise is essential.",
    finance:      "Slow but steady financial growth. Avoid risky investments. This is the year to budget, save, and build financial foundations.",
    career:       "Hard work is rewarded. Stability and systematic effort win over shortcuts. Best for long-term career planning and skill development.",
    relationship: "Relationships require practical commitment and effort. Stability and reliability are valued more than romance this year."
  },
  5: {
    title: "Year of Change & Freedom",
    theme: "A dynamic, unpredictable year of exciting changes, travel, and new experiences. Embrace flexibility.",
    health:       "Health fluctuates with your lifestyle changes. Guard against overindulgence and irregular sleep patterns. Nervous system needs attention.",
    finance:      "Unexpected financial opportunities and expenses. Invest in flexible assets. Travel or communication-related businesses flourish.",
    career:       "Major career changes may occur. New roles, industries, or locations beckon. Ideal for entrepreneurs and those seeking freedom.",
    relationship: "Relationships enter exciting new phases or face unexpected changes. Freedom and space are important in partnerships this year."
  },
  6: {
    title: "Year of Responsibility & Harmony",
    theme: "A nurturing year focused on home, family, and taking responsibility. Beauty and harmony are your keywords.",
    health:       "Focus on holistic wellness — diet, beauty, and emotional health. Heart and hormonal health need attention. Yoga and meditation are beneficial.",
    finance:      "Stable financial year tied to home, property, or family matters. Good year for real estate investments and domestic business ventures.",
    career:       "Career success through service, healing, counseling, or creative arts. Recognition comes for your responsible and caring approach.",
    relationship: "A beautiful year for love, marriage, and family bonds. Existing relationships are strengthened. New romantic connections are deep and meaningful."
  },
  7: {
    title: "Year of Inner Wisdom & Spiritual Growth",
    theme: "A contemplative, introspective year for inner development, research, and spiritual understanding.",
    health:       "Mental and nervous system health require attention. Avoid isolation-induced depression. Meditation, sleep, and spiritual practices are protective.",
    finance:      "Not the best year for financial risks. Investments in knowledge, research, and spiritual development pay off long-term.",
    career:       "Ideal for research, analysis, spiritual teaching, healing, and writing. Avoid major career risks — study and introspect instead.",
    relationship: "Relationships may feel introspective or distant. Deep spiritual connections are made. Avoid misunderstandings due to withdrawal behavior."
  },
  8: {
    title: "Year of Power, Material Success & Karma",
    theme: "A karmic, powerful year of material rewards and consequences. What you have worked for arrives. Balance power with wisdom.",
    health:       "Health challenges may arise if lifestyle has been imbalanced. Heart, blood pressure, and stress require monitoring. Balance work and rest.",
    finance:      "Major financial gains or losses depending on past actions. Business deals reach fruition. Real estate, stocks, and authority-based roles pay well.",
    career:       "Best year for career advancement, authority roles, and major financial decisions. Leadership recognition and power positions are attainable.",
    relationship: "Power dynamics in relationships require balance. Strong commitments are made. Guard against domination or control tendencies."
  },
  9: {
    title: "Year of Completion, Release & Transformation",
    theme: "A year of endings and completion. Release what no longer serves you. Prepare for a brand new 9-year cycle.",
    health:       "Emotional and physical detoxification is needed. Let go of old health habits. Nervous system and immunity need strengthening.",
    finance:      "Complete old financial obligations. Avoid starting major new financial ventures. Clearing debts creates space for next cycle abundance.",
    career:       "Career completions and endings occur. Charitable, humanitarian, and service-oriented work brings satisfaction and recognition.",
    relationship: "Some relationships end or transform. Forgiveness and letting go are themes. Those that remain are purified and more authentic."
  }
};

export const getPersonalYearData = (personalYear) => {
  return PERSONAL_YEAR_DATA[personalYear] || PERSONAL_YEAR_DATA[1];
};

// Calculate personal year for any given calendar year
export const calcPersonalYearForYear = (dob, year) => {
  const parts = dob.split("-");
  const mmdd = parts[1] + parts[2];
  const total =
    mmdd.split("").reduce((a, d) => a + parseInt(d), 0) +
    String(year).split("").reduce((a, d) => a + parseInt(d), 0);
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
  const mulankTraits = getTraits(mulank);

  // Use full Lo Shu grid including Mulank, Bhagyank & Kua (per client spec)
  const kuaNum = calculateKua(dob, gender);
  const loShuGrid = calculateLoShuGrid(dob, [mulank, bhagyank, kuaNum]);
  const presentNumbers = getPresentNumbers(loShuGrid);
  const missingNums = getMissingNumbers(loShuGrid);
  const elements = getLuckyElements(bhagyank, mulank, kuaNum);

  // Dynamic key traits from TRAITS data
  const KEY_TRAITS_MAP = {
    1: ["Natural leader and trailblazer", "Self-reliant and highly independent", "Original thinker with strong willpower", "Ambitious and goal-oriented achiever", "Commands respect and authority easily"],
    2: ["Highly empathetic and emotionally intelligent", "Natural peacemaker and diplomat", "Deeply intuitive and perceptive", "Works best in partnerships and collaboration", "Artistic and imaginative by nature"],
    3: ["Creative expression is their greatest gift", "Excellent communicator and social connector", "Optimistic, joyful, and inspiring to others", "Natural teacher, writer, or entertainer", "Thrives in creative and expressive roles"],
    4: ["Disciplined builder of lasting foundations", "Systematic, organized, and methodical thinker", "Extremely loyal and dependable partner", "Thrives on structure, routine, and hard work", "Long-term planner with exceptional endurance"],
    5: ["Freedom-seeker and adventurous spirit", "Highly adaptable to change and new experiences", "Quick-witted and versatile communicator", "Natural salesperson and marketing talent", "Thrives in dynamic, multi-tasking environments"],
    6: ["Deeply caring, nurturing, and responsible", "Natural healer and protector of loved ones", "Strong sense of beauty, harmony, and aesthetics", "Excels in family, home, and community roles", "Artistic and creatively gifted individual"],
    7: ["Deep analytical thinker and researcher", "Strong spiritual inclination and intuition", "Seeker of truth and hidden knowledge", "Private, introspective, and self-reliant", "Excellent in technical, scientific, and occult fields"],
    8: ["Powerhouse of ambition and material success", "Natural authority and commanding presence", "Strong karmic understanding of cause and effect", "Excellence in business, finance, and management", "Persistent and resilient under pressure"],
    9: ["Compassionate humanitarian at heart", "Broad-minded and deeply philosophical", "Natural leader in social and global causes", "Generous, giving, and selfless by nature", "Completes what others cannot finish"],
    11: ["Highly intuitive spiritual messenger", "Inspirational and visionary thinker", "Bridges the physical and spiritual realms", "Powerful healer and teacher", "Sensitive to the needs of humanity"],
    22: ["Master architect of grand visions", "Bridges idealism with practical reality", "Extraordinary capacity for large-scale projects", "Natural leader on a global scale", "Manifests what others only dream"],
    33: ["Pure channel of unconditional love", "Master healer and compassionate teacher", "Selfless service to the world at large", "Deeply spiritual and emotionally evolved", "Creates healing through wisdom and love"]
  };

  // Dynamic personality content based on mulank + bhagyank
  const PLANET_NAMES_SHORT = {
    1: "Sun", 2: "Moon", 3: "Jupiter", 4: "Rahu", 5: "Mercury",
    6: "Venus", 7: "Ketu", 8: "Saturn", 9: "Mars"
  };
  const mulankPlanet  = PLANET_NAMES_SHORT[mulank]  || "Sun";
  const bhagyankPlanet = PLANET_NAMES_SHORT[bhagyank] || "Moon";
  const compat = getCompatibility(mulank, bhagyank);
  const compatText = compat.status === "friend"
    ? "This creates a powerful cosmic harmony — your birth energy and destiny path are aligned, leading to smooth personal growth and career success."
    : compat.status === "enemy"
    ? "This creates inner tension between your birth energy and destiny path. With conscious effort, remedies, and alignment with lucky numbers, you can overcome these challenges."
    : "Your birth energy and destiny path have a neutral interaction. Neither strongly supportive nor opposing, outcomes are largely shaped by your choices and consistent effort.";

  const personalityContent = `Your Psychic Number ${mulank} is ruled by ${mulankPlanet}, shaping your core personality and daily impulses. Your Destiny Number ${bhagyank} is ruled by ${bhagyankPlanet}, guiding the long-term direction of your life's achievements. ${compatText} Your most productive periods come when you actively work with your lucky numbers and favorable dates to align your actions with cosmic timing.`;

  // Dynamic date influencer content
  const dayNum = parseInt(dob.split("-")[2]);
  const DATE_INFLUENCER_CONTENT = {
    1: "Born on the 1st, you are a natural initiator. Sun energy gives you remarkable leadership and an unbreakable drive. You achieve greatest success in independent ventures and pioneering roles.",
    2: "Born on the 2nd, Moon energy makes you highly intuitive and empathetic. You excel in partnerships, counseling, and creative arts. Your sensitivity is your greatest strength.",
    3: "Born on the 3rd, Jupiter blesses you with wisdom, optimism, and excellent communication. You thrive in teaching, writing, and creative expression roles.",
    4: "Born on the 4th, Rahu energy makes you unconventional and analytically sharp. You excel in technology, research, and building reliable structures.",
    5: "Born on the 5th, Mercury gives you quick wit and adaptability. Sales, marketing, travel, and communication are your natural domains.",
    6: "Born on the 6th, Venus bestows charm, aesthetic sensitivity, and a nurturing nature. You shine in creative, hospitality, and family-oriented roles.",
    7: "Born on the 7th, Neptune (Ketu) energy deepens your spiritual awareness and analytical mind. You are drawn to research, occult sciences, and spiritual paths.",
    8: "Born on the 8th, Saturn energy provides exceptional discipline and material manifestation ability. Business, authority roles, and long-term investments favor you.",
    9: "Born on the 9th, Mars infuses you with courage, drive, and humanitarian passion. You excel in leadership, defense, sports, and social causes.",
    10: "Born on the 10th (reduces to 1), you carry strong Sun energy — a natural leader who inspires others and achieves remarkable independence.",
    11: "Born on the 11th (Master Number), you are a highly intuitive spiritual messenger. Inspiration, healing, and visionary thinking define your life path.",
    12: "Born on the 12th (reduces to 3), Jupiter's creative and expressive energy flows through you — a natural communicator and creative mind.",
    13: "Born on the 13th (reduces to 4), Rahu energy combined with disciplined Saturnian influence makes you a determined builder of lasting structures.",
    14: "Born on the 14th (reduces to 5), you carry dynamic Mercury energy — versatile, communicative, and naturally drawn to variety and change.",
    15: "Born on the 15th (reduces to 6), you carry strong Venus energy amplified by the Sun — charismatic, creative, and deeply nurturing.",
    16: "Born on the 16th (reduces to 7), you are spiritually inclined and analytically gifted — drawn to deeper truths and solitary contemplation.",
    17: "Born on the 17th (reduces to 8), Saturn's karmic power and the visionary 7 combine for powerful material manifestation and authority.",
    18: "Born on the 18th (reduces to 9), Mars energy is amplified — you are a natural warrior for justice with a humanitarian heart.",
    19: "Born on the 19th (reduces to 1), Sun energy is doubly strong — exceptional leadership potential and the drive to overcome all obstacles.",
    20: "Born on the 20th (reduces to 2), Moon energy is magnified — deeply intuitive, emotionally rich, and naturally skilled in creating harmony.",
    21: "Born on the 21st (reduces to 3), Jupiter's wisdom combines with the Moon's creativity — an inspired and expressive communicator.",
    22: "Born on the 22nd (Master Number), you carry the vibration of a Master Builder — capable of manifesting extraordinary visions into reality.",
    23: "Born on the 23rd (reduces to 5), you carry the Royal Star of the Lion — highly adaptable, communicative, and naturally charismatic.",
    24: "Born on the 24th (reduces to 6), Venus energy combined with Moon nurturing makes you a natural caretaker with great artistic gifts.",
    25: "Born on the 25th (reduces to 7), you have powerful spiritual insight and analytical depth — a seeker of wisdom and hidden truths.",
    26: "Born on the 26th (reduces to 8), Saturn's discipline meets Venus's creativity — strong material manifestation with artistic sensibility.",
    27: "Born on the 27th (reduces to 9), Mars energy is refined by spiritual 7 — a courageous humanitarian with deep compassion.",
    28: "Born on the 28th (reduces to 1), Sun leadership is tempered by the Moon and Saturn — a balanced leader who builds lasting legacies.",
    29: "Born on the 29th (reduces to 11), Moon and Mars combine with Master 11 energy — deeply intuitive and inspired by a higher calling.",
    30: "Born on the 30th (reduces to 3), pure Jupiter energy flows through you — a natural teacher, philosopher, and creative expression master.",
    31: "Born on the 31st (reduces to 4), Rahu and Jupiter combine — an innovative builder who thinks outside conventional frameworks."
  };

  // Dynamic missing number remedies from actual grid
  const missingNumbersRemedies = missingNums.map(num => ({
    num,
    ...getMissingNumberRemedyData(num)
  }));

  // Dynamic future predictions using personal year formula
  const currentYear = new Date().getFullYear();
  const futurePredictions = {};
  for (let i = 0; i < 3; i++) {
    const yr = currentYear + i;
    const pyNum = calcPersonalYearForYear(dob, yr);
    const pyData = getPersonalYearData(pyNum);
    futurePredictions[`year${i + 1}`] = {
      year: yr,
      personalYear: pyNum,
      title: pyData.title.toUpperCase(),
      desc: pyData.theme,
      health: pyData.health,
      finance: pyData.finance,
      career: pyData.career,
      relationship: pyData.relationship
    };
  }

  // Dynamic repeated numbers influence map
  const REPEATED_INFLUENCE = {
    1: "Amplified Sun energy: strong willpower, authority, and leadership. Can become domineering if unchecked.",
    2: "Amplified Moon energy: heightened sensitivity, intuition, and emotional depth. Guard against mood swings.",
    3: "Amplified Jupiter energy: exceptional wisdom, creative expression, and luck. A highly auspicious repetition.",
    4: "Amplified Rahu energy: intense organizational drive and unconventional thinking. Can cause restlessness.",
    5: "Amplified Mercury energy: exceptional communication skills and adaptability. Guard against scattered focus.",
    6: "Amplified Venus energy: magnetic charm, artistic gifts, and nurturing ability. Very favorable for love life.",
    7: "Amplified Neptune (Ketu) energy: deep spiritual insight and analytical capability. Can lead to isolation.",
    8: "Amplified Saturn energy: exceptional discipline and material manifestation power. Karmic responsibility increases.",
    9: "Amplified Mars energy: extraordinary courage and humanitarian drive. Guard against aggression."
  };

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
      keyTraits: KEY_TRAITS_MAP[mulank] || KEY_TRAITS_MAP[1],
    },
    expressionTraits: {
      ...expressionTraits,
      keyTraits: KEY_TRAITS_MAP[bhagyank] || KEY_TRAITS_MAP[1],
    },
    dateInfluencer: {
      title: `Date Influencer — Born on ${dayNum}`,
      desc: `People born on ${dayNum}, ${dayNum + 9 <= 31 ? dayNum + 9 : ''} ${dayNum + 18 <= 31 ? ', ' + (dayNum + 18) : ''} share this birth energy.`.trim(),
      content: DATE_INFLUENCER_CONTENT[dayNum] || `Born on the ${dayNum}th, you carry a unique blend of planetary energies that shapes your personality, strengths, and life path in distinctive ways.`,
    },
    personalityAnalysis: {
      title: `Mulank ${mulank} (${mulankPlanet}) + Bhagyank ${bhagyank} (${bhagyankPlanet}) Combination`,
      content: personalityContent,
    },
    luckyElements: {
      luckyDates: elements.luckyDates,
      unluckyDates: elements.unluckyDates,
      luckyColor: elements.luckyColor,
      unluckyColor: elements.unluckyColor,
      luckyDirection: elements.luckyDirection,
      kuaColors: elements.kuaColors,
      kuaTheme: elements.kuaTheme,
      element: elements.element,
      planetEnergy: elements.planetEnergy,
    },
    repeatedNumbersAnalysis: presentNumbers.filter(n => n.count > 1).map(n => ({
      num: n.num,
      count: n.count,
      influence: REPEATED_INFLUENCE[n.num] || `Enhanced qualities of Number ${n.num} — its planetary energy is amplified in your chart.`
    })),
    suitableProfessions: getCareerOutlook(mulank, bhagyank).professionsList,
    missingNumbersRemedies,
    futurePredictions,
    affirmations: getAffirmations(lifePath),
    customPage1: { title: 'Note Page 1', content: '' },
    customPage2: { title: 'Note Page 2', content: '' },
    customPage3: { title: 'Note Page 3', content: '' },
  };
};


// ─────────────────────────────────────────────────────────────────────────────
// MOBILE COMPATIBILITY CHECK — Strict Planetary Matrix Logic (Client Spec)
// ─────────────────────────────────────────────────────────────────────────────

const COMPOUND_RATING = {
  // "Good" compounds (highly auspicious in Chaldean)
  good: [1, 3, 5, 6, 9, 10, 14, 15, 19, 21, 23, 24, 27, 28, 33, 37, 41, 46, 50, 55, 64, 69],
  // "Average" compounds
  average: [2, 7, 11, 16, 20, 25, 26, 31, 32, 38, 43, 47, 51, 52, 56, 60, 65],
  // "Bad" compounds
  bad: [4, 8, 13, 17, 18, 22, 26, 29, 30, 35, 36, 39, 40, 44, 48, 49, 53, 54],
};

const getCompoundRating = (compound) => {
  if (COMPOUND_RATING.good.includes(compound)) return { label: 'Very Good', stars: '★★★★★' };
  if (COMPOUND_RATING.bad.includes(compound))  return { label: 'Bad',       stars: '★☆☆☆☆' };
  return { label: 'Average', stars: '★★★☆☆' };
};

const getRelationLabel = (status) => {
  if (status === 'friend')  return 'Good Friend';
  if (status === 'enemy')   return 'Non-Friend';
  return 'Neutral';
};

// Returns best common friendly numbers between driver and conductor
const getBestMobileNumbers = (mulank, bhagyank) => {
  const m = COMPATIBILITY_TABLE[mulank]?.friends || [];
  const b = COMPATIBILITY_TABLE[bhagyank]?.friends || [];
  const common = [...new Set([...m, ...b])].filter(n => m.includes(n) && b.includes(n));
  return common.length > 0 ? common : [...new Set([...m, ...b])].slice(0, 4);
};

// Returns digits that should be avoided in the mobile number
const getDigitsToAvoid = (mulank, bhagyank) => {
  const me = COMPATIBILITY_TABLE[mulank]?.nonFriends || [];
  const be = COMPATIBILITY_TABLE[bhagyank]?.nonFriends || [];
  return [...new Set([...me, ...be])];
};

export const getMobileCompatibilityCheck = (phone, mulank, bhagyank, dob = '') => {
  if (!phone || phone.trim() === '' || phone === '-') {
    return { isValid: false };
  }

  let digits = phone.replace(/\D/g, '');
  if (digits.length > 10) digits = digits.slice(-10);
  if (digits.length === 0) return { isValid: false };

  const totalSum   = digits.split('').reduce((s, d) => s + parseInt(d, 10), 0);
  const singleDigit = reduceToSingle(totalSum);

  const mCompat = getCompatibility(singleDigit, mulank);
  const bCompat = getCompatibility(singleDigit, bhagyank);

  const mLabel = getRelationLabel(mCompat.status);
  const bLabel = getRelationLabel(bCompat.status);

  // Overall status: Friendly / Neutral / Non-Friendly
  let overallStatus = 'Neutral';
  if (mCompat.status === 'enemy' || bCompat.status === 'enemy') {
    overallStatus = 'Non-Friendly';
  } else if (mCompat.status === 'friend' || bCompat.status === 'friend') {
    overallStatus = 'Friendly';
  } else {
    overallStatus = 'Neutral';
  }

  const PLANET_NAMES = {
    1: 'Sun (Surya)',
    2: 'Moon (Chandra)',
    3: 'Jupiter (Guru)',
    4: 'Rahu (Uranus)',
    5: 'Mercury (Budh)',
    6: 'Venus (Shukra)',
    7: 'Ketu (Neptune)',
    8: 'Saturn (Shani)',
    9: 'Mars (Mangal)'
  };

  const planet = PLANET_NAMES[singleDigit] || 'Planet';

  // Bullet 1: Total calculation and base nature
  const b1 = `The mobile number compound total is ${totalSum}, reducing to single digit ${singleDigit}, which is ruled by ${planet} and represents its base qualities.`;

  // Bullet 2: Relation with Mulank
  let b2 = '';
  if (mCompat.status === 'friend') {
    b2 = `The single digit sum ${singleDigit} is friendly with your Driver ${mulank}, creating an active flow of supportive and constructive energy.`;
  } else if (mCompat.status === 'enemy') {
    b2 = `The single digit sum ${singleDigit} is non-friendly with your Driver ${mulank}, creating planetary friction and potential obstacles in your daily actions.`;
  } else {
    b2 = `The single digit sum ${singleDigit} is neutral with your Driver ${mulank}, offering a stable and balanced relationship with your root energy.`;
  }

  // Bullet 3: Relation with Bhagyank
  let b3 = '';
  if (bCompat.status === 'friend') {
    b3 = `It has a friendly relationship with your Conductor ${bhagyank}, which aligns with your destiny path and supports overall progress.`;
  } else if (bCompat.status === 'enemy') {
    b3 = `It conflicts with your Conductor ${bhagyank}, introducing underlying friction that can delay key goals or destiny outcomes.`;
  } else {
    b3 = `It maintains a neutral relationship with your Conductor ${bhagyank}, avoiding clashes and keeping your destiny path unhindered.`;
  }

  // Bullet 4: Lo Shu / DOB digit support or missing energy
  const dobDigits = (dob || '').replace(/\D/g, '');
  const hasDigit = dobDigits.includes(singleDigit.toString());
  let b4 = '';
  if (hasDigit) {
    b4 = `The number ${singleDigit} is already present in your birth date, reinforcing your native planetary energies and strengthening your grid's stability.`;
  } else {
    b4 = `Since the number ${singleDigit} is missing from your birth date, using this mobile number acts as an energetic remedy, introducing this much-needed vibration into your life.`;
  }

  // Bullet 5: Practical effect or caution
  let b5 = '';
  if (overallStatus === 'Friendly') {
    b5 = `Using this vibration regularly will attract positive communication, helpful business leads, and smooth interpersonal relationships.`;
  } else if (overallStatus === 'Non-Friendly') {
    b5 = `Caution is advised: this frequency may trigger sudden misunderstandings, dropped leads, or unexpected professional delays.`;
  } else {
    b5 = `It serves as a reliable, balanced connection for routine communications without causing any major positive or negative disruptions.`;
  }

  // Bullet 6: Final conclusion bullet
  let b6 = '';
  if (overallStatus === 'Friendly') {
    b6 = `Overall, this mobile number is highly favorable for you, and keeping it active will enhance your prosperity and communication.`;
  } else if (overallStatus === 'Non-Friendly') {
    b6 = `Overall, this mobile number is not recommended due to direct planetary clashes, and transitioning to a friendly total sum is suggested.`;
  } else {
    b6 = `Overall, this mobile number is neutral, offering steady performance without causing any adverse planetary friction.`;
  }

  const bullets = [b1, b2, b3, b4, b5, b6];

  const cRating = getCompoundRating(totalSum);
  const bestNums   = getBestMobileNumbers(mulank, bhagyank);
  const avoidDigits = getDigitsToAvoid(mulank, bhagyank);
  const goodToHave  = `Try to have number sum in between ${bestNums.join(', ')}.`;
  const avoidSentence = avoidDigits.length > 0
    ? `It is recommended that the number does not include the digits ${avoidDigits.join(' or ')}.`
    : 'No specific digits to avoid based on your planetary matrix.';

  return {
    isValid: true,
    phone: digits,
    totalSum,
    singleDigit,
    mulank,
    bhagyank,
    bullets,
    overallStatus,
    goodToHave,
    avoidSentence,
    driverRelation:    mLabel,
    conductorRelation: bLabel,
    compoundRating:    cRating,
    bestNumbers:       bestNums,
    avoidDigits,
    isCompatible: overallStatus === 'Friendly',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// NAME NUMEROLOGY CHECK — Strict Planetary Matrix Logic (Client Spec)
// ─────────────────────────────────────────────────────────────────────────────

// Chaldean map (same as calcChaldeanName but standalone for sub-name calc)
const CHALDEAN_STRICT = {
  A:1, I:1, J:1, Q:1, Y:1,
  B:2, K:2, R:2,
  C:3, G:3, L:3, S:3,
  D:4, M:4, T:4,
  E:5, H:5, N:5, X:5,
  U:6, V:6, W:6,
  O:7, Z:7,
  F:8, P:8
};

const chaldeanOf = (str) => {
  if (!str) return 0;
  const letters = str.toUpperCase().replace(/[^A-Z]/g, '').split('');
  return letters.reduce((s, c) => s + (CHALDEAN_STRICT[c] || 0), 0);
};

const compoundAndSingle = (str) => {
  if (!str) return { compound: 0, single: 0 };
  const compound = chaldeanOf(str);
  return { compound, single: reduceToSingle(compound) };
};

export const getNameNumerologyCheck = (name, mulank, bhagyank) => {
  if (!name || name.trim() === '') {
    return { isValid: false };
  }

  // Split into first name and last name
  const parts       = name.trim().split(/\s+/);
  const firstName   = parts[0] || '';
  const lastName    = parts.slice(1).join(' ') || '';

  const fn = compoundAndSingle(firstName);
  const ln = lastName ? compoundAndSingle(lastName) : null;
  const full = compoundAndSingle(name);

  // ── First Name Analysis ──────────────────────────────────────────────────
  const fnNot48      = fn.single !== 4 && fn.single !== 8;
  const fnMCompat    = getCompatibility(fn.single, mulank);
  const fnBCompat    = getCompatibility(fn.single, bhagyank);
  const fnMLabel     = getRelationLabel(fnMCompat.status);
  const fnBLabel     = getRelationLabel(fnBCompat.status);
  const fnCRating    = getCompoundRating(fn.compound);

  const firstNameCard = {
    name:         firstName,
    compound:     fn.compound,
    single:       fn.single,
    not48Check:   fnNot48,
    compatLine:   `Sum of First Name number is ${fn.single} which is ${fnMLabel} with Driver ${mulank} and ${fnBLabel} with Conductor ${bhagyank}.`,
    compoundLine: `First Name Combination Count is ${fn.compound} which is ${fnCRating.label} and rating is ${fnCRating.stars}.`,
    driverStatus:    fnMCompat.status,
    conductorStatus: fnBCompat.status,
    overallGood: fnNot48 && (fnMCompat.status !== 'enemy') && (fnBCompat.status !== 'enemy'),
  };

  // ── Last Name Analysis ────────────────────────────────────────────────────
  let lastNameCard = null;
  if (ln) {
    const lnNot48   = ln.single !== 4 && ln.single !== 8;
    const lnMCompat = getCompatibility(ln.single, mulank);
    const lnBCompat = getCompatibility(ln.single, bhagyank);
    const lnMLabel  = getRelationLabel(lnMCompat.status);
    const lnBLabel  = getRelationLabel(lnBCompat.status);
    const lnCRating = getCompoundRating(ln.compound);
    lastNameCard = {
      name:         lastName,
      compound:     ln.compound,
      single:       ln.single,
      not48Check:   lnNot48,
      compatLine:   `Sum of Last Name number is ${ln.single} which is ${lnMLabel} with Driver ${mulank} and ${lnBLabel} with Conductor ${bhagyank}.`,
      compoundLine: `Last Name Combination Count is ${ln.compound} which is ${lnCRating.label} and rating is ${lnCRating.stars}.`,
      driverStatus:    lnMCompat.status,
      conductorStatus: lnBCompat.status,
      overallGood: lnNot48 && (lnMCompat.status !== 'enemy') && (lnBCompat.status !== 'enemy'),
    };
  }

  // ── Full Name Analysis ────────────────────────────────────────────────────
  const fullNot48     = full.single !== 4 && full.single !== 8;
  const fullMCompat   = getCompatibility(full.single, mulank);
  const fullBCompat   = getCompatibility(full.single, bhagyank);
  const fullMLabel    = getRelationLabel(fullMCompat.status);
  const fullBLabel    = getRelationLabel(fullBCompat.status);
  const fullTargetOk  = [1, 3, 5, 6].includes(full.single);
  const fullCRating   = getCompoundRating(full.compound);

  const fullNameCard = {
    name:          name,
    compound:      full.compound,
    single:        full.single,
    not48Check:    fullNot48,
    compatLine:    `Sum of Full Name number is ${full.single} which is ${fullMLabel} with Driver ${mulank} and ${fullBLabel} with Conductor ${bhagyank}.`,
    targetLine:    fullTargetOk
      ? `Full Name Count is ${full.single} which is in the ideal range (1, 3, 5 or 6). ✓`
      : `Full Name Count should be 1, 3, 5 or 6. Currently it is ${full.single}.`,
    compoundLine:  `Full Name Combination Count is ${full.compound} — rating is ${fullCRating.stars} (${fullCRating.label}).`,
    targetOk:      fullTargetOk,
    driverStatus:  fullMCompat.status,
    conductorStatus: fullBCompat.status,
    overallGood:   fullNot48 && fullTargetOk && (fullMCompat.status !== 'enemy') && (fullBCompat.status !== 'enemy'),
  };

  // ── Final Status ─────────────────────────────────────────────────────────
  const isBalanced = firstNameCard.overallGood && fullNameCard.overallGood;
  const finalStatus = isBalanced ? 'Name Balanced ✓' : 'Name Not Balanced ✗';
  const finalStatusGood = isBalanced;

  return {
    isValid: true,
    firstName,
    lastName,
    fullName: name,
    firstNameCard,
    lastNameCard,
    fullNameCard,
    finalStatus,
    finalStatusGood,
  };
};


// ─────────────────────────────────────────────────────────────────────────────
// FOREIGN SETTLEMENT PREDICTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export const getForeignSettlement = (dob, mulank, bhagyank) => {
  const grid = calculateLoShuGrid(dob, [mulank, bhagyank]);
  const presentNums = [];
  const missingNums = [];
  for (let i = 1; i <= 9; i++) {
    if (grid[i - 1] > 0) presentNums.push(i);
    else missingNums.push(i);
  }

  const has5 = presentNums.includes(5);
  const has6 = presentNums.includes(6);
  const missing5 = missingNums.includes(5);
  const missing6 = missingNums.includes(6);

  // ── Rule 1 & 2: Core 5 & 6 check ──────────────────────────────────────────
  let baseChance;
  let coreResult;
  let coreGood;

  if (missing5 && missing6) {
    baseChance = 15;
    coreResult = 'If 5 & 6 Both Missing in the grid, Less chances for foreign settlement.';
    coreGood = false;
  } else if (has5 && has6) {
    baseChance = 85;
    coreResult = 'Strong elements for international travel found. High chances for foreign settlement.';
    coreGood = true;
  } else if (has5 || has6) {
    baseChance = 50;
    coreResult = has5
      ? 'Number 5 (travel energy) is present but 6 (comforts abroad) is missing. Moderate chances for foreign settlement.'
      : 'Number 6 (foreign comforts) is present but 5 (travel energy) is missing. Moderate chances for foreign settlement.';
    coreGood = false;
  } else {
    baseChance = 30;
    coreResult = 'Travel-support numbers are partially absent. Limited foreign settlement potential.';
    coreGood = false;
  }

  // ── Rule 3: Driver/Conductor friction with travel numbers (2, 5, 6) ────────
  const travelNums = [2, 5, 6];
  const frictionLines = [];

  travelNums.forEach(tn => {
    const dComp = getCompatibility(mulank, tn);
    const bComp = getCompatibility(bhagyank, tn);
    if (dComp.status === 'enemy') {
      frictionLines.push(`Driver ${mulank} is a Non-Friend to Number ${tn} — initial visa delays or travel friction possible.`);
    }
    if (bComp.status === 'enemy') {
      frictionLines.push(`Conductor ${bhagyank} is a Non-Friend to Number ${tn} — persistence is key to overcome settlement hurdles.`);
    }
  });

  // Adjustment for driver/conductor relationship
  const driverToFive  = getCompatibility(mulank, 5).status;
  const conductorToSix = getCompatibility(bhagyank, 6).status;

  let planetaryNote = '';
  if (driverToFive === 'friend' && conductorToSix === 'friend') {
    planetaryNote = `Driver ${mulank} is friendly to Number 5 and Conductor ${bhagyank} is friendly to Number 6 — both energies support foreign settlement strongly.`;
    baseChance = Math.min(baseChance + 10, 95);
  } else if (driverToFive === 'enemy' || conductorToSix === 'enemy') {
    planetaryNote = `Since ${driverToFive === 'enemy' ? `Driver ${mulank}` : `Conductor ${bhagyank}`} carries friction with travel numbers, balancing these missing elements with remedies is highly recommended.`;
    baseChance = Math.max(baseChance - 10, 10);
  } else {
    planetaryNote = `Driver ${mulank} and Conductor ${bhagyank} maintain a neutral-to-supportive stance on foreign travel energies. Focused effort will yield results.`;
  }

  return {
    presentNums,
    missingNums,
    coreResult,
    coreGood,
    probabilityScore: baseChance,
    frictionLines,
    planetaryNote,
    has5,
    has6,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// MATCH MAKING COMPATIBILITY ENGINE
// ─────────────────────────────────────────────────────────────────────────────

// Cross-grid pair compatibility table (Male num ⇌ Female num that balance)
const BALANCE_PAIRS = [
  [2, 7], [7, 2],
  [4, 5], [5, 4],
  [1, 6], [6, 1],
  [3, 9], [9, 3],
  [1, 2], [2, 1],
  [8, 5], [5, 8],
];

export const getMatchMaking = (maleData, femaleData) => {
  // maleData / femaleData: { name, dob, mulank, bhagyank, grid[] }
  const { name: mName, mulank: mDriver, bhagyank: mConductor, grid: mGrid = [] } = maleData;
  const { name: fName, mulank: fDriver, bhagyank: fConductor, grid: fGrid = [] } = femaleData;

  let totalPct = 0;
  const boostLogs = [];
  const highlights = [];
  const sharedPairs = [];

  // ── 1. Driver Dominance Check ─────────────────────────────────────────────
  const driverCompat = getCompatibility(mDriver, fDriver);
  if (driverCompat.status === 'friend') {
    totalPct += 30;
    boostLogs.push(`${mName} has driver ${mDriver} which is a Good Friend to ${fName}'s driver ${fDriver}. This adds a positive impact and boosts profile compatibility by 30%.`);
    highlights.push(`Both driver numbers are harmonious — a strong foundation for the relationship.`);
  } else if (driverCompat.status === 'enemy') {
    totalPct += 5;
    boostLogs.push(`${mName}'s driver ${mDriver} and ${fName}'s driver ${fDriver} are Non-Friends. Personality clashes are possible — compatibility adds only 5%.`);
    highlights.push(`Driver numbers clash — differences in core nature require conscious effort.`);
  } else {
    totalPct += 15;
    boostLogs.push(`${mName}'s driver ${mDriver} is Neutral to ${fName}'s driver ${fDriver}. This brings a stable but neutral energy, adding 15%.`);
    highlights.push(`Driver numbers are neutral — the relationship is stable but needs nurturing.`);
  }

  // ── 2. Marriage Core: 5 & 6 across both grids ────────────────────────────
  const allNums = [...new Set([...mGrid, ...fGrid])];
  if (allNums.includes(5) && allNums.includes(6)) {
    totalPct += 5;
    boostLogs.push(`For marriage relations, presence of 5 and 6 across the combined grids is extremely auspicious. This gives a boost of 5% to this profile!`);
    highlights.push(`Auspicious numbers 5 & 6 are present across the combined grids — excellent for a lasting bond.`);
  }

  // ── 3. Number Sharing (cross-grid balance pairs) ─────────────────────────
  let pairsFound = 0;
  BALANCE_PAIRS.forEach(([mNum, fNum]) => {
    if (mGrid.includes(mNum) && fGrid.includes(fNum)) {
      const key = `${Math.min(mNum, fNum)} ⇌ ${Math.max(mNum, fNum)}`;
      if (!sharedPairs.some(p => p.pair === key)) {
        sharedPairs.push({ pair: key, mNum, fNum });
        totalPct += 10;
        pairsFound++;
        boostLogs.push(`${mName} can share ${mNum} and ${fName} can share ${fNum}. This will add 10% to profile match.`);
      }
    }
  });
  if (pairsFound >= 2) {
    highlights.push(`${pairsFound} number pairs are being shared across Lo Shu grids — this balances out the negative impacts of each other.`);
  } else if (pairsFound === 1) {
    highlights.push(`One balancing number pair found across grids — a positive signal for mutual understanding.`);
  } else {
    highlights.push(`No direct number-sharing pairs found — independent energy profiles.`);
  }

  // ── 4. Conductor bonus ────────────────────────────────────────────────────
  const conductorCompat = getCompatibility(mConductor, fConductor);
  if (conductorCompat.status === 'friend') {
    totalPct += 10;
    boostLogs.push(`Conductor ${mConductor} (${mName}) is friendly to Conductor ${fConductor} (${fName}) — long-term life paths align. +10%.`);
  }

  totalPct = Math.min(totalPct, 100);

  // ── Star Rating Scale ────────────────────────────────────────────────────
  let stars, ratingLabel;
  if (totalPct >= 80) {
    stars = 5;
    ratingLabel = 'Excellent Compatibility';
  } else if (totalPct >= 50) {
    stars = totalPct >= 65 ? 4 : 3;
    ratingLabel = 'Moderate Compatibility';
  } else {
    stars = totalPct >= 30 ? 2 : 1;
    ratingLabel = 'Low Compatibility';
  }

  return {
    totalPercentage: totalPct,
    stars,
    ratingLabel,
    highlights,
    sharedPairs,
    boostLogs,
    driverCompatStatus: driverCompat.status,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// LOVE vs ARRANGED MARRIAGE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export const getMarriageType = (dob, mulank, bhagyank) => {
  const grid = calculateLoShuGrid(dob, [mulank, bhagyank]);
  const presentNums = [];
  const missingNums = [];
  for (let i = 1; i <= 9; i++) {
    if (grid[i - 1] > 0) presentNums.push(i);
    else missingNums.push(i);
  }

  let lovePct = 40;   // base
  let arrangePct = 40; // base
  const comments = [];

  // ── Rule 1: Driver/Conductor relationship ─────────────────────────────────
  const dcRelation = getCompatibility(mulank, bhagyank);
  const dcLabel = getRelationLabel(dcRelation.status);
  comments.push(`The Conductor number ${bhagyank} is ${dcLabel} with Driver number ${mulank}.`);

  // ── Rule 2: Love Marriage Boosters — 5 & 6 ───────────────────────────────
  const loveBoostNums = [5, 6];
  const loveFound = loveBoostNums.filter(n => presentNums.includes(n));
  if (loveFound.length === 2) {
    lovePct += 25;
    comments.push(`Numbers {${loveFound.join(', ')}} are present. This increases chances of a love marriage.`);
  } else if (loveFound.length === 1) {
    lovePct += 12;
    comments.push(`Number ${loveFound[0]} is present. This partially increases chances of a love marriage.`);
  }

  // ── Rule 3: Arranged Marriage Boosters — 9, 3, 2 ─────────────────────────
  const arrangeBoostNums = [9, 3, 2];
  const arrangeFound = arrangeBoostNums.filter(n => presentNums.includes(n));
  if (arrangeFound.length >= 2) {
    arrangePct += 20 + (arrangeFound.length - 2) * 5;
    comments.push(`Numbers {${arrangeFound.join(', ')}} are present. This increases chances of an arranged marriage.`);
  } else if (arrangeFound.length === 1) {
    arrangePct += 8;
    comments.push(`Number ${arrangeFound[0]} is present. This slightly increases chances of an arranged marriage.`);
  }

  // ── Rule 4: Missing Support Check ─────────────────────────────────────────
  // Love support numbers: 1, 7
  [1, 7].forEach(n => {
    if (missingNums.includes(n)) {
      comments.push(`The number ${n} which supports chances of love marriage is MISSING!`);
      lovePct = Math.max(lovePct - 8, 10);
    }
  });
  // Arranged support number: 8
  if (missingNums.includes(8)) {
    comments.push(`The number 8 which supports chances of arrange marriage is MISSING!`);
    arrangePct = Math.max(arrangePct - 8, 10);
  }

  lovePct    = Math.min(lovePct, 95);
  arrangePct = Math.min(arrangePct, 95);

  const dominant = lovePct >= arrangePct ? 'Love' : 'Arranged';
  const highlight = `More chances of ${dominant} Marriage as compared to ${dominant === 'Love' ? 'Arranged' : 'Love'} Marriage.`;

  return {
    lovePct,
    arrangePct,
    dominant,
    highlight,
    comments,
    presentNums,
    missingNums,
  };
};

export const getStockRelation = (base, target) => {
  const friendlyMatrix = {
    1: { friendly: [1,2,3,9], neutral: [5], anti: [4,6,7,8] },
    2: { friendly: [1,2,4,6], neutral: [3,5], anti: [7,8,9] },
    3: { friendly: [1,3,5,6,9], neutral: [2,8], anti: [4,7] },
    4: { friendly: [2,4,6,8], neutral: [5,7], anti: [1,3,9] },
    5: { friendly: [3,5,6], neutral: [1,4,8], anti: [2,7,9] },
    6: { friendly: [2,3,5,6,9], neutral: [4], anti: [1,7,8] },
    7: { friendly: [7,8], neutral: [4,5], anti: [1,2,3,6,9] },
    8: { friendly: [4,7,8], neutral: [3,5,6], anti: [1,2,9] },
    9: { friendly: [1,3,6,9], neutral: [2], anti: [4,5,7,8] }
  };
  if (base === target) return "exact";
  const row = friendlyMatrix[base];
  if (!row) return "anti";
  if (row.friendly.includes(target)) return "friendly";
  if (row.neutral.includes(target)) return "neutral";
  return "anti";
};

export const getRelationScore = (type, isBhagyank) => {
  if (isBhagyank) {
    switch (type) {
      case "exact": return 5;
      case "friendly": return 3;
      case "neutral": return 1;
      default: return -4;
    }
  } else {
    switch (type) {
      case "exact": return 4;
      case "friendly": return 2;
      case "neutral": return 1;
      default: return -3;
    }
  }
};

export const getCompoundScore = (compound) => {
  const strongCompounds = [14, 19, 23, 24, 32, 37, 41, 46];
  const weakCompounds = [12, 16, 18, 20, 26, 28, 29, 31, 34, 38];
  if (strongCompounds.includes(compound)) return 2;
  if (weakCompounds.includes(compound)) return -2;
  return 0;
};

export const analyzeStock = (dob, companyName, symbol, listingDateStr) => {
  const m = calcMulank(dob);
  const b = calcBhagyank(dob);

  const company = compoundAndSingle(companyName);
  const stockSymbol = compoundAndSingle(symbol);

  let listing = 0;
  if (listingDateStr && listingDateStr !== '-') {
    const cleanDate = listingDateStr.replace(/\D/g, '');
    const listingSum = cleanDate.split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
    listing = reduceToSingle(listingSum);
  }

  const candidates = [
    {
      label: "Company Name",
      compound: company.compound,
      single: company.single,
    },
    {
      label: "Symbol",
      compound: stockSymbol.compound,
      single: stockSymbol.single,
    }
  ];

  if (listing > 0) {
    candidates.push({
      label: "Listing Date",
      compound: 0,
      single: listing,
    });
  }

  let bestScore = -999;
  let best = {};

  for (const item of candidates) {
    const single = item.single;
    const compound = item.compound;

    const mulankRel = getStockRelation(single, m);
    const bhagyankRel = getStockRelation(single, b);

    let score = 0;
    score += getRelationScore(mulankRel, false);
    score += getRelationScore(bhagyankRel, true);
    score += getCompoundScore(compound);

    // Lo Shu support
    let count = 0;
    if (single > 0 && dob) {
      const dobDigits = dob.replace(/\D/g, '');
      count = (dobDigits.match(new RegExp(single.toString(), 'g')) || []).length;
    }
    if (count >= 2) {
      score += 2;
    } else if (count === 1) {
      score += 1;
    } else if (single > 0) {
      score -= 1;
    }

    if (score > bestScore) {
      bestScore = score;
      best = {
        ...item,
        mulankRelation: mulankRel,
        bhagyankRelation: bhagyankRel,
        score: score,
      };
    }
  }

  let status;
  if (bestScore >= 8) {
    status = "Strongly Suitable";
  } else if (bestScore >= 4) {
    status = "Suitable";
  } else if (bestScore >= 1) {
    status = "Watchlist";
  } else {
    status = "Avoid";
  }

  return {
    mulank: m,
    bhagyank: b,
    bestIndicator: best,
    status: status,
    score: bestScore,
  };
};

export const getStockComments = (bestIndicator, mulank, bhagyank, dob, status, score, language = 'en') => {
  const isHi = language === 'hi';
  const single = bestIndicator.single;
  const compound = bestIndicator.compound;
  const mulankRel = bestIndicator.mulankRelation;
  const bhagyankRel = bestIndicator.bhagyankRelation;

  const planetEng = {
    1: 'Sun (Surya), representing leadership, authority, and vitality',
    2: 'Moon (Chandra), representing emotions, intuition, and adaptability',
    3: 'Jupiter (Guru), representing growth, wisdom, and expansion',
    4: 'Rahu, representing innovation, sudden gains, and technology',
    5: 'Mercury (Budh), representing trade, communication, and business intelligence',
    6: 'Venus (Shukra), representing wealth, luxury, and harmony',
    7: 'Ketu, representing research, analysis, and intuition',
    8: 'Saturn (Shani), representing discipline, hard work, and persistence',
    9: 'Mars (Mangal), representing energy, courage, and action'
  };

  const planetHi = {
    1: 'सूर्य (Sun), जो नेतृत्व, अधिकार और जीवन शक्ति का प्रतिनिधित्व करता है',
    2: 'चंद्र (Moon), जो भावनाओं, अंतर्ज्ञान और अनुकूलनशीलता का प्रतिनिधित्व करता है',
    3: 'गुरु (Jupiter), जो विकास, ज्ञान और विस्तार का प्रतिनिधित्व करता है',
    4: 'राहु (Rahu), जो नवाचार, अचानक लाभ और तकनीक का प्रतिनिधित्व करता है',
    5: 'बुध (Mercury), जो व्यापार, संचार और व्यावसायिक बुद्धिमत्ता का प्रतिनिधित्व करता है',
    6: 'शुक्र (Venus), जो धन, विलासिता और सद्भाव का प्रतिनिधित्व करता है',
    7: 'केतु (Ketu), जो शोध, विश्लेषण और अंतर्ज्ञान का प्रतिनिधित्व करता है',
    8: 'शनि (Saturn), जो अनुशासन, कड़ी मेहनत और दृढ़ता का प्रतिनिधित्व करता है',
    9: 'मंगल (Mars), जो ऊर्जा, साहस और क्रिया का प्रतिनिधित्व करता है'
  };

  // Bullet 1: Core number quality
  const b1 = isHi
    ? `एकल अंक योग ${single} है, जो ${planetHi[single] || 'ग्रह'} द्वारा शासित है।`
    : `The single digit sum is ${single}, ruled by ${planetEng[single] || 'planet'}.`;

  // Bullet 2: Mulank relation
  let b2 = '';
  if (isHi) {
    if (mulankRel === 'exact') {
      b2 = `यह एकल अंक आपके मूलांक ${mulank} से बिल्कुल मेल खाता है, जिससे अत्यधिक शक्तिशाली और समकालिक ऊर्जा स्थापित होती है।`;
    } else if (mulankRel === 'friendly') {
      b2 = `यह अंक आपके मूलांक ${mulank} के अनुकूल है, जो आपकी व्यक्तिगत मूल ऊर्जा के साथ सहज संरेखण सुनिश्चित करता है।`;
    } else if (mulankRel === 'neutral') {
      b2 = `यह अंक आपके मूलांक ${mulank} के साथ तटस्थ है, जो बिना किसी बड़े व्यवधान के स्थिर ऊर्जा प्रवाह प्रदान करता है।`;
    } else {
      b2 = `यह अंक आपके मूलांक ${mulank} के लिए गैर-अनुकूल (शत्रु) है, जिससे अचानक चुनौतियाँ या ऊर्जा घर्षण उत्पन्न हो सकता है।`;
    }
  } else {
    if (mulankRel === 'exact') {
      b2 = `This single digit is an exact match to your Driver ${mulank}, establishing a highly powerful and synchronized energy.`;
    } else if (mulankRel === 'friendly') {
      b2 = `This digit is friendly with your Driver ${mulank}, ensuring smooth alignment with your personal core energy.`;
    } else if (mulankRel === 'neutral') {
      b2 = `This digit is neutral with your Driver ${mulank}, providing a stable energy flow without major disruptions.`;
    } else {
      b2 = `This digit is non-friendly with your Driver ${mulank}, which may introduce sudden challenges or energy friction.`;
    }
  }

  // Bullet 3: Bhagyank relation
  let b3 = '';
  if (isHi) {
    if (bhagyankRel === 'exact') {
      b3 = `यह अंक आपके भाग्यांक ${bhagyank} से बिल्कुल मेल खाता है, जो दीर्घकालिक निवेश के लिए मजबूत भाग्य समर्थन और समृद्धि लाता है।`;
    } else if (bhagyankRel === 'friendly') {
      b3 = `यह अंक आपके भाग्यांक ${bhagyank} के अनुकूल है, जो आपके भाग्य पथ और दीर्घकालिक वित्तीय विकास का समर्थन करता है।`;
    } else if (bhagyankRel === 'neutral') {
      b3 = `यह अंक आपके भाग्यांक ${bhagyank} के साथ तटस्थ है, जो संतुलित और स्थिर निवेश परिणाम प्रदान करता है।`;
    } else {
      b3 = `यह अंक आपके भाग्यांक ${bhagyank} के साथ टकराव में है, जिससे निवेश में अप्रत्याशित देरी या हानि की संभावना बन सकती है।`;
    }
  } else {
    if (bhagyankRel === 'exact') {
      b3 = `This digit is an exact match to your Conductor ${bhagyank}, bringing strong destiny support and prosperity for long-term growth.`;
    } else if (bhagyankRel === 'friendly') {
      b3 = `This digit is friendly with your Conductor ${bhagyank}, supporting your destiny path and long-term financial progress.`;
    } else if (bhagyankRel === 'neutral') {
      b3 = `This digit is neutral with your Conductor ${bhagyank}, offering balanced and stable investment outcomes.`;
    } else {
      b3 = `This digit conflicts with your Conductor ${bhagyank}, which can introduce delays or potential losses in investments.`;
    }
  }

  // Bullet 4: Compound support/weakness
  let b4 = '';
  if (compound === 0) {
    b4 = isHi
      ? `चूंकि यह प्रविष्टि एक विशिष्ट सूचीकरण तिथि है, यह बिना किसी जटिल संयुक्त संख्या के सीधे एकल अंक का प्रभाव प्रदान करती है।`
      : `Since this entry represents a listing date, it offers direct single digit energy without compound number complexity.`;
  } else {
    const strongCompounds = [14, 19, 23, 24, 32, 37, 41, 46];
    const weakCompounds = [12, 16, 18, 20, 26, 28, 29, 31, 34, 38];
    const isStrong = strongCompounds.includes(compound);
    const isWeak = weakCompounds.includes(compound);

    if (isHi) {
      if (isStrong) {
        b4 = `संयुक्त अंक ${compound} एक अत्यंत भाग्यशाली संख्या है, जो आपकी वित्तीय स्थिति को अतिरिक्त ग्रहीय मजबूती और अनुकूलता प्रदान करती है।`;
      } else if (isWeak) {
        b4 = `संयुक्त अंक ${compound} एक कमजोर/चुनौतीपूर्ण संख्या है, जिसके कारण उतार-चढ़ाव या अप्रत्याशित हानि से बचने के लिए अतिरिक्त सतर्कता आवश्यक है।`;
      } else {
        b4 = `संयुक्त अंक ${compound} एक औसत/मध्यम संख्या है, जो सामान्य और संतुलित प्रदर्शन प्रदान करती है।`;
      }
    } else {
      if (isStrong) {
        b4 = `The compound total ${compound} is a highly favorable number, bringing extra planetary strength and bonus luck to your finances.`;
      } else if (isWeak) {
        b4 = `The compound total ${compound} is a weak/caution number, demanding extra vigilance to avoid volatility or unexpected drops.`;
      } else {
        b4 = `The compound total ${compound} is an average/neutral number, providing steady and balanced performance.`;
      }
    }
  }

  // Bullet 5: Suitability statement
  let b5 = '';
  if (isHi) {
    if (status === 'Strongly Suitable') {
      b5 = `कुल मिलाकर, यह स्टॉक आपके मुख्य अंकों के साथ अत्यधिक उपयुक्त श्रेणी में है; यह भविष्य में मजबूत लाभ के लिए उत्कृष्ट है।`;
    } else if (status === 'Suitable') {
      b5 = `कुल मिलाकर, यह स्टॉक आपके अंकों के साथ अनुकूल है और संतुलित जोखिम के साथ निवेश के लिए उपयुक्त है।`;
    } else if (status === 'Watchlist') {
      b5 = `कुल मिलाकर, यह स्टॉक एक तटस्थ श्रेणी (वॉचलिस्ट) में आता है; पूरी सावधानी और उचित तकनीकी विश्लेषण के बाद ही व्यापार करें।`;
    } else {
      b5 = `कुल मिलाकर, मुख्य अंकों में सीधे टकराव के कारण इस स्टॉक से बचने की सलाह दी जाती है, क्योंकि यह प्रतिकूल ऊर्जा चक्र ला सकता है।`;
    }
  } else {
    if (status === 'Strongly Suitable') {
      b5 = `Overall, this stock is strongly suitable and aligns exceptionally well with your numerology profile for long-term wealth creation.`;
    } else if (status === 'Suitable') {
      b5 = `Overall, this stock is suitable, showing favorable planetary alignment and solid growth potential.`;
    } else if (status === 'Watchlist') {
      b5 = `Overall, this stock falls in the watchlist category; monitor its movements closely and trade with caution.`;
    } else {
      b5 = `Overall, this stock conflicts with your core numbers; it is highly recommended to avoid investing in this frequency.`;
    }
  }

  return [b1, b2, b3, b4, b5];
};

// ─────────────────────────────────────────────────────────────────────────────
// BABY BIRTH DATE CALCULATOR — Chaldean + Lo Shu Plane Scoring
// ─────────────────────────────────────────────────────────────────────────────

const LO_SHU_PLANES = {
  thought:    { numbers: [4, 3, 8], label: 'Thought Plane',    labelHi: 'विचार तल' },
  will:       { numbers: [9, 5, 1], label: 'Will Plane',       labelHi: 'इच्छाशक्ति तल' },
  action:     { numbers: [2, 7, 6], label: 'Action Plane',     labelHi: 'क्रिया तल' },
  mental:     { numbers: [4, 9, 2], label: 'Mental Plane',     labelHi: 'मानसिक तल' },
  emotional:  { numbers: [3, 5, 7], label: 'Emotional Plane',  labelHi: 'भावनात्मक तल' },
  practical:  { numbers: [8, 1, 6], label: 'Practical Plane',  labelHi: 'व्यावहारिक तल' },
  golden:     { numbers: [4, 5, 6], label: 'Golden Plane',     labelHi: 'स्वर्णिम तल' },
  silver:     { numbers: [2, 5, 8], label: 'Silver Plane',     labelHi: 'रजत तल' },
};

const PLANET_FRIENDS_BIRTH = {
  1: [1, 2, 3, 9], 2: [1, 2, 3, 4], 3: [1, 2, 3, 6, 9],
  4: [1, 2, 4, 7, 8], 5: [1, 4, 5, 6], 6: [3, 5, 6, 9],
  7: [1, 2, 4, 7], 8: [4, 5, 6, 7, 8], 9: [1, 3, 6, 9],
};

const getDCRelationship = (driver, conductor) => {
  if (!driver || !conductor) return 'Neutral';
  const friends = PLANET_FRIENDS_BIRTH[driver] || [];
  const condFriends = PLANET_FRIENDS_BIRTH[conductor] || [];
  if (friends.includes(conductor) || condFriends.includes(driver)) return 'Compatible';
  if ([4, 8].includes(driver) && [4, 8].includes(conductor)) return 'Anti';
  if (driver === conductor) return 'Compatible';
  return 'Neutral';
};

const KARMIC_NUMBERS = [13, 14, 16, 19];
const MASTER_NUMBERS_BIRTH = [11, 22, 33];

const calcBirthCompound = (dateStr) => {
  if (!dateStr) return { compound: 0, single: 0 };
  const digits = dateStr.replace(/-/g, '').split('').map(Number);
  const total = digits.reduce((a, d) => a + d, 0);
  return { compound: total, single: reduceToSingle(total) };
};

const calcDayDriver = (dateStr) => {
  if (!dateStr) return 0;
  const day = parseInt(dateStr.split('-')[2] || '0', 10);
  return reduceToSingle(day);
};

const getPlanePercentage = (presentNumbers, planeNums) => {
  const count = planeNums.filter(n => presentNumbers.includes(n)).length;
  if (count >= 3) return 100;
  if (count === 2) return 66;
  if (count === 1) return 33;
  return 0;
};

export const analyzeSingleBirthDate = (dateStr) => {
  if (!dateStr) return null;

  const driver = calcDayDriver(dateStr);
  const { compound: compoundConductor, single: conductor } = calcBirthCompound(dateStr);

  const rawDigits = dateStr.replace(/-/g, '').split('').map(Number).filter(d => d > 0);
  const presentNumbers = [...new Set(rawDigits)].filter(n => n >= 1 && n <= 9);
  const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const missingNumbers = allNumbers.filter(n => !presentNumbers.includes(n));
  const digitCounts = {};
  rawDigits.forEach(d => { if (d > 0) digitCounts[d] = (digitCounts[d] || 0) + 1; });
  const repeatedNumbers = Object.entries(digitCounts)
    .filter(([, c]) => c > 1)
    .map(([n]) => parseInt(n));

  const gridFilled = presentNumbers.length;
  const karmicNumber = KARMIC_NUMBERS.includes(compoundConductor) ? compoundConductor : null;
  const masterNumber = MASTER_NUMBERS_BIRTH.includes(compoundConductor) ? compoundConductor : null;
  const dcRelationship = getDCRelationship(driver, conductor);

  const planes = {};
  Object.entries(LO_SHU_PLANES).forEach(([key, def]) => {
    planes[key] = {
      label: def.label,
      labelHi: def.labelHi,
      numbers: def.numbers,
      percentage: getPlanePercentage(presentNumbers, def.numbers),
    };
  });

  let score = 0;
  if (dcRelationship === 'Compatible') score += 20;
  else if (dcRelationship === 'Neutral') score += 8;
  else score -= 10;

  score += gridFilled * 5;
  score += Math.round(planes.golden.percentage * 0.15);
  score += Math.round(planes.will.percentage * 0.08);
  score += Math.round(planes.action.percentage * 0.08);
  score += Math.round(planes.emotional.percentage * 0.05);

  if (karmicNumber === 13 || karmicNumber === 16) score -= 10;
  else if (karmicNumber) score -= 5;

  if ((driver === 4 && conductor === 8) || (driver === 8 && conductor === 4)) score -= 15;

  const boyScore = Math.min(100, Math.max(0, score
    + Math.round(planes.will.percentage * 0.10)
    + Math.round(planes.action.percentage * 0.10)));

  const girlScore = Math.min(100, Math.max(0, score
    + Math.round(planes.golden.percentage * 0.12)
    + Math.round(planes.emotional.percentage * 0.08)));

  const finalScore = Math.min(100, Math.max(0, score));
  const isPerfect = finalScore >= 70;

  return {
    date: dateStr,
    driver,
    conductor,
    compoundConductor,
    dcRelationship,
    karmicNumber,
    masterNumber,
    presentNumbers,
    missingNumbers,
    repeatedNumbers,
    gridFilled,
    planes,
    score: finalScore,
    boyScore,
    girlScore,
    isPerfect,
  };
};

export const analyzeBirthDateRange = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return [];
  const results = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start) || isNaN(end) || start > end) return [];

  const current = new Date(start);
  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const result = analyzeSingleBirthDate(`${yyyy}-${mm}-${dd}`);
    if (result) results.push(result);
    current.setDate(current.getDate() + 1);
  }

  results.sort((a, b) => b.score - a.score);
  return results;
};

export const getBirthDateGenderJustification = (analysis, gender, language = 'en') => {
  if (!analysis) return '';
  const isHi = language === 'hi';
  const { date, planes } = analysis;
  const [yyyy, mm, dd] = date.split('-');
  const formattedDate = `${dd}-${mm}-${yyyy}`;

  if (gender === 'boy') {
    const actionPct = planes.action.percentage;
    const willPct = planes.will.percentage;
    if (isHi) {
      return `${formattedDate} बेबी बॉय के लिए अत्यंत उपयुक्त है क्योंकि इसमें ${actionPct}% Action Plane और ${willPct}% Will Plane की शक्ति है — जो नेतृत्व, साहस और क्रियाशीलता सुनिश्चित करती है।`;
    }
    return `${formattedDate} is highly suitable for a Baby Boy because it anchors a ${actionPct}% Action Plane and strong ${willPct}% Will Plane, ensuring high leadership, courage, and execution capabilities.`;
  } else {
    const goldenPct = planes.golden.percentage;
    const emotionalPct = planes.emotional.percentage;
    if (isHi) {
      return `${formattedDate} बेबी गर्ल के लिए असाधारण रूप से उपयुक्त है क्योंकि इसमें ${goldenPct}% Golden Plane (4,5,6) और ${emotionalPct}% Emotional Plane है — जो समृद्धि, संतुलन और सृजनात्मक विलासिता लाती है।`;
    }
    return `${formattedDate} is exceptionally suitable for a Baby Girl due to a ${goldenPct}% Golden Plane (4,5,6) combined with a solid ${emotionalPct}% Emotional Plane, bringing immense prosperity, balance, and creative luxury to her life.`;
  }
};

