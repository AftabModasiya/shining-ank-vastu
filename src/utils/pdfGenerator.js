import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { 
  calculateLoShuGrid, 
  getMissingNumbers, 
  getPresentNumbers, 
  calculateKua 
} from "./numerology";

export const generatePDF = (reportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ── Colors matching Shining Ank Vastu theme — Warm Peach & Gold ──
  const goldPrimary   = [181, 130, 10];   // #b5820a
  const goldDark      = [154, 110, 8];    // #9a6e08
  const goldAccent    = [201, 162, 39];   // #c9a227
  const warmBrown     = [61, 44, 30];     // #3d2c1e  (footer only)
  const peachBg       = [247, 232, 214];  // #f7e8d6
  const peachMid      = [240, 213, 188];  // #f0d5bc
  const cardWhite     = [255, 254, 249];  // #fffef9
  const cardYellow    = [254, 249, 231];  // #fef9e7
  const cardPink      = [253, 234, 234];  // #fdeaea
  const cardBlue      = [234, 238, 252];  // #eaeefc
  const textHeading   = [61, 44, 30];     // #3d2c1e
  const textLabel     = [140, 111, 88];   // #8c6f58
  const textBrand     = [26, 58, 46];     // kept only for brand name
  const borderWarm    = [232, 213, 191];  // #e8d5bf

  // Legacy aliases (kept so existing code below still works)
  const primaryBrown  = goldPrimary;
  const darkGreen     = warmBrown;       // ← NO more dark green pages
  const lightCream    = peachBg;
  const accentGold    = goldAccent;
  const softBeige     = cardWhite;

  // Helper for footer
  const drawFooter = (doc) => {
    const pWidth = doc.internal.pageSize.getWidth();
    const pHeight = doc.internal.pageSize.getHeight();
    
    // Gold footer bar
    doc.setFillColor(181, 130, 10); // goldPrimary
    doc.rect(0, pHeight - 14, pWidth, 14, "F");
    
    // Subtle separator line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.15);
    doc.line(10, pHeight - 8.5, pWidth - 10, pHeight - 8.5);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("SHINING ANK VASTU", pWidth / 2, pHeight - 9, { align: "center", charSpace: 1.5 });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("Empowering Lives Through Cosmic Numbers", pWidth / 2, pHeight - 4, { align: "center" });
    
    // Page number
    doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pWidth - 12, pHeight - 6.5, { align: "right" });
  };

  // Helper for page border
  const drawBorder = (doc) => {
    doc.setDrawColor(...accentGold);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    
    // Corner accents
    doc.setLineWidth(1.5);
    // Top-left
    doc.line(5, 5, 15, 5);
    doc.line(5, 5, 5, 15);
    // Top-right
    doc.line(pageWidth - 15, 5, pageWidth - 5, 5);
    doc.line(pageWidth - 5, 5, pageWidth - 5, 15);
    // Bottom-left
    doc.line(5, pageHeight - 15, 5, pageHeight - 5);
    doc.line(5, pageHeight - 5, 15, pageHeight - 5);
    // Bottom-right
    doc.line(pageWidth - 5, pageHeight - 15, pageWidth - 5, pageHeight - 5);
    doc.line(pageWidth - 15, pageHeight - 5, pageWidth - 5, pageHeight - 5);
  };

  // PAGE 1: Warm Peach Cover Page
  // Gradient-like peach background (two rects blend)
  doc.setFillColor(...peachBg);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setFillColor(...peachMid);
  doc.rect(0, pageHeight * 0.55, pageWidth, pageHeight * 0.45, "F");

  // Decorative concentric gold circles
  doc.setDrawColor(...goldAccent);
  doc.setLineWidth(0.3);
  doc.circle(pageWidth / 2, pageHeight / 2, 75);
  doc.setLineWidth(0.1);
  doc.circle(pageWidth / 2, pageHeight / 2, 85);

  // Brand label (small caps)
  doc.setTextColor(...textBrand);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("SHINING ANK VASTU", pageWidth / 2, 52, { align: "center", charSpace: 2.5 });

  // Decorative gold line
  doc.setDrawColor(...goldAccent);
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 40, 57, pageWidth / 2 + 40, 57);

  // Logo Star
  doc.setTextColor(...goldPrimary);
  doc.setFontSize(52);
  doc.text("★", pageWidth / 2, 100, { align: "center" });

  // Main title — large gold serif feel
  doc.setTextColor(...goldPrimary);
  doc.setFontSize(38);
  doc.setFont("helvetica", "bold");
  doc.text("NUMEROLOGY", pageWidth / 2, 128, { align: "center" });
  doc.text("REPORT", pageWidth / 2, 144, { align: "center" });

  // Thin divider
  doc.setDrawColor(...goldAccent);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 25, 150, pageWidth / 2 + 25, 150);

  // Client Details Box — white/cream
  doc.setFillColor(...cardWhite);
  doc.setDrawColor(...borderWarm);
  doc.setLineWidth(0.5);
  doc.roundedRect(25, 162, pageWidth - 50, 52, 5, 5, "FD");
  
  // Gold top accent on box
  doc.setFillColor(...goldAccent);
  doc.roundedRect(25, 162, pageWidth - 50, 4, 2, 2, "F");

  doc.setTextColor(...textLabel);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("PREPARED FOR", pageWidth / 2, 178, { align: "center", charSpace: 1.5 });
  
  doc.setFontSize(22);
  doc.setTextColor(...goldPrimary);
  doc.setFont("helvetica", "bold");
  doc.text(reportData.name.toUpperCase(), pageWidth / 2, 192, { align: "center" });
  
  doc.setFontSize(11);
  doc.setTextColor(...textLabel);
  doc.setFont("helvetica", "normal");
  doc.text(`${reportData.dob}`, pageWidth / 2, 206, { align: "center" });

  // Tagline
  doc.setFontSize(9);
  doc.setTextColor(...textLabel);
  doc.text("Discover the power of your destiny through Vedic Numerology", pageWidth / 2, pageHeight - 30, { align: "center" });

  // PAGE 2: Core Analysis
  doc.addPage();
  drawBorder(doc);

  // Warm peach page background
  doc.setFillColor(...peachBg);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  drawBorder(doc);

  let yPos = 25;

  // Section header bar — warm brown/gold
  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, yPos, pageWidth - 20, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("CORE NUMBERS ANALYSIS", pageWidth / 2, yPos + 8, { align: "center", charSpace: 1 });

  yPos += 25;

  // Driver & Conductor Section
  // Driver Number
  doc.setFillColor(...softBeige);
  doc.roundedRect(15, yPos, 85, 65, 3, 3, "F");
  doc.setDrawColor(...primaryBrown);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, yPos, 85, 65, 3, 3, "D");

  doc.setFillColor(...primaryBrown);
  doc.circle(57.5, yPos + 15, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(String(reportData.lifePath), 57.5, yPos + 18, { align: "center" });

  doc.setTextColor(...primaryBrown);
  doc.setFontSize(12);
  doc.text("Driver Number", 57.5, yPos + 35, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("(Mulank)", 57.5, yPos + 40, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Planet: ${reportData.lifePathTraits.planet}`, 20, yPos + 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const pathDescLines = doc.splitTextToSize(reportData.lifePathTraits.desc, 75);
  doc.text(pathDescLines, 20, yPos + 55);

  // Conductor Number
  doc.setFillColor(...softBeige);
  doc.roundedRect(pageWidth - 100, yPos, 85, 65, 3, 3, "F");
  doc.setDrawColor(...darkGreen);
  doc.roundedRect(pageWidth - 100, yPos, 85, 65, 3, 3, "D");

  doc.setFillColor(...darkGreen);
  doc.circle(pageWidth - 57.5, yPos + 15, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(String(reportData.expression), pageWidth - 57.5, yPos + 18, { align: "center" });

  doc.setTextColor(...darkGreen);
  doc.setFontSize(12);
  doc.text("Conductor Number", pageWidth - 57.5, yPos + 35, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("(Bhagyank)", pageWidth - 57.5, yPos + 40, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Planet: ${reportData.expressionTraits.planet}`, pageWidth - 95, yPos + 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const exprDescLines = doc.splitTextToSize(reportData.expressionTraits.desc, 75);
  doc.text(exprDescLines, pageWidth - 95, yPos + 55);

  yPos += 80;

  // Key Influencers
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, yPos, pageWidth - 30, 45, 2, 2, "F");
  
  doc.setTextColor(...darkGreen);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(reportData.dateInfluencer?.title || "", 20, yPos + 10);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const influencerLines = doc.splitTextToSize(reportData.dateInfluencer?.content || "", pageWidth - 40);
  doc.text(influencerLines, 20, yPos + 18);

  yPos += 55;

  // Lucky Elements - Modern Grid
  const luckyElements = [
    { label: "Lucky Dates", value: reportData.luckyElements?.luckyDates, color: [76, 175, 80] },
    { label: "Unlucky Dates", value: reportData.luckyElements?.unluckyDates, color: [244, 67, 54] },
    { label: "Lucky Color", value: reportData.luckyElements?.luckyColor, color: [255, 152, 0] },
    { label: "Lucky Direction", value: reportData.luckyElements?.luckyDirection, color: [33, 150, 243] },
    { label: "Element", value: reportData.luckyElements?.element, color: [255, 87, 34] },
    { label: "Kua Number", value: String(calculateKua(reportData.dob, reportData.gender)), color: [147, 112, 219] },
  ];

  const colWidth = (pageWidth - 40) / 3;
  let xIdx = 0;
  let yIdx = 0;

  luckyElements.forEach((elem) => {
    const curX = 15 + xIdx * colWidth;
    const curY = yPos + yIdx * 20;
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(curX, curY, colWidth - 5, 15, 2, 2, "FD");
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(elem.label, curX + 4, curY + 6);
    
    doc.setFontSize(10);
    doc.setTextColor(...(elem.color || [0, 0, 0]));
    doc.setFont("helvetica", "bold");
    doc.text(String(elem.value || "-"), curX + 4, curY + 12);
    
    xIdx++;
    if (xIdx > 2) {
      xIdx = 0;
      yIdx++;
    }
  });

  // PAGE 3: Lo Shu Grid & Personality
  doc.addPage();
  doc.setFillColor(...peachBg);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  drawBorder(doc);
  yPos = 25;

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, yPos, pageWidth - 20, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("LO SHU GRID & PERSONALITY", pageWidth / 2, yPos + 8, { align: "center", charSpace: 1 });

  yPos += 25;

  // Lo Shu Grid - Premium Styled
  const loShuGrid = calculateLoShuGrid(reportData.dob);
  const gridSize = 25;
  const gridStartX = 20;
  const gridStartY = yPos;
  const gridLayout = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

  doc.setDrawColor(...accentGold);
  doc.setLineWidth(0.5);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const num = gridLayout[i][j];
      const count = loShuGrid[num - 1];
      const x = gridStartX + j * gridSize;
      const y = gridStartY + i * gridSize;

      if (count > 0) {
        doc.setFillColor(...softBeige);
        doc.rect(x, y, gridSize, gridSize, "F");
      }
      doc.rect(x, y, gridSize, gridSize, "D");
      
      doc.setFontSize(16);
      doc.setTextColor(count > 0 ? primaryBrown[0] : 220, count > 0 ? primaryBrown[1] : 220, count > 0 ? primaryBrown[2] : 220);
      doc.setFont("helvetica", count > 0 ? "bold" : "normal");
      doc.text(String(num), x + gridSize / 2, y + gridSize / 2 + 3, { align: "center" });
      
      if (count > 1) {
        doc.setFontSize(8);
        doc.setTextColor(...primaryBrown);
        doc.text(`x${count}`, x + gridSize - 6, y + 6);
      }
    }
  }

  // Grid Interpretation Side Box
  const sideX = gridStartX + gridSize * 3 + 10;
  doc.setFillColor( softBeige[0], softBeige[1], softBeige[2], 0.5 );
  doc.roundedRect(sideX, gridStartY, pageWidth - sideX - 15, gridSize * 3, 3, 3, "F");
  
  doc.setTextColor(...darkGreen);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Grid Highlights", sideX + 5, gridStartY + 10);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Present Numbers:", sideX + 5, gridStartY + 18);
  const presentNums = getPresentNumbers(loShuGrid).map(n => n.num).join(", ");
  doc.setFont("helvetica", "bold");
  doc.text(presentNums, sideX + 5, gridStartY + 23);
  
  doc.setFont("helvetica", "normal");
  doc.text("Missing Numbers:", sideX + 5, gridStartY + 33);
  const missingNums = getMissingNumbers(loShuGrid).join(", ");
  doc.setFont("helvetica", "bold");
  doc.text(missingNums, sideX + 5, gridStartY + 38);

  yPos = gridStartY + gridSize * 3 + 20;

  // Personality Analysis Section
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, yPos, pageWidth - 30, 65, 3, 3, "F");
  
  doc.setTextColor(...primaryBrown);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(reportData.personalityAnalysis?.title || "PERSONALITY INSIGHTS", 20, yPos + 12);
  
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const personalityLines = doc.splitTextToSize(reportData.personalityAnalysis?.content || "", pageWidth - 40);
  doc.text(personalityLines, 20, yPos + 22);

  // Repeated Numbers Section
  const repeatedNums = reportData.repeatedNumbersAnalysis || [];
  if (repeatedNums.length > 0) {
    doc.addPage();
    doc.setFillColor(...peachBg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    drawBorder(doc);
    yPos = 25;
    doc.setFillColor(...goldPrimary);
    doc.roundedRect(10, yPos, pageWidth - 20, 12, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("INFLUENCE OF REPEATED NUMBERS", pageWidth / 2, yPos + 8, { align: "center", charSpace: 1 });
    yPos += 25;
    repeatedNums.forEach(item => {
      doc.setFillColor(...softBeige);
      doc.roundedRect(15, yPos, pageWidth - 30, 20, 2, 2, "F");
      doc.setTextColor(...primaryBrown);
      doc.setFontSize(12);
      doc.text(`Number ${item.num} appears ${item.count} times`, 20, yPos + 8);
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(item.influence, 20, yPos + 14);
      yPos += 25;
    });
  }

  // Professions Section
  const professions = reportData.suitableProfessions || [];
  if (professions.length > 0) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      drawBorder(doc);
      yPos = 25;
    }
    doc.setFillColor(...primaryBrown);
    doc.rect(10, yPos, pageWidth - 20, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("SUITABLE PROFESSIONS & BUSINESS", 20, yPos + 7);
    yPos += 18;
    professions.forEach(prof => {
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.text(`• ${prof}`, 20, yPos);
      yPos += 8;
    });
    yPos += 10;
  }

  // Future Predictions (3-Year Forecast)
  if (reportData.futurePredictions) {
    doc.addPage();
    doc.setFillColor(...peachBg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    drawBorder(doc);
    yPos = 25;
    doc.setFillColor(...goldPrimary);
    doc.roundedRect(10, yPos, pageWidth - 20, 12, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("3-YEAR PERSONAL FORECAST", pageWidth / 2, yPos + 8, { align: "center", charSpace: 1 });
    yPos += 25;
    
    Object.keys(reportData.futurePredictions).forEach(key => {
      const forecast = reportData.futurePredictions[key];
      doc.setFillColor(...softBeige);
      doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, "F");
      doc.setTextColor(...primaryBrown);
      doc.setFontSize(14);
      doc.text(`Year ${forecast.year}`, 20, yPos + 10);
      doc.setTextColor(...darkGreen);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(forecast.title, 20, yPos + 18);
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(forecast.desc, pageWidth - 40);
      doc.text(descLines, 20, yPos + 25);
      yPos += 45;
    });
  }

  // Remedies Section
  if (reportData.missingNumbersRemedies?.length > 0) {
    doc.addPage();
    doc.setFillColor(...peachBg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    drawBorder(doc);
    yPos = 25;

    doc.setFillColor(...goldPrimary);
    doc.roundedRect(10, yPos, pageWidth - 20, 12, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("DIVINE REMEDIES & SOLUTIONS", pageWidth / 2, yPos + 8, { align: "center", charSpace: 1 });

    yPos += 25;

    reportData.missingNumbersRemedies.forEach((remedy, idx) => {
      doc.setFillColor(...softBeige);
      doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, "F");
      
      doc.setTextColor(...primaryBrown);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Remedy for Number ${remedy.num} (${remedy.planet})`, 20, yPos + 10);
      
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const effectsLines = doc.splitTextToSize(`Effects: ${remedy.effects}`, pageWidth - 45);
      doc.text(effectsLines, 22, yPos + 18);
      
      doc.setTextColor(...darkGreen);
      doc.setFont("helvetica", "bold");
      doc.text(`Crystal Recommendation: ${remedy.crystal}`, 22, yPos + 30);
      
      yPos += 45;
    });
  }

  // CUSTOM PAGES
  [reportData.customPage1, reportData.customPage2].forEach(customPage => {
    if (customPage?.content) {
      doc.addPage();
      doc.setFillColor(...peachBg);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      drawBorder(doc);
      yPos = 25;

      doc.setFillColor(...goldPrimary);
      doc.roundedRect(10, yPos, pageWidth - 20, 12, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(customPage.title.toUpperCase(), pageWidth / 2, yPos + 8, { align: "center", charSpace: 1 });

      yPos += 25;
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const customLines = doc.splitTextToSize(customPage.content, pageWidth - 30);
      doc.text(customLines, 15, yPos);
    }
  });

  // FINAL PAGE: Affirmations
  doc.addPage();
  doc.setFillColor(...peachBg);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  drawBorder(doc);
  yPos = 25;

  doc.setFillColor(...goldPrimary);
  doc.roundedRect(10, yPos, pageWidth - 20, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("DAILY DIVINE AFFIRMATIONS", pageWidth / 2, yPos + 8, { align: "center", charSpace: 1 });

  yPos += 30;
  (reportData.affirmations || []).forEach((aff, idx) => {
    doc.setFillColor(...softBeige);
    doc.roundedRect(15, yPos, pageWidth - 30, 15, 7.5, 7.5, "F");
    
    doc.setTextColor(...primaryBrown);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("✨", 22, yPos + 9.5);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(aff, 32, yPos + 9.5);
    
    yPos += 22;
  });

  // Final blessing
  doc.setTextColor(...goldPrimary);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("MAY THE NUMBERS GUIDE YOU TO SUCCESS", pageWidth / 2, pageHeight - 40, { align: "center", charSpace: 0.5 });

  // Add footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc);
  }

  return doc;
};
