'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AppLanguage = 'en' | 'ur';
type TextScale = 'normal' | 'large' | 'extra';

interface AccessibilityContextType {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  toggleLanguage: () => void;
  cycleTextScale: () => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    accessibility: 'Accessibility',
    compose: 'Compose',
    dashboard: 'Dashboard',
    drafts: 'Drafts',
    english: 'English',
    explore: 'Explore',
    extraLargeText: 'Extra',
    help: 'Help',
    inbox: 'Inbox',
    language: 'Language',
    largeText: 'Large',
    loading: 'Loading...',
    signingIn: 'Checking your session',
    redirecting: 'Taking you to sign in...',
    normalText: 'Normal',
    privacyPolicy: 'Privacy Policy',
    profile: 'Profile',
    releaseNotes: 'Release Notes',
    sent: 'Sent',
    settings: 'Settings',
    signedIn: 'Signed in',
    signedInAs: 'Signed in as',
    signOut: 'Sign Out',
    stamps: 'Stamps',
    termsOfService: 'Terms of Service',
    textSize: 'Text Size',
    urdu: 'Urdu',
    welcomeBack: 'Welcome back',
    writeLetter: 'Write Letter',
    yuubinUser: 'Yuubin user',
    completeProfile: 'Complete your profile',
    privateProfile: 'Private profile',
    publicProfile: 'Public profile',
    newMember: 'New member',
    visibility: 'Visibility',
    joined: 'Joined',
    exploreWriters: 'Explore Writers',
    viewStamps: 'View Stamps',
    letterActivity: 'Letter activity',
    totalExchangedLetters: 'Total exchanged letters',
    receivedShort: 'received',
    sentShort: 'sent',
    lettersReceived: 'Letters received',
    lettersSent: 'Letters sent',
    followers: 'Followers',
    following: 'Following',
    atAGlance: 'At a glance',
    unread: 'Unread',
    inTransit: 'In transit',
    delivered: 'Delivered',
    likes: 'Likes',
    recentLetters: 'Recent letters',
    latestLettersInInbox: 'Latest letters arriving in your inbox',
    viewInbox: 'View inbox',
    noLettersYet: 'No letters yet',
    noLettersMessage: 'Explore writers or send your first letter to begin the exchange.',
    from: 'From',
    unknownSender: 'Unknown sender',
    untitledLetter: 'Untitled letter',
    travellingPreview: 'This letter is still travelling. It will open when it arrives.',
    open: 'Open',
    deliveredStatus: 'Delivered',
    inTransitStatus: 'In Transit',
    pendingStatus: 'Pending',
    draftStatus: 'Draft',
    unknownDate: 'Unknown date',
    loadingYourData: 'Loading your data...',
    userMenuLabel: 'Open user menu',
    signOutSuccess: 'Signed out successfully',
    signOutError: 'Failed to sign out',
  },
  ur: {
    accessibility: 'رسائی',
    compose: 'خط لکھیں',
    dashboard: 'ڈیش بورڈ',
    drafts: 'مسودے',
    english: 'English',
    explore: 'دریافت کریں',
    extraLargeText: 'بہت بڑا',
    help: 'مدد',
    inbox: 'موصولہ خطوط',
    language: 'زبان',
    largeText: 'بڑا',
    loading: 'لوڈ ہو رہا ہے...',
    normalText: 'عام',
    privacyPolicy: 'رازداری پالیسی',
    profile: 'پروفائل',
    releaseNotes: 'ریلیز نوٹس',
    sent: 'بھیجے گئے',
    settings: 'ترتیبات',
    signedIn: 'لاگ ان',
    signedInAs: 'لاگ ان صارف',
    signOut: 'سائن آؤٹ',
    stamps: 'ڈاک ٹکٹ',
    termsOfService: 'استعمال کی شرائط',
    textSize: 'متن کا سائز',
    urdu: 'اردو',
    welcomeBack: 'خوش آمدید',
    writeLetter: 'خط لکھیں',
    yuubinUser: 'یوبن صارف',
    completeProfile: 'اپنا پروفائل مکمل کریں',
    privateProfile: 'نجی پروفائل',
    publicProfile: 'عوامی پروفائل',
    newMember: 'نیا رکن',
    visibility: 'ظاہری حیثیت',
    joined: 'شمولیت',
    exploreWriters: 'لکھنے والوں کو دیکھیں',
    viewStamps: 'ڈاک ٹکٹ دیکھیں',
    letterActivity: 'خطوط کی سرگرمی',
    totalExchangedLetters: 'کل تبادلہ شدہ خطوط',
    receivedShort: 'موصول',
    sentShort: 'بھیجے گئے',
    lettersReceived: 'موصولہ خطوط',
    lettersSent: 'بھیجے گئے خطوط',
    followers: 'فالوورز',
    following: 'فالو کر رہے ہیں',
    atAGlance: 'ایک نظر میں',
    unread: 'نہ پڑھے گئے',
    inTransit: 'سفر میں',
    delivered: 'پہنچ گئے',
    likes: 'پسندیدگیاں',
    recentLetters: 'حالیہ خطوط',
    latestLettersInInbox: 'آپ کے ان باکس میں آنے والے تازہ خطوط',
    viewInbox: 'ان باکس دیکھیں',
    noLettersYet: 'ابھی کوئی خط نہیں',
    noLettersMessage: 'لکھنے والوں کو دیکھیں یا اپنا پہلا خط بھیج کر تبادلہ شروع کریں۔',
    from: 'از',
    unknownSender: 'نامعلوم بھیجنے والا',
    untitledLetter: 'بے عنوان خط',
    travellingPreview: 'یہ خط ابھی سفر میں ہے۔ پہنچنے پر کھل جائے گا۔',
    open: 'کھولیں',
    deliveredStatus: 'پہنچ گیا',
    inTransitStatus: 'سفر میں',
    pendingStatus: 'زیر التوا',
    draftStatus: 'مسودہ',
    unknownDate: 'نامعلوم تاریخ',
    loadingYourData: 'آپ کا ڈیٹا لوڈ ہو رہا ہے...',
    signingIn: 'آپ کے سیشن کی جانچ ہو رہی ہے',
    redirecting: 'آپ کو سائن اِن صفحے پر لے جایا جا رہا ہے...',
    userMenuLabel: 'صارف مینو کھولیں',
    signOutSuccess: 'کامیابی سے سائن آؤٹ ہو گیا',
    signOutError: 'سائن آؤٹ ناکام ہو گیا',
  },
};

