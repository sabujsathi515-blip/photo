/**
 * Realistic Sample WhatsApp Documents (Slanted, crooked, with background & shadows)
 * Allows cyber cafe operators to test straightening and print enhancement instantly!
 */

export function generateSampleDoc(type: "aadhaar" | "application" | "marksheet"): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1500;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 1. Background (Wooden desk / bedsheet fabric with texture)
  if (type === "aadhaar") {
    // Dark brown wooden desk background
    const woodGrad = ctx.createLinearGradient(0, 0, 1200, 1500);
    woodGrad.addColorStop(0, "#2c1d11");
    woodGrad.addColorStop(0.5, "#3d2817");
    woodGrad.addColorStop(1, "#24170d");
    ctx.fillStyle = woodGrad;
    ctx.fillRect(0, 0, 1200, 1500);

    // Wood grain lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 1500; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.bezierCurveTo(400, i + 15, 800, i - 15, 1200, i + 5);
      ctx.stroke();
    }
  } else if (type === "application") {
    // Bedsheet fabric background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, 1200, 1500);
    // Subtle crosshatch fabric pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    for (let i = 0; i < 1500; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1200, i);
      ctx.stroke();
    }
  } else {
    // Office table with uneven warm lighting
    const tableGrad = ctx.createRadialGradient(400, 300, 100, 600, 750, 900);
    tableGrad.addColorStop(0, "#475569");
    tableGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = tableGrad;
    ctx.fillRect(0, 0, 1200, 1500);
  }

  // 2. Render Tilted & Perspective-skewed Document Card
  ctx.save();
  // Move to center, tilt by 8.5 degrees
  ctx.translate(600, 750);
  ctx.rotate((8.5 * Math.PI) / 180);

  if (type === "aadhaar") {
    // Draw Aadhaar Card (horizontal laminated card)
    const cardW = 780;
    const cardH = 490;
    const x = -cardW / 2;
    const y = -cardH / 2;

    // Card Drop Shadow on wood table
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetX = 18;
    ctx.shadowOffsetY = 24;

    // Card body (yellowish phone lighting)
    ctx.fillStyle = "#fefdfa";
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 16);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = "transparent";

    // Top Indian Govt Tricolor Bar
    const triGrad = ctx.createLinearGradient(x, y, x + cardW, y);
    triGrad.addColorStop(0, "#ff9933");
    triGrad.addColorStop(0.5, "#ffffff");
    triGrad.addColorStop(1, "#138808");
    ctx.fillStyle = triGrad;
    ctx.fillRect(x + 15, y + 15, cardW - 30, 8);

    // Ashoka Emblem / Header
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("GOVERNMENT OF INDIA / ভারত সরকার", x + 120, y + 55);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Unique Identification Authority of India", x + 120, y + 78);

    // Photo Box (Left)
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(x + 40, y + 100, 150, 190);
    ctx.strokeStyle = "#94a3b8";
    ctx.strokeRect(x + 40, y + 100, 150, 190);
    // Silhouette avatar
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.arc(x + 115, y + 165, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 115, y + 265, 60, Math.PI, Math.PI * 2);
    ctx.fill();

    // Aadhaar Details
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("SOUMEN SARKAR / সৌমেন সরকার", x + 215, y + 140);
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#334155";
    ctx.fillText("DOB / জন্ম তারিখ: 14/08/1996", x + 215, y + 175);
    ctx.fillText("Gender / লিঙ্গ: MALE / পুরুষ", x + 215, y + 205);
    ctx.fillText("Address: Vill- Radhanagar, P.O- Krishnanagar,", x + 215, y + 240);
    ctx.fillText("Dist- Nadia, West Bengal, PIN - 741101", x + 215, y + 265);

    // Big Aadhaar Number in Red/Black
    ctx.fillStyle = "#b91c1c";
    ctx.font = "bold 32px monospace";
    ctx.fillText("9482  7361  0459", x + 240, y + 340);

    // Bottom Slogan
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("আমার আধার, আমার পরিচয়", x + cardW / 2 - 100, y + 430);

    // Simulated camera finger shadow across corner
    const shadowGrad = ctx.createLinearGradient(x + cardW - 250, y, x + cardW, y + 300);
    shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    shadowGrad.addColorStop(1, "rgba(20, 15, 10, 0.45)");
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 16);
    ctx.fill();
  } else if (type === "application") {
    // Official Letter / दरখাস্ত
    const docW = 750;
    const docH = 1050;
    const x = -docW / 2;
    const y = -docH / 2;

    // Drop shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 12;
    ctx.shadowOffsetY = 18;

    // Crumpled/off-white paper
    ctx.fillStyle = "#fbfaf6";
    ctx.fillRect(x, y, docW, docH);
    ctx.shadowColor = "transparent";

    // Application Text
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 20px serif";
    ctx.fillText("To,", x + 60, y + 80);
    ctx.fillText("The Block Development Officer (B.D.O)", x + 60, y + 110);
    ctx.fillText("Nakashipara Development Block, Nadia", x + 60, y + 140);

    ctx.font = "bold 18px serif";
    ctx.fillText("বিষয়: বাংলা আবাস যোজনার তদন্ত ও নতুন তালিকার আবেদন।", x + 60, y + 210);

    ctx.font = "17px serif";
    ctx.fillStyle = "#334155";
    ctx.fillText("মহাশয়,", x + 60, y + 270);
    ctx.fillText("সবিনয় নিবেদন এই যে, আমি শ্রী সুশান্ত কুমার বিশ্বাস, পিতা স্বর্গীয় হরিপদ বিশ্বাস,", x + 60, y + 310);
    ctx.fillText("গ্রাম- গোবিন্দপুর, পোঃ- বেথুয়াডহরী, থানা- নাকাশীপাড়া, জেলা- নদীয়ার স্থায়ী বাসিন্দা।", x + 60, y + 345);
    ctx.fillText("আমার কোনো পাকা বাড়ি নাই, বর্তমান বর্ষাকালে মাটির ঘরটি ধসে যাওয়ার মুখে।", x + 60, y + 380);
    ctx.fillText("অতএব মহাশয়ের নিকট করজোড়ে প্রার্থনা, আমার পরিবারটির পরিস্থিতি সরজমিনে", x + 60, y + 430);
    ctx.fillText("তদন্ত করে সরকারি আবাস প্রকল্পে আর্থিক মঞ্জুরি প্রদান করিতে আপনার সদয় আজ্ঞা হয়।", x + 60, y + 465);

    // Official Stamp (Purple/Blue round seal)
    ctx.save();
    ctx.translate(x + 180, y + 750);
    ctx.rotate(-0.15);
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#2563eb";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("GRAM PANCHAYAT", -48, -12);
    ctx.fillText("★ RECEIVED ★", -38, 8);
    ctx.fillText("BETHUADAHARI", -42, 26);
    ctx.restore();

    // Signature in blue ink
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + docW - 260, y + 780);
    ctx.bezierCurveTo(x + docW - 220, y + 740, x + docW - 200, y + 810, x + docW - 140, y + 760);
    ctx.bezierCurveTo(x + docW - 110, y + 730, x + docW - 80, y + 790, x + docW - 50, y + 750);
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.font = "16px serif";
    ctx.fillText("বিনীত,", x + docW - 220, y + 720);
    ctx.fillText("সুশান্ত কুমার বিশ্বাস", x + docW - 220, y + 810);
    ctx.fillText("মোবাইল: 98321XXXXX", x + docW - 220, y + 835);

    // Phone camera shadow gradient across top right
    const phoneShadow = ctx.createLinearGradient(x + docW, y, x + docW - 350, y + 450);
    phoneShadow.addColorStop(0, "rgba(10, 15, 25, 0.45)");
    phoneShadow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = phoneShadow;
    ctx.fillRect(x, y, docW, docH);
  } else {
    // School Marksheet with Table
    const docW = 760;
    const docH = 1080;
    const x = -docW / 2;
    const y = -docH / 2;

    // Drop shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 14;
    ctx.shadowOffsetY = 20;

    ctx.fillStyle = "#faf8f2";
    ctx.fillRect(x, y, docW, docH);
    ctx.shadowColor = "transparent";

    // Board Header
    ctx.fillStyle = "#1e3a8a";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("WEST BENGAL BOARD OF SECONDARY EDUCATION", x + 50, y + 80);
    ctx.fillStyle = "#475569";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("MADHYAMIK PARIKSHA (SECONDARY EXAMINATION) - 2024", x + 130, y + 110);

    // Candidate details
    ctx.strokeStyle = "#94a3b8";
    ctx.strokeRect(x + 40, y + 140, docW - 80, 80);
    ctx.fillStyle = "#0f172a";
    ctx.font = "14px sans-serif";
    ctx.fillText("Candidate Name: PRIYA BANERJEE", x + 60, y + 170);
    ctx.fillText("Roll: 410221M   No: 0148", x + docW - 280, y + 170);
    ctx.fillText("School: KRISHNAGAR HIGH SCHOOL", x + 60, y + 200);

    // Marksheet Table
    const tblY = y + 250;
    const rowH = 40;
    const colW = [200, 100, 100, 100, 140];

    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(x + 40, tblY, docW - 80, rowH);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("SUBJECT", x + 60, tblY + 26);
    ctx.fillText("WRITTEN", x + 260, tblY + 26);
    ctx.fillText("ORAL", x + 360, tblY + 26);
    ctx.fillText("TOTAL", x + 460, tblY + 26);
    ctx.fillText("GRADE", x + 560, tblY + 26);

    const marks = [
      ["FIRST LANGUAGE (BENGALI)", "82", "10", "92", "AA (OUTSTANDING)"],
      ["SECOND LANGUAGE (ENGLISH)", "74", "10", "84", "A+ (EXCELLENT)"],
      ["MATHEMATICS", "88", "10", "98", "AA (OUTSTANDING)"],
      ["PHYSICAL SCIENCE", "79", "10", "89", "A+ (EXCELLENT)"],
      ["LIFE SCIENCE", "85", "10", "95", "AA (OUTSTANDING)"],
      ["HISTORY", "72", "10", "82", "A+ (EXCELLENT)"],
      ["GEOGRAPHY", "80", "10", "90", "AA (OUTSTANDING)"],
    ];

    marks.forEach((m, idx) => {
      const curY = tblY + rowH * (idx + 1);
      ctx.strokeStyle = "#cbd5e1";
      ctx.strokeRect(x + 40, curY, docW - 80, rowH);
      ctx.fillStyle = "#334155";
      ctx.font = "13px sans-serif";
      ctx.fillText(m[0], x + 55, curY + 25);
      ctx.fillText(m[1], x + 275, curY + 25);
      ctx.fillText(m[2], x + 375, curY + 25);
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#0f172a";
      ctx.fillText(m[3], x + 475, curY + 25);
      ctx.fillText(m[4], x + 560, curY + 25);
    });

    // Grand Total Row
    const grandY = tblY + rowH * (marks.length + 1);
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(x + 40, grandY, docW - 80, 45);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("GRAND TOTAL: 630 / 700", x + 60, grandY + 28);
    ctx.fillStyle = "#15803d";
    ctx.fillText("RESULT: PASSED (FIRST DIVISION)", x + 380, grandY + 28);

    // Uneven room shadow across the marksheet
    const roomShadow = ctx.createLinearGradient(x, y + docH, x + 400, y + docH - 400);
    roomShadow.addColorStop(0, "rgba(15, 23, 42, 0.4)");
    roomShadow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = roomShadow;
    ctx.fillRect(x, y, docW, docH);
  }

  ctx.restore();
  return canvas.toDataURL("image/jpeg", 0.92);
}
