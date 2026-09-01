import { Customer, Transaction, SchoolProjectData, PSDTemplateItem, GovtLink, CafeProfile, StoredFile } from "../types";
import { initialGovtLinks } from "../data/govtLinks";
import { initialPsdTemplates } from "../data/psdTemplates";

const STORAGE_KEYS = {
  PROFILE: "dsp_cafe_profile",
  CUSTOMERS: "dsp_customers",
  TRANSACTIONS: "dsp_transactions",
  PROJECTS: "dsp_school_projects",
  PSD_TEMPLATES: "dsp_psd_templates",
  GOVT_LINKS: "dsp_govt_links",
  STORED_FILES: "dsp_stored_files",
  THEME: "dsp_theme",
  LANG: "dsp_lang",
};

export const defaultProfile: CafeProfile = {
  cafeName: "DIGITAL SEVA KENDRA & PHOTO STUDIO",
  name: "DIGITAL SEVA KENDRA & PHOTO STUDIO",
  tagline: "Online Services, Passport Photo, School Projects & Cyber Point",
  ownerName: "Operator Admin",
  phone: "+91 98765 43210",
  email: "digitalseva.station@gmail.com",
  address: "Main Market Road, Near Station, West Bengal, India",
  gstin: "19ABCDE1234F1Z5",
  serviceRates: {
    passport8: 40,
    passport16: 70,
    photoA4: 80,
    photo4R: 25,
    xeroxBw: 3,
    xeroxColor: 10,
    laminationA4: 20,
    onlineFormFill: 50,
  },
  rates: {
    photoPassport: 40,
    photoA4Sheet: 80,
    printBlackWhite: 3,
    printColor: 10,
    scanPerPage: 5,
    projectPerSchoolDoc: 120,
    resumePerDoc: 50,
    laminationA4: 20,
  },
};

export const defaultSampleCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "Sourav Mondal",
    phone: "9832109876",
    mobile: "9832109876",
    service: "School Project (Science)",
    date: new Date().toISOString().split("T")[0],
    amount: 150,
    paidStatus: "paid",
    paidAmount: 150,
    totalVisits: 3,
    notes: "Printed on 100 GSM colour paper with cover",
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: "cust-2",
    name: "Priyanka Roy",
    phone: "8912345678",
    mobile: "8912345678",
    service: "Passport Photo (8 Copies)",
    date: new Date().toISOString().split("T")[0],
    amount: 60,
    paidStatus: "paid",
    paidAmount: 60,
    totalVisits: 1,
    notes: "White background for Indian Passport",
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: "cust-3",
    name: "Subhashis Das",
    phone: "7001982341",
    mobile: "7001982341",
    service: "Online Form + Xerox (Duare Sarkar)",
    date: new Date().toISOString().split("T")[0],
    amount: 110,
    paidStatus: "due",
    paidAmount: 50,
    totalVisits: 2,
    notes: "Due Rs. 60 balance remaining",
    createdAt: Date.now() - 3600000 * 6,
  },
];

export const defaultSampleTransactions: Transaction[] = [
  {
    id: "tx-1",
    customerName: "Sourav Mondal",
    serviceName: "School Project - Water Pollution",
    type: "income",
    category: "School Project",
    amount: 150,
    paymentMethod: "upi",
    paymentMode: "upi",
    date: new Date().toISOString(),
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: "tx-2",
    customerName: "Priyanka Roy",
    serviceName: "Passport Photo 8 Copies",
    type: "income",
    category: "Passport Photo",
    amount: 60,
    paymentMethod: "cash",
    paymentMode: "cash",
    date: new Date().toISOString(),
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: "tx-3",
    customerName: "Paper & Stationery Wholesaler",
    serviceName: "JK Glossy Photo Paper 180GSM (1 Packet)",
    type: "expense",
    category: "Paper & Stationery",
    amount: 280,
    paymentMethod: "cash",
    paymentMode: "cash",
    date: new Date().toISOString(),
    createdAt: Date.now() - 3600000 * 8,
  },
];

class LocalDB {
  getProfile(): CafeProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  }

  saveProfile(profile: CafeProfile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : defaultSampleCustomers;
    } catch {
      return defaultSampleCustomers;
    }
  }

  saveCustomers(customers: Customer[]) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : defaultSampleTransactions;
    } catch {
      return defaultSampleTransactions;
    }
  }

  saveTransactions(transactions: Transaction[]) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  getProjects(): SchoolProjectData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveProjects(projects: SchoolProjectData[]) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  getPsdTemplates(): PSDTemplateItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PSD_TEMPLATES);
      return data ? JSON.parse(data) : initialPsdTemplates as any;
    } catch {
      return initialPsdTemplates as any;
    }
  }

  savePsdTemplates(templates: PSDTemplateItem[]) {
    localStorage.setItem(STORAGE_KEYS.PSD_TEMPLATES, JSON.stringify(templates));
  }

  getGovtLinks(): GovtLink[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOVT_LINKS);
      return data ? JSON.parse(data) : initialGovtLinks;
    } catch {
      return initialGovtLinks;
    }
  }

  saveGovtLinks(links: GovtLink[]) {
    localStorage.setItem(STORAGE_KEYS.GOVT_LINKS, JSON.stringify(links));
  }

  getStoredFiles(): StoredFile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STORED_FILES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveStoredFiles(files: StoredFile[]) {
    localStorage.setItem(STORAGE_KEYS.STORED_FILES, JSON.stringify(files));
  }

  exportFullBackup(): string {
    const backup = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      profile: this.getProfile(),
      customers: this.getCustomers(),
      transactions: this.getTransactions(),
      projects: this.getProjects(),
      psdTemplates: this.getPsdTemplates(),
      govtLinks: this.getGovtLinks(),
      storedFiles: this.getStoredFiles(),
    };
    return JSON.stringify(backup, null, 2);
  }

  importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) this.saveProfile(data.profile);
      if (data.customers) this.saveCustomers(data.customers);
      if (data.transactions) this.saveTransactions(data.transactions);
      if (data.projects) this.saveProjects(data.projects);
      if (data.psdTemplates) this.savePsdTemplates(data.psdTemplates);
      if (data.govtLinks) this.saveGovtLinks(data.govtLinks);
      if (data.storedFiles) this.saveStoredFiles(data.storedFiles);
      return true;
    } catch (e) {
      console.error("Failed to import backup:", e);
      return false;
    }
  }
}

export const db = new LocalDB();
