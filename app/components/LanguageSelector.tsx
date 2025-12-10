'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguageStore } from '@/lib/use-language-store';
import { Language, languageNames } from '@/lib/translations';

interface LanguageSelectorProps {
  variant?: 'light' | 'dark';
}

export default function LanguageSelector({ variant = 'dark' }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDark = variant === 'dark';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
          isDark
            ? 'text-white/70 hover:text-white hover:bg-white/10'
            : 'text-stone-600 hover:text-stone-800 hover:bg-stone-100'
        }`}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">{currentLang.nativeName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-40 rounded-xl shadow-lg overflow-hidden z-50 ${
          isDark
            ? 'bg-stone-800/95 backdrop-blur-xl border border-white/10'
            : 'bg-white border border-stone-200'
        }`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
                language === lang.code
                  ? isDark
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-amber-50 text-amber-700'
                  : isDark
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <span>{lang.nativeName}</span>
              {language === lang.code && (
                <span className="text-xs opacity-60">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