const textScaleValues: Record<TextScale, string> = {
  normal: '1',
  large: '1.12',
  extra: '1.25',
};

const textScaleOrder: TextScale[] = ['normal', 'large', 'extra'];

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');
  const [textScale, setTextScaleState] = useState<TextScale>('normal');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('yuubin-language') as AppLanguage | null;
    const storedScale = localStorage.getItem('yuubin-text-scale') as TextScale | null;

    if (storedLanguage === 'ur' || storedLanguage === 'en') {
      setLanguageState(storedLanguage);
    }

    if (storedScale && textScaleOrder.includes(storedScale)) {
      setTextScaleState(storedScale);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const isUrdu = language === 'ur';

    html.lang = isUrdu ? 'ur' : 'en';
    html.dir = isUrdu ? 'rtl' : 'ltr';
    html.classList.toggle('yuubin-urdu-ui', isUrdu);
  }, [language]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--yuubin-font-scale',
      textScaleValues[textScale],
    );
  }, [textScale]);

  const value = useMemo<AccessibilityContextType>(() => {
    const setLanguage = (nextLanguage: AppLanguage) => {
      setLanguageState(nextLanguage);
      localStorage.setItem('yuubin-language', nextLanguage);
    };

    const setTextScale = (nextScale: TextScale) => {
      setTextScaleState(nextScale);
      localStorage.setItem('yuubin-text-scale', nextScale);
    };

    const toggleLanguage = () => {
      setLanguage(language === 'ur' ? 'en' : 'ur');
    };

    const cycleTextScale = () => {
      const currentIndex = textScaleOrder.indexOf(textScale);
      const nextScale = textScaleOrder[(currentIndex + 1) % textScaleOrder.length];
      setTextScale(nextScale);
    };

    return {
      language,
      setLanguage,
      textScale,
      setTextScale,
      toggleLanguage,
      cycleTextScale,
      isRtl: language === 'ur',
      t: (key) => translations[language][key] ?? key,
    };
  }, [language, textScale]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
