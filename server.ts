import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Server-side Gemini AI Client (Lazy init)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "DIGITAL SEVA PRO", time: new Date().toISOString() });
});

// AI School Project Assistant Endpoint
app.post("/api/ai/project-generate", async (req, res) => {
  try {
    const { topic, studentClass, language, subject, studentName, schoolName } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback structured generation when API key isn't provided
      const fallbackResponse = generateFallbackProject(topic, studentClass, language, subject);
      return res.json({ project: fallbackResponse, source: "template" });
    }

    const prompt = `You are a professional educational curriculum expert and school project creator for Indian and West Bengal board students (WBBSE, WBCHSE, CBSE, ICSE).
Generate a comprehensive, high-quality, structured School Project on the topic: "${topic}".

Parameters:
- Student Class: ${studentClass || "Class 8"}
- Language: ${language === "bn" ? "Bengali (বাংলা) with proper Bengali typography and vocabulary suited for school project submission" : "English with clear, student-friendly, and well-structured headings"}
- Subject: ${subject || "General Science / Social Studies / Environmental Studies"}
- Student Name: ${studentName || "Student"}
- School Name: ${schoolName || "High School"}

Create a complete academic project with the following 10 sections strictly formatted in JSON:
1. introduction (Detailed introductory overview)
2. objectives (Bullet points of project learning objectives)
3. mainContent (Core concepts, definitions, history/background)
4. explanation (Detailed breakdown and explanation suitable for the student's grade level)
5. importantFacts (5-7 fascinating key facts / data points / timelines)
6. examples (Real-life examples, case studies or local Indian/WB context)
7. advantages (Key benefits / positive impacts if applicable)
8. disadvantages (Challenges / negative aspects / problems)
9. conclusion (Summary insights and student reflection)
10. bibliography (3-5 verified book references, educational websites, encyclopedias)

Also provide 3 suggested diagrams or illustrations with captions.

Return ONLY valid JSON matching this schema:
{
  "title": "Project Title",
  "subject": "Subject Name",
  "introduction": "string",
  "objectives": ["string", "string"],
  "mainContent": "string",
  "explanation": "string",
  "importantFacts": ["string", "string"],
  "examples": ["string", "string"],
  "advantages": ["string", "string"],
  "disadvantages": ["string", "string"],
  "conclusion": "string",
  "bibliography": ["string", "string"],
  "suggestedDiagrams": [
    { "title": "string", "caption": "string", "prompt": "string" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json({ project: parsed, source: "gemini" });
  } catch (error: any) {
    console.error("AI Project Generation Error:", error);
    // Return gracefully with fallback
    const { topic, studentClass, language, subject } = req.body;
    const fallback = generateFallbackProject(topic, studentClass, language, subject);
    return res.json({ project: fallback, source: "fallback", error: error.message });
  }
});

// Helper for offline / fallback school project generation
function generateFallbackProject(topic: string, studentClass = "Class 8", language = "bn", subject = "Science") {
  const isBn = language === "bn";
  if (isBn) {
    return {
      title: `${topic} সম্পর্কিত বিদ্যালয় প্রকল্প`,
      subject: subject || "পরিবেশ বিজ্ঞান / ভূগোল",
      introduction: `বর্তমান বিশ্বে ${topic} একটি অত্যন্ত গুরুত্বপূর্ণ ও প্রাসঙ্গিক বিষয়। আমাদের দৈনন্দিন জীবনে এবং সামগ্রিক পরিবেশ ও সমাজে এর গভীর প্রভাব রয়েছে। এই প্রকল্পের মাধ্যমে আমরা ${topic}-এর বিভিন্ন দিক, কারণ ও ফলাফল বিস্তারিতভাবে অনুসন্ধান করেছি।`,
      objectives: [
        `${topic} সম্পর্কে স্পষ্ট ধারণা ও প্রাথমিক জ্ঞান অর্জন করা।`,
        `এর বিভিন্ন উপাদান, কারণ এবং ফলাফল বিশ্লেষণ করা।`,
        `বাস্তব জীবনে এর প্রভাব এবং সমাধানের উপায় অনুসন্ধান করা।`,
        `বিজ্ঞানসম্মত দৃষ্টিভঙ্গি ও তথ্য সংগ্রহের দক্ষতা বৃদ্ধি করা।`
      ],
      mainContent: `${topic} হলো আধুনিক মানব সভ্যতা ও প্রকৃতির একটি অবিচ্ছেদ্য অংশ। প্রাচীনকাল থেকে বর্তমান সময় পর্যন্ত এর বিবর্তন ঘটেছে। বর্তমান বৈজ্ঞানিক ও সামাজিক প্রেক্ষাপটে এটি গভীরভাবে পর্যালোচিত হচ্ছে। বিভিন্ন তথ্য ও পরিসংখ্যান থেকে দেখা যায় যে এর সঠিক ব্যবস্থাপনা ভবিষ্যৎ প্রজন্মের জন্য অত্যন্ত জরুরি।`,
      explanation: `বিষয়টিকে সহজভাবে বোঝার জন্য আমরা এটিকে প্রধান কয়েকটি ভাগে ভাগ করতে পারি:\n1. প্রাথমিক উৎস ও পরিকাঠামো\n2. কার্যপ্রণালী ও দৈনন্দিন প্রয়োগ\n3. সামাজিক ও পরিবেশগত ভারসাম্য\n4. দীর্ঘমেয়াদী প্রভাব ও সচেতনতা।\n\nপ্রতিটি ক্ষেত্রে সঠিক নিয়ম ও বৈজ্ঞানিক পদ্ধতি মেনে চলা উচিত।`,
      importantFacts: [
        `${topic}-এর সঠিক ব্যবহার মানবকল্যাণে প্রভূত উন্নতি সাধন করতে পারে।`,
        `বিশ্বব্যাপী বিভিন্ন গবেষণা প্রতিষ্ঠান এই বিষয়ে নিরন্তর কাজ করে চলেছে।`,
        `বিদ্যালয় স্তরে এই প্রকল্পের মাধ্যমে শিক্ষার্থীরা বাস্তবমুখী জ্ঞান লাভ করে।`,
        `পশ্চিমবঙ্গ ও ভারতবর্ষের প্রেক্ষাপটে এর সামাজিক গুরুত্ব অপরিসীম।`
      ],
      examples: [
        `আমাদের চারপাশে ও গ্রামীণ/শহরাঞ্চলে এর প্রত্যক্ষ উদাহরণ লক্ষ্য করা যায়।`,
        `দৈনন্দিন কার্যকলাপে এর ভূমিকা ও ব্যবহারিক প্রয়োগ।`,
        `আন্তর্জাতিক ও জাতীয় স্তরের বিভিন্ন সফল প্রকল্প ও কেস স্টাডি।`
      ],
      advantages: [
        `সচেতনতা বৃদ্ধি এবং সঠিক জ্ঞানের বিকাশ।`,
        `বিজ্ঞানমনস্কতা তৈরি ও যুক্তিবাদী চিন্তা।`,
        `পরিবেশ সুরক্ষা ও সামাজিক উন্নয়ন।`
      ],
      disadvantages: [
        `সঠিক জ্ঞান বা সচেতনতার অভাবে ভুল প্রয়োগের সম্ভাবনা।`,
        `পর্যাপ্ত পরিকাঠামো বা উপকরণের সীমাবদ্ধতা।`
      ],
      conclusion: `পরিশেষে বলা যায় যে, ${topic} বিষয়ে এই অনুসন্ধান আমাদের নতুন দৃষ্টিভঙ্গি প্রদান করেছে। আমরা যদি সঠিক উপায়ে সচেতন থাকি এবং দায়িত্বশীল আচরণ করি, তবে একটি সুন্দর ও উন্নত ভবিষ্যৎ গড়ে তোলা সম্ভব। এই প্রকল্পের জন্য শিক্ষক মহাশয় ও সহপাঠীদের ধন্যবাদ জানাই।`,
      bibliography: [
        `পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ পাঠ্যপুস্তক (শ্রেণী: ${studentClass})`,
        `উইকিপিডিয়া ও বিভিন্ন প্রামাণ্য ওয়েবসাইট`,
        `বিজ্ঞান ও পরিবেশ পত্রিকা এবং শিক্ষামূলক জার্নাল`
      ],
      suggestedDiagrams: [
        { title: `${topic}-এর মৌলিক চিত্র`, caption: "বিষয়বস্তুর রূপরেখা ও প্রবাহ চিত্র", prompt: "A clear schematic educational diagram of " + topic },
        { title: "বাস্তব প্রভাব ও উদাহরণ", caption: "বাস্তব জীবনের প্রাসঙ্গিক চিত্র", prompt: "Real world example diagram of " + topic }
      ]
    };
  } else {
    return {
      title: `School Academic Project on ${topic}`,
      subject: subject || "General Science / Environmental Studies",
      introduction: `${topic} is a significant subject of study in today's modern curriculum. It plays a pivotal role in shaping our environment, scientific understanding, and social awareness. Through this project, we explore the core principles, implications, and practical perspectives of ${topic}.`,
      objectives: [
        `To gain a comprehensive understanding of ${topic}.`,
        `To analyze the fundamental causes, effects, and modern relevance.`,
        `To foster scientific inquiry, research habits, and presentation skills.`,
        `To evaluate sustainable measures and community awareness.`
      ],
      mainContent: `${topic} encompasses various foundational concepts that impact our daily lives and academic learning. Over the years, technological and social advancements have reshaped how we perceive and address the challenges associated with it. This study presents a structured overview suitable for academic evaluation.`,
      explanation: `To understand the topic deeply, we can categorize it into essential dimensions:\n1. Fundamental Concepts and Definitions\n2. Key Operational Mechanisms\n3. Ecological and Socio-economic Impact\n4. Preventive and Constructive Action Plan.`,
      importantFacts: [
        `Scientific studies emphasize continuous observation and research in this domain.`,
        `National educational standards encourage student participation in practical case studies.`,
        `Real-world implementation of these concepts has transformed modern practices.`,
        `Awareness campaigns across schools have significantly improved general understanding.`
      ],
      examples: [
        `Case study observations from local community practices.`,
        `Documented real-life examples from national scientific projects.`,
        `Comparative analysis of past vs modern methodologies.`
      ],
      advantages: [
        `Enhances critical thinking and problem-solving abilities.`,
        `Promotes environmental stewardship and societal progress.`,
        `Equips students with practical project management skills.`
      ],
      disadvantages: [
        `Resource constraints in initial data collection.`,
        `Need for continuous updates in rapid technological shifts.`
      ],
      conclusion: `In conclusion, this project on ${topic} has provided valuable insights into both theoretical and applied aspects. Continuous awareness, ethical practices, and proactive community involvement are vital for achieving long-term sustainable growth.`,
      bibliography: [
        `NCERT / Board Standard Textbooks (Grade: ${studentClass})`,
        `Encyclopedia Britannica and National Science Journals`,
        `Verified Educational Research Portals and Documentaries`
      ],
      suggestedDiagrams: [
        { title: `Core Conceptual Diagram of ${topic}`, caption: "Visual representation of key elements and workflows", prompt: "Educational scientific diagram for " + topic },
        { title: "Flowchart & Real World Impact", caption: "Step-by-step impact illustration", prompt: "Impact flow diagram for " + topic }
      ]
    };
  }
}

// AI Document Drafting Endpoint (Leave applications, affidavits, complaints, notices)
app.post("/api/ai/document-assist", async (req, res) => {
  try {
    const { docType, inputs, language } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({ draft: "Standard template applied locally.", source: "template" });
    }

    const prompt = `You are an expert legal document drafter and official correspondence specialist for Indian Cyber Cafes.
Draft a professional, formatted ${docType} in ${language === "bn" ? "Bengali (বাংলা)" : "English"}.
User Details & Key Points:
${JSON.stringify(inputs, null, 2)}

Provide clean, formatted document text ready for printing on A4 paper with standard official headers, date, subject line, body, and signature placeholders.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
      },
    });

    res.json({ draft: response.text || "", source: "gemini" });
  } catch (error: any) {
    console.error("AI Document Assist Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware for development & Static Serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DIGITAL SEVA PRO Server running on http://localhost:${PORT}`);
  });
}

startServer();
