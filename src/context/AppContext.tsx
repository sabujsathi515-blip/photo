import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Language,
  Theme,
  NavSection,
  CafeProfile,
  Customer,
  Transaction,
  GovtLink,
  PSDTemplateItem,
  SchoolProjectData,
  StoredFile,
} from "../types";
import { db } from "../services/db";
import { translations } from "../data/translations";

interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  activeSection: NavSection;
  setActiveSection: (sec: NavSection) => void;
  currentView: NavSection;
  setCurrentView: (sec: NavSection) => void;
  profile: CafeProfile;
  updateProfile: (profile: CafeProfile) => void;
  customers: Customer[];
  addCustomer: (cust: Partial<Customer>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  transactions: Transaction[];
  addTransaction: (tx: Partial<Transaction>) => Transaction;
  deleteTransaction: (id: string) => void;
  govtLinks: GovtLink[];
  addGovtLink: (link: Omit<GovtLink, "id">) => void;
  deleteGovtLink: (id: string) => void;
  togglePinGovtLink: (id: string) => void;
  psdTemplates: PSDTemplateItem[];
  addPsdTemplate: (item: PSDTemplateItem) => void;
  deletePsdTemplate: (id: string) => void;
  toggleFavoritePsd: (id: string) => void;
  projects: SchoolProjectData[];
  saveProject: (project: SchoolProjectData) => void;
  deleteProject: (id: string) => void;
  storedFiles: StoredFile[];
  addStoredFile: (file: StoredFile) => void;
  deleteStoredFile: (id: string) => void;
  t: typeof translations.bn;
  sharedPhoto: string | null;
  setSharedPhoto: (dataUrl: string | null) => void;
  toasts: ToastNotification[];
  notify: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("dsp_lang") as Language) || "bn";
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("dsp_theme") as Theme) || "dark";
  });

  const [activeSection, setActiveSection] = useState<NavSection>("dashboard");
  const [profile, setProfile] = useState<CafeProfile>(() => db.getProfile());
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers());
  const [transactions, setTransactions] = useState<Transaction[]>(() => db.getTransactions());
  const [govtLinks, setGovtLinks] = useState<GovtLink[]>(() => db.getGovtLinks());
  const [psdTemplates, setPsdTemplates] = useState<PSDTemplateItem[]>(() => db.getPsdTemplates());
  const [projects, setProjects] = useState<SchoolProjectData[]>(() => db.getProjects());
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>(() => db.getStoredFiles());
  const [sharedPhoto, setSharedPhoto] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    localStorage.setItem("dsp_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("dsp_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const setLanguage = (l: Language) => setLanguageState(l);
  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  const notify = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = "toast-" + Date.now() + Math.random().toString(36).slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateProfile = (newProfile: CafeProfile) => {
    setProfile(newProfile);
    db.saveProfile(newProfile);
    notify(language === "bn" ? "প্রোফাইল সেটিংস সেভ হয়েছে" : "Profile settings saved");
  };

  const addCustomer = (cust: Partial<Customer>): Customer => {
    const newCust: Customer = {
      id: "cust-" + Date.now(),
      name: cust.name || "Customer",
      phone: cust.phone || cust.mobile || "",
      mobile: cust.mobile || cust.phone || "",
      service: cust.service || "General Service",
      date: cust.date || new Date().toISOString().split("T")[0],
      amount: cust.amount || 0,
      paidStatus: cust.paidStatus || "paid",
      paidAmount: cust.paidAmount || cust.amount || 0,
      totalVisits: cust.totalVisits || 1,
      notes: cust.notes || "",
      createdAt: Date.now(),
    };
    const updated = [newCust, ...customers];
    setCustomers(updated);
    db.saveCustomers(updated);

    if (newCust.paidAmount && newCust.paidAmount > 0) {
      addTransaction({
        type: "income",
        category: newCust.service,
        serviceName: newCust.service,
        amount: newCust.paidAmount,
        description: `${newCust.service} - ${newCust.name}`,
        date: newCust.date,
        customerName: newCust.name,
        paymentMethod: "cash",
        paymentMode: "cash",
      });
    }

    notify(language === "bn" ? "নতুন কাস্টমার যুক্ত হয়েছে" : "Customer record added");
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const updated = customers.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCustomers(updated);
    db.saveCustomers(updated);
    notify(language === "bn" ? "কাস্টমার তথ্য আপডেট হয়েছে" : "Customer record updated");
  };

  const deleteCustomer = (id: string) => {
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    db.saveCustomers(updated);
    notify(language === "bn" ? "কাস্টমার মুছে ফেলা হয়েছে" : "Customer deleted", "info");
  };

  const addTransaction = (tx: Partial<Transaction>): Transaction => {
    const newTx: Transaction = {
      id: "tx-" + Date.now() + Math.random().toString(36).slice(2, 4),
      customerName: tx.customerName || "Walk-in Customer",
      serviceName: tx.serviceName || tx.category || "Service",
      category: tx.category || tx.serviceName || "General",
      description: tx.description || `${tx.serviceName || "Service"} - ${tx.customerName || "Customer"}`,
      amount: tx.amount || 0,
      type: tx.type || "income",
      paymentMethod: tx.paymentMethod || tx.paymentMode || "cash",
      paymentMode: tx.paymentMode || tx.paymentMethod || "cash",
      date: tx.date || new Date().toISOString(),
      notes: tx.notes || "",
      createdAt: Date.now(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    db.saveTransactions(updated);
    return newTx;
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    db.saveTransactions(updated);
    notify(language === "bn" ? "লেনদেন মুছে ফেলা হয়েছে" : "Transaction deleted", "info");
  };

  const addGovtLink = (link: Omit<GovtLink, "id">) => {
    const newLink: GovtLink = {
      ...link,
      id: "link-" + Date.now(),
    };
    const updated = [newLink, ...govtLinks];
    setGovtLinks(updated);
    db.saveGovtLinks(updated);
    notify(language === "bn" ? "নতুন লিঙ্ক যুক্ত হয়েছে" : "Govt link added");
  };

  const deleteGovtLink = (id: string) => {
    const updated = govtLinks.filter((l) => l.id !== id);
    setGovtLinks(updated);
    db.saveGovtLinks(updated);
  };

  const togglePinGovtLink = (id: string) => {
    const updated = govtLinks.map((l) => (l.id === id ? { ...l, isPinned: !l.isPinned } : l));
    setGovtLinks(updated);
    db.saveGovtLinks(updated);
  };

  const addPsdTemplate = (item: PSDTemplateItem) => {
    const updated = [item, ...psdTemplates];
    setPsdTemplates(updated);
    db.savePsdTemplates(updated);
    notify(language === "bn" ? "PSD টেমপ্লেট যুক্ত হয়েছে" : "PSD template added");
  };

  const deletePsdTemplate = (id: string) => {
    const updated = psdTemplates.filter((p) => p.id !== id);
    setPsdTemplates(updated);
    db.savePsdTemplates(updated);
    notify(language === "bn" ? "PSD টেমপ্লেট মুছে ফেলা হয়েছে" : "PSD template removed", "info");
  };

  const toggleFavoritePsd = (id: string) => {
    const updated = psdTemplates.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    setPsdTemplates(updated);
    db.savePsdTemplates(updated);
  };

  const saveProject = (proj: SchoolProjectData) => {
    const id = proj.id || "proj-" + Date.now();
    const updatedProject = { ...proj, id };
    const existingIndex = projects.findIndex((p) => p.id === id);
    let updated: SchoolProjectData[];
    if (existingIndex >= 0) {
      updated = [...projects];
      updated[existingIndex] = updatedProject;
    } else {
      updated = [updatedProject, ...projects];
    }
    setProjects(updated);
    db.saveProjects(updated);
    notify(language === "bn" ? "স্কুল প্রজেক্ট সংরক্ষিত হয়েছে" : "Project saved successfully");
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    db.saveProjects(updated);
  };

  const addStoredFile = (file: StoredFile) => {
    const updated = [file, ...storedFiles];
    setStoredFiles(updated);
    db.saveStoredFiles(updated);
    notify(language === "bn" ? "ফাইল সেভ হয়েছে" : "File saved to vault");
  };

  const deleteStoredFile = (id: string) => {
    const updated = storedFiles.filter((f) => f.id !== id);
    setStoredFiles(updated);
    db.saveStoredFiles(updated);
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        activeSection,
        setActiveSection,
        currentView: activeSection,
        setCurrentView: setActiveSection,
        profile,
        updateProfile,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        transactions,
        addTransaction,
        deleteTransaction,
        govtLinks,
        addGovtLink,
        deleteGovtLink,
        togglePinGovtLink,
        psdTemplates,
        addPsdTemplate,
        deletePsdTemplate,
        toggleFavoritePsd,
        projects,
        saveProject,
        deleteProject,
        storedFiles,
        addStoredFile,
        deleteStoredFile,
        t,
        sharedPhoto,
        setSharedPhoto,
        toasts,
        notify,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
