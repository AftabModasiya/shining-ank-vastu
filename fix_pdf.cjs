const fs = require('fs');
const file = 'src/utils/pdfGenerator.js';
let content = fs.readFileSync(file, 'utf8');

// Replacements
content = content.replace(/doc\.text\("✦",/g, 'doc.text("*",');
content = content.replace(/doc\.text\("📊 CORE NUMBERS ANALYSIS"/g, 'doc.text("CORE NUMBERS ANALYSIS"');
content = content.replace(/doc\.text\(`📅 Date Influencer/g, 'doc.text(`Date Influencer');
content = content.replace(/doc\.text\("🔢 LO SHU GRID ANALYSIS"/g, 'doc.text("LO SHU GRID ANALYSIS"');
content = content.replace(/doc\.text\("⚠️ Areas to Improve"/g, 'doc.text("Areas to Improve"');
content = content.replace(/doc\.text\("✨ Influence of Repeated Numbers"/g, 'doc.text("Influence of Repeated Numbers"');
content = content.replace(/doc\.text\("👤 PERSONALITY & COMPATIBILITY"/g, 'doc.text("PERSONALITY & COMPATIBILITY"');
content = content.replace(/`✨ Personality Analysis/g, '`Personality Analysis');
content = content.replace(/icon: "🔢"/g, 'icon: ""');
content = content.replace(/icon: "🎨"/g, 'icon: ""');
content = content.replace(/doc\.text\(`\$\{box\.icon\} \$\{box\.label\}:`, boxX \+ 5, yPos \+ 6\);/g, 'doc.text(`${box.label}:`, boxX + 5, yPos + 6);');
content = content.replace(/doc\.text\("💼 Suitable Professions & Business"/g, 'doc.text("Suitable Professions & Business"');
content = content.replace(/doc\.text\("📝 NAME NUMEROLOGY"/g, 'doc.text("NAME NUMEROLOGY"');
content = content.replace(/doc\.text\("👤 Name Numerology \(Chaldean System\)"/g, 'doc.text("Name Numerology (Chaldean System)"');
content = content.replace(/doc\.text\(`✓ \$\{trait\}`/g, 'doc.text(`- ${trait}`');
content = content.replace(/doc\.splitTextToSize\(`✓ \$\{trait\}`/g, 'doc.splitTextToSize(`- ${trait}`');
content = content.replace(/doc\.text\(`✓ \$\{benefit\}`/g, 'doc.text(`- ${benefit}`');
content = content.replace(/doc\.text\(`✓ \$\{todo\}`/g, 'doc.text(`- ${todo}`');

content = content.replace(/✓ Compassionate/g, '- Compassionate');
content = content.replace(/✓ High levels/g, '- High levels');
content = content.replace(/✓ Skills to/g, '- Skills to');
content = content.replace(/✓ Short tempered/g, '- Short tempered');
content = content.replace(/✓ Very good/g, '- Very good');

content = content.replace(/doc\.text\("⚠️ MISSING NUMBERS & CRYSTAL REMEDIES"/g, 'doc.text("MISSING NUMBERS & CRYSTAL REMEDIES"');
content = content.replace(/doc\.text\("⚠️ Effects of Missing Number "/g, 'doc.text("Effects of Missing Number "');
content = content.replace(/doc\.text\("💎 Recommended Crystal Bracelet"/g, 'doc.text("Recommended Crystal Bracelet"');
content = content.replace(/doc\.text\(`⭐ \$\{rem\}`/g, 'doc.text(`- ${rem}`');

content = content.replace(/doc\.text\("🔮 FUTURE PREDICTIONS"/g, 'doc.text("FUTURE PREDICTIONS"');
content = content.replace(/doc\.text\("💎 CRYSTAL & BRACELET RECOMMENDATIONS"/g, 'doc.text("CRYSTAL & BRACELET RECOMMENDATIONS"');
content = content.replace(/doc\.text\("💎 Crystal & Bracelet Recommendations"/g, 'doc.text("Crystal & Bracelet Recommendations"');
content = content.replace(/`1️⃣ For Life Path Number/g, '`1. For Life Path Number');
content = content.replace(/`2️⃣ For Destiny Number/g, '`2. For Destiny Number');

// Fix circle badge for 1111
const circleFix = `      // Number badge
      const text = \`\${item.num}\`.repeat(item.count);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      let textWidth = doc.getTextWidth(text);
      let badgeWidth = Math.max(20, textWidth + 10);
      doc.setFillColor(255, 152, 0);
      doc.roundedRect(30 - badgeWidth/2, yPos + 5, badgeWidth, 20, 10, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(text, 30, yPos + 17, { align: "center" });`;

content = content.replace(/\/\/ Number badge\n      doc\.setFillColor\(255, 152, 0\);\n      doc\.circle\(30, yPos \+ 15, 10, "F"\);\n      doc\.setTextColor\(255, 255, 255\);\n      doc\.setFontSize\(14\);\n      doc\.setFont\("helvetica", "bold"\);\n      doc\.text\(`\$\{item\.num\}`\.repeat\(item\.count\), 30, yPos \+ 17, \{\n        align: "center",\n      \}\);/g, circleFix);

fs.writeFileSync(file, content);
console.log('Fixes applied.');
