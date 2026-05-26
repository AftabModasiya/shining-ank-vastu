import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { 
  calculateLoShuGrid, 
  getMissingNumbers, 
  getPresentNumbers, 
  calculateKua,
  calcMulank,
  calcBhagyank,
  getNumberCompatibilityAnalysis,
  getHiddenInfluences,
  getPersonalYearData,
  calcPersonalYearForYear,
  getLuckyElements,
  getMobileAnalysis,
  getNameCompatibilityAnalysis,
  getCareerOutlook,
  getArrows,
  getRepeatedNumbers,
  getKuaVastuData,
  getMissingNumberRemedyData,
  getMobileCompatibilityCheck,
  getNameNumerologyCheck,
  getForeignSettlement,
  getMatchMaking,
  getMarriageType
} from "./numerology";

// Static assets imported directly so Vite bundles them
import firstp1Img from "../assets/Firstp1.png"; // This is actually the Wheel image
import firstp2Img from "../assets/firstp2.png"; // This is actually the Lord Ganesha image
import lastPageImg from "../assets/LastPage.png";
import ganeshaMantraImg from "../assets/ganeshaMantra.png";

// Helper to asynchronously load images for PDF generation
const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};

export const generatePDF = async (clientData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });


  
  const reportData = clientData.report || clientData;
  const rawDob = clientData.dob || "";
  const phone = clientData.phone || "-";
  const gender = clientData.gender || "male";

  // ── Dynamic core number calculations ──────────────────────────────────
  // Mulank  : sum of DAY digits only        e.g. 17 → 1+7 = 8
  // Bhagyank: sum of ALL DOB digits         e.g. 17-04-1972 → 31 → 4
  // Kua     : year digit sum → 11-sum (male) / 4+sum (female), reduced
  const mulank   = calcMulank(rawDob);
  const bhagyank = calcBhagyank(rawDob);
  const kuaNum   = calculateKua(rawDob, gender);

  // Dynamic lucky elements (fully calculated from bhagyank, mulank, kuaNum)
  const luckyData = getLuckyElements(bhagyank, mulank, kuaNum);

  // Dynamic mobile number compatibility insights (Bug 3 fix: pass mulank AND bhagyank)
  const mobileData = getMobileAnalysis(phone, mulank, bhagyank);

  // Dynamic name number compatibility insights
  const nameCompatData = getNameCompatibilityAnalysis(clientData.name || '', mulank, bhagyank);

  // Dynamic professional & career outlook insights
  const careerData = getCareerOutlook(mulank, bhagyank);

  // NEW: Strict planetary matrix mobile & name checks (client spec)
  const mobileCheck = getMobileCompatibilityCheck(phone, mulank, bhagyank);
  const nameNumerologyCheck = getNameNumerologyCheck(clientData.name || '', mulank, bhagyank);

  // NEW: Foreign Settlement, Marriage Type
  const foreignSettlement = getForeignSettlement(rawDob, mulank, bhagyank);
  const marriageType = getMarriageType(rawDob, mulank, bhagyank);

  // NEW: Match Making (from report.matchMaking if consultant filled it)
  const mmRaw = (clientData.report || clientData).matchMaking || null;
  let mmResult = null;
  if (mmRaw?.male?.dob && mmRaw?.female?.dob) {
    const mMulank = calcMulank(mmRaw.male.dob);
    const mBhagyank = calcBhagyank(mmRaw.male.dob);
    const fMulank = calcMulank(mmRaw.female.dob);
    const fBhagyank = calcBhagyank(mmRaw.female.dob);
    const mGrid = calculateLoShuGrid(mmRaw.male.dob, [mMulank, mBhagyank]);
    const fGrid = calculateLoShuGrid(mmRaw.female.dob, [fMulank, fBhagyank]);
    const mPresent = [...new Set(mGrid.flatMap((cnt, i) => cnt > 0 ? [i + 1] : []))];
    const fPresent = [...new Set(fGrid.flatMap((cnt, i) => cnt > 0 ? [i + 1] : []))];
    mmResult = getMatchMaking(
      { name: mmRaw.male.name, mulank: mMulank, bhagyank: mBhagyank, grid: mPresent },
      { name: mmRaw.female.name, mulank: fMulank, bhagyank: fBhagyank, grid: fPresent }
    );
    mmResult.maleName = mmRaw.male.name;
    mmResult.femaleName = mmRaw.female.name;
  }

  // Helper: build the display breakdown string for Mulank
  const mulankBreakdown = (() => {
    if (!rawDob) return "";
    const day = rawDob.split("-")[2] || "";
    return day.split("").join("+") + " = " + mulank;
  })();

  // Helper: build the display breakdown string for Bhagyank
  const bhagyankBreakdown = (() => {
    if (!rawDob) return "";
    const digits = rawDob.replace(/-/g, "").split("");
    return digits.join("+") + " = " + bhagyank;
  })();

  // Helper: build the display breakdown string for Kua
  const kuaBreakdown = (() => {
    if (!rawDob) return "";
    const yearStr = rawDob.split("-")[0] || "";
    const yearSum = yearStr.split("").reduce((a, d) => a + parseInt(d), 0);
    if (gender === "female") {
      return `4 + ${yearSum} = ${kuaNum}`;
    } else {
      return `11 - ${yearSum} = ${kuaNum}`;
    }
  })();

  // Format date of birth to DD-MM-YYYY dynamically
  let formattedDob = rawDob;
  if (rawDob.includes("-")) {
    const parts = rawDob.split("-");
    if (parts.length === 3) {
      formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  // Helper function to replace unicode stars with standard text representations for PDF compatibility
  const cleanStars = (str) => {
    if (!str) return "";
    return str
      .replace(/★★★★★/g, "5/5 Stars")
      .replace(/★★★☆☆/g, "3/5 Stars")
      .replace(/★☆☆☆☆/g, "1/5 Stars")
      .replace(/★/g, "")
      .replace(/☆/g, "");
  };

  // Current Date in DD-MM-YYYY
  const today = new Date();
  const reportDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  // Pre-compute new analysis data
  // Full Lo Shu Grid including Mulank, Bhagyank & Kua digits (Bug 2 fix / client spec)
  const loShuGridEarly = calculateLoShuGrid(rawDob, [mulank, bhagyank, kuaNum]);

  // 1. Chaldean Compatibility between Mulank & Bhagyank
  const compatibilityAnalysis = getNumberCompatibilityAnalysis(mulank, bhagyank);

  // 2. Hidden Influences based on Lo Shu planes (partial presence logic)
  const hiddenInfluences = getHiddenInfluences(loShuGridEarly);

  // 3. Personal Year data for current year
  const personalYearNum = calcPersonalYearForYear(rawDob, today.getFullYear());
  const personalYearInfo = getPersonalYearData(personalYearNum);

  // 4. Five-Year Personal Year Predictions
  const fiveYearPredictions = Array.from({ length: 5 }, (_, i) => {
    const yr = today.getFullYear() + i;
    const pyNum = calcPersonalYearForYear(rawDob, yr);
    const pyInfo = getPersonalYearData(pyNum);
    return { year: yr, personalYear: pyNum, title: pyInfo.title, theme: pyInfo.theme };
  });



  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load assets asynchronously (swap so firstp2Img is Ganesha, firstp1Img is Wheel)
  const [ganeshaImg, wheelImg, lastPageGraphic, ganeshaMantra] = await Promise.all([
    loadImage(firstp2Img), // Ganesha (firstp2)
    loadImage(firstp1Img), // Wheel (Firstp1)
    loadImage(lastPageImg),
    loadImage(ganeshaMantraImg)
  ]);

  // Color theme variables (gradient ivory/pastel aesthetic)
  const peachBg = [252, 246, 238];     // Ivory base
  const ivoryMid = [249, 240, 228];    // Slightly deeper ivory
  const goldPrimary = [181, 130, 10];   // Luxury gold #b5820a
  const textDark = [61, 44, 30];       // Rich brown text
  const textMuted = [140, 111, 88];     // Muted label brown
  const greenText = [26, 128, 46];     // Vibrant green for "Thank You,"

  // Helper: Draw background gradient + watermark + border on each page
  const drawPageShell = (doc, skipWatermark = false) => {
    // Gradient pastel & ivory background
    doc.setFillColor(...peachBg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setFillColor(...ivoryMid);
    doc.rect(0, pageHeight * 0.6, pageWidth, pageHeight * 0.4, "F");

    // Standard Gold Border with Elegant Corner Elements
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.4);
    doc.rect(6, 6, pageWidth - 12, pageHeight - 12);
    
    doc.setLineWidth(1.2);
    // Top-left corner
    doc.line(6, 6, 16, 6);
    doc.line(6, 6, 6, 16);
    // Top-right corner
    doc.line(pageWidth - 16, 6, pageWidth - 6, 6);
    doc.line(pageWidth - 6, 6, pageWidth - 6, 16);
    // Bottom-left corner
    doc.line(6, pageHeight - 16, 6, pageHeight - 6);
    doc.line(6, pageHeight - 6, 16, pageHeight - 6);
    // Bottom-right corner
    doc.line(pageWidth - 6, pageHeight - 16, pageWidth - 6, pageHeight - 6);
    doc.line(pageWidth - 16, pageHeight - 6, pageWidth - 6, pageHeight - 6);

    // Light shed watermark: Shining Ank Vastu (using elegant visible gold/ivory tint)
    if (!skipWatermark) {
      doc.setFont("helvetica", "bold");
      const wmFontSize = 46;
      doc.setFontSize(wmFontSize);
      doc.setTextColor(205, 195, 178); // More visible soft gold/ivory color

      const wmText = "Shining Ank Vastu";
      const scale = doc.internal.scaleFactor;
      const w = (doc.getStringUnitWidth(wmText) * wmFontSize) / scale;
      const h = wmFontSize / scale;

      const cx = pageWidth / 2;
      const cy = pageHeight / 2;

      // Centering calculations for rotated text (45 degrees)
      const angleRad = Math.PI / 4;
      const cosAngle = Math.cos(angleRad);
      const sinAngle = Math.sin(angleRad);

      const x = cx - ((w - h) / 2) * cosAngle;
      const y = cy + ((w + h) / 2) * sinAngle;

      doc.text(wmText, x, y, { angle: 45 });
    }
  };

  // Helper: Universal Footer
  const drawFooter = (doc) => {
    const pWidth = doc.internal.pageSize.getWidth();
    const pHeight = doc.internal.pageSize.getHeight();

    // Draw horizontal line
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.25);
    doc.line(6, pHeight - 18, pWidth - 6, pHeight - 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(26, 58, 46); // Shining Ank Vastu brand dark green/teal
    doc.text("Shining Ank Vastu - M : 9913961553", pWidth / 2, pHeight - 13, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text("Align Your Numbers, Transform Your Life", pWidth / 2, pHeight - 9, { align: "center" });
  };

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 1: COVER PAGE
  // ════════════════════════════════════════════════════════════════════════
  drawPageShell(doc, true);

  // 1. Lord Ganesha Image (Top Center)
  if (ganeshaImg) {
    // 35mm wide, 35mm high, perfectly centered square (y shifted from 12 to 15)
    doc.addImage(ganeshaImg, "PNG", (pageWidth - 35) / 2, 15, 35, 35);
  }

  // Ganesha Mantra in Hindi centered below Ganesha image
  if (ganeshaMantra) {
    // 35mm wide, 8.5mm high, perfectly centered horizontally
    doc.addImage(ganeshaMantra, "PNG", (pageWidth - 35) / 2, 51.5, 35, 8.5);
  }

  // Brand Name above the wheel image (y shifted from 52 to 65)
  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Shining Ank Vastu", 55.5, 65, { align: "center" });

  // Circular Wheel Graphic on Left column (centered at x = 55.5, size 80x80, y shifted from 58 to 75)
  if (wheelImg) {
    doc.addImage(wheelImg, "PNG", 15.5, 75, 80, 80);
  }

  // Middle vertical line separator (y shifted from 62-142 to 78-158)
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.6);
  doc.line(105, 78, 105, 158);

  // Right column dynamic metadata
  let textX = 110;
  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("REPORT PREPARED FOR:", textX, 88);

  doc.setTextColor(0, 128, 0); // Proper green
  doc.setFontSize(16);
  doc.text(clientData.name || "Client Name", textX, 98);

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`DATE OF BIRTH: ${formattedDob}`, textX, 110);

  // Prepared by block
  doc.setTextColor(...goldPrimary);
  doc.setFontSize(12);
  doc.text("Prepared by:", textX, 130);
  doc.setTextColor(0, 128, 0); // Proper green
  doc.setFontSize(13);
  doc.text("Mr. Veren Misstry", textX, 136);
  doc.setFontSize(11);
  doc.text("Numerologist", textX, 141);

  // Brand Name & Contact removed from right column to avoid duplication

  // Wheel Title & Date (Bottom left column area, centered at x = 55.5, y shifted down)
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.text("Crown Lifepath Report", 55.5, 168, { align: "center" });

  doc.setTextColor(0, 128, 0); // Proper green
  doc.setFontSize(11);
  doc.text(`Report Date: ${reportDate}`, 55.5, 174, { align: "center" });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 2: BIRTH CHART OVERVIEW & CORE PERSONALITY INSIGHTS
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // Section Header
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("BIRTH CHART OVERVIEW", 14, 27);

  // Use full grid (with Mulank/Bhagyank/Kua) for PDF too
  const loShuGrid = calculateLoShuGrid(rawDob, [mulank, bhagyank, kuaNum]);
  const gridSize = 22;
  const gridStartX = 25;
  const gridStartY = 42;
  const gridLayout = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.4);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const num = gridLayout[i][j];
      const count = loShuGrid[num - 1];
      const x = gridStartX + j * gridSize;
      const y = gridStartY + i * gridSize;

      // Draw blank square border
      doc.rect(x, y, gridSize, gridSize, "D");
      
      // If present in DOB, draw pastel yellow background and show repeated digits
      if (count > 0) {
        doc.setFillColor(254, 249, 231); 
        doc.rect(x, y, gridSize, gridSize, "F");
        doc.rect(x, y, gridSize, gridSize, "D"); // Redraw border over fill
        
        const cellValue = String(num).repeat(count);
        // Adjust font size dynamically to fit repeated digits inside the cell
        let fontSize = 15;
        if (count === 2) fontSize = 13.5;
        else if (count === 3) fontSize = 11.5;
        else if (count >= 4) fontSize = 9.5;
        
        doc.setFontSize(fontSize);
        doc.setTextColor(...goldPrimary);
        doc.setFont("helvetica", "bold");
        doc.text(cellValue, x + gridSize / 2, y + gridSize / 2 + (fontSize * 0.25), { align: "center" });
      }
    }
  }

  const sideX = 104;
  const presentNums = getPresentNumbers(loShuGrid).map(n => n.num).join(", ");
  const missingNums = getMissingNumbers(loShuGrid).join(", ");
  
  const repeats = getRepeatedNumbers(loShuGrid);
  const repeatsStr = repeats.length > 0 
    ? repeats.map(r => `${r.num} (${r.strength})`).join(", ") 
    : "None";

  const arrows = getArrows(loShuGrid);
  const posArrowsStr = arrows.positive.length > 0 
    ? arrows.positive.map(a => a.split(" (")[0]).join(", ") 
    : "None";
  const negArrowsStr = arrows.negative.length > 0 
    ? arrows.negative.map(a => a.split(" (")[0]).join(", ") 
    : "None";

  // Calculate wrapped lines and height dynamically to prevent overflow
  const getLineHeight = (val, labelOffset) => {
    const lines = doc.splitTextToSize(val, pageWidth - (sideX + 6 + labelOffset) - 18);
    return (lines.length * 4.5) + 3.5;
  };

  let totalTextHeight = 14; // start offset + title padding
  totalTextHeight += getLineHeight(presentNums || "None", 26);
  totalTextHeight += getLineHeight(missingNums || "None", 26);
  totalTextHeight += getLineHeight(repeatsStr, 28);
  totalTextHeight += getLineHeight(posArrowsStr, 25);
  totalTextHeight += getLineHeight(negArrowsStr, 26);
  totalTextHeight += 8; // Kua details height + padding + safety margin

  const sideCardHeight = Math.max(gridSize * 3, totalTextHeight);

  // Side summary box (ivory background card)
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(sideX, gridStartY, pageWidth - sideX - 15, sideCardHeight, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(sideX, gridStartY, pageWidth - sideX - 15, sideCardHeight, 3, 3, "D");

  doc.setTextColor(...goldPrimary);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text("GRID HIGHLIGHTS", sideX + 6, gridStartY + 8);

  let currY = gridStartY + 14;
  const drawLine = (label, val, labelOffset) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.setFontSize(8.2);
    doc.text(label, sideX + 6, currY);
    
    doc.setFont("helvetica", "bold");
    const lines = doc.splitTextToSize(val, pageWidth - (sideX + 6 + labelOffset) - 18);
    doc.text(lines, sideX + 6 + labelOffset, currY);
    currY += (lines.length * 4.5) + 3.5;
  };

  drawLine("Present Numbers: ", presentNums || "None", 26);
  drawLine("Missing Numbers: ", missingNums || "None", 26);
  drawLine("Repeated Numbers: ", repeatsStr, 28);
  drawLine("Positive Arrows: ", posArrowsStr, 25);
  drawLine("Negative Arrows: ", negArrowsStr, 26);
  
  // Kua Vastu direction (Issue 7 fix: use getKuaVastuData for correct direction)
  const kuaVastuInfo = getKuaVastuData(kuaNum);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textDark);
  doc.setFontSize(8.2);
  doc.text("Kua Details: ", sideX + 6, currY);
  doc.setFont("helvetica", "bold");
  doc.text(`${kuaNum} (Direction: ${kuaVastuInfo.direction})`, sideX + 24, currY);

  // Section 2: Core Personality Insights
  const coreY = gridStartY + sideCardHeight + 15;
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, coreY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("CORE PERSONALITY INSIGHTS", 14, coreY + 7);

  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, coreY + 16, pageWidth - 30, 48, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, coreY + 16, pageWidth - 30, 48, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Analysis for ${clientData.name || "Native"}:`, 20, coreY + 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const pText = reportData.personalityAnalysis?.content || "You are highly intuitive, emotionally rich, and creative. The balance of your cosmic grid suggests a strong potential to convert dreams into practical reality. You easily gain respect from peers and maintain high spiritual insights.";
  const pLines = doc.splitTextToSize(pText, pageWidth - 42);
  doc.text(pLines, 20, coreY + 31);

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 3: MULANK-BHAGYANK ALIGNMENT & YOGAS
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // Section Header
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("MULANK – BHAGYANK ALIGNMENT & ITS MEANING", 14, 27);

  // ── Dynamic traits based on calculated mulank / bhagyank ──────────────
  const mulankTraits = reportData.lifePathTraits || {};
  const bhagyankTraits = reportData.expressionTraits || {};

  // Mulank Box (Left Column) — date digits only
  doc.setFillColor(254, 249, 231); // Pastel yellow card
  doc.roundedRect(15, 38, 85, 68, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, 38, 85, 68, 3, 3, "D");

  doc.setFillColor(...goldPrimary);
  doc.circle(57.5, 52, 11, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(String(mulank), 57.5, 55, { align: "center" });

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Mulank", 57.5, 68, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...goldPrimary);
  doc.text(`Planet: ${mulankTraits.planet || "Sun"}`, 20, 78);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  const mulLines = doc.splitTextToSize(mulankTraits.desc || "Represents leadership qualities, innovation, independent thought process, and primary life focus.", 76);
  doc.text(mulLines, 20, 84);

  // Bhagyank Box (Right Column) — all DOB digits
  doc.setFillColor(254, 249, 231);
  doc.roundedRect(pageWidth - 100, 38, 85, 68, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth - 100, 38, 85, 68, 3, 3, "D");

  doc.setFillColor(...goldPrimary);
  doc.circle(pageWidth - 57.5, 52, 11, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(String(bhagyank), pageWidth - 57.5, 55, { align: "center" });

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Bhagyank", pageWidth - 57.5, 68, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...goldPrimary);
  doc.text(`Planet: ${bhagyankTraits.planet || "Moon"}`, pageWidth - 95, 78);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  const bhagLines = doc.splitTextToSize(bhagyankTraits.desc || "Represents dynamic action, relationship handling, and how your inner potential converts to tangible actions.", 76);
  doc.text(bhagLines, pageWidth - 95, 84);

  // ── Kua Number box (below the two main boxes, centered) ──────────────
  const kuaBoxY = 112;
  doc.setFillColor(234, 245, 255); // soft blue for kua
  doc.roundedRect(pageWidth / 2 - 35, kuaBoxY, 70, 18, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth / 2 - 35, kuaBoxY, 70, 18, 3, 3, "D");

  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`KUA NUMBER: ${kuaNum}`, pageWidth / 2, kuaBoxY + 10, { align: "center" });

  // Section 4: Hidden Influences of Yogas (Dynamic — all 6 planes with partial logic)
  const yogY = 136;
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, yogY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("SECRET POWER OF LO SHU PLANES", 14, yogY + 7);

  // Show first 4 planes on Page 3 (3 horizontal + first vertical)
  const pagePlanes = hiddenInfluences.slice(0, 4);
  let planeY = yogY + 16;
  pagePlanes.forEach(plane => {
    const statusLabel = plane.isActive ? "FULLY ACTIVE" : plane.isInactive ? "ABSENT" : "PARTIAL";
    const bgColor = plane.isActive ? [234, 248, 240] : plane.isInactive ? [253, 234, 234] : [254, 249, 231];
    const borderWidth = plane.isActive ? 0.4 : 0.15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const interpLines = doc.splitTextToSize(plane.interpretation, pageWidth - 42);
    const cardHeight = 8 + interpLines.length * 5;

    doc.setFillColor(...bgColor);
    doc.roundedRect(15, planeY, pageWidth - 30, cardHeight, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(borderWidth);
    doc.roundedRect(15, planeY, pageWidth - 30, cardHeight, 2, 2, "D");

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`${plane.name} — ${statusLabel}`, 20, planeY + 5.5);

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(interpLines, 20, planeY + 11);

    planeY += cardHeight + 3.5;
  });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 4: REPEATING NUMBERS, EFFECTS OF MISSING NUMBERS & REMEDIES
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // Section 5
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("EFFECT OF REPEATING NUMBERS", 14, 27);

  let repY = 36;
  const repeated = reportData.repeatedNumbersAnalysis || [];
  if (repeated.length === 0) {
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, repY, pageWidth - 30, 16, 2, 2, "F");
    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("No numbers are repeated in your Date of Birth. This brings a very balanced and single-frequency energy vibration to your planes.", 20, repY + 10);
    repY += 22;
  } else {
    repeated.forEach(item => {
      doc.setFillColor(254, 249, 231); // light yellow
      doc.roundedRect(15, repY, pageWidth - 30, 13, 2, 2, "F");
      doc.setDrawColor(...goldPrimary);
      doc.setLineWidth(0.25);
      doc.roundedRect(15, repY, pageWidth - 30, 13, 2, 2, "D");

      doc.setTextColor(...goldPrimary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Number ${item.num} repeated ${item.count} times:`, 20, repY + 5);

      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(item.influence || "Enhances the qualities of this number significantly.", 20, repY + 9);
      repY += 15.5;
    });
  }

  // Section 6 & 7: Effects of Missing Numbers & Personalized Remedies
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, repY + 4, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("EFFECTS OF MISSING NUMBERS & PERSONALIZED REMEDIES", 14, repY + 11);

  let remY = repY + 20;
  const missingArr = getMissingNumbers(loShuGrid);
  
  // Issue 8 fix: Show ALL missing numbers using dynamic getMissingNumberRemedyData
  if (missingArr.length === 0) {
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, remY, pageWidth - 30, 16, 2, 2, "F");
    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("Congratulations! Your Lo Shu Grid contains no missing numbers. You have a highly cohesive primary energy spectrum.", 20, remY + 10);
  } else {
    missingArr.forEach(num => {
      const remInfo = getMissingNumberRemedyData(num);

      // Handle arrays of effects/remedies if available, else split string by newline
      const effectsList = remInfo.effectsList || (remInfo.effects || "").split("\n").map(e => e.replace(/^•\s*/, ""));
      const remediesList = remInfo.remediesList || (remInfo.crystal || "").split("\n").map(r => r.replace(/^•\s*/, ""));

      // Set active font to helvetica normal size 8.2 for splitTextToSize calculations
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);

      const wrappedEffects = [];
      effectsList.forEach(eff => {
        const lines = doc.splitTextToSize(`• ${eff}`, pageWidth - 46);
        wrappedEffects.push(lines);
      });

      const wrappedRemedies = [];
      remediesList.forEach(rem => {
        const lines = doc.splitTextToSize(`• ${rem}`, pageWidth - 46);
        wrappedRemedies.push(lines);
      });

      // Calculate total text lines to size the card dynamically
      const totalEffectsLines = wrappedEffects.reduce((acc, lines) => acc + lines.length, 0);
      const totalRemediesLines = wrappedRemedies.reduce((acc, lines) => acc + lines.length, 0);

      // Height: Header title (9.5) + "EFFECT:" title (5.5) + effects lines + "REMEDIES:" title (5.5) + remedies lines + padding
      const cardH = 9.5 + 5.5 + (totalEffectsLines * 4.2) + 5.5 + (totalRemediesLines * 4.2) + 7;

      // Guard: add new page if content overflows
      if (remY + cardH > pageHeight - 25) {
        doc.addPage();
        drawPageShell(doc);
        drawFooter(doc);
        remY = 25;
      }

      doc.setFillColor(253, 234, 234); // Pastel pink card
      doc.roundedRect(15, remY, pageWidth - 30, cardH, 3, 3, "F");
      doc.setDrawColor(...goldPrimary);
      doc.setLineWidth(0.25);
      doc.roundedRect(15, remY, pageWidth - 30, cardH, 3, 3, "D");

      // Draw title
      doc.setTextColor(...goldPrimary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(`Missing Number ${num} (${remInfo.planet})`, 20, remY + 6.5);

      let textY = remY + 11.5;

      // EFFECT section
      doc.setTextColor(197, 34, 31); // Reddish text for effect heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("EFFECT:", 20, textY);
      textY += 4.2;

      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      wrappedEffects.forEach(lines => {
        doc.text(lines, 20, textY);
        textY += lines.length * 4.2;
      });

      // REMEDIES section
      textY += 1.5;
      doc.setTextColor(19, 115, 51); // Greenish text for remedies heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("REMEDIES:", 20, textY);
      textY += 4.2;

      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      wrappedRemedies.forEach(lines => {
        doc.text(lines, 20, textY);
        textY += lines.length * 4.2;
      });

      remY += cardH + 4;
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 5: PROFESSIONAL & CAREER OUTLOOK & NAME COMPATIBILITY
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // Section 8
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PROFESSIONAL & CAREER OUTLOOK", 14, 27);

  // 1. Compatibility Matrix
  let careerY = 36;
  doc.setFillColor(243, 246, 252);
  doc.roundedRect(15, careerY, pageWidth - 30, 22, 2, 2, "F");
  doc.setDrawColor(173, 193, 230);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, careerY, pageWidth - 30, 22, 2, 2, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Combination ${mulank}-${bhagyank} Connection: ${careerData.compatibilityStatus}`, 20, careerY + 6);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const esotericLines = doc.splitTextToSize(`Esoteric Insight: ${careerData.esotericReason}`, pageWidth - 42);
  doc.text(esotericLines, 20, careerY + 11);
  
  careerY += 26;

  // 2. Workstyle
  const workstyleLines = doc.splitTextToSize(careerData.workstyle, pageWidth - 42);
  const workstyleH = 10 + workstyleLines.length * 4.5;
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, careerY, pageWidth - 30, workstyleH, 2, 2, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.15);
  doc.roundedRect(15, careerY, pageWidth - 30, workstyleH, 2, 2, "D");

  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Impact on Workstyle", 20, careerY + 5.5);

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(workstyleLines, 20, careerY + 11);

  careerY += workstyleH + 4;

  // 3. Suitable Careers
  let careersH = 8;
  const suitableWrapped = careerData.topCareers.map((c, idx) => {
    const lines = doc.splitTextToSize(`Field ${idx + 1}: ${c.field} - ${c.explanation}`, pageWidth - 46);
    careersH += lines.length * 4.5 + 2;
    return lines;
  });

  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, careerY, pageWidth - 30, careersH, 2, 2, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.15);
  doc.roundedRect(15, careerY, pageWidth - 30, careersH, 2, 2, "D");

  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Top 3 Recommended Career Fields", 20, careerY + 5.5);

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  let innerY = careerY + 11;
  suitableWrapped.forEach(lines => {
    doc.text(lines, 20, innerY);
    innerY += lines.length * 4.5 + 2;
  });

  careerY += careersH + 4;

  // 4. Careers to Avoid
  let avoidH = 8;
  const avoidWrapped = careerData.careersToAvoid.map(item => {
    const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 42);
    avoidH += lines.length * 4.5 + 1;
    return lines;
  });

  doc.setFillColor(255, 240, 240);
  doc.roundedRect(15, careerY, pageWidth - 30, avoidH, 2, 2, "F");
  doc.setDrawColor(249, 213, 213);
  doc.setLineWidth(0.15);
  doc.roundedRect(15, careerY, pageWidth - 30, avoidH, 2, 2, "D");

  doc.setTextColor(197, 34, 31);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Careers to Avoid (Strict Warning)", 20, careerY + 5.5);

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  let innerAvoidY = careerY + 11;
  avoidWrapped.forEach(lines => {
    doc.text(lines, 20, innerAvoidY);
    innerAvoidY += lines.length * 4.5 + 1;
  });

  careerY += avoidH + 4;

  // 5. Golden Remedy
  const remedyLines = doc.splitTextToSize(careerData.goldenRemedy, pageWidth - 42);
  const remedyH = 10 + remedyLines.length * 4.5;

  doc.setFillColor(254, 249, 231);
  doc.roundedRect(15, careerY, pageWidth - 30, remedyH, 2, 2, "F");
  doc.setDrawColor(249, 231, 159);
  doc.setLineWidth(0.15);
  doc.roundedRect(15, careerY, pageWidth - 30, remedyH, 2, 2, "D");

  doc.setTextColor(176, 96, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Golden Professional Remedy", 20, careerY + 5.5);

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(remedyLines, 20, careerY + 11);

  const careerCardH = careerY + remedyH - 36;

  // Section 9: Name Number Compatibility Analysis
  let sec9StartY = 36 + careerCardH + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.2);
  const nameCompLines = doc.splitTextToSize(nameCompatData.description, pageWidth - 46);
  const cardHeight = 16 + (nameCompLines.length * 4.5) + 12; // dynamic height including headers, description height, status line, and padding
  
  if (sec9StartY + cardHeight + 20 > pageHeight - 25) {
    doc.addPage();
    drawPageShell(doc);
    drawFooter(doc);
    sec9StartY = 20;
  }

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, sec9StartY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("NAME NUMBER COMPATIBILITY ANALYSIS", 14, sec9StartY + 7);

  const sec9CardStartY = sec9StartY + 16;

  doc.setFillColor(234, 238, 252); // Pastel blue card
  doc.roundedRect(15, sec9CardStartY, pageWidth - 30, cardHeight, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, sec9CardStartY, pageWidth - 30, cardHeight, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(`Current Name Vibrations: ${clientData.name || "Native"} (Chaldean Root: ${nameCompatData.nameNumber})`, 20, sec9CardStartY + 7);

  // Divider line inside name card
  doc.setDrawColor(200, 210, 240);
  doc.setLineWidth(0.15);
  doc.line(18, sec9CardStartY + 10, pageWidth - 18, sec9CardStartY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.2);
  let currentTextY = sec9CardStartY + 16;
  nameCompLines.forEach(line => {
    doc.text(line, 20, currentTextY);
    currentTextY += 4.5;
  });

  const statusY = currentTextY + 5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...goldPrimary);
  doc.text(`Name Number Compatibility Status: ${nameCompatData.status}`, 20, statusY);

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 6: MOBILE COMPATIBILITY & 5-YEAR FUTURE PREDICTIONS
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // Section 10
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("MOBILE NUMBER COMPATIBILITY INSIGHTS", 14, 27);

  // 1. Pre-calculate line wraps and heights to compute container height
  const descWidth = pageWidth - 66; // 144mm width
  const vibLines = mobileData.isValid ? doc.splitTextToSize(mobileData.vibrationMeaning, descWidth) : [];
  const compLines = mobileData.isValid ? doc.splitTextToSize(mobileData.compatibilityDescription, descWidth) : [];
  const zeroLines = mobileData.isValid ? doc.splitTextToSize(mobileData.zeroAnalysis, descWidth) : [];
  const lastFourText = mobileData.isValid ? `[${mobileData.lastFourDigits}] sum to ${mobileData.lastFourSingleDigit}: ${mobileData.lastFourMeaning}` : "";
  const lastFourLines = mobileData.isValid ? doc.splitTextToSize(lastFourText, descWidth) : [];

  let cardH = 30; // default height if invalid
  if (mobileData.isValid) {
    const h1 = Math.max(4.5, vibLines.length * 4);
    const h2 = Math.max(4.5, compLines.length * 4);
    const h3 = Math.max(4.5, zeroLines.length * 4);
    const h4 = Math.max(4.5, lastFourLines.length * 4);
    cardH = 14 + h1 + h2 + h3 + h4 + 4; // 14mm header offset + total line heights + padding
  }

  // Draw background box for Section 10
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, 35, pageWidth - 30, cardH, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, 35, pageWidth - 30, cardH, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(`Mobile Number: ${phone} (Sum: ${mobileData.totalSum} | Root: ${mobileData.singleDigit})`, 20, 42);

  // Draw a horizontal divider line below title
  doc.setDrawColor(232, 213, 191);
  doc.setLineWidth(0.15);
  doc.line(18, 45, pageWidth - 18, 45);

  doc.setFontSize(8.5);
  let contentY = 50;

  if (mobileData.isValid) {
    // 1. Vibration
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...goldPrimary);
    doc.text("VIBRATION:", 20, contentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.text(vibLines, 48, contentY);
    contentY += Math.max(4.5, vibLines.length * 4);

    // 2. Compatibility
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...goldPrimary);
    doc.text("COMPATIBILITY:", 20, contentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.text(compLines, 48, contentY);
    contentY += Math.max(4.5, compLines.length * 4);

    // 3. Vastu Flow
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...goldPrimary);
    doc.text("VASTU FLOW:", 20, contentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.text(zeroLines, 48, contentY);
    contentY += Math.max(4.5, zeroLines.length * 4);

    // 4. Last 4 Digits
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...goldPrimary);
    doc.text("LAST 4 DIGITS:", 20, contentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.text(lastFourLines, 48, contentY);
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textMuted);
    doc.text("No mobile number has been provided for this client profile.", 20, 52);
  }

  // Section 11: 5-Year Future Predictions (Dynamic Personal Year per calendar year)
  // Dynamically position Section 11 relative to the end of Section 10 card
  const sec11StartY = 35 + cardH + 6;
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, sec11StartY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("5-YEAR PERSONAL YEAR FORECAST", 14, sec11StartY + 7);

  let yrY = sec11StartY + 16;
  fiveYearPredictions.forEach(pred => {
    const themeLines = doc.splitTextToSize(pred.theme, pageWidth - 58);
    const cardH = 8 + themeLines.length * 4.5;

    doc.setFillColor(254, 249, 231);
    doc.roundedRect(15, yrY, pageWidth - 30, cardH, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, yrY, pageWidth - 30, cardH, 2, 2, "D");

    // Year badge
    doc.setFillColor(...goldPrimary);
    doc.roundedRect(15, yrY, 26, cardH, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${pred.year}`, 28, yrY + cardH / 2 + 1, { align: "center" });
    doc.setFontSize(7);
    doc.text(`PY ${pred.personalYear}`, 28, yrY + cardH / 2 + 5.5, { align: "center" });

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(pred.title, 44, yrY + 5.5);

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(themeLines, 44, yrY + 10.5);

    yrY += cardH + 3;
  });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 6b: CHALDEAN COMPATIBILITY + REMAINING LO SHU PLANES
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // ── Chaldean Number Compatibility ──────────────────────────────────────
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("CHALDEAN NUMBER COMPATIBILITY ANALYSIS", 14, 27);

  const ca = compatibilityAnalysis;
  const compatBg = ca.overallStatus === "friend"  ? [234, 248, 240] :
                   ca.overallStatus === "enemy"   ? [253, 234, 234] : [254, 249, 231];
  const compatLabel = ca.overallStatus === "friend"  ? "HIGHLY COMPATIBLE ✓" :
                      ca.overallStatus === "enemy"   ? "CHALLENGING — REMEDY RECOMMENDED" : "NEUTRAL";
  const compatLabelColor = ca.overallStatus === "friend"  ? [0, 128, 0] :
                           ca.overallStatus === "enemy"   ? [200, 50, 50] : [...goldPrimary];

  // Two number boxes side by side
  doc.setFillColor(254, 249, 231);
  doc.roundedRect(15, 36, 55, 36, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, 36, 55, 36, 3, 3, "D");
  doc.setFillColor(...goldPrimary);
  doc.circle(42.5, 47, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(String(mulank), 42.5, 50, { align: "center" });
  doc.setTextColor(...textDark);
  doc.setFontSize(8.5);
  doc.text(`Mulank`, 42.5, 60, { align: "center" });
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text(ca.mulankPlanet, 42.5, 65, { align: "center" });

  // "vs" connector
  doc.setTextColor(...goldPrimary);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("vs", pageWidth / 2, 56, { align: "center" });

  // Bhagyank box
  doc.setFillColor(254, 249, 231);
  doc.roundedRect(pageWidth - 70, 36, 55, 36, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth - 70, 36, 55, 36, 3, 3, "D");
  doc.setFillColor(...goldPrimary);
  doc.circle(pageWidth - 42.5, 47, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(String(bhagyank), pageWidth - 42.5, 50, { align: "center" });
  doc.setTextColor(...textDark);
  doc.setFontSize(8.5);
  doc.text(`Bhagyank`, pageWidth - 42.5, 60, { align: "center" });
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text(ca.bhagyankPlanet, pageWidth - 42.5, 65, { align: "center" });

  // Compatibility status badge
  doc.setFillColor(...compatBg);
  doc.roundedRect(15, 78, pageWidth - 30, 8, 2, 2, "F");
  doc.setTextColor(...compatLabelColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(compatLabel, pageWidth / 2, 83.5, { align: "center" });

  // Description
  doc.setFillColor(255, 254, 249);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const caDescLines = doc.splitTextToSize(ca.description, pageWidth - 42);
  doc.roundedRect(15, 90, pageWidth - 30, caDescLines.length * 5.5 + 6, 2, 2, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, 90, pageWidth - 30, caDescLines.length * 5.5 + 6, 2, 2, "D");
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(caDescLines, 20, 96);

  // ── Remaining Lo Shu Planes (Middle & Right columns) ───────────────────
  const caDescCardH = caDescLines.length * 5.5 + 6;
  let remPlaneY = 90 + caDescCardH + 10;

  // Guard: if vertical planes will overflow this page, push them to a new page
  if (remPlaneY + 40 > pageHeight - 25) {
    doc.addPage();
    drawPageShell(doc);
    drawFooter(doc);
    remPlaneY = 25;
  }

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, remPlaneY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("HIDDEN INFLUENCE — VERTICAL PLANES", 14, remPlaneY + 7);
  remPlaneY += 14;

  hiddenInfluences.slice(4).forEach(plane => {
    const statusLabel = plane.isActive ? "FULLY ACTIVE" : plane.isInactive ? "ABSENT" : "PARTIAL";
    const bgColor = plane.isActive ? [234, 248, 240] : plane.isInactive ? [253, 234, 234] : [254, 249, 231];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const interpLines = doc.splitTextToSize(plane.interpretation, pageWidth - 42);
    const cardH = 8 + interpLines.length * 5;

    doc.setFillColor(...bgColor);
    doc.roundedRect(15, remPlaneY, pageWidth - 30, cardH, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(plane.isActive ? 0.4 : 0.15);
    doc.roundedRect(15, remPlaneY, pageWidth - 30, cardH, 2, 2, "D");

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`${plane.name} — ${statusLabel}`, 20, remPlaneY + 5.5);

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(interpLines, 20, remPlaneY + 11);

    remPlaneY += cardH + 3.5;
  });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 6c: PERSONAL YEAR DETAILED ANALYSIS
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`PERSONAL YEAR ${personalYearNum} — DETAILED ANALYSIS`, 14, 27);

  // Year badge
  doc.setFillColor(234, 248, 240);
  doc.roundedRect(15, 36, pageWidth - 30, 20, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, 36, pageWidth - 30, 20, 3, 3, "D");
  doc.setFillColor(...goldPrimary);
  doc.circle(32, 46, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(String(personalYearNum), 32, 49, { align: "center" });
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(personalYearInfo.title, 46, 43);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const pyThemeLines = doc.splitTextToSize(personalYearInfo.theme, pageWidth - 65);
  doc.text(pyThemeLines, 46, 49);

  // 4 life area cards
  const lifeAreas = [
    { label: "HEALTH",       text: personalYearInfo.health,       bg: [253, 234, 234] },
    { label: "FINANCE",      text: personalYearInfo.finance,      bg: [234, 248, 240] },
    { label: "CAREER",       text: personalYearInfo.career,       bg: [234, 238, 252] },
    { label: "RELATIONSHIP", text: personalYearInfo.relationship, bg: [254, 249, 231] }
  ];

  let lifeY = 62;
  lifeAreas.forEach(area => {
    const aLines = doc.splitTextToSize(area.text, pageWidth - 46);
    const aH = 8 + aLines.length * 5.2;

    doc.setFillColor(...area.bg);
    doc.roundedRect(15, lifeY, pageWidth - 30, aH, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, lifeY, pageWidth - 30, aH, 2, 2, "D");

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(area.label, 20, lifeY + 6);

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(aLines, 20, lifeY + 12);

    lifeY += aH + 4;
  });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 7: LUCKY/UNLUCKY ELEMENTS, COLORS & SIGNATURE STYLE
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);


  // Section 12 & 13
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("LUCKY ELEMENTS", 14, 27);

  const luckyElements = [
    { label: "Lucky Number",       value: `${luckyData.luckyNumber} (Life Path)`,   color: [181, 130, 10] },
    { label: "Lucky Dates",        value: luckyData.luckyDates,                      color: [0, 150, 100] },
    { label: "Challenging Dates",  value: luckyData.unluckyDates,                    color: [229, 62, 62] },
    { label: "Lucky Color",        value: luckyData.luckyColor,                      color: [181, 130, 10] },
    { label: "Challenging Color",  value: luckyData.unluckyColor,                    color: [61, 44, 30] },
    { label: "Lucky Direction",    value: luckyData.luckyDirection,                  color: [0, 150, 100] },
    { label: "Core Element",       value: `${luckyData.element} (${luckyData.planetEnergy})`, color: [105, 80, 180] },
  ];

  const colWidth = (pageWidth - 40) / 3;
  let xIdx = 0;
  let yIdx = 0;

  luckyElements.forEach((elem) => {
    const curX = 15 + xIdx * colWidth;
    const curY = 38 + yIdx * 20;

    doc.setFillColor(255, 254, 249);
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(curX, curY, colWidth - 5, 18, 2, 2, "FD");

    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "normal");
    doc.text(elem.label, curX + 4, curY + 5.5);

    doc.setFontSize(8.5);
    doc.setTextColor(...(elem.color || textDark));
    doc.setFont("helvetica", "bold");
    // Wrap long values to fit within card width
    const valLines = doc.splitTextToSize(String(elem.value || "-"), colWidth - 12);
    doc.text(valLines[0], curX + 4, curY + 12); // show first line only

    xIdx++;
    if (xIdx > 2) {
      xIdx = 0;
      yIdx++;
    }
  });

  // Section 14: Signature Style for Success
  // Use tracked yIdx to accurately position after the last row
  const actualRows = yIdx + (xIdx > 0 ? 1 : 0); // rows actually used (yIdx doesn't increment after last row if incomplete)
  const luckyGridEndY = 38 + actualRows * 20 + 8;  // 8mm gap after the grid

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, luckyGridEndY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("SIGNATURE STYLE FOR SUCCESS", 14, luckyGridEndY + 7);

  const sigBoxY = luckyGridEndY + 14;  // 4mm below header bottom (header is 10mm)
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, sigBoxY, pageWidth - 30, 68, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, sigBoxY, pageWidth - 30, 68, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Prosperity Signature Rules:", 20, sigBoxY + 8);

  const sigRules = [
    "• Sign at a continuous rising angle of approximately 45 degrees.",
    "• Never put a line cutting through any letters of your name.",
    "• Always end your signature with a forward and rising stroke.",
    "• Use two parallel underlines below the signature with a rising ending.",
    "• Ensure the first alphabet of your name is larger and clearly readable."
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  let sigY = sigBoxY + 16;
  sigRules.forEach(rule => {
    doc.text(rule, 20, sigY);
    sigY += 9;
  });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 8: YANTRA-BASED REMEDIES & BRACELET REMEDIES
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  // Section 15
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("REMEDIES", 14, 27);

  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, 36, pageWidth - 30, 52, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, 36, pageWidth - 30, 52, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const yantraText = "The Lo Shu Grid is considered a divine representation of the universe. Drawing the grid numbers on high-quality copper or keeping a personalized copper Lo Shu Yantra in your home's north or east sector balances missing planetary energies. Chant planetary mantras daily to amplify success grids.";
  const yantraLines = doc.splitTextToSize(yantraText, pageWidth - 42);
  doc.text(yantraLines, 20, 51);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...goldPrimary);
  doc.text("Yantra Direction placement: North / East living sector", 20, 80);

  // // Section 16: Bracelet & Energy Remedies
  // doc.setFillColor(...goldPrimary);
  // doc.roundedRect(10, 96, pageWidth - 20, 10, 2, 2, "F");
  // doc.setTextColor(255, 255, 255);
  // doc.setFont("helvetica", "bold");
  // doc.setFontSize(12);
  // doc.text("BRACELET & ENERGY REMEDIES", 14, 103);

  // doc.setFillColor(254, 249, 231);
  // doc.roundedRect(15, 112, pageWidth - 30, 52, 3, 3, "F");
  // doc.setDrawColor(...goldPrimary);
  // doc.setLineWidth(0.25);
  // doc.roundedRect(15, 112, pageWidth - 30, 52, 3, 3, "D");

  // doc.setTextColor(...textDark);
  // doc.setFont("helvetica", "bold");
  // doc.setFontSize(11);
  // doc.text("Crystal Recommendation for Life Balance:", 20, 120);

  // doc.setFont("helvetica", "normal");
  // doc.setFontSize(9.5);
  // const crystalText = "Crystals acts as high-frequency energy conduits. Wearing a dynamic combination of Green Aventurine, Tiger Eye, and Clear Quartz bracelet aligns cosmic vibrations. Rudraksha beads (Five Mukhi) keep the heart chakra grounded and shield against modern electromagnetic pollutions.";
  // const crystalLines = doc.splitTextToSize(crystalText, pageWidth - 42);
  // doc.text(crystalLines, 20, 127);

  // doc.setFont("helvetica", "bold");
  // doc.setTextColor(0, 150, 100);
  // doc.text("Recommended: Multi-Gemstone Prosperity Bracelet (Wear on Left hand)", 20, 154);

  // ════════════════════════════════════════════════════════════════════════
  // PAGE: FOREIGN SETTLEMENT PREDICTION
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("FOREIGN SETTLEMENT PREDICTION", 14, 27);

  // Probability header card
  doc.setFillColor(232, 244, 253);
  doc.roundedRect(15, 34, pageWidth - 30, 22, 3, 3, "F");
  doc.setDrawColor(26, 111, 168);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, 34, pageWidth - 30, 22, 3, 3, "D");

  doc.setTextColor(13, 60, 94);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(`Probability Score: ${foreignSettlement.probabilityScore}%`, 20, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);
  doc.text(`Present: ${foreignSettlement.presentNums.join(', ')}`, 20, 50);
  doc.text(`Missing: ${foreignSettlement.missingNums.join(', ') || 'None'}`, pageWidth / 2, 50);

  let fsY = 62;

  // Core result
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, fsY, pageWidth - 30, 26, 2, 2, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, fsY, pageWidth - 30, 26, 2, 2, "D");
  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("FOREIGN SETTLEMENT PREDICTIONS", 20, fsY + 6);

  const coreColor = foreignSettlement.coreGood ? [19, 115, 51] : [197, 34, 31];
  doc.setFillColor(...coreColor);
  doc.circle(21, fsY + 17, 2, "F");
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const coreLines = doc.splitTextToSize(`${foreignSettlement.coreGood ? 'Match' : 'Alert'}: ${foreignSettlement.coreResult}`, pageWidth - 50);
  doc.text(coreLines, 26, fsY + 18);
  fsY += 32;

  // Friction lines
  if (foreignSettlement.frictionLines.length > 0) {
    const frH = 10 + foreignSettlement.frictionLines.length * 8;
    doc.setFillColor(255, 244, 230);
    doc.roundedRect(15, fsY, pageWidth - 30, frH, 2, 2, "F");
    doc.setDrawColor(245, 192, 122);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, fsY, pageWidth - 30, frH, 2, 2, "D");
    doc.setTextColor(138, 69, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("PLANETARY FRICTION", 20, fsY + 6);
    let fline = fsY + 13;
    foreignSettlement.frictionLines.forEach(line => {
      doc.setFillColor(197, 34, 31);
      doc.circle(21, fline, 1.8, "F");
      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      const fl = doc.splitTextToSize(line, pageWidth - 52);
      doc.text(fl, 26, fline + 1);
      fline += fl.length * 4.5 + 2;
    });
    fsY += frH + 6;
  }

  // Planetary note
  const pnLines = doc.splitTextToSize(foreignSettlement.planetaryNote, pageWidth - 42);
  const pnH = 10 + pnLines.length * 4.5;
  doc.setFillColor(240, 244, 255);
  doc.roundedRect(15, fsY, pageWidth - 30, pnH, 2, 2, "F");
  doc.setDrawColor(191, 208, 247);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, fsY, pageWidth - 30, pnH, 2, 2, "D");
  doc.setTextColor(26, 58, 110);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("PLANETARY ALIGNMENT", 20, fsY + 6);
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(pnLines, 20, fsY + 12);

  // ════════════════════════════════════════════════════════════════════════
  // PAGE: LOVE vs ARRANGED MARRIAGE PREDICTION
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("LOVE vs ARRANGED MARRIAGE PREDICTION", 14, 27);

  let mrY = 36;

  // Two percentage boxes side by side
  const boxW = (pageWidth - 36) / 2;
  // Love box
  const loveBg   = marriageType.dominant === 'Love' ? [255, 194, 212] : [255, 235, 240];
  const loveFg   = [194, 24, 91];
  doc.setFillColor(...loveBg);
  doc.roundedRect(15, mrY, boxW, 28, 3, 3, "F");
  doc.setDrawColor(...loveFg);
  doc.setLineWidth(marriageType.dominant === 'Love' ? 0.6 : 0.2);
  doc.roundedRect(15, mrY, boxW, 28, 3, 3, "D");
  doc.setTextColor(...loveFg);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(marriageType.dominant === 'Love' ? 14 : 12);
  doc.text(`${marriageType.lovePct}%`, 15 + boxW / 2, mrY + 12, { align: "center" });
  doc.setFontSize(8.5);
  doc.text("Love Marriage", 15 + boxW / 2, mrY + 22, { align: "center" });

  // Arranged box
  const arrBg  = marriageType.dominant === 'Arranged' ? [187, 222, 251] : [232, 244, 253];
  const arrFg  = [21, 101, 192];
  doc.setFillColor(...arrBg);
  doc.roundedRect(21 + boxW, mrY, boxW, 28, 3, 3, "F");
  doc.setDrawColor(...arrFg);
  doc.setLineWidth(marriageType.dominant === 'Arranged' ? 0.6 : 0.2);
  doc.roundedRect(21 + boxW, mrY, boxW, 28, 3, 3, "D");
  doc.setTextColor(...arrFg);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(marriageType.dominant === 'Arranged' ? 14 : 12);
  doc.text(`${marriageType.arrangePct}%`, 21 + boxW + boxW / 2, mrY + 12, { align: "center" });
  doc.setFontSize(8.5);
  doc.text("Arranged Marriage", 21 + boxW + boxW / 2, mrY + 22, { align: "center" });
  mrY += 34;

  // Highlight banner
  doc.setFillColor(254, 249, 231);
  doc.roundedRect(15, mrY, pageWidth - 30, 12, 2, 2, "F");
  doc.setDrawColor(249, 231, 159);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, mrY, pageWidth - 30, 12, 2, 2, "D");
  doc.setTextColor(138, 85, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(marriageType.highlight, pageWidth / 2, mrY + 8, { align: "center" });
  mrY += 18;

  // Comments section
  const commentsH = 10 + marriageType.comments.length * 9;
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, mrY, pageWidth - 30, commentsH, 2, 2, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, mrY, pageWidth - 30, commentsH, 2, 2, "D");
  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("COMMENTS & JUSTIFICATION", 20, mrY + 6);
  let cmY = mrY + 13;
  marriageType.comments.forEach(c => {
    const isMissing = c.includes('MISSING');
    doc.setFillColor(...(isMissing ? [197, 34, 31] : [19, 115, 51]));
    doc.circle(21, cmY, 1.8, "F");
    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    const cl = doc.splitTextToSize(c, pageWidth - 52);
    doc.text(cl, 26, cmY + 1);
    cmY += cl.length * 4.2 + 3;
  });

  // ════════════════════════════════════════════════════════════════════════
  // PAGE: MATCH MAKING COMPATIBILITY (only if consultant filled the data)
  // ════════════════════════════════════════════════════════════════════════
  if (mmResult) {
    doc.addPage();
    drawPageShell(doc);

    doc.setFillColor(...goldPrimary);
    doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("MATCH MAKING COMPATIBILITY", 14, 27);

    // Rating header
    doc.setFillColor(255, 228, 240);
    doc.roundedRect(15, 34, pageWidth - 30, 24, 3, 3, "F");
    doc.setDrawColor(233, 30, 99);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, 34, pageWidth - 30, 24, 3, 3, "D");

    doc.setTextColor(136, 14, 79);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`${mmResult.maleName} & ${mmResult.femaleName}`, 20, 42);
    doc.setFontSize(9);
    doc.text(`${mmResult.ratingLabel}  |  Total: ${mmResult.totalPercentage}%`, 20, 51);
    doc.setFontSize(10);
    // Draw stars as text using standard chars
    const starText = `${'*'.repeat(mmResult.stars)}${'o'.repeat(5 - mmResult.stars)}  (${mmResult.stars}/5 Stars)`;
    doc.text(starText, pageWidth - 20, 51, { align: "right" });

    let mmY = 64;

    // Highlights
    const hlH = 10 + mmResult.highlights.length * 7;
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, mmY, pageWidth - 30, hlH, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, mmY, pageWidth - 30, hlH, 2, 2, "D");
    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("HIGHLIGHTS", 20, mmY + 6);
    let hlY = mmY + 13;
    mmResult.highlights.forEach(h => {
      doc.setFillColor(...goldPrimary);
      doc.circle(21, hlY, 1.5, "F");
      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      const hl = doc.splitTextToSize(h, pageWidth - 52);
      doc.text(hl, 26, hlY + 1);
      hlY += hl.length * 4.2 + 2;
    });
    mmY += hlH + 6;

    // Shared pairs
    if (mmResult.sharedPairs.length > 0) {
      doc.setFillColor(240, 255, 244);
      doc.roundedRect(15, mmY, pageWidth - 30, 18, 2, 2, "F");
      doc.setDrawColor(165, 214, 167);
      doc.setLineWidth(0.2);
      doc.roundedRect(15, mmY, pageWidth - 30, 18, 2, 2, "D");
      doc.setTextColor(46, 125, 50);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("SHARABLE NUMBER PAIRS", 20, mmY + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(mmResult.sharedPairs.map(p => p.pair).join('   '), 20, mmY + 14);
      mmY += 24;
    }

    // Boost logs
    const blH = 10 + mmResult.boostLogs.length * 9;
    if (mmY + blH < pageHeight - 30) {
      doc.setFillColor(255, 254, 249);
      doc.roundedRect(15, mmY, pageWidth - 30, blH, 2, 2, "F");
      doc.setDrawColor(...goldPrimary);
      doc.setLineWidth(0.2);
      doc.roundedRect(15, mmY, pageWidth - 30, blH, 2, 2, "D");
      doc.setTextColor(...goldPrimary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("COMPATIBILITY INSIGHTS", 20, mmY + 6);
      let blY = mmY + 13;
      mmResult.boostLogs.forEach(log => {
        doc.setFillColor(19, 115, 51);
        doc.circle(21, blY, 1.8, "F");
        doc.setTextColor(...textDark);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.2);
        const bl = doc.splitTextToSize(cleanStars(log), pageWidth - 52);
        doc.text(bl, 26, blY + 1);
        blY += bl.length * 4.2 + 3;
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 12b: MOBILE NUMBER ANALYSIS (Strict Planetary Matrix)
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("MOBILE NUMBER ANALYSIS", 14, 27);

  let mbY = 36;

  if (mobileCheck.isValid) {
    // Header card
    doc.setFillColor(232, 248, 238);
    doc.roundedRect(15, mbY, pageWidth - 30, 22, 3, 3, "F");
    doc.setDrawColor(46, 125, 82);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, mbY, pageWidth - 30, 22, 3, 3, "D");

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`Mobile: ${phone}`, 20, mbY + 7);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Compound Total: ${mobileCheck.totalSum}   |   Single Digit: ${mobileCheck.singleDigit}`, 20, mbY + 13);

    const statusColor = mobileCheck.isCompatible ? [19, 115, 51] : [197, 34, 31];
    doc.setTextColor(...statusColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(mobileCheck.overallStatus, pageWidth - 20, mbY + 10, { align: "right" });

    mbY += 28;

    // Section A: Mobile Number Compatibility Check
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, mbY, pageWidth - 30, 30, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, mbY, pageWidth - 30, 30, 2, 2, "D");

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("MOBILE NUMBER COMPATIBILITY CHECK", 20, mbY + 6);

    const dot1 = mobileCheck.isCompatible ? [19, 115, 51] : [197, 34, 31];
    doc.setFillColor(...dot1);
    doc.circle(21, mbY + 14, 2, "F");
    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const cLine1 = doc.splitTextToSize(mobileCheck.compatSentence, pageWidth - 50);
    doc.text(cLine1, 26, mbY + 15);

    const ratingColor = mobileCheck.compoundRating.label === 'Very Good' ? [19, 115, 51] : mobileCheck.compoundRating.label === 'Bad' ? [197, 34, 31] : [176, 96, 0];
    doc.setFillColor(...ratingColor);
    doc.circle(21, mbY + 23, 2, "F");
    doc.setTextColor(...textDark);
    const cLine2 = doc.splitTextToSize(cleanStars(mobileCheck.compoundSentence), pageWidth - 50);
    doc.text(cLine2, 26, mbY + 24);

    mbY += 36;

    // Section B: Good To Have
    doc.setFillColor(254, 249, 231);
    doc.roundedRect(15, mbY, pageWidth - 30, 30, 2, 2, "F");
    doc.setDrawColor(249, 231, 159);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, mbY, pageWidth - 30, 30, 2, 2, "D");

    doc.setTextColor(176, 96, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("GOOD TO HAVE", 20, mbY + 6);

    doc.setFillColor(19, 115, 51);
    doc.circle(21, mbY + 14, 2, "F");
    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const gLine1 = doc.splitTextToSize(mobileCheck.goodToHave, pageWidth - 50);
    doc.text(gLine1, 26, mbY + 15);

    doc.setFillColor(197, 34, 31);
    doc.circle(21, mbY + 23, 2, "F");
    const gLine2 = doc.splitTextToSize(mobileCheck.avoidSentence, pageWidth - 50);
    doc.text(gLine2, 26, mbY + 24);

    mbY += 36;

    // Section C: Impact on Life & Work
    const impactLines = doc.splitTextToSize(mobileCheck.impactLine, pageWidth - 42);
    const impactCardH = 10 + impactLines.length * 4.5;
    doc.setFillColor(240, 244, 255);
    doc.roundedRect(15, mbY, pageWidth - 30, impactCardH, 2, 2, "F");
    doc.setDrawColor(191, 208, 247);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, mbY, pageWidth - 30, impactCardH, 2, 2, "D");

    doc.setTextColor(26, 58, 110);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("IMPACT ON LIFE & WORK", 20, mbY + 6);

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(impactLines, 20, mbY + 12);

  } else {
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, mbY, pageWidth - 30, 16, 2, 2, "F");
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.text("No mobile number provided for this client profile.", 20, mbY + 10);
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 12c: NAME NUMEROLOGY ANALYSIS (Strict Planetary Matrix)
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc);

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("NAME NUMEROLOGY ANALYSIS", 14, 27);

  let nmY = 36;

  const drawNameCard = (title, cardData, isFullName = false) => {
    if (!cardData) return;
    const lineItems = [
      { good: cardData.not48Check,     text: cleanStars(`Count should not be 4 or 8. ${cardData.not48Check ? '✓' : `Currently ${cardData.single}.`}`) },
      { good: cardData.driverStatus !== 'enemy' && cardData.conductorStatus !== 'enemy', text: cleanStars(cardData.compatLine) },
    ];
    if (isFullName) {
      lineItems.push({ good: cardData.targetOk, text: cleanStars(cardData.targetLine) });
    }
    lineItems.push({ good: cardData.compoundRating?.label !== 'Bad', text: cleanStars(cardData.compoundLine) });

    // Pre-calculate height
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    let totalH = 12 + 6; // title + compound badge row
    lineItems.forEach(item => {
      const lines = doc.splitTextToSize(item.text, pageWidth - 54);
      totalH += lines.length * 4.2 + 3;
    });
    totalH += 4; // bottom padding

    if (nmY + totalH > pageHeight - 30) {
      doc.addPage();
      drawPageShell(doc);
      drawFooter(doc);
      nmY = 25;
    }

    doc.setFillColor(254, 249, 231);
    doc.roundedRect(15, nmY, pageWidth - 30, totalH, 3, 3, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.25);
    doc.roundedRect(15, nmY, pageWidth - 30, totalH, 3, 3, "D");

    // Title + numbers
    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(title, 20, nmY + 6);
    doc.setTextColor(...textMuted);
    doc.setFontSize(8);
    doc.text(`Compound: ${cardData.compound}   Single: ${cardData.single}`, pageWidth - 20, nmY + 6, { align: "right" });

    let lineY = nmY + 12;
    lineItems.forEach(item => {
      const dotColor = item.good ? [19, 115, 51] : [197, 34, 31];
      doc.setFillColor(...dotColor);
      doc.circle(21, lineY + 1, 1.8, "F");
      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      const lines = doc.splitTextToSize(item.text, pageWidth - 54);
      doc.text(lines, 26, lineY + 2);
      lineY += lines.length * 4.2 + 3;
    });

    nmY += totalH + 5;
  };

  if (nameNumerologyCheck.isValid) {
    drawNameCard(`FIRST NAME: ${nameNumerologyCheck.firstNameCard.name}`, nameNumerologyCheck.firstNameCard, false);
    if (nameNumerologyCheck.lastNameCard) {
      drawNameCard(`LAST NAME: ${nameNumerologyCheck.lastNameCard.name}`, nameNumerologyCheck.lastNameCard, false);
    }
    drawNameCard(`FULL NAME: ${nameNumerologyCheck.fullNameCard.name}`, nameNumerologyCheck.fullNameCard, true);

    // Final Status Banner
    if (nmY + 16 > pageHeight - 30) {
      doc.addPage();
      drawPageShell(doc);
      drawFooter(doc);
      nmY = 25;
    }
    const statusBg = nameNumerologyCheck.finalStatusGood ? [212, 237, 218] : [248, 215, 218];
    const statusFg = nameNumerologyCheck.finalStatusGood ? [21, 87, 36]   : [114, 28, 36];
    const statusBorder = nameNumerologyCheck.finalStatusGood ? [40, 167, 69] : [220, 53, 69];
    doc.setFillColor(...statusBg);
    doc.roundedRect(15, nmY, pageWidth - 30, 14, 3, 3, "F");
    doc.setDrawColor(...statusBorder);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, nmY, pageWidth - 30, 14, 3, 3, "D");
    doc.setTextColor(...statusFg);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`STATUS: ${nameNumerologyCheck.finalStatus}`, pageWidth / 2, nmY + 9, { align: "center" });
  } else {
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, nmY, pageWidth - 30, 16, 2, 2, "F");
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.text("No name data available for analysis.", 20, nmY + 10);
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGES: 3 BLANK PAGES FOR CONSULTANT NOTES / SUGGESTIONS
  // ════════════════════════════════════════════════════════════════════════
  for (let c = 1; c <= 3; c++) {
    doc.addPage();
    drawPageShell(doc);

    const pageData = reportData[`customPage${c}`] || {};
    const contentText = pageData.content || "";

    doc.setFillColor(...goldPrimary);
    doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("NOTES / SUGGESTIONS", 14, 27);

    doc.setFillColor(255, 254, 249);
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, 38, pageWidth - 30, pageHeight - 74, 4, 4, "FD");

    if (contentText) {
      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const lines = doc.splitTextToSize(contentText, pageWidth - 42);
      doc.text(lines, 20, 48);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE: FINAL THANK YOU & DISCLAIMER PAGE
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc, true);

  // Add LastPage png asset
  if (lastPageGraphic) {
    doc.addImage(lastPageGraphic, "PNG", (pageWidth - 95) / 2, 35, 95, 60);
  }

  // "Thank You," text in dynamic green font
  doc.setTextColor(...greenText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("Thank You,", pageWidth / 2, 115, { align: "center" });

  // Disclaimer Title
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("DISCLAIMER", pageWidth / 2, 155, { align: "center" });

  // Disclaimer Body text
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  const disclaimerText = "This report is for informational and entertainment purposes only. The findings provided are based on traditional numerological methods and should not be considered professional advice in any field, such as financial, medical, legal, or psychological. Results can be different, and any choices you make from this report are your own responsibility. Use this as a tool for self-reflection, and consult qualified professionals for significant life decisions.";
  const discLines = doc.splitTextToSize(disclaimerText, pageWidth - 36);
  doc.text(discLines, pageWidth / 2, 163, { align: "center" });

  // Add all footers sequentially
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Draw footer on all pages (cover is page 1, but user requested in all report pages)
    drawFooter(doc);
  }

  return doc;
};
