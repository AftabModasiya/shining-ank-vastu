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
  const psychicPlanets = {
    1: { name: "Sun", qualities: "leadership, authority, and creative vision", industries: "management, public administration, or independent ventures" },
    2: { name: "Moon", qualities: "empathy, creative imagination, and strong intuition", industries: "creative arts, psychology, public relations, or consulting" },
    3: { name: "Jupiter", qualities: "wisdom, teaching capabilities, and strategic counseling", industries: "education, advisory, financial planning, or legal services" },
    4: { name: "Rahu", qualities: "analytical thinking, technical ingenuity, and unconventional ideas", industries: "information technology, research, real estate, or system organization" },
    5: { name: "Mercury", qualities: "quick communication, business acumen, and versatility", industries: "sales, trading, media, marketing, or travel operations" },
    6: { name: "Venus", qualities: "aesthetic sensibilities, hospitality, and luxurious tastes", industries: "fashion, luxury retail, hospitality, interior design, or media" },
    7: { name: "Ketu", qualities: "deep research capability, spiritual inclination, and analytical depth", industries: "scientific research, occult sciences, writing, or analysis" },
    8: { name: "Saturn", qualities: "discipline, administrative endurance, and long-term planning", industries: "heavy industries, metals, law, judicial administration, or real estate" },
    9: { name: "Mars", qualities: "courage, physical dynamism, and organizational drive", industries: "defense, sports management, engineering, surgery, or social welfare" }
  };

  const psychicInfo = psychicPlanets[mulank] || psychicPlanets[1];
  const destinyInfo = psychicPlanets[bhagyank] || psychicPlanets[1];

  const careerIntroText = `Driven by your Psychic Number ${mulank} (ruled by ${psychicInfo.name}) and Destiny Number ${bhagyank} (ruled by ${destinyInfo.name}), your professional path is governed by ${psychicInfo.qualities}. You thrive best in environments where you can leverage your destiny traits in ${destinyInfo.industries}. Working in roles that call for independent decision-making and planning will yield rapid career advancement. Focus on launching new business ventures on your favorable dates to align with planetary support.`;

  const professionsMap = {
    1: ["Government Administration", "Corporate Management", "Entrepreneurship / CEO", "Jewelry & Gold Trading"],
    2: ["Creative Writing & Arts", "Psychology & Counseling", "Import-Export & Liquids", "Human Resource Management"],
    3: ["Educational Administration", "Financial Advisory / Auditing", "Legal & Judicial Practice", "Consulting & Speaking"],
    4: ["Software & IT Engineering", "Real Estate Development", "Astrology & Occult Sciences", "Investigative Research"],
    5: ["Marketing & Public Relations", "Stock Trading & Brokerage", "Journalism & Media Production", "Travel & Tourism Planning"],
    6: ["Fashion & Interior Designing", "Luxury Goods & Hospitality", "Media, Cinema & Music", "Health & Beauty Services"],
    7: ["Scientific & Data Research", "Spiritual Healing / Occultism", "Philosophy & Writing", "Financial Audit & Analysis"],
    8: ["Real Estate & Construction", "Legal Practice & Judiciary", "Heavy Metals & Machinery", "Corporate Restructuring"],
    9: ["Defense & Police Services", "Sports & Fitness Training", "Surgical Medicine", "NGO & Humanitarian Projects"]
  };

  const set = new Set([
    ...(professionsMap[mulank] || professionsMap[1]).slice(0, 2),
    ...(professionsMap[bhagyank] || professionsMap[1]).slice(0, 2)
  ]);

  let professionsList = Array.from(set);
  if (professionsList.length < 4) {
    const fallback = professionsMap[mulank] || professionsMap[1];
    fallback.forEach(p => {
      if (!professionsList.includes(p)) professionsList.push(p);
    });
  }

  return {
    careerIntroText,
    professionsList: professionsList.slice(0, 4)
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
    effects: "Lacks confidence, leadership, and self-assertion. May struggle with identity, face issues with authority figures, and find it hard to make independent decisions. Low vital energy and poor father relationship.",
    crystal: "Ruby or Red Garnet Bracelet",
    benefits: ["Builds self-confidence and leadership qualities", "Improves relationship with father and authority", "Activates solar plexus chakra and boosts vitality"]
  },
  2: {
    planet: "Moon (Chandra)",
    effects: "Emotionally imbalanced, lacks intuition, may be insensitive to others. Poor relationship with mother, sleep disturbances, and digestive issues. Struggles in partnerships and creative imagination.",
    crystal: "Pearl or Moonstone Bracelet",
    benefits: ["Balances emotions and enhances intuition", "Improves maternal relationships and domestic harmony", "Promotes restful sleep and mental peace"]
  },
  3: {
    planet: "Jupiter (Guru)",
    effects: "Lacks wisdom, optimism, and philosophical depth. May face challenges in education, financial planning, and spiritual growth. Poor luck with expansive opportunities and teaching roles.",
    crystal: "Yellow Sapphire or Citrine Bracelet",
    benefits: ["Attracts wisdom, luck, and spiritual growth", "Improves financial planning and higher education", "Enhances optimism and philosophical understanding"]
  },
  4: {
    planet: "Uranus (Rahu)",
    effects: "Avoids physical work, needs constant motivation, highly unorganized, not hardworking, believes in shortcuts, and misses opportunities. Lacks stability and practical grounding.",
    crystal: "Rudraksha and Crystal Bracelet",
    benefits: ["Brings stability and structure to life", "Helps overcome sudden obstacles and challenges", "Improves focus and organizational skills"]
  },
  5: {
    planet: "Mercury (Budh)",
    effects: "Most confused personality, frequent changes in decisions, afraid of new things, less adventurous, highly insecure, and difficulty adapting to change. Poor communication and business acumen.",
    crystal: "Green Aventurine Bracelet",
    benefits: ["Attracts luck, abundance, and prosperity", "Enhances communication and business skills", "Promotes emotional healing and adaptability"]
  },
  6: {
    planet: "Venus (Shukar)",
    effects: "Struggles with relationships, love life, and artistic expression. Lacks aesthetic sense, may face financial instability in luxury and comfort. Domestic life is often chaotic or unfulfilling.",
    crystal: "Diamond, Sphatik, or Rose Quartz Bracelet",
    benefits: ["Enhances love life and relationship harmony", "Attracts luxury, beauty, and creative expression", "Brings domestic peace and financial comfort"]
  },
  7: {
    planet: "Neptune (Ketu)",
    effects: "Lacks spiritual depth and introspective wisdom. May be overly materialistic, restless, and disconnected from inner self. Struggles with analytical research and long-term focus.",
    crystal: "Cat's Eye or Amethyst Bracelet",
    benefits: ["Deepens spiritual awareness and introspection", "Enhances analytical and research capabilities", "Brings inner peace and detachment from materialism"]
  },
  8: {
    planet: "Saturn (Shani)",
    effects: "Lacks discipline, endurance, and long-term planning. May face repeated failures due to shortcuts and laziness. Karmic debts and obstacles in career. Poor relationship with employees and subordinates.",
    crystal: "Blue Sapphire or Black Tourmaline Bracelet",
    benefits: ["Builds discipline, patience, and endurance", "Clears karmic debts and obstacles in career", "Improves administrative and leadership capabilities"]
  },
  9: {
    planet: "Mars (Mangal)",
    effects: "Lacks courage, drive, and competitive spirit. May be passive, fearful, and unable to assert themselves. Struggles in physical activities, sports, and crisis management situations.",
    crystal: "Coral or Red Jasper Bracelet",
    benefits: ["Boosts courage, energy, and competitive drive", "Improves physical vitality and assertiveness", "Enhances leadership in crisis situations"]
  }
};

export const getMissingNumberRemedyData = (num) => {
  return MISSING_NUMBER_REMEDIES[num] || {
    planet: "Unknown",
    effects: `Faces issues related to the energy plane of Number ${num}.`,
    crystal: "Clear Quartz Bracelet",
    benefits: ["Balances the missing energy", "Restores harmony in affected life areas"]
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


