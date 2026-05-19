import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { 
  calculateLoShuGrid, 
  getMissingNumbers, 
  getPresentNumbers, 
  calculateKua,
  calcMulank,
  calcBhagyank
} from "./numerology";

// Static assets imported directly so Vite bundles them
import firstp1Img from "../assets/Firstp1.png"; // This is actually the Wheel image
import firstp2Img from "../assets/firstp2.png"; // This is actually the Lord Ganesha image
import lastPageImg from "../assets/LastPage.png";

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
  const phone = clientData.phone || "99139 61553";
  const gender = clientData.gender || "male";

  // ── Dynamic core number calculations ──────────────────────────────────
  // Mulank  : sum of DAY digits only        e.g. 17 → 1+7 = 8
  // Bhagyank: sum of ALL DOB digits         e.g. 17-04-1972 → 31 → 4
  // Kua     : year digit sum → 11-sum (male) / 4+sum (female), reduced
  const mulank   = calcMulank(rawDob);
  const bhagyank = calcBhagyank(rawDob);
  const kuaNum   = calculateKua(rawDob, gender);

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

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load assets asynchronously (swap so firstp2Img is Ganesha, firstp1Img is Wheel)
  const [ganeshaImg, wheelImg, lastPageGraphic] = await Promise.all([
    loadImage(firstp2Img), // Ganesha (firstp2)
    loadImage(firstp1Img), // Wheel (Firstp1)
    loadImage(lastPageImg)
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

    // Light shed watermark: Shining Ank Vastu (using very light faint gold tint for absolute readability)
    if (!skipWatermark) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(36);
      doc.setTextColor(244, 236, 226); // Very faint gold/ivory color (does not block text!)
      doc.text("Shining Ank Vastu", pageWidth / 2, pageHeight / 2 - 20, {
        align: "center",
        angle: 45
      });
      doc.text("Precision & Clarity", pageWidth / 2, pageHeight / 2 + 20, {
        align: "center",
        angle: 45
      });
    }
  };

  // Helper: Universal Footer
  const drawFooter = (doc) => {
    const pWidth = doc.internal.pageSize.getWidth();
    const pHeight = doc.internal.pageSize.getHeight();

    // Draw horizontal line
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.25);
    doc.line(10, pHeight - 18, pWidth - 10, pHeight - 18);

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
    // 32mm wide, 40mm high, perfectly centered
    doc.addImage(ganeshaImg, "PNG", (pageWidth - 32) / 2, 12, 32, 40);
  }

  // Brand Name above the wheel image
  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Shining Ank Vastu", 54.5, 54, { align: "center" });

  // Circular Wheel Graphic on Left column
  if (wheelImg) {
    doc.addImage(wheelImg, "PNG", 12, 60, 85, 85);
  }

  // Middle vertical line separator
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.6);
  doc.line(105, 62, 105, 142);

  // Right column dynamic metadata
  let textX = 110;
  doc.setTextColor(0, 128, 0); // Proper green
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("REPORT PREPARED FOR:", textX, 72);

  doc.setTextColor(...textDark);
  doc.setFontSize(16);
  doc.text(clientData.name || "Client Name", textX, 82);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`DATE OF BIRTH: ${formattedDob}`, textX, 94);

  // Prepared by block
  doc.setTextColor(...goldPrimary);
  doc.setFontSize(12);
  doc.text("Prepared by:", textX, 114);
  doc.setTextColor(0, 128, 0); // Proper green
  doc.setFontSize(13);
  doc.text("Mr. Veren Misstry", textX, 120);
  doc.setFontSize(11);
  doc.text("Numerologist", textX, 125);

  // Brand Name & Contact removed from right column to avoid duplication

  // Wheel Title & Date (Bottom left column area)
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.text("Crown Lifepath Report", 54, 152, { align: "center" });

  doc.setTextColor(0, 128, 0); // Proper green
  doc.setFontSize(11);
  doc.text(`Report Date: ${reportDate}`, 54, 160, { align: "center" });

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

  // Render Lo Shu Grid
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

      if (count > 0) {
        doc.setFillColor(254, 249, 231); // Pastel yellow for filled number
        doc.rect(x, y, gridSize, gridSize, "F");
      }
      doc.rect(x, y, gridSize, gridSize, "D");
      
      doc.setFontSize(15);
      doc.setTextColor(count > 0 ? goldPrimary[0] : 190, count > 0 ? goldPrimary[1] : 190, count > 0 ? goldPrimary[2] : 190);
      doc.setFont("helvetica", count > 0 ? "bold" : "normal");
      doc.text(String(num), x + gridSize / 2, y + gridSize / 2 + 3.5, { align: "center" });
      
      if (count > 1) {
        doc.setFontSize(7.5);
        doc.setTextColor(...goldPrimary);
        doc.text(`x${count}`, x + gridSize - 5, y + 5);
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
  
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textDark);
  doc.text("Present Numbers:", sideX + 6, gridStartY + 18);
  const presentNums = getPresentNumbers(loShuGrid).map(n => n.num).join(", ");
  doc.setFont("helvetica", "bold");
  doc.text(presentNums || "None", sideX + 6, gridStartY + 24);
  
  doc.setFont("helvetica", "normal");
  doc.text("Missing Numbers:", sideX + 6, gridStartY + 36);
  const missingNums = getMissingNumbers(loShuGrid).join(", ");
  doc.setFont("helvetica", "bold");
  doc.text(missingNums || "None", sideX + 6, gridStartY + 42);

  doc.setFont("helvetica", "normal");
  doc.text("Kua Direction:", sideX + 6, gridStartY + 54);
  doc.setFont("helvetica", "bold");
  doc.text(reportData.luckyElements?.luckyDirection || "East", sideX + 6, gridStartY + 60);

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

  // Section 4: Hidden Influences of Yogas
  const yogY = 136;
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, yogY, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("HIDDEN INFLUENCES OF YOGAS IN YOUR DOB", 14, yogY + 7);

  // List Yogas based on present numbers
  const planes = [
    { name: "Mental Plane (4-9-2)", present: [4, 9, 2].every(n => loShuGrid[n-1] > 0), desc: "Sharp memory, analytical power, thinking ahead, excellent plan creation capabilities." },
    { name: "Emotional Plane (3-5-7)", present: [3, 5, 7].every(n => loShuGrid[n-1] > 0), desc: "Highly sensitive, spiritual inclination, deep intuition, strong compassion." },
    { name: "Practical/Action Plane (8-1-6)", present: [8, 1, 6].every(n => loShuGrid[n-1] > 0), desc: "Material success, high execution skills, converting ideas into physical realities." },
    { name: "Willpower Plane (9-5-1)", present: [9, 5, 1].every(n => loShuGrid[n-1] > 0), desc: "Unshakeable determination, willpower, strong confidence to overcome obstacles." }
  ];

  let planeY = yogY + 16;
  planes.forEach(plane => {
    doc.setFillColor(plane.present ? 234 : 255, plane.present ? 238 : 254, plane.present ? 252 : 249);
    doc.roundedRect(15, planeY, pageWidth - 30, 14, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(plane.present ? 0.35 : 0.15);
    doc.roundedRect(15, planeY, pageWidth - 30, 14, 2, 2, "D");

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${plane.name} - ${plane.present ? "ACTIVE YOGA" : "INACTIVE"}`, 20, planeY + 5);

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(plane.desc, 20, planeY + 10);

    planeY += 16.5;
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
  doc.text("POWER OF REPEATING NUMBERS IN YOUR DOB", 14, 27);

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

      doc.setTextColor(0, 150, 100);
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

  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, 36, pageWidth - 30, 52, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, 36, pageWidth - 30, 52, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Dynamic Career Guidance & Best Paths:", 20, 44);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const careerIntroText = "According to your Mulank and Bhagyank alignments, you thrive best in leadership, administrative, or strategic planning roles. Working in consulting, business management, or creative operations yields fast growth and social standing. Focus on starting major ventures on your lucky dates to guarantee prosperity.";
  const careerIntroLines = doc.splitTextToSize(careerIntroText, pageWidth - 42);
  doc.text(careerIntroLines, 20, 51);

  doc.setFont("helvetica", "bold");
  doc.text("Top Recommended Professions:", 20, 71);
  const professionsList = reportData.suitableProfessions || ["Leadership Roles", "Creative Arts", "Real Estate & Architecture", "Advisory Consulting"];
  doc.setFont("helvetica", "normal");
  doc.text(professionsList.map(p => `• ${p}`).join("   "), 20, 79);

  // Section 9: Name Number Compatibility Analysis
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 96, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("NAME NUMBER COMPATIBILITY ANALYSIS", 14, 103);

  doc.setFillColor(234, 238, 252); // Pastel blue card
  doc.roundedRect(15, 112, pageWidth - 30, 52, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, 112, pageWidth - 30, 52, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Current Name Vibrations: ${clientData.name || "Native"}`, 20, 120);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const nameCompText = `Your calculated Name Number is ${reportData.soulUrge || 1}. This represents a powerful compound energetic frequency. A name compatible with your Mulank and Bhagyank numbers acts as a cosmic catalyst, resolving blockages and attracting abundance effortlessly. If it is neutral or hostile, simple spell corrections can align it perfectly.`;
  const nameCompLines = doc.splitTextToSize(nameCompText, pageWidth - 42);
  doc.text(nameCompLines, 20, 127);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...goldPrimary);
  doc.text(`Name Number Compatibility Status: HIGHLY FAVORABLE`, 20, 150);

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

  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, 36, pageWidth - 30, 46, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, 36, pageWidth - 30, 46, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Analyzing Phone/Mobile Number: ${phone}`, 20, 44);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const phoneText = "Mobile numbers are modern energetic channels. The sum total of your mobile number digits represents your secondary business and relationship vibration. A sum of 1, 5, or 6 is highly friendly with your birth chart. Avoid combinations ending in highly challenging digits to maintain progressive business communications.";
  const phoneLines = doc.splitTextToSize(phoneText, pageWidth - 42);
  doc.text(phoneLines, 20, 51);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...goldPrimary);
  doc.text("Recommended Mobile Total: 1, 5 or 6 (for business success)", 20, 72);

  // Section 11: 5 - Year Future Predictions
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 90, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("5 - YEAR FUTURE PREDICTIONS (FORECAST)", 14, 97);

  let yrY = 106;
  const startYear = today.getFullYear();
  const personalYearVal = reportData.personalYear || 1;

  for (let i = 0; i < 5; i++) {
    const yr = startYear + i;
    const yrFreq = (personalYearVal + i > 9) ? (personalYearVal + i - 9) : (personalYearVal + i);

    doc.setFillColor(254, 249, 231);
    doc.roundedRect(15, yrY, pageWidth - 30, 13, 2, 2, "F");
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, yrY, pageWidth - 30, 13, 2, 2, "D");

    doc.setTextColor(...goldPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Year ${yr} (Personal Year ${yrFreq})`, 20, yrY + 5);

    doc.setTextColor(...textDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    
    let predText = "A period of great expansion, new business alignments, and strong material success.";
    if (yrFreq === 4 || yrFreq === 8) predText = "A foundation building period. Demands discipline, focus, hard work, and strict health management.";
    if (yrFreq === 5) predText = "Dynamic year of positive transitions, travel, and expanding network opportunities.";

    doc.text(predText, 20, yrY + 9);
    yrY += 15;
  }

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
    { label: "Lucky Dates", value: reportData.luckyElements?.luckyDates || "1, 10, 19, 28", color: [0, 150, 100] },
    { label: "Challenging Dates", value: reportData.luckyElements?.unluckyDates || "8, 17, 26", color: [229, 62, 62] },
    { label: "Lucky Color", value: reportData.luckyElements?.luckyColor || "Orange & White", color: [181, 130, 10] },
    { label: "Challenging Color", value: reportData.luckyElements?.unluckyColor || "Black & Dark Brown", color: [61, 44, 30] },
    { label: "Lucky Direction", value: reportData.luckyElements?.luckyDirection || "East", color: [0, 150, 100] },
    { label: "Core Element", value: reportData.luckyElements?.element || "Fire", color: [181, 130, 10] },
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
    doc.roundedRect(curX, curY, colWidth - 5, 16, 2, 2, "FD");
    
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "normal");
    doc.text(elem.label, curX + 4, curY + 6);
    
    doc.setFontSize(9.5);
    doc.setTextColor(...(elem.color || textDark));
    doc.setFont("helvetica", "bold");
    doc.text(String(elem.value || "-"), curX + 4, curY + 12);
    
    xIdx++;
    if (xIdx > 2) {
      xIdx = 0;
      yIdx++;
    }
  });

  // Section 14: Signature Style for Success
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, 84, pageWidth - 20, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("SIGNATURE STYLE FOR SUCCESS", 14, 91);

  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, 100, pageWidth - 30, 68, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, 100, pageWidth - 30, 68, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Prosperity Signature Rules:", 20, 108);

  const sigRules = [
    "• Sign at a continuous rising angle of approximately 45 degrees.",
    "• Never put a line cutting through any letters of your name.",
    "• Always end your signature with a forward and rising stroke.",
    "• Use two parallel underlines below the signature with a rising ending.",
    "• Ensure the first alphabet of your name is larger and clearly readable."
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  let sigY = 115;
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
  doc.text("YANTRA-BASED REMEDIES", 14, 27);

  doc.setFillColor(255, 254, 249);
  doc.roundedRect(15, 36, pageWidth - 30, 52, 3, 3, "F");
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, 36, pageWidth - 30, 52, 3, 3, "D");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Sacred Vedic Lo Shu Grid Yantra:", 20, 44);

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

    doc.setFillColor(...goldPrimary);
    doc.roundedRect(10, 20, pageWidth - 20, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`CONSULTANT NOTES (PAGE ${c} OF 3)`, 14, 27);
    
    // Beautiful clean white area for handmade notes
    doc.setFillColor(255, 254, 249);
    doc.setDrawColor(...goldPrimary);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, 38, pageWidth - 30, pageHeight - 74, 4, 4, "FD");
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 12: FINAL THANK YOU & DISCLAIMER PAGE
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageShell(doc, true);

  // Add LastPage png asset
  if (lastPageGraphic) {
    doc.addImage(lastPageGraphic, "PNG", (pageWidth - 95) / 2, 16, 95, 60);
  }

  // "Thank You," text in dynamic green font
  doc.setTextColor(...greenText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("Thank You,", pageWidth / 2, 90, { align: "center" });

  // Disclaimer Title
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("DISCLAIMER", pageWidth / 2, 102, { align: "center" });

  // Disclaimer Body text
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  const disclaimerText = "This report is for informational and entertainment purposes only. The findings provided are based on traditional numerological methods and should not be considered professional advice in any field, such as financial, medical, legal, or psychological. Results can be different, and any choices you make from this report are your own responsibility. Use this as a tool for self-reflection, and consult qualified professionals for significant life decisions.";
  const discLines = doc.splitTextToSize(disclaimerText, pageWidth - 36);
  doc.text(discLines, pageWidth / 2, 110, { align: "center" });

  // Add all footers sequentially
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Draw footer on all pages (cover is page 1, but user requested in all report pages)
    drawFooter(doc);
  }

  return doc;
};
