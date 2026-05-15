import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Helper function to calculate Lo Shu Grid from DOB
const calculateLoShuGrid = (dob) => {
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
const getMissingNumbers = (grid) => {
  const missing = [];
  for (let i = 0; i < 9; i++) {
    if (grid[i] === 0) {
      missing.push(i + 1);
    }
  }
  return missing;
};

// Helper function to get present numbers
const getPresentNumbers = (grid) => {
  const present = [];
  for (let i = 0; i < 9; i++) {
    if (grid[i] > 0) {
      present.push({ num: i + 1, count: grid[i] });
    }
  }
  return present;
};

// Calculate Kua number
const calculateKua = (dob, gender) => {
  const year = parseInt(dob.split("-")[0]);
  const lastTwoDigits = year % 100;
  const sum = Math.floor(lastTwoDigits / 10) + (lastTwoDigits % 10);
  const reduced = sum > 9 ? Math.floor(sum / 10) + (sum % 10) : sum;

  if (gender === "male") {
    return 10 - reduced;
  } else {
    return reduced + 5 > 9 ? reduced + 5 - 9 : reduced + 5;
  }
};

export const generatePDF = (reportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors matching Shining Ank Vastu theme
  const primaryBrown = [200, 111, 44];
  const darkGreen = [26, 58, 46];
  const lightCream = [245, 237, 228];
  const accentGold = [212, 165, 116];

  // Calculate additional data
  const loShuGrid = calculateLoShuGrid(reportData.dob);
  const missingNumbers = getMissingNumbers(loShuGrid);
  const presentNumbers = getPresentNumbers(loShuGrid);
  const kuaNumber = calculateKua(reportData.dob, reportData.gender);

  // PAGE 1: Cover Page
  doc.setFillColor(...darkGreen);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Logo/Icon
  doc.setFontSize(48);
  doc.setTextColor(primaryBrown[0], primaryBrown[1], primaryBrown[2]);
  doc.text("*", pageWidth / 2, 60, { align: "center" });

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("SHINING ANK VASTU", pageWidth / 2, 90, { align: "center" });

  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.text("Numerology Report", pageWidth / 2, 105, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  doc.text(
    "Based on Vedic Science & Numerological Combinations",
    pageWidth / 2,
    115,
    { align: "center" },
  );

  // Client Name Box
  doc.setFillColor(...primaryBrown);
  doc.roundedRect(30, 140, pageWidth - 60, 20, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(reportData.name.toUpperCase(), pageWidth / 2, 152, {
    align: "center",
  });

  // Birth Date
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Born on: ${reportData.dob}`, pageWidth / 2, 175, {
    align: "center",
  });

  // Vedic Numerology Report label
  doc.setFontSize(10);
  doc.text("Vedic Numerology Report", pageWidth / 2, pageHeight - 20, {
    align: "center",
  });

  // PAGE 2: Core Numbers
  doc.addPage();
  let yPos = 20;

  // Section Header
  doc.setFillColor(...lightCream);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("CORE NUMBERS ANALYSIS", 20, yPos + 7);

  yPos += 20;

  // Driver Number Card
  doc.setFillColor(255, 245, 235);
  doc.roundedRect(15, yPos, 85, 55, 3, 3, "F");

  // Number badge
  doc.setFillColor(255, 87, 34);
  doc.circle(30, yPos + 15, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(String(reportData.lifePath), 30, yPos + 17, { align: "center" });

  // Title
  doc.setTextColor(255, 87, 34);
  doc.setFontSize(12);
  doc.text("Driver Number (Mulank)", 45, yPos + 12);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("The Leader", 45, yPos + 18);

  // Details
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`Planet: ${reportData.lifePathTraits.planet}`, 20, yPos + 30);
  doc.setFont("helvetica", "normal");
  doc.text("Leadership, confidence, ambition, power", 20, yPos + 35);

  doc.setFont("helvetica", "bold");
  doc.text("Key Traits:", 20, yPos + 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const traits1 = [
    "Leadership qualities, can easily dominate people",
    "Problem solvers who tackle every situation easily",
    "Very positive, strong, determined, good initiators",
    "Ability to change dreams into reality",
    "Occupy higher positions in society",
  ];
  let traitY = yPos + 47;
  traits1.forEach((trait) => {
    doc.text(`- ${trait}`, 20, traitY);
    traitY += 4;
  });

  // Conductor Number Card
  doc.setFillColor(255, 248, 225);
  doc.roundedRect(pageWidth - 100, yPos, 85, 55, 3, 3, "F");

  // Number badge
  doc.setFillColor(255, 193, 7);
  doc.circle(pageWidth - 85, yPos + 15, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(String(reportData.expression), pageWidth - 85, yPos + 17, {
    align: "center",
  });

  // Title
  doc.setTextColor(255, 193, 7);
  doc.setFontSize(12);
  doc.text("Conductor Number", pageWidth - 70, yPos + 12);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("(Bhagyank)", pageWidth - 70, yPos + 17);
  doc.text("The Intuitive", pageWidth - 70, yPos + 22);

  // Details
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Planet: ${reportData.expressionTraits.planet}`,
    pageWidth - 95,
    yPos + 30,
  );
  doc.setFont("helvetica", "normal");
  doc.text(
    "Sensitivity, intuition, emotions, creativity",
    pageWidth - 95,
    yPos + 35,
  );

  doc.setFont("helvetica", "bold");
  doc.text("Key Traits:", pageWidth - 95, yPos + 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const traits2 = [
    "Most feminine number, signifies human soul",
    "Extremely sensitive and emotional",
    "Imaginative, intuitive, deep thinkers",
    "Ability to think out of the box",
    "Good presenters and ability to convince",
  ];
  traitY = yPos + 47;
  traits2.forEach((trait) => {
    const lines = doc.splitTextToSize(`- ${trait}`, 75);
    doc.text(lines, pageWidth - 95, traitY);
    traitY += lines.length * 4;
  });

  yPos += 65;

  // Date Influencer
  const birthDay = parseInt(reportData.dob.split("-")[2]);
  doc.setFillColor(232, 245, 253);
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Date Influencer - Born on ${birthDay}`, 20, yPos + 10);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  const dobParts = reportData.dob.split("-");
  doc.text(
    `People born on ${birthDay}, ${birthDay + 9}, ${birthDay + 18}, ${birthDay + 27} (any month)`,
    20,
    yPos + 17,
  );

  const influencerText = doc.splitTextToSize(
    "These people give importance to other's point of view as well but have a rational mind. Due to the presence of 2, Moon, they will have a pleasing personality.",
    pageWidth - 40,
  );
  doc.text(influencerText, 20, yPos + 23);

  yPos += 40;

  // Lucky/Unlucky elements in grid
  const luckyElements = [
    { label: "Lucky Dates", value: "1, 10, 19, 28", color: [76, 175, 80] },
    { label: "Unlucky Dates", value: "8, 17, 26", color: [244, 67, 54] },
    { label: "Lucky Color", value: "Orange", color: [255, 152, 0] },
    { label: "Unlucky Color", value: "Black & Brown", color: [100, 100, 100] },
    { label: "Lucky Direction", value: "East", color: [33, 150, 243] },
    { label: "Element", value: "Fire", color: [255, 87, 34] },
  ];

  const boxWidth = (pageWidth - 40) / 3;
  const boxHeight = 20;
  let xOffset = 15;
  let yOffset = yPos;

  luckyElements.forEach((elem, index) => {
    if (index % 3 === 0 && index > 0) {
      yOffset += boxHeight + 5;
      xOffset = 15;
    }

    doc.setFillColor(250, 250, 250);
    doc.roundedRect(xOffset, yOffset, boxWidth - 5, boxHeight, 2, 2, "F");

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.text(elem.label, xOffset + 5, yOffset + 8);

    doc.setFontSize(10);
    doc.setTextColor(...elem.color);
    doc.setFont("helvetica", "bold");
    doc.text(elem.value, xOffset + 5, yOffset + 15);

    xOffset += boxWidth;
  });

  // Continue to next page for Lo Shu Grid...
  doc.addPage();
  yPos = 20;

  // Lo Shu Grid Section
  doc.setFillColor(...lightCream);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("LO SHU GRID ANALYSIS", 20, yPos + 7);

  yPos += 20;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("Your Personal Lo Shu Grid", 20, yPos);
  doc.setFontSize(8);
  doc.text("The magic square revealing your number distribution", 20, yPos + 5);

  yPos += 15;

  // Draw Lo Shu Grid
  const gridSize = 25;
  const gridStartX = 25;
  const gridStartY = yPos;

  // Grid layout: 4 9 2 / 3 5 7 / 8 1 6
  const gridLayout = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const num = gridLayout[i][j];
      const count = loShuGrid[num - 1];

      // Cell background
      if (count > 0) {
        doc.setFillColor(255, 248, 225);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(
        gridStartX + j * gridSize,
        gridStartY + i * gridSize,
        gridSize,
        gridSize,
        "FD",
      );

      // Number
      doc.setFontSize(14);
      if (count > 0) {
        doc.setTextColor(...primaryBrown);
        doc.setFont("helvetica", "bold");
      } else {
        doc.setTextColor(200, 200, 200);
        doc.setFont("helvetica", "normal");
      }
      doc.text(
        String(num),
        gridStartX + j * gridSize + 12.5,
        gridStartY + i * gridSize + 16,
        { align: "center" },
      );

      // Count indicator
      if (count > 1) {
        doc.setFontSize(8);
        doc.setTextColor(255, 87, 34);
        doc.text(
          `x${count}`,
          gridStartX + j * gridSize + 19,
          gridStartY + i * gridSize + 6,
        );
      }
    }
  }

  // Kua number indicator
  doc.setFillColor(147, 112, 219);
  doc.circle(
    gridStartX + gridSize + 12.5,
    gridStartY + gridSize + 12.5,
    8,
    "F",
  );
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Kua", gridStartX + gridSize + 12.5, gridStartY + gridSize + 14, {
    align: "center",
  });

  // Grid Interpretation
  const interpX = gridStartX + 90;
  doc.setFontSize(12);
  doc.setTextColor(...darkGreen);
  doc.setFont("helvetica", "bold");
  doc.text("Grid Interpretation", interpX, yPos + 5);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("Present Numbers:", interpX, yPos + 15);

  // Present numbers badges
  let badgeX = interpX;
  let badgeY = yPos + 20;
  presentNumbers.slice(0, 5).forEach((item, index) => {
    doc.setFillColor(255, 193, 7);
    doc.roundedRect(badgeX, badgeY, 18, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    const text =
      item.count > 1 ? `${item.num}(x${item.count})` : String(item.num);
    doc.text(text, badgeX + 9, badgeY + 5.5, { align: "center" });

    badgeX += 20;
    if ((index + 1) % 3 === 0) {
      badgeX = interpX;
      badgeY += 10;
    }
  });

  badgeY += 15;
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.text("Missing Numbers:", interpX, badgeY);

  // Missing numbers badges
  badgeX = interpX;
  badgeY += 5;
  missingNumbers.slice(0, 4).forEach((num, index) => {
    doc.setFillColor(255, 235, 238);
    doc.roundedRect(badgeX, badgeY, 12, 8, 2, 2, "F");
    doc.setTextColor(244, 67, 54);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(String(num), badgeX + 6, badgeY + 5.5, { align: "center" });

    badgeX += 14;
  });

  // Kua number info
  badgeY += 15;
  doc.setFontSize(9);
  doc.setTextColor(...primaryBrown);
  doc.setFont("helvetica", "bold");
  doc.text(`Your Kua Number: ${kuaNumber}`, interpX, badgeY);
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "italic");
  doc.text(
    "(Filled in grid as it was not naturally present in DOB)",
    interpX,
    badgeY + 5,
  );

  // Continue from previous page
  yPos = gridStartY + 85;

  // Areas to Improve section
  if (missingNumbers.length > 0) {
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, "F");
    doc.setTextColor(...darkGreen);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Areas to Improve", 20, yPos + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    // Show first missing number impact
    const firstMissing = missingNumbers[0];
    const missingImpacts = {
      4: "Emotional Balance (4, 5, 6): Moody, distrustful, critical, arrogant, lives in own shell",
      5: "Emotional Balance (4, 5, 6): Most confused personality, frequent changes, afraid of new things",
      6: "Emotional Balance (4, 5, 6): Bad terms with parents, least interested in home errands",
      7: "Spiritual Growth (7): Unable to pursue spiritualism, impatient, quick reactor, lacks empathy",
    };

    const impact =
      missingImpacts[firstMissing] ||
      "Certain life areas may need attention and development";
    const impactLines = doc.splitTextToSize(impact, pageWidth - 40);
    doc.text(impactLines, 20, yPos + 15);
  }

  yPos += 35;

  // Influence of Repeated Numbers
  const repeatedNums = presentNumbers.filter((item) => item.count > 1);
  if (repeatedNums.length > 0) {
    doc.setFillColor(255, 243, 224);
    doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, "F");
    doc.setTextColor(...darkGreen);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Influence of Repeated Numbers", 20, yPos + 7);

    yPos += 15;

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(
      "80% of charts have repeated numbers. These reveal your strengths and challenges.",
      20,
      yPos,
    );

    yPos += 10;

    // Show details for first repeated number
    repeatedNums.slice(0, 2).forEach((item) => {
      doc.setFillColor(255, 248, 235);
      doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, "F");

            // Number badge
      const text = `${item.num}`.repeat(item.count);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      let textWidth = doc.getTextWidth(text);
      let badgeWidth = Math.max(20, textWidth + 10);
      doc.setFillColor(255, 152, 0);
      doc.roundedRect(30 - badgeWidth/2, yPos + 5, badgeWidth, 20, 10, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(text, 30, yPos + 17, { align: "center" });

      // Title
      doc.setTextColor(255, 152, 0);
      doc.setFontSize(11);
      doc.text(`Number ${item.num} appears ${item.count} times`, 45, yPos + 12);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);

      const numberMeanings = {
        1: "Determination and Freedom",
        2: "Self-Confidence and Discretion",
        8: "Spirituality, Understanding, Correct Use of Power",
      };
      doc.text(
        numberMeanings[item.num] || "Special Significance",
        45,
        yPos + 18,
      );

      // Description
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");

      const descriptions = {
        1: "Compassionate or Sympathetic: Expressing inner feelings through words is a difficult chore for these people. The second one is that they are kind of reserved, introvert and calm.",
        2: "Bright and Brilliant: Double 2 is a great advantage. It provides the natural ability to develop intuitive sensitivity. They are the scanners and able to judge people instantly also correctly in the first meeting.",
        8: "Money Lovers: They are practical and careful, which make them a good businessman and financially settled. They can be somewhat, inflexible, rigid and restless.",
      };

      const desc =
        descriptions[item.num] ||
        "This repeated number brings special qualities and challenges to your personality.";
      const descLines = doc.splitTextToSize(desc, pageWidth - 50);
      doc.text(descLines, 20, yPos + 25);

      yPos += 35 + descLines.length * 3;
    });
  }

  // PAGE: Personality & Compatibility
  doc.addPage();
  yPos = 20;

  doc.setFillColor(...lightCream);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PERSONALITY & COMPATIBILITY", 20, yPos + 7);

  yPos += 20;

  // Personality Analysis
  doc.setFillColor(237, 231, 246);
  doc.roundedRect(15, yPos, pageWidth - 30, 60, 3, 3, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Personality Analysis (Life Path ${reportData.lifePath} + Destiny ${reportData.expression})`,
    20,
    yPos + 10,
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("Vedic Numerology Analysis", 20, yPos + 17);

  yPos += 20;

  const personalityText =
    "You will fulfil all that you take up in life provided you have good name number. You will work far more efficiently for others than if you work independently. In case you work independently, you will remain confused between the choices to make. You are physically strong but mentally emotional or sensitive. You will get a lot of attention from the opposite sex.";
  const personalityLines = doc.splitTextToSize(personalityText, pageWidth - 40);
  doc.text(personalityLines, 20, yPos);

  yPos += personalityLines.length * 4 + 10;

  // Lucky elements boxes
  const luckyBoxes = [
    { label: "Lucky Numbers", value: "2, 3, 9", icon: "" },
    { label: "Lucky Colors", value: "White", icon: "" },
  ];

  let boxX = 20;
  luckyBoxes.forEach((box) => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(boxX, yPos, 80, 15, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.text(`${box.label}:`, boxX + 5, yPos + 6);
    doc.setFontSize(10);
    doc.setTextColor(...primaryBrown);
    doc.text(box.value, boxX + 5, yPos + 11);
    boxX += 85;
  });

  yPos += 25;

  // Lucky Business Name Numbers
  doc.setFillColor(243, 232, 255);
  doc.roundedRect(15, yPos, (pageWidth - 35) / 2, 25, 3, 3, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Lucky Business Name Numbers", 20, yPos + 8);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");

  const businessNums = ["15", "24", "33", "42", "69"];
  let numX = 20;
  let numY = yPos + 14;
  businessNums.forEach((num) => {
    doc.setFillColor(147, 112, 219);
    doc.roundedRect(numX, numY, 12, 7, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(num, numX + 6, numY + 5, { align: "center" });
    numX += 14;
  });

  // Lucky Name Numbers
  doc.setFillColor(255, 235, 238);
  doc.roundedRect(pageWidth / 2 + 5, yPos, (pageWidth - 35) / 2, 25, 3, 3, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Lucky Name Numbers", pageWidth / 2 + 10, yPos + 8);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");

  const nameNums = ["15", "24", "33", "42", "69"];
  numX = pageWidth / 2 + 10;
  numY = yPos + 14;
  nameNums.forEach((num) => {
    doc.setFillColor(244, 67, 54);
    doc.roundedRect(numX, numY, 12, 7, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(num, numX + 6, numY + 5, { align: "center" });
    numX += 14;
  });

  yPos += 35;

  // Suitable Professions
  doc.setFillColor(232, 245, 253);
  doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Suitable Professions & Business", 20, yPos + 8);

  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");

  const professions = [
    "Water related professions",
    "Dairy farming",
    "Export/Import business",
    "Spirituality",
  ];
  let profX = 20;
  let profY = yPos + 15;
  professions.forEach((prof) => {
    doc.setFillColor(33, 150, 243);
    doc.roundedRect(profX, profY, 2, 2, 1, 1, "F");
    doc.setTextColor(60, 60, 60);
    doc.text(prof, profX + 5, profY + 2);
    profX += 48;
  });

  // Continue to Name Numerology page...
  doc.addPage();
  yPos = 20;

  doc.setFillColor(...lightCream);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("NAME NUMEROLOGY", 20, yPos + 7);

  yPos += 20;

  // Name Numerology Section
  doc.setFillColor(245, 240, 255);
  doc.roundedRect(15, yPos, pageWidth - 30, 80, 3, 3, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Name Numerology (Chaldean System)", 20, yPos + 10);

  yPos += 20;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Full Name: ${reportData.name}`, 20, yPos);

  yPos += 10;

  // Name letter breakdown
  const nameLetters = reportData.name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("");
  const letterMap = {
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

  let letterX = 20;
  let letterY = yPos;
  let totalValue = 0;

  nameLetters.forEach((letter, index) => {
    const value = letterMap[letter] || 0;
    totalValue += value;

    doc.setFillColor(237, 231, 246);
    doc.roundedRect(letterX, letterY, 10, 12, 2, 2, "F");
    doc.setTextColor(...darkGreen);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(letter, letterX + 5, letterY + 6, { align: "center" });
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(String(value), letterX + 5, letterY + 10, { align: "center" });

    letterX += 12;
    if (letterX > pageWidth - 30) {
      letterX = 20;
      letterY += 14;
    }
  });

  yPos = letterY + 18;

  // Total and reduced value
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.text(`Total: ${totalValue} = ${reportData.expression}`, 20, yPos);

  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryBrown);
  doc.text(
    `Name Number: ${reportData.expression} - ${reportData.expressionTraits.title}`,
    20,
    yPos,
  );
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(reportData.expressionTraits.desc, 20, yPos + 6);

  yPos += 15;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Key Traits:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const nameTraits = [
    "- Compassionate, strong willpower, courageous",
    "- High levels of energy",
    "- Skills to handle every situation wisely",
    "- Short tempered",
    "- Very good organizers, powerful",
  ];

  yPos += 5;
  nameTraits.forEach((trait) => {
    doc.text(trait, 25, yPos);
    yPos += 5;
  });

  // Continue with more sections...

  // PAGE: Missing Numbers & Remedies
  doc.addPage();
  yPos = 20;

  doc.setFillColor(...lightCream);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("MISSING NUMBERS & CRYSTAL REMEDIES", 20, yPos + 7);

  yPos += 20;

  // Show remedies for first 2-3 missing numbers
  const missingRemedies = {
    4: {
      planet: "Rahu",
      effects:
        "Avoids physical work, needs constant motivation, highly unorganized, not hardworking, believes in shortcuts, misses opportunities",
      crystal: "Rudraksh and Crystal Bracelet",
      crystalColor: "Brown with Crystal",
      benefits: [
        "Brings stability and structure to life",
        "Helps overcome sudden obstacles and challenges",
        "Improves focus and organizational skills",
        "Reduces confusion and provides clarity",
        "Protects from negative energies and evil eye",
      ],
      howToWear: "Wear on Saturday evening after cleansing with sesame oil",
      additionalRemedies: [
        "Keep Rahu Yantra in Lead",
        "Balance South-West direction of home",
        "Give food to street dogs",
        "Chant Gayatri Mantra",
        "Wear Rudraksh Crystal Bracelet",
      ],
    },
    5: {
      planet: "Mercury",
      effects:
        "Most confused personality, frequent changes, afraid of new things, less adventurous, highly insecure, difficulty adapting",
      crystal: "Green Aventurine Bracelet",
      crystalColor: "Green",
      benefits: [
        "Attracts luck, abundance, and prosperity",
        "Enhances communication and business skills",
        "Promotes emotional healing and heart chakra balance",
        "Increases adaptability and quick thinking",
        "Helps in making better financial decisions",
      ],
      howToWear: "Wear on Wednesday morning after cleansing with fresh water",
      additionalRemedies: [
        "Keep positive attitude always",
        "Place Vishnu Bhagwan picture in West",
        "Wear green clothes",
        "Wear Mercury Yantra (Gold)",
        "Feed cows regularly",
        "Offer green dal to birds",
      ],
    },
    6: {
      planet: "Venus",
      effects:
        "Bad terms with parents, least interested in home errands, cannot be part of society, struggles with love and harmony",
      crystal: "Seven Chakras Bracelet / Rose Quartz",
      crystalColor: "Multi-color / Pink",
      benefits: [
        "Balances all seven chakras for complete harmony",
        "Attracts love, beauty, and harmonious relationships",
        "Enhances artistic abilities and creativity",
        "Promotes domestic happiness and family bonding",
        "Brings luxury, comfort, and material pleasures",
      ],
      howToWear: "Wear on Friday morning after cleansing with rose water",
      additionalRemedies: [
        "Wear a watch in a gold chain",
        "Place Lakshmi Mata's picture in South-East",
        "Boys need to respect ladies",
        "Keep Venus Yantra (Gold)",
        "Keep fragrances at home",
        "Girls wear Rose Quartz for relationships",
      ],
    },
    7: {
      planet: "Ketu",
      effects:
        "Unable to pursue spiritualism, impatient, quick reactor, lacks empathy, anticipates worst, sees bad omens, assumes life is full of sorrows",
      crystal: "Tiger Eye Bracelet",
      crystalColor: "Golden Brown",
      benefits: [
        "Enhances spiritual wisdom and intuition",
        "Provides protection from negative energies",
        "Improves focus, willpower, and determination",
        "Balances emotions and reduces fear",
        "Promotes good luck and releases blocked creativity",
      ],
      howToWear: "Wear on Tuesday or Saturday after meditation and cleansing",
      additionalRemedies: [
        "Need to be positive",
        "Place Swastik at main door",
        "Fast on Thursday",
        "Wear Ketu Yantra (Silver)",
        "Donate food to street dogs",
        "Place Gautam Buddha's picture in North-East",
      ],
    },
  };

  missingNumbers.slice(0, 2).forEach((num, index) => {
    const remedy = missingRemedies[num];
    if (!remedy) return;

    // Missing Number Header
    doc.setFillColor(255, 245, 238);
    doc.roundedRect(15, yPos, pageWidth - 30, 12, 3, 3, "F");

    doc.setFillColor(244, 67, 54);
    doc.circle(30, yPos + 6, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(String(num), 30, yPos + 8, { align: "center" });

    doc.setTextColor(244, 67, 54);
    doc.setFontSize(12);
    doc.text(`Missing Number ${num}`, 45, yPos + 6);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Planet: ${remedy.planet}`, 45, yPos + 11);

    yPos += 18;

    // Effects
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text("Effects of Missing Number " + num + ":", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const effectsLines = doc.splitTextToSize(remedy.effects, pageWidth - 40);
    doc.text(effectsLines, 20, yPos + 5);

    yPos += 15;

    // Crystal Remedy
    doc.setFillColor(232, 245, 253);
    doc.roundedRect(15, yPos, pageWidth - 30, 45, 3, 3, "F");

    doc.setTextColor(...darkGreen);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Recommended Crystal Bracelet", 20, yPos + 8);

    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text(remedy.crystal, 20, yPos + 15);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(remedy.crystalColor, 20, yPos + 20);

    // Benefits
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text("Benefits:", 20, yPos + 27);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    let benefitY = yPos + 32;
    remedy.benefits.slice(0, 3).forEach((benefit) => {
      doc.text(`- ${benefit}`, 25, benefitY);
      benefitY += 4;
    });

    yPos += 50;

    // How to Wear
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text("How to Wear: ", 20, yPos + 6);
    doc.setFont("helvetica", "normal");
    doc.text(remedy.howToWear, 45, yPos + 6);

    yPos += 15;

    // Additional Remedies
    doc.setFillColor(232, 245, 253);
    doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, "F");
    doc.setFontSize(9);
    doc.setTextColor(...darkGreen);
    doc.setFont("helvetica", "bold");
    doc.text("Additional Remedies:", 20, yPos + 7);

    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    let remedyY = yPos + 12;
    remedy.additionalRemedies.slice(0, 4).forEach((rem) => {
      doc.text(`- ${rem}`, 25, remedyY);
      remedyY += 4;
    });

    yPos += 30;

    // Add new page if needed
    if (yPos > pageHeight - 40 && index < missingNumbers.length - 1) {
      doc.addPage();
      yPos = 20;
    }
  });

  // PAGE: Future Predictions
  doc.addPage();
  yPos = 20;

  doc.setFillColor(...lightCream);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("FUTURE PREDICTIONS", 20, yPos + 7);

  yPos += 20;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("3-Year Personal Year Predictions", 20, yPos);

  yPos += 15;

  // Current Year (2026)
  const currentYear = new Date().getFullYear();
  const personalYear = reportData.personalYear;

  doc.setFillColor(255, 248, 225);
  doc.roundedRect(15, yPos, pageWidth - 30, 70, 3, 3, "F");

  // Year badge
  doc.setFillColor(255, 152, 0);
  doc.roundedRect(20, yPos + 5, 35, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`Personal Year ${personalYear}`, 37.5, yPos + 10, {
    align: "center",
  });

  // Current Year badge
  doc.setFillColor(76, 175, 80);
  doc.roundedRect(pageWidth - 50, yPos + 5, 30, 8, 2, 2, "F");
  doc.text("Current Year", pageWidth - 35, yPos + 10, { align: "center" });

  doc.setTextColor(...darkGreen);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(String(currentYear), 20, yPos + 22);

  doc.setFontSize(11);
  const titleLines = doc.splitTextToSize(
    "THE YEAR OF HARD WORK, DISCIPLINE AND BUILDING FOUNDATIONS",
    pageWidth - 40,
  );
  doc.text(titleLines, 20, yPos + 30);

  const titleHeight = titleLines.length * 5;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Ruling Planet: Rahu", 20, yPos + 30 + titleHeight + 3);

  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const yearDesc =
    "A serious year requiring hard work and discipline. Focus on building solid foundations in all areas of life. Health needs attention. Organization and practical matters are prioritized.";
  const yearLines = doc.splitTextToSize(yearDesc, pageWidth - 40);
  doc.text(yearLines, 20, yPos + 30 + titleHeight + 11);

  const descHeight = yearLines.length * 4;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Personal Year " + personalYear + ": Things To Do",
    20,
    yPos + 30 + titleHeight + 11 + descHeight + 6,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  const thingsToDo = [
    "Work diligently on important goals",
    "Organize your life and workspace",
    "Be disciplined and practical",
    "Save money for the future",
  ];

  let todoY = yPos + 30 + titleHeight + 11 + descHeight + 11;
  thingsToDo.forEach((todo) => {
    doc.text(`- ${todo}`, 25, todoY);
    todoY += 4;
  });

  yPos += 80;

  // Next Year
  doc.setFillColor(245, 240, 255);
  doc.roundedRect(15, yPos, pageWidth - 30, 50, 3, 3, "F");

  doc.setFillColor(147, 112, 219);
  doc.roundedRect(20, yPos + 5, 35, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`Personal Year ${(personalYear % 9) + 1}`, 37.5, yPos + 10, {
    align: "center",
  });

  doc.setTextColor(...darkGreen);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(String(currentYear + 1), 20, yPos + 22);

  doc.setFontSize(11);
  const nextYearTitleLines = doc.splitTextToSize(
    "THE YEAR OF CHANGE, FREEDOM AND NEW EXPERIENCES",
    pageWidth - 40,
  );
  doc.text(nextYearTitleLines, 20, yPos + 30);

  const nextTitleHeight = nextYearTitleLines.length * 5;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Ruling Planet: Mercury", 20, yPos + 30 + nextTitleHeight + 3);

  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const nextYearDesc =
    "A dynamic year of change, travel, and new experiences. The unexpected happens. Embrace freedom and variety. Avoid making hasty permanent commitments.";
  const nextYearLines = doc.splitTextToSize(nextYearDesc, pageWidth - 40);
  doc.text(nextYearLines, 20, yPos + 30 + nextTitleHeight + 11);

  yPos += 60;

  // Year After Next
  doc.setFillColor(255, 235, 238);
  doc.roundedRect(15, yPos, pageWidth - 30, 50, 3, 3, "F");

  doc.setFillColor(244, 67, 54);
  doc.roundedRect(20, yPos + 5, 35, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`Personal Year ${((personalYear + 1) % 9) + 1}`, 37.5, yPos + 10, {
    align: "center",
  });

  doc.setTextColor(...darkGreen);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(String(currentYear + 2), 20, yPos + 22);

  doc.setFontSize(11);
  const thirdYearTitleLines = doc.splitTextToSize(
    "THE YEAR OF RESPONSIBILITY, FAMILY AND LOVE",
    pageWidth - 40,
  );
  doc.text(thirdYearTitleLines, 20, yPos + 30);

  const thirdTitleHeight = thirdYearTitleLines.length * 5;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Ruling Planet: Venus", 20, yPos + 30 + thirdTitleHeight + 3);

  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const thirdYearDesc =
    "A year centered on family, home, and responsibilities. Domestic matters demand attention. Love and relationships are highlighted. Good year for marriage, children, or buying a home.";
  const thirdYearLines = doc.splitTextToSize(thirdYearDesc, pageWidth - 40);
  doc.text(thirdYearLines, 20, yPos + 30 + thirdTitleHeight + 11);

  // Final Page: Crystal Recommendations
  doc.addPage();
  yPos = 20;

  doc.setFillColor(...lightCream);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("CRYSTAL & BRACELET RECOMMENDATIONS", 20, yPos + 7);

  yPos += 20;

  doc.setFillColor(255, 243, 224);
  doc.roundedRect(15, yPos, pageWidth - 30, 60, 3, 3, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Crystal & Bracelet Recommendations", 20, yPos + 10);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Energize your numbers with these powerful remedies", 20, yPos + 17);

  yPos += 25;

  // Life Path Crystal
  doc.setFillColor(255, 235, 238);
  doc.roundedRect(20, yPos, 80, 30, 3, 3, "F");
  doc.setTextColor(244, 67, 54);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`1. For Life Path Number ${reportData.lifePath}`, 25, yPos + 8);

  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "bold");
  doc.text("Gemstone:", 25, yPos + 15);
  doc.setFont("helvetica", "normal");
  doc.text(reportData.lifePathTraits.gem, 25, yPos + 20);

  doc.setFont("helvetica", "bold");
  doc.text("Crystal:", 25, yPos + 25);
  doc.setFont("helvetica", "normal");
  doc.text("Citrine", 25, yPos + 30);

  // Destiny Crystal
  doc.setFillColor(232, 245, 253);
  doc.roundedRect(pageWidth - 100, yPos, 80, 30, 3, 3, "F");
  doc.setTextColor(33, 150, 243);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(
    `2. For Destiny Number ${reportData.expression}`,
    pageWidth - 95,
    yPos + 8,
  );

  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "bold");
  doc.text("Gemstone:", pageWidth - 95, yPos + 15);
  doc.setFont("helvetica", "normal");
  doc.text(reportData.expressionTraits.gem, pageWidth - 95, yPos + 20);

  doc.setFont("helvetica", "bold");
  doc.text("Crystal:", pageWidth - 95, yPos + 25);
  doc.setFont("helvetica", "normal");
  doc.text("Moonstone", pageWidth - 95, yPos + 30);

  yPos += 40;

  // Recommended Combination
  doc.setFillColor(255, 248, 225);
  doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, "F");
  doc.setTextColor(...darkGreen);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Recommended Bracelet Combination", 20, yPos + 8);

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.text(`7 Mukhi Rudraksha + 2 Mukhi Rudraksha`, 20, yPos + 15);

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Wear these crystals together for maximum benefit. Contact Shining Ank Vastu for authentic, energized products.",
    20,
    yPos + 21,
  );

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Shining Ank Vastu", pageWidth / 2, pageHeight - 15, {
    align: "center",
  });
  doc.text("Vedic Numerology Report", pageWidth / 2, pageHeight - 10, {
    align: "center",
  });
  doc.text(
    `Report generated on: ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    pageHeight - 5,
    { align: "center" },
  );

  return doc;
};
