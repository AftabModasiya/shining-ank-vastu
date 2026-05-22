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
  getRepeatedNumbers
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

  // Dynamic mobile number compatibility insights
  const mobileData = getMobileAnalysis(phone, bhagyank);

  // Dynamic name number compatibility insights
  const nameCompatData = getNameCompatibilityAnalysis(clientData.name || '', mulank, bhagyank);

  // Dynamic professional & career outlook insights
  const careerData = getCareerOutlook(mulank, bhagyank);

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

  // Current Date in DD-MM-YYYY
  const today = new Date();
  const reportDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  // ── Pre-compute new analysis data ─────────────────────────────────────
  const loShuGridEarly = calculateLoShuGrid(rawDob);

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

  // Render Lo Shu Grid (Raw DOB frequencies only, no Kua numbers inside the grid)
  const loShuGrid = calculateLoShuGrid(rawDob);
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

  // Side summary box (ivory background card)
  const sideX = 104;
  doc.setFillColor(255, 254, 249);
  doc.roundedRect(sideX, gridStartY, pageWidth - sideX - 15, gridSize * 3, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(sideX, gridStartY, pageWidth - sideX - 15, gridSize * 3, 3, 3, "D");

  doc.setTextColor(...goldPrimary);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text("GRID HIGHLIGHTS", sideX + 6, gridStartY + 8);
  
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
  
  // Kua Details line
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textDark);
  doc.setFontSize(8.2);
  doc.text("Kua Details: ", sideX + 6, currY);
  doc.setFont("helvetica", "bold");
  doc.text(`${kuaNum} (Direction: ${reportData.luckyElements?.luckyDirection || "East"})`, sideX + 24, currY);

  // Section 2: Core Personality Insights
  const coreY = gridStartY + (gridSize * 3) + 15;
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
  
  if (missingArr.length === 0) {
    doc.setFillColor(255, 254, 249);
    doc.roundedRect(15, remY, pageWidth - 30, 16, 2, 2, "F");
    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("Congratulations! Your Lo Shu Grid contains no missing numbers. You have a highly cohesive primary energy spectrum.", 20, remY + 10);
  } else {
    // Show top 3 missing numbers to fit page beautifully
    missingArr.slice(0, 3).forEach(num => {
      // Find matching remedy info or generate dynamic ones
      const remInfo = reportData.missingNumbersRemedies?.find(r => r.num === num) || {
        num: num,
        planet: num === 1 ? "Sun" : num === 2 ? "Moon" : num === 3 ? "Jupiter" : num === 6 ? "Venus" : num === 7 ? "Ketu" : num === 8 ? "Saturn" : num === 9 ? "Mars" : "Mercury",
        effects: `Faces minor issues related to the specific energy plane of Number ${num}.`,
        crystal: num === 1 ? "Ruby" : num === 2 ? "Pearl / Moonstone" : num === 3 ? "Yellow Sapphire" : num === 6 ? "Diamond / Sphatik" : num === 7 ? "Cat's Eye" : num === 8 ? "Blue Sapphire" : "Coral Bracelet"
      };

      doc.setFillColor(253, 234, 234); // Pastel pink for missing
      doc.roundedRect(15, remY, pageWidth - 30, 24, 3, 3, "F");
      doc.setDrawColor(...goldPrimary);
      doc.setLineWidth(0.25);
      doc.roundedRect(15, remY, pageWidth - 30, 24, 3, 3, "D");

      doc.setTextColor(...goldPrimary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(`Missing Number ${num} (${remInfo.planet})`, 20, remY + 6);

      doc.setTextColor(...textDark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const effectsText = doc.splitTextToSize(`Effects: ${remInfo.effects || "Flipped planes, minor work delays."}`, pageWidth - 42);
      doc.text(effectsText, 20, remY + 11);

      doc.setTextColor(0, 128, 0);
      doc.setFont("helvetica", "bold");
      doc.text(`Remedy Bracelet: ${remInfo.crystal || "Vedic Crystal"}`, 20, remY + 20);

      remY += 27.5;
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

  const careerIntroLines = doc.splitTextToSize(careerData.careerIntroText, pageWidth - 42);
  const careerCardH = 43 + careerIntroLines.length * 4.5; // dynamic offset + extra row of professions + bottom padding

  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, 36, pageWidth - 30, careerCardH, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, 36, pageWidth - 30, careerCardH, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Dynamic Career Guidance & Best Paths:", 20, 44);

  // Horizontal divider inside career card
  doc.setDrawColor(232, 213, 191);
  doc.setLineWidth(0.15);
  doc.line(18, 47, pageWidth - 18, 47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(careerIntroLines, 20, 52);

  const professionsTitleY = 52 + careerIntroLines.length * 4.5 + 4;
  doc.setFont("helvetica", "bold");
  doc.text("Top Recommended Professions:", 20, professionsTitleY);

  doc.setFont("helvetica", "normal");
  const col1X = 20;
  const col2X = 105;
  const line1Y = professionsTitleY + 7;
  const line2Y = professionsTitleY + 12;

  if (careerData.professionsList[0]) doc.text(`• ${careerData.professionsList[0]}`, col1X, line1Y);
  if (careerData.professionsList[1]) doc.text(`• ${careerData.professionsList[1]}`, col2X, line1Y);
  if (careerData.professionsList[2]) doc.text(`• ${careerData.professionsList[2]}`, col1X, line2Y);
  if (careerData.professionsList[3]) doc.text(`• ${careerData.professionsList[3]}`, col2X, line2Y);

  // Section 9: Name Number Compatibility Analysis
  const sec9StartY = 36 + careerCardH + 6;
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, sec9StartY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("NAME NUMBER COMPATIBILITY ANALYSIS", 14, sec9StartY + 7);

  const nameCompLines = doc.splitTextToSize(nameCompatData.description, pageWidth - 42);
  const cardHeight = 22 + nameCompLines.length * 4.5 + 8; // title + divider + spacing + status
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
  doc.text(nameCompLines, 20, sec9CardStartY + 16);

  const statusY = sec9CardStartY + 16 + nameCompLines.length * 4.5 + 4;
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
  // PAGES 9, 10, 11: 3 BLANK PAGES FOR CONSULTANT NOTES (NO RULES)
  // ════════════════════════════════════════════════════════════════════════
  for (let c = 1; c <= 3; c++) {
    doc.addPage();
    drawPageShell(doc);

    const pageData = reportData[`customPage${c}`] || {};
    const titleText = (pageData.title || `NOTES / SUGGESTIONS`).toUpperCase();
    const contentText = pageData.content || "";

    doc.setFillColor(...goldPrimary);
    doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`NOTES / SUGGESTIONS`, 14, 27);
    
    // Beautiful clean white area for handmade notes
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
  // PAGE 12: FINAL THANK YOU & DISCLAIMER PAGE
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
