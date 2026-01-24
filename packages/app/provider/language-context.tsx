import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '../../../types';
import { Platform } from 'react-native';
import { en as enTranslations } from '../translations/en';
import { hi as hiTranslations } from '../translations/hi';

// Embedded Dictionaries + External Translations key merging
const DICTIONARIES: Record<LanguageCode, Record<string, any>> = {
  en: {
    ...enTranslations, ...{
      "welcome": "Welcome",
      "dashboard": "Dashboard",
      "attendance": "Attendance",
      "fees": "Fees",
      "transport": "Transport",
      "library": "Library",
      "hostel": "Hostel",
      "pay_now": "Pay Now",
      "sync_status": "Sync Status",
      "present": "Present",
      "absent": "Absent",
      "low_data": "Low Data Mode",
      "mark": "Mark",
      "route": "Route",
      "logout": "Logout",
      // Teacher Dashboard Keys
      "today": "Today",
      "my_classes": "My Classes",
      "marks_entry": "Marks Entry",
      "homework": "Homework",
      "leave": "Leave",
      "my_classes_today": "My Classes Today",
      "period": "Period",
      "submit": "Submit",
      "save_draft": "Save Draft",
      "submit_for_approval": "Submit for Approval",
      "all_present": "All Present",
      "queued": "Queued",
      "synced": "Synced",
      "offline": "Offline",
      "online": "Online",
      "pending_sync": "Pending Sync",
      "start_live_class": "Start Live Class",
      "end_live_class": "End Live Class",
      "apply_leave": "Apply Leave",
      "leave_balance": "Leave Balance",
      "sick_leave": "Sick Leave",
      "casual_leave": "Casual Leave",
      "earned_leave": "Earned Leave",
      "copy_to_class": "Copy to Class",
      "due_date": "Due Date",
      "student_roster": "Student Roster",
      "not_started": "Not Started",
      "in_progress": "In Progress",
      "submitted": "Submitted"
    }
  },
  hi: {
    ...hiTranslations, ...{
      "welcome": "स्वागत हे",
      "dashboard": "डैशबोर्ड",
      "attendance": "उपस्थिति",
      "fees": "शुल्क",
      "transport": "परिवहन",
      "library": "पुस्तकालय",
      "hostel": "छात्रावास",
      "pay_now": "अभी भुगतान करें",
      "sync_status": "सिंक स्थिति",
      "present": "उपस्थित",
      "absent": "अनुपस्थित",
      "low_data": "लो डेटा मोड",
      "mark": "चिह्नित करें",
      "route": "रूट",
      "logout": "लॉग आउट",
      // Teacher Dashboard Keys
      "today": "आज",
      "my_classes": "मेरी कक्षाएँ",
      "marks_entry": "अंक प्रविष्टि",
      "homework": "गृहकार्य",
      "leave": "छुट्टी",
      "my_classes_today": "आज की कक्षाएँ",
      "period": "कालांश",
      "submit": "जमा करें",
      "save_draft": "ड्राफ्ट सहेजें",
      "submit_for_approval": "अनुमोदन के लिए भेजें",
      "all_present": "सभी उपस्थित",
      "queued": "कतार में",
      "synced": "सिंक हो गया",
      "offline": "ऑफ़लाइन",
      "online": "ऑनलाइन",
      "pending_sync": "सिंक बाकी है",
      "start_live_class": "लाइव क्लास शुरू करें",
      "end_live_class": "लाइव क्लास समाप्त करें",
      "apply_leave": "छुट्टी के लिए आवेदन करें",
      "leave_balance": "छुट्टी शेष",
      "sick_leave": "बीमारी की छुट्टी",
      "casual_leave": "आकस्मिक छुट्टी",
      "earned_leave": "अर्जित छुट्टी",
      "copy_to_class": "कक्षा में कॉपी करें",
      "due_date": "नियत तारीख",
      "student_roster": "छात्र सूची",
      "not_started": "शुरू नहीं हुआ",
      "in_progress": "प्रगति पर है",
      "submitted": "जमा किया गया"
    }
  },
  mr: {
    "welcome": "स्वागत आहे",
    "dashboard": "डॅशबोर्ड",
    "attendance": "हजेरी",
    "fees": "फी",
    "transport": "वाहतूक",
    "library": "ग्रंथालय",
    "hostel": "वसतिगृह",
    "pay_now": "आत्ता भरा",
    "sync_status": "सिंक स्थिती",
    "present": "हजर",
    "absent": "गैरहजर",
    "low_data": "लो डेटा मोड",
    "mark": "नोंदवा",
    "route": "मार्ग",
    "logout": "बाहेर पडा",
    // Teacher Dashboard Keys
    "today": "आज",
    "my_classes": "माझे वर्ग",
    "marks_entry": "गुण प्रविष्टी",
    "homework": "गृहपाठ",
    "leave": "रजा",
    "my_classes_today": "आजचे वर्ग",
    "period": "तास",
    "submit": "सबमिट करा",
    "save_draft": "मसुदा जतन करा",
    "submit_for_approval": "मंजुरीसाठी सबमिट करा",
    "all_present": "सर्व हजर",
    "queued": "रांगेत",
    "synced": "सिंक झाले",
    "offline": "ऑफलाइन",
    "online": "ऑनलाइन",
    "pending_sync": "सिंक बाकी",
    "start_live_class": "लाइव्ह क्लास सुरू करा",
    "end_live_class": "लाइव्ह क्लास समाप्त करा",
    "apply_leave": "रजेसाठी अर्ज करा",
    "leave_balance": "रजा शिल्लक",
    "sick_leave": "आजारी रजा",
    "casual_leave": "नैमित्तिक रजा",
    "earned_leave": "अर्जित रजा",
    "copy_to_class": "वर्गात कॉपी करा",
    "due_date": "देय तारीख",
    "student_roster": "विद्यार्थी यादी",
    "not_started": "सुरू नाही",
    "in_progress": "प्रगतीवर",
    "submitted": "सबमिट केले"
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  // Support nested keys or flat keys, but simple string return
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>('en');

  // Load from local storage on mount (simulated)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const saved = localStorage.getItem('sovereign_lang') as LanguageCode;
      if (saved && DICTIONARIES[saved]) {
        setLanguage(saved);
      }
    }
  }, []);

  const changeLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    if (Platform.OS === 'web') {
      localStorage.setItem('sovereign_lang', lang);
    }
  };

  const t = (key: string) => {
    // Basic dot notation support (e.g. "vp_dashboard.stats.pending_approvals")
    const keys = key.split('.');
    let value = DICTIONARIES[language];

    // Fallback if top level missing
    if (!value) value = DICTIONARIES['en'];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    // Fallback to English if missing in current lang
    if (value === undefined && language !== 'en') {
      let enValue = DICTIONARIES['en'];
      for (const k of keys) {
        if (enValue && typeof enValue === 'object') {
          enValue = enValue[k];
        } else {
          enValue = undefined;
          break;
        }
      }
      value = enValue;
    }

    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};

// Alias for compatibility with new code
export const useLanguage = useTranslation;
