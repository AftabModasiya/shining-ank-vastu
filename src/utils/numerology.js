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

// ─────────────────────────────────────────────────────────────────────────────
// 1. CHALDEAN LO SHU COMPATIBILITY CHART
//    Based on traditional planetary friend/enemy/neutral relationships
//    Planet mapping: 1=Sun, 2=Moon, 3=Jupiter, 4=Rahu(Uranus), 5=Mercury,
//                    6=Venus, 7=Ketu(Neptune), 8=Saturn, 9=Mars
// ─────────────────────────────────────────────────────────────────────────────
const COMPATIBILITY_TABLE = {
  1: { friends: [9, 2, 5, 3, 6, 1], nonFriends: [8], neutral: [4, 7] },
  2: { friends: [1, 5, 3, 2, 7], nonFriends: [8, 4, 9], neutral: [6, 7] },
  3: { friends: [1, 5, 3, 7], nonFriends: [6], neutral: [4, 8, 9, 2] },
  4: { friends: [7, 1, 5, 6, 4, 8], nonFriends: [2, 9], neutral: [3] },
  5: { friends: [1, 2, 3, 6, 5], nonFriends: [], neutral: [4, 7, 8, 9] },
  6: { friends: [1, 7, 4, 6, 5], nonFriends: [3], neutral: [2, 8, 9] },
  7: { friends: [4, 6, 1, 5, 3, 7], nonFriends: [], neutral: [2, 8, 9] },
  8: { friends: [5, 3, 8, 4, 6, 7], nonFriends: [1, 2, 4], neutral: [9, 6, 7] },
  9: { friends: [1, 5], nonFriends: [2, 4], neutral: [3, 7, 6, 8, 9] }
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
export const getNumberCompatibilityAnalysis = (mulank, bhagyank) => {
  const compat = getCompatibility(mulank, bhagyank);
  const reverseCompat = getCompatibility(bhagyank, mulank);

  const planetNames = { 1:"Sun",2:"Moon",3:"Jupiter",4:"Rahu",5:"Mercury",6:"Venus",7:"Ketu",8:"Saturn",9:"Mars" };

  const statusDescriptions = {
    friend: "Your Mulank and Bhagyank planets are in a highly favorable relationship. You will experience strong support from your destiny number, smooth financial growth, and harmonious relationships. Career opportunities align naturally.",
    enemy: "Your Mulank and Bhagyank planets are in a challenging relationship. This creates internal conflicts between your birth energy and destiny path. Special remedies and alignment through lucky dates are recommended for smoother results.",
    neutral: "Your Mulank and Bhagyank planets share a neutral relationship. Neither strongly supporting nor opposing, the results depend on effort and environment. With proper remedies, you can amplify the positive outcomes significantly."
  };

  return {
    mulankPlanet: planetNames[mulank] || "Unknown",
    bhagyankPlanet: planetNames[bhagyank] || "Unknown",
    mulankToBhagyank: compat,
    bhagyankToMulank: reverseCompat,
    overallStatus: compat.status,
    description: statusDescriptions[compat.status] || statusDescriptions.neutral
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


