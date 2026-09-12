import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { BackButton } from "../common/BackButton";
import { Transaction, CustomerRecord } from "../../types";
import {
  BadgeIndianRupee,
  TrendingUp,
  TrendingDown,
  Plus,
  Users,
  Printer,
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  Wallet,
  Receipt,
  Trash2,
} from "lucide-react";

export const AccountsManager: React.FC = () => {
  const {
    language,
    t,
    profile,
    transactions,
    customers,
    addTransaction,
    addCustomer,
    notify,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"transactions" | "customers" | "invoice">("transactions");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // New Transaction Form Modal State
  const [showAddTx, setShowAddTx] = useState<boolean>(false);
  const [txType, setTxType] = useState<"income" | "expense">("income");
  const [txAmount, setTxAmount] = useState<string>("");
  const [txCustomer, setTxCustomer] = useState<string>("");
  const [txService, setTxService] = useState<string>("Photo Print & Passport");
  const [txPaymentMethod, setTxPaymentMethod] = useState<"cash" | "upi" | "card">("upi");
  const [txNotes, setTxNotes] = useState<string>("");

  // New Customer Form State
  const [showAddCust, setShowAddCust] = useState<boolean>(false);
  const [custName, setCustName] = useState<string>("");
  const [custPhone, setCustPhone] = useState<string>("");
  const [custNotes, setCustNotes] = useState<string>("");

  // Invoice Builder State
  const [invoiceCustomerName, setInvoiceCustomerName] = useState<string>("Shri Amit Roy");
  const [invoiceCustomerPhone, setInvoiceCustomerPhone] = useState<string>("9876543210");
  const [invoiceItems, setInvoiceItems] = useState<
    { description: string; qty: number; rate: number }[]
  >([
    { description: "Passport Photo (8 Copies)", qty: 1, rate: 60 },
    { description: "Online Form Application (WB Police)", qty: 1, rate: 80 },
    { description: "A4 Color Lamination", qty: 2, rate: 20 },
  ]);

  // Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTxs = transactions.filter((t) => t.date.startsWith(todayStr));

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netCashInHand = totalIncome - totalExpense;

  const todayIncome = todayTxs
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleSaveTx = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      notify("Please enter valid amount", "error");
      return;
    }

    addTransaction({
      customerName: txCustomer.trim() || "Walk-in Customer",
      serviceName: txService,
      amount: amountNum,
      type: txType,
      paymentMethod: txPaymentMethod,
      date: new Date().toISOString(),
      notes: txNotes,
    });

    setShowAddTx(false);
    setTxAmount("");
    setTxCustomer("");
    setTxNotes("");
    notify(language === "bn" ? "লেনদেন সফলভাবে নথিভুক্ত হয়েছে" : "Transaction recorded successfully");
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) {
      notify("Please enter customer name and phone", "error");
      return;
    }

    addCustomer({
      name: custName.trim(),
      phone: custPhone.trim(),
      notes: custNotes,
    });

    setShowAddCust(false);
    setCustName("");
    setCustPhone("");
    setCustNotes("");
    notify(language === "bn" ? "কাস্টমার ডাটাবেসে যুক্ত হয়েছেন" : "Customer added successfully");
  };

  const invoiceSubtotal = invoiceItems.reduce((acc, item) => acc + item.qty * item.rate, 0);

  const handlePrintInvoice = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${profile.cafeName}</title>
          <style>
            @page { size: 80mm auto; margin: 5mm; }
            body { font-family: monospace; font-size: 12px; color: #000; margin: 0; padding: 0; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { text-align: left; padding: 2px 0; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="bold" style="font-size: 14px;">${profile.cafeName}</div>
            <div>${profile.address}</div>
            <div>Ph: ${profile.phone}</div>
            <div class="divider"></div>
            <div class="bold">RETAIL CASH MEMO / INVOICE</div>
          </div>
          <div style="font-size: 10px; margin-top: 4px;">
            <div>Customer: ${invoiceCustomerName}</div>
            <div>Phone: ${invoiceCustomerPhone}</div>
            <div>Date: ${new Date().toLocaleString()}</div>
          </div>
          <div class="divider"></div>
          <table>
            <thead>
              <tr class="bold">
                <th>Item</th>
                <th class="center">Qty</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceItems
                .map(
                  (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td class="center">${item.qty}</td>
                  <td class="right">₹${item.qty * item.rate}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="divider"></div>
          <table>
            <tr class="bold">
              <td>GRAND TOTAL:</td>
              <td class="right">₹${invoiceSubtotal}</td>
            </tr>
          </table>
          <div class="divider"></div>
          <div class="center" style="font-size: 10px; margin-top: 6px;">
            Thank you for visiting!<br>
            *** Have a Nice Day ***
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <BadgeIndianRupee className="w-5 h-5 text-emerald-400" />
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {t.accounting.title}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">{t.accounting.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTx(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.accounting.addIncome} / Expense</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === "bn" ? "আজকের মোট ইনকাম" : "Today's Income"}
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
              ₹{todayIncome.toFixed(2)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === "bn" ? "মোট খরচ (Expense)" : "Total Expenses"}
            </span>
            <span className="text-2xl font-black font-mono text-rose-400 mt-1 block">
              ₹{totalExpense.toFixed(2)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === "bn" ? "নেট ক্যাশ ইন হ্যান্ড" : "Net Balance"}
            </span>
            <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">
              ₹{netCashInHand.toFixed(2)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Transactions / Customer Ledger / Invoicing */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "transactions"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {language === "bn" ? "দৈনিক ক্যাশবুক ও ট্রানজাকশন" : "Transactions Ledger"}
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "customers"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {language === "bn" ? "কাস্টমার খাতা (CRM)" : "Customers Database"}
        </button>
        <button
          onClick={() => setActiveTab("invoice")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "invoice"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {language === "bn" ? "বিল ও থার্মাল রিসিপ্ট মেকার" : "Thermal Invoice Generator"}
        </button>
      </div>

      {/* Tab 1: Transactions Table */}
      {activeTab === "transactions" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {language === "bn" ? "সাম্প্রতিক লেনদেনসমূহ" : "Recent Cashbook Entries"}
            </h3>
            <span className="text-xs text-slate-400 font-mono">Total: {transactions.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer / Party</th>
                  <th className="p-3">Service Details</th>
                  <th className="p-3">Method</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-850/50">
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-bold text-slate-200">{tx.customerName}</td>
                    <td className="p-3 text-slate-300">{tx.serviceName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td
                      className={`p-3 text-right font-mono font-bold ${
                        tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Customers */}
      {activeTab === "customers" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === "bn" ? "নিবন্ধিত কাস্টমার তালিকা" : "Registered Customers Directory"}
            </span>
            <button
              onClick={() => setShowAddCust(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((c) => (
              <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{c.name}</span>
                  <span className="text-[11px] font-mono text-indigo-400">{c.phone}</span>
                </div>
                {c.notes && <p className="text-xs text-slate-400">{c.notes}</p>}
                <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-500">
                  <span>Visits: {c.totalVisits}</span>
                  <span>Joined: {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Invoice Generator */}
      {activeTab === "invoice" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">
              {language === "bn" ? "কাস্টমার ও বিল আইটেম" : "Customer & Items"}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={invoiceCustomerName}
                  onChange={(e) => setInvoiceCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={invoiceCustomerPhone}
                  onChange={(e) => setInvoiceCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            {/* Invoice Line Items */}
            <div className="space-y-2 pt-2">
              <span className="font-bold text-slate-300 block">Service Items</span>
              {invoiceItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...invoiceItems];
                      updated[idx].description = e.target.value;
                      setInvoiceItems(updated);
                    }}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                  />
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => {
                      const updated = [...invoiceItems];
                      updated[idx].qty = Number(e.target.value);
                      setInvoiceItems(updated);
                    }}
                    className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 text-xs text-center"
                  />
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => {
                      const updated = [...invoiceItems];
                      updated[idx].rate = Number(e.target.value);
                      setInvoiceItems(updated);
                    }}
                    className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 text-xs text-right"
                  />
                  <button
                    onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <button
                onClick={() =>
                  setInvoiceItems([...invoiceItems, { description: "General Xerox / Print", qty: 1, rate: 10 }])
                }
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold mt-1"
              >
                + Add Another Item
              </button>
            </div>
          </div>

          {/* Thermal Slip Preview */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-between min-h-[450px]">
            <div className="w-full max-w-xs bg-white text-slate-900 font-mono text-xs p-5 rounded-lg shadow-2xl space-y-3">
              <div className="text-center border-b border-dashed border-slate-400 pb-2">
                <h4 className="font-bold text-sm uppercase">{profile.cafeName}</h4>
                <p className="text-[10px] text-slate-600">{profile.address}</p>
                <p className="text-[10px] text-slate-600">Mob: {profile.phone}</p>
              </div>

              <div className="text-[10px] space-y-0.5">
                <p>Cust: {invoiceCustomerName}</p>
                <p>Phone: {invoiceCustomerPhone}</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="border-t border-b border-dashed border-slate-400 py-2 space-y-1">
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate pr-2">{item.description} x{item.qty}</span>
                    <span className="font-bold font-mono">₹{item.qty * item.rate}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span>₹{invoiceSubtotal}</span>
              </div>

              <div className="text-center text-[9px] text-slate-500 pt-2 border-t border-dashed border-slate-400">
                Thank you for visiting!
              </div>
            </div>

            <div className="mt-4 w-full flex justify-end">
              <button
                onClick={handlePrintInvoice}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Receipt (80mm)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Transaction */}
      {showAddTx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 text-xs shadow-2xl">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              Record Transaction
            </h3>
            <form onSubmit={handleSaveTx} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType("income")}
                  className={`py-2 rounded-xl border font-bold ${
                    txType === "income" ? "bg-emerald-600 text-white border-emerald-500" : "bg-slate-950 text-slate-400"
                  }`}
                >
                  + Income (লাভ)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("expense")}
                  className={`py-2 rounded-xl border font-bold ${
                    txType === "expense" ? "bg-rose-600 text-white border-rose-500" : "bg-slate-950 text-slate-400"
                  }`}
                >
                  - Expense (খরচ)
                </button>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Customer / Party Name</label>
                <input
                  type="text"
                  value={txCustomer}
                  onChange={(e) => setTxCustomer(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Service / Reason</label>
                <input
                  type="text"
                  value={txService}
                  onChange={(e) => setTxService(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["upi", "cash", "card"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTxPaymentMethod(m)}
                      className={`py-1.5 rounded-lg border font-bold uppercase text-[11px] ${
                        txPaymentMethod === m ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-950 text-slate-400"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTx(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Customer */}
      {showAddCust && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 text-xs shadow-2xl">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              Add New Customer
            </h3>
            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mobile / WhatsApp No *</label>
                <input
                  type="tel"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Notes / Pending Task</label>
                <input
                  type="text"
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  placeholder="e.g. Aadhaar PVC ordered, pending collection"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCust(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
