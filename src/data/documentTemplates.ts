export interface DocField {
  id: string;
  label: string;
  labelBn: string;
  placeholder?: string;
  type: "text" | "textarea" | "date" | "number" | "select";
  options?: string[];
  defaultValue?: string;
  required?: boolean;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  titleBn: string;
  category: "Application" | "Letter" | "Declaration" | "Affidavit" | "Notice" | "School";
  description: string;
  fields: DocField[];
  templateEn: (data: Record<string, any>) => string;
  templateBn: (data: Record<string, any>) => string;
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: "leave-school-headmaster",
    title: "School Leave Application to Headmaster",
    titleBn: "প্রধান শিক্ষকের কাছে ছুটির দরখাস্ত",
    category: "School",
    description: "Application for sick leave or urgent leave to the Headmaster/Principal of a school.",
    fields: [
      { id: "headmasterTitle", label: "Recipient Title", labelBn: "পদবী", type: "text", defaultValue: "The Headmaster / Principal" },
      { id: "schoolName", label: "School Name & Address", labelBn: "বিদ্যালয়ের নাম ও ঠিকানা", type: "text", required: true, defaultValue: "ABC High School, Kolkata" },
      { id: "studentName", label: "Student Name", labelBn: "ছাত্র/ছাত্রীর নাম", type: "text", required: true },
      { id: "classRoll", label: "Class, Section & Roll No.", labelBn: "শ্রেণী, বিভাগ ও রোল নম্বর", type: "text", required: true },
      { id: "fromDate", label: "Leave From Date", labelBn: "ছুটি শুরুর তারিখ", type: "date", required: true },
      { id: "toDate", label: "Leave To Date", labelBn: "ছুটি শেষের তারিখ", type: "date", required: true },
      { id: "totalDays", label: "Total Days", labelBn: "মোট দিন সংখ্যা", type: "text", defaultValue: "3 days" },
      { id: "reason", label: "Reason for Leave", labelBn: "ছুটির কারণ", type: "textarea", defaultValue: "sudden viral fever and severe illness" },
      { id: "parentSignature", label: "Parent / Guardian Name", labelBn: "অভিভাবকের নাম", type: "text" },
      { id: "date", label: "Application Date", labelBn: "আবেদনের তারিখ", type: "date" },
    ],
    templateEn: (d) => `To,\n${d.headmasterTitle || "The Headmaster"},\n${d.schoolName || "[School Name]"}\n\nSubject: Application for leave of absence.\n\nRespected Sir/Madam,\n\nWith humble submission, I beg to state that I, ${d.studentName || "[Student Name]"}, a student of your prestigious institution of ${d.classRoll || "[Class & Roll]"}, could not attend / will be unable to attend my regular classes from ${d.fromDate || "[Start Date]"} to ${d.toDate || "[End Date]"} (${d.totalDays || "few days"}) due to ${d.reason || "unavoidable personal circumstances"}.\n\nTherefore, I earnestly request your kind self to grant me leave of absence for those days and oblige thereby.\n\nThanking you.\n\nYours obediently,\n${d.studentName || "[Student Name]"}\n${d.classRoll || "[Class / Roll]"}\n\nDate: ${d.date || new Date().toISOString().split("T")[0]}\nGuardian's Signature: __________________ (${d.parentSignature || "Guardian"})`,
    templateBn: (d) => `প্রতি,\nমাননীয় প্রধান শিক্ষক মহাশয় সমীপেষু,\n${d.schoolName || "[বিদ্যালয়ের নাম]"}\n\nবিষয়: ছুটির জন্য আবেদন পত্র।\n\nমহাশয়,\nবিনীত নিবেদন এই যে, আমি আপনার বিদ্যালয়ের ${d.classRoll || "[শ্রেণী ও রোল]"} এর ছাত্র/ছাত্রী ${d.studentName || "[ছাত্রের নাম]"}। আমার ${d.reason || "হঠাৎ অসুস্থতার"} কারণে আগামী ${d.fromDate || "[শুরুর তারিখ]"} হইতে ${d.toDate || "[শেষের তারিখ]"} পর্যন্ত মোট ${d.totalDays || "কয়েক দিন"} বিদ্যালয়ে উপস্থিত থাকিতে অসমর্থ হইব / ছিলাম।\n\nঅতএব, মহাশয়ের নিকট বিনীত প্রার্থনা, অনুগ্রহপূর্বক উক্ত দিনগুলির ছুটি মঞ্জুর করিয়া আমাকে বাধিত করিবেন।\n\nধন্যবাদান্তে,\nআপনার একান্ত অনুগত ছাত্র/ছাত্রী,\nনাম: ${d.studentName || "[ছাত্রের নাম]"}\n${d.classRoll || "[শ্রেণী ও রোল]"}\n\nতারিখ: ${d.date || new Date().toISOString().split("T")[0]}\nঅভিভাবকের স্বাক্ষর: __________________ (${d.parentSignature || "অভিভাবক"})`,
  },
  {
    id: "police-lost-document",
    title: "Police Complaint (GD) for Lost Document / Mobile",
    titleBn: "ডকুমেন্ট বা মোবাইল হারানোর জন্য থানায় জিডি (GD) দরখাস্ত",
    category: "Application",
    description: "Format for reporting lost documents or mobile phone to Police Station.",
    fields: [
      { id: "policeStation", label: "Police Station Name", labelBn: "থানার নাম ও ঠিকানা", type: "text", required: true, defaultValue: "The Officer-in-Charge, Local P.S." },
      { id: "applicantName", label: "Applicant Name", labelBn: "আবেদনকারীর নাম", type: "text", required: true },
      { id: "fatherName", label: "Father's / Husband's Name", labelBn: "পিতা / স্বামীর নাম", type: "text", required: true },
      { id: "address", label: "Residential Address", labelBn: "স্থায়ী ঠিকানা", type: "textarea", required: true },
      { id: "mobile", label: "Contact Number", labelBn: "মোবাইল নম্বর", type: "text", required: true },
      { id: "lostItemDetails", label: "Lost Document Details with Number", labelBn: "হারিয়ে যাওয়া নথির বিবরণ ও নম্বর", type: "textarea", required: true, defaultValue: "Original Madhyamik Admit Card and Aadhaar Card" },
      { id: "lostDatePlace", label: "Date, Time and Place of Loss", labelBn: "হারানোর স্থান ও তারিখ", type: "text", required: true, defaultValue: "on 15th August around 4:30 PM near Station Road" },
      { id: "date", label: "Date", labelBn: "তারিখ", type: "date" },
    ],
    templateEn: (d) => `To,\nThe Officer-in-Charge,\n${d.policeStation || "[Police Station Name]"}\n\nSubject: Information regarding loss of ${d.lostItemDetails?.slice(0, 30) || "documents"} (Request for General Diary).\n\nRespected Sir,\n\nI, ${d.applicantName || "[Applicant Name]"}, son/daughter/wife of ${d.fatherName || "[Father/Husband Name]"}, residing at ${d.address || "[Address]"}, Mobile: ${d.mobile || "[Mobile]"}, beg to report that:\n\nI have unfortunately lost my: ${d.lostItemDetails || "[Details]"} ${d.lostDatePlace || "[Date & Place]"}.\n\nIn spite of thorough searching, I have been unable to trace the item. I request you to record this information in your General Diary (GD) and issue me an acknowledged copy.\n\nThanking you.\n\nYours faithfully,\n\n________________________\n(${d.applicantName || "Applicant Signature"})\nMobile: ${d.mobile || ""}\nDate: ${d.date || new Date().toISOString().split("T")[0]}`,
    templateBn: (d) => `প্রতি,\nমাননীয় ভারপ্রাপ্ত আধিকারিক মহাশয় (Officer-in-Charge),\n${d.policeStation || "[থানার নাম]"}\n\nবিষয়: নথি হারানোর সাধারণ ডায়েরি (GD) করার আবেদন।\n\nমহাশয়,\nআমি নিম্নস্বাক্ষরকারী ${d.applicantName || "[আবেদনকারীর নাম]"}, পিতা/স্বামী: ${d.fatherName || "[পিতা/স্বামীর নাম]"}, সাকিন: ${d.address || "[ঠিকানা]"}, মোবাইল: ${d.mobile || "[মোবাইল]"}, সনির্বন্ধ নিবেদন এই যে:\n\nগত ${d.lostDatePlace || "[তারিখ ও স্থান]"}-এ আমার নিম্নবর্ণিত প্রয়োজনীয় নথিটি হারাইয়া গিয়াছে: "${d.lostItemDetails || "[নথির বিবরণ]}"}।"\n\nভবিষ্যৎ অপব্যবহার রোধ এবং ডুপ্লিকেট নথি সংগ্রহের স্বার্থে বিষয়টি আপনার থানায় ডায়রিভুক্ত করিয়া একটি রিসিভ কপি প্রদান করিতে আজ্ঞা হয়।\n\nধন্যবাদান্তে,\nবিনীত,\n________________________\n(${d.applicantName || "স্বাক্ষর"})\nমোবাইল: ${d.mobile || ""}\nতারিখ: ${d.date || new Date().toISOString().split("T")[0]}`,
  },
  {
    id: "income-self-declaration",
    title: "Self Declaration of Family Annual Income",
    titleBn: "পারিবারিক বার্ষিক আয়ের স্বঘোষণাপত্র (Self Declaration)",
    category: "Declaration",
    description: "Self declaration format for scholarships and government schemes.",
    fields: [
      { id: "applicantName", label: "Applicant / Parent Name", labelBn: "ঘোষণাকারীর নাম", type: "text", required: true },
      { id: "guardianName", label: "Father's / Husband's Name", labelBn: "পিতা / স্বামীর নাম", type: "text", required: true },
      { id: "villageTown", label: "Village / Town", labelBn: "গ্রাম / শহর", type: "text", required: true },
      { id: "poPs", label: "P.O. & P.S.", labelBn: "পোস্ট ও থানা", type: "text", required: true },
      { id: "districtState", label: "District & PIN", labelBn: "জেলা ও পিন কোড", type: "text", defaultValue: "District: Purba Bardhaman, PIN: 713101" },
      { id: "occupation", label: "Primary Occupation", labelBn: "পেশা / আয়ের প্রধান উৎস", type: "text", defaultValue: "Agriculture & Small Business" },
      { id: "annualIncomeFigure", label: "Annual Income (₹)", labelBn: "বার্ষিক আয় (₹)", type: "text", defaultValue: "72,000" },
      { id: "annualIncomeWords", label: "Annual Income in Words", labelBn: "বার্ষিক আয় (কথায়)", type: "text", defaultValue: "Seventy Two Thousand Rupees Only" },
      { id: "purpose", label: "Purpose", labelBn: "ঘোষণার উদ্দেশ্য", type: "text", defaultValue: "Higher Education Scholarship" },
      { id: "date", label: "Date", labelBn: "তারিখ", type: "date" },
    ],
    templateEn: (d) => `SELF DECLARATION OF ANNUAL FAMILY INCOME\n\nI, ${d.applicantName || "[Name]"}, son/daughter/wife of ${d.guardianName || "[Guardian Name]"}, residing at ${d.villageTown || "[Village]"}, P.O. & P.S.: ${d.poPs || "[PO & PS]"}, ${d.districtState || "[District]"}, do hereby solemnly declare that:\n\n1. My family's primary occupation is: ${d.occupation || "Agriculture"}.\n2. The total gross annual income of my family from all sources is Rs. ${d.annualIncomeFigure || "0"}/- (Rupees ${d.annualIncomeWords || "Zero"} only).\n3. All statements made herein are true and correct.\n\nPurpose: ${d.purpose || "Official submission"}.\n\nDate: ${d.date || new Date().toISOString().split("T")[0]}\n\n____________________________________\nSignature of Declarant`,
    templateBn: (d) => `পারিবারিক বার্ষিক আয়ের স্বঘোষণাপত্র\n\nআমি শ্রী/শ্রীমতী ${d.applicantName || "[নাম]"}, পিতা/স্বামী: ${d.guardianName || "[পিতা/স্বামীর নাম]"}, সাকিন: ${d.villageTown || "[গ্রাম]"}, ডাকঘর ও থানা: ${d.poPs || "[পোস্ট ও থানা]"}, ${d.districtState || "[জেলা]"}, এই মর্মে ঘোষণা করিতেছি যে:\n\n১. আমার পরিবারের জীবিকা ও আয়ের প্রধান উৎস: ${d.occupation || "কৃষি / ক্ষুদ্র ব্যবসা"}।\n২. চলতি অর্থবর্ষে আমার সমগ্র পরিবারের সর্বমোট বার্ষিক আয় মাত্র ₹ ${d.annualIncomeFigure || "০"}/- (কথায়: ${d.annualIncomeWords || "শূন্য"} টাকা মাত্র)।\n৩. আমার জ্ঞানমতে উপরোক্ত যাবতীয় বিবরণ সত্য ও নির্ভুল।\n\nউদ্দেশ্য: ${d.purpose || "স্কলারশিপ / সরকারি প্রকল্প"}।\n\nতারিখ: ${d.date || new Date().toISOString().split("T")[0]}\n\n____________________________________\nঘোষণাকারীর পূর্ণ স্বাক্ষর`,
  },
  {
    id: "bank-account-transfer-mobile",
    title: "Bank Application for Mobile Number / Address Update",
    titleBn: "ব্যাঙ্কে মোবাইল নম্বর পরিবর্তনের আবেদন",
    category: "Application",
    description: "Application to the Bank Branch Manager for linking new mobile number.",
    fields: [
      { id: "bankName", label: "Bank Name & Branch", labelBn: "ব্যাঙ্কের নাম ও ব্রাঞ্চ", type: "text", defaultValue: "State Bank of India, Main Branch" },
      { id: "accountHolder", label: "Account Holder Name", labelBn: "অ্যাকাউন্টধারীর নাম", type: "text", required: true },
      { id: "accountNumber", label: "Savings Account Number", labelBn: "সেভিংস অ্যাকাউন্ট নম্বর", type: "text", required: true },
      { id: "oldMobile", label: "Old Mobile Number", labelBn: "পুরাতন মোবাইল নম্বর", type: "text" },
      { id: "newMobile", label: "New Mobile Number to Link", labelBn: "নতুন মোবাইল নম্বর", type: "text", required: true },
      { id: "reason", label: "Reason", labelBn: "কারণ", type: "text", defaultValue: "Old SIM lost" },
      { id: "date", label: "Date", labelBn: "তারিখ", type: "date" },
    ],
    templateEn: (d) => `To,\nThe Branch Manager,\n${d.bankName || "[Bank Name & Branch]"}\n\nSubject: Request to update mobile number in Savings Account No: ${d.accountNumber || "XXXX"}.\n\nRespected Sir/Madam,\n\nI hold a Savings Bank Account in your branch under Account Number: ${d.accountNumber || "_______________"}.\n\nDue to ${d.reason || "unavoidable reasons"}, my old mobile number (${d.oldMobile || "Old Number"}) is inactive. Please register my new mobile number: ${d.newMobile || "_______________"}.\n\nI have attached copies of my Aadhaar Card and Passbook.\n\nThanking you.\n\nYours faithfully,\n\n___________________________\n(${d.accountHolder || "Signature"})\nAccount: ${d.accountNumber || ""}\nMobile: ${d.newMobile || ""}\nDate: ${d.date || new Date().toISOString().split("T")[0]}`,
    templateBn: (d) => `প্রতি,\nমাননীয় শাখা প্রবন্ধক মহাশয়,\n${d.bankName || "[ব্যাঙ্কের নাম ও শাখা]"}\n\nবিষয়: সেভিংস অ্যাকাউন্ট নম্বর: ${d.accountNumber || "XXXX"} -এ নতুন মোবাইল নম্বর যুক্ত করার আবেদন।\n\nমহাশয়,\nআপনার শাখায় আমার একটি সেভিংস ব্যাঙ্ক অ্যাকাউন্ট রহিয়াছে (অ্যাকাউন্ট নম্বর: ${d.accountNumber || "_______________"})।\n\nআমার পুরাতন নম্বরটি বন্ধ থাকায় (${d.oldMobile || "পুরাতন নম্বর"}), আমি আমার নতুন মোবাইল নম্বরটি: ${d.newMobile || "_______________"} উক্ত অ্যাকাউন্টের সঙ্গে সংযুক্ত করিতে ইচ্ছুক। আধার কার্ড ও পাসবুকের জেরক্স কপি সংযুক্ত করিলাম।\n\nধন্যবাদান্তে,\nআপনার বিশ্বস্ত,\n___________________________\n(${d.accountHolder || "স্বাক্ষর"})\nঅ্যাকাউন্ট নং: ${d.accountNumber || ""}\nমোবাইল: ${d.newMobile || ""}\nতারিখ: ${d.date || new Date().toISOString().split("T")[0]}`,
  }
];
