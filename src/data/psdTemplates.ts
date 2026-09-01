export interface PsdTemplate {
  id: string;
  title: string;
  titleBn: string;
  category: "passport" | "visiting_card" | "certificate" | "flex_banner" | "marriage" | "school";
  tags: string[];
  fileSize: string;
  resolution: string;
  layers: number;
  fonts: string[];
  thumbnailUrl: string;
  description: string;
  descriptionBn: string;
  downloadUrl?: string;
}

export type PSDTemplateItem = PsdTemplate;

export const psdTemplates: PsdTemplate[] = [
  {
    id: "psd-passport-action",
    title: "Indian Passport Photo 8-in-1 Action Template",
    titleBn: "পাসপোর্ট ফটো ৮-ইন-১ অ্যাকশন টেমপ্লেট",
    category: "passport",
    tags: ["passport", "action", "35x45mm", "a4", "8-copies", "studio"],
    fileSize: "14.8 MB",
    resolution: "300 DPI",
    layers: 8,
    fonts: ["Arial", "Hind Siliguri"],
    thumbnailUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=60",
    description: "Automated 8-in-1 A4 sheet passport photo grid with cutting guidelines and smart layer masks.",
    descriptionBn: "A4 পেপারে ৮ কপি পাসপোর্ট ফটো স্বয়ংক্রিয় কাটিং গাইড ও স্মার্ট লেয়ারসহ।",
  },
  {
    id: "psd-voter-pvc",
    title: "New Voter Card Front & Back PVC Print Layout",
    titleBn: "নতুন ভোটার কার্ড ফ্রন্ট ও ব্যাক PVC প্রিন্ট লেআউট",
    category: "passport",
    tags: ["voter", "epic", "pvc", "smart card", "cr80"],
    fileSize: "8.2 MB",
    resolution: "300 DPI",
    layers: 12,
    fonts: ["Roboto", "Hind Siliguri"],
    thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=60",
    description: "Ready CR80 plastic card dimensions for instant dye-sublimation and inkjet PVC card printing.",
    descriptionBn: "স্ট্যান্ডার্ড CR80 সাইজ ভোটার কার্ড প্রিন্ট লেআউট।",
  },
  {
    id: "psd-aadhaar-pvc",
    title: "Aadhaar Card PVC Layout with Mask & QR Guide",
    titleBn: "আধার কার্ড PVC লেআউট ও QR কোড গাইড",
    category: "passport",
    tags: ["aadhaar", "pvc", "card print", "qr code"],
    fileSize: "9.5 MB",
    resolution: "300 DPI",
    layers: 10,
    fonts: ["Arial", "Hind Siliguri"],
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
    description: "CR80 standard smart plastic card layout with automatic QR code and barcode aligner.",
    descriptionBn: "আধার PVC কার্ড প্রিন্ট মাস্টার ফাইল।",
  },
  {
    id: "psd-visiting-card-cyber",
    title: "Cyber Cafe & Digital Seva Kendra Business Card",
    titleBn: "সাইবার ক্যাফে ও ডিজিটাল সেবা কেন্দ্র ভিজিটিং কার্ড",
    category: "visiting_card",
    tags: ["visiting card", "cyber cafe", "csc", "digital seva"],
    fileSize: "12.0 MB",
    resolution: "300 DPI",
    layers: 16,
    fonts: ["Montserrat", "Hind Siliguri"],
    thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=60",
    description: "Dual-sided modern Cyber Cafe business visiting card with QR code payment mockup.",
    descriptionBn: "ডিজিটাল সেবা ও অনলাইন সার্ভিসের জন্য আকর্ষণীয় দুই পিঠের ভিজিটিং কার্ড।",
  },
  {
    id: "psd-certificate-appreciation",
    title: "Modern Golden Border Appreciation Certificate",
    titleBn: "গোল্ডেন বর্ডার সম্মাননা ও ক্যালিগ্রাফি সার্টিফিকেট",
    category: "certificate",
    tags: ["certificate", "gold border", "award", "sports", "school"],
    fileSize: "28.6 MB",
    resolution: "300 DPI",
    layers: 18,
    fonts: ["Cinzel", "Times New Roman"],
    thumbnailUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=60",
    description: "A4 landscape golden filigree certificate with editable badges, stamps, and signatures.",
    descriptionBn: "স্কুল, প্রতিযোগিতা ও ক্লাবের জন্য গোল্ডেন সার্টিফিকেট ফ্রেম।",
  },
  {
    id: "psd-puja-banner",
    title: "Durga Puja & Kali Puja Digital Banner & Poster",
    titleBn: "দুর্গাপূজা ও কালীপূজা ফ্লেক্স ব্যানার ও পোস্টার",
    category: "flex_banner",
    tags: ["durga puja", "kali puja", "banner", "flex", "club"],
    fileSize: "68.5 MB",
    resolution: "150 DPI",
    layers: 24,
    fonts: ["Hind Siliguri", "Impact"],
    thumbnailUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&auto=format&fit=crop&q=60",
    description: "6x3 feet HD Flex banner layout with Bengali typography and festival ornaments.",
    descriptionBn: "৬x৩ ফুট সাইজের পূজা ও সাংস্কৃতিক অনুষ্ঠানের ফ্লেক্স ব্যানার।",
  },
  {
    id: "psd-marriage-card",
    title: "Bengali Traditional Vivaha Card Multi-Layer",
    titleBn: "বাঙালি সনাতন শুভ বিবাহ নিমন্ত্রণ পত্র",
    category: "marriage",
    tags: ["marriage", "wedding", "bengali", "invitation", "topor"],
    fileSize: "45.0 MB",
    resolution: "300 DPI",
    layers: 22,
    fonts: ["Hind Siliguri", "Cinzel"],
    thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=60",
    description: "Traditional Bengali marriage invitation card with shankha, pola, topor, and sindoor motifs.",
    descriptionBn: "টোপড়, শঙ্খ ও আলপনা নকশাসহ বাঙালি বিয়ের নিমন্ত্রণ কার্ড।",
  },
  {
    id: "psd-school-cover-science",
    title: "School Science Project Premium Cover Page",
    titleBn: "স্কুল সায়েন্স ও পরিবেশ প্রজেক্ট ফ্রন্ট পেজ",
    category: "school",
    tags: ["school", "science", "front page", "border", "a4"],
    fileSize: "22.4 MB",
    resolution: "300 DPI",
    layers: 14,
    fonts: ["Plus Jakarta Sans", "Hind Siliguri"],
    thumbnailUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop&q=60",
    description: "A4 printable science project cover page with decorative laboratory and nature borders.",
    descriptionBn: "স্কুল ও কলেজের প্রজেক্ট ফ্রন্ট পেজ কভার ডিজাইন।",
  },
];

export const initialPsdTemplates = psdTemplates;
