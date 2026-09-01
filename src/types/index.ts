export type Language = "bn" | "en";
export type Theme = "dark" | "light";

export type NavSection =
  | "dashboard"
  | "photo_studio"
  | "passport_maker"
  | "photo_print"
  | "photo_calc"
  | "image_tools"
  | "school_project"
  | "document_maker"
  | "resume_maker"
  | "pdf_tools"
  | "design_studio"
  | "psd_manager"
  | "gov_services"
  | "accounting"
  | "settings"
  // Legacy aliases
  | "photo-studio"
  | "passport-photo"
  | "photo-print-layout"
  | "photo-calculator"
  | "school-project"
  | "document-maker"
  | "resume-maker"
  | "pdf-tools"
  | "image-tools"
  | "design-studio"
  | "psd-manager"
  | "print-manager"
  | "customer-manager"
  | "accounts"
  | "reports"
  | "file-storage"
  | "govt-services";

export interface CafeRates {
  passport8: number;
  passport16: number;
  photoA4: number;
  photo4R: number;
  xeroxBw: number;
  xeroxColor: number;
  laminationA4: number;
  onlineFormFill: number;
  [key: string]: number;
}

export interface CyberCafeProfile {
  name?: string;
  cafeName: string;
  ownerName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  gstNumber?: string;
  gstin?: string;
  upiId?: string;
  serviceRates: CafeRates;
  rates?: any;
}

export type CafeProfile = CyberCafeProfile;

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  mobile?: string;
  notes?: string;
  service?: string;
  totalVisits: number;
  amount?: number;
  paidAmount?: number;
  paidStatus?: "paid" | "due" | "partial";
  date?: string;
  createdAt: number;
}

export type Customer = CustomerRecord;

export interface Transaction {
  id: string;
  customerName: string;
  serviceName: string;
  category?: string;
  description?: string;
  amount: number;
  type: "income" | "expense";
  paymentMethod: "cash" | "upi" | "card" | "other";
  paymentMode?: "cash" | "upi" | "card" | "other";
  date: string;
  notes?: string;
  createdAt?: number;
}

export interface GovtLink {
  id: string;
  name: string;
  bengaliName: string;
  url: string;
  category: string;
  description: string;
  isOfficial: boolean;
  isPinned?: boolean;
}

export interface PSDTemplateItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  fileSize: string;
  dateAdded: string;
  downloadUrl?: string;
  previewUrl?: string;
  dimensions?: string;
  isFavorite?: boolean;
  fileBlob?: Blob;
}

export interface PassportPreset {
  id: string;
  name: string;
  nameBn: string;
  widthMm: number;
  heightMm: number;
  dpi: number;
  aspectRatio: string;
  bgRecommended: string;
  description: string;
  dimensionText?: string;
}

export const defaultPassportPresets: PassportPreset[] = [
  {
    id: "indian_passport",
    name: "Indian Passport & Visa (35x45mm)",
    nameBn: "ভারতীয় পাসপোর্ট ও ভিসা (৩৫x৪৫ মিমি)",
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
    aspectRatio: "35:45",
    bgRecommended: "White / Off-White",
    description: "Standard for Indian Passport, Tatkaal, OCI, and Visa applications.",
    dimensionText: "35 x 45 mm (3.5 x 4.5 cm)",
  },
  {
    id: "pan_card",
    name: "NSDL / UTI PAN Card (25x35mm)",
    nameBn: "প্যান কার্ড ফটো (২৫x৩৫ মিমি)",
    widthMm: 25,
    heightMm: 35,
    dpi: 300,
    aspectRatio: "25:35",
    bgRecommended: "Pure White",
    description: "For Form 49A, e-PAN, and PAN Card corrections.",
    dimensionText: "25 x 35 mm (2.5 x 3.5 cm)",
  },
  {
    id: "voter_id",
    name: "Election EPIC Voter ID (32x40mm)",
    nameBn: "ভোটার কার্ড ও ফর্ম ৮ (৩২x৪০ মিমি)",
    widthMm: 32,
    heightMm: 40,
    dpi: 200,
    aspectRatio: "32:40",
    bgRecommended: "Light / White",
    description: "For Form 6, Form 8, and National Voters Services.",
    dimensionText: "32 x 40 mm (3.2 x 4.0 cm)",
  },
  {
    id: "wb_police",
    name: "WB Police & WBPRB (35x45mm 20-50KB)",
    nameBn: "ওয়েস্ট বেঙ্গল পুলিশ রিক্রুটমেন্ট (WBPRB)",
    widthMm: 35,
    heightMm: 45,
    dpi: 200,
    aspectRatio: "35:45",
    bgRecommended: "Light Background",
    description: "WBPRB Police SI & Constable online application size.",
    dimensionText: "35 x 45 mm @ 200 DPI (20-50 KB)",
  },
  {
    id: "ssc_cgl",
    name: "SSC CGL / CHSL / MTS (35x45mm 20-50KB)",
    nameBn: "এসএসসি (SSC) সেন্ট্রাল রিক্রুটমেন্ট",
    widthMm: 35,
    heightMm: 45,
    dpi: 200,
    aspectRatio: "35:45",
    bgRecommended: "White",
    description: "Staff Selection Commission photo size specifications.",
    dimensionText: "35 x 45 mm @ 200 DPI (20-50 KB)",
  },
  {
    id: "stamp_size",
    name: "Stamp Size Photo (20x25mm)",
    nameBn: "স্ট্যাম্প সাইজ ফটো (২০x২৫ মিমি)",
    widthMm: 20,
    heightMm: 25,
    dpi: 300,
    aspectRatio: "20:25",
    bgRecommended: "Blue / White",
    description: "For school identity cards, bank account opening, and passbooks.",
    dimensionText: "20 x 25 mm (2.0 x 2.5 cm)",
  },
];

export type SchoolProjectBorder =
  | "ornate-classic"
  | "floral-bengali"
  | "science-blueprint"
  | "modern-minimal"
  | "golden-royal"
  | "vintage-manuscript"
  | "classic"
  | "double";

export interface ProjectSection {
  id: string;
  title: string;
  content: string;
  type?: "text" | "bullets" | "table";
}

export interface SchoolProjectData {
  id?: string;
  title: string;
  topic: string;
  subject: string;
  studentClass: string;
  language: "bn" | "en";
  studentName: string;
  rollNumber: string;
  schoolName: string;
  teacherName: string;
  academicYear: string;
  borderStyle: SchoolProjectBorder;
  createdAt?: number;
  template?: string;
  themeColor?: string;
  diagrams?: any[];
  sections: {
    introduction: string;
    objectives: string[];
    mainContent: string;
    explanation: string;
    importantFacts: string[];
    examples: string[];
    advantages: string[];
    disadvantages: string[];
    conclusion: string;
    bibliography: string[];
  };
}

export interface ResumeData {
  fullName: string;
  designation?: string;
  email: string;
  phone: string;
  address: string;
  photoUrl?: string;
  careerObjective?: string;
  education: { degree: string; institution: string; year: string; score: string }[];
  experience: { role: string; company: string; duration: string; description: string }[];
  skills: string[];
  languages: string[];
  declaration: string;
  personalDetails?: any;
  template?: string;
}

export interface StoredFile {
  id: string;
  name: string;
  folder?: string;
  size: number;
  mimeType: string;
  dataUrl: string;
  createdAt: number;
  notes?: string;
}
