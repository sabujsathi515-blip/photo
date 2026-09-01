import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/common/Header";
import { Sidebar } from "./components/common/Sidebar";
import { Toast } from "./components/common/Toast";
import { DashboardOverview } from "./components/dashboard/DashboardOverview";
import { GovServicesDirectory } from "./components/gov/GovServicesDirectory";
import { PhotoStudio } from "./components/photo/PhotoStudio";
import { PassportMaker } from "./components/photo/PassportMaker";
import { PhotoPrintLayout } from "./components/photo/PhotoPrintLayout";
import { PhotoCalculator } from "./components/photo/PhotoCalculator";
import { ImageTools } from "./components/photo/ImageTools";
import { SchoolProjectMaker } from "./components/school/SchoolProjectMaker";
import { DocumentMaker } from "./components/documents/DocumentMaker";
import { ResumeMaker } from "./components/documents/ResumeMaker";
import { PdfToolkit } from "./components/pdf/PdfToolkit";
import { DesignStudio } from "./components/design/DesignStudio";
import { PsdManager } from "./components/psd/PsdManager";
import { AccountsManager } from "./components/accounting/AccountsManager";
import { SettingsManager } from "./components/settings/SettingsManager";

const MainContent: React.FC = () => {
  const { currentView, activeSection } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const view = currentView || activeSection || "dashboard";

  const renderView = () => {
    switch (view) {
      case "dashboard":
        return <DashboardOverview />;
      case "gov_services":
      case "govt-services":
        return <GovServicesDirectory />;
      case "photo_studio":
      case "photo-studio":
        return <PhotoStudio />;
      case "passport_maker":
      case "passport-photo":
        return <PassportMaker />;
      case "photo_print":
      case "photo-print-layout":
      case "print-manager":
        return <PhotoPrintLayout />;
      case "photo_calc":
      case "photo-calculator":
        return <PhotoCalculator />;
      case "image_tools":
      case "image-tools":
        return <ImageTools />;
      case "school_project":
      case "school-project":
        return <SchoolProjectMaker />;
      case "document_maker":
      case "document-maker":
        return <DocumentMaker />;
      case "resume_maker":
      case "resume-maker":
        return <ResumeMaker />;
      case "pdf_tools":
      case "pdf-tools":
        return <PdfToolkit />;
      case "design_studio":
      case "design-studio":
        return <DesignStudio />;
      case "psd_manager":
      case "psd-manager":
        return <PsdManager />;
      case "accounting":
      case "accounts":
      case "customer-manager":
      case "reports":
        return <AccountsManager />;
      case "settings":
      case "file-storage":
        return <SettingsManager />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Toast Notification Container */}
      <Toast />

      {/* Left Navigation Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden lg:pl-64">
        {/* Top App Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Dynamic Viewport Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto">{renderView()}</div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
