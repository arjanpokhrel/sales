import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Home, Map, PhoneCall, BookOpen, User, ShieldAlert } from 'lucide-react';

export default function BottomNavigation() {
  const { t } = useLanguage();
  const location = useLocation();

  const items = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/map', label: t('nav.map'), icon: Map },
    { to: '/emergency', label: t('nav.emergency'), icon: ShieldAlert, isEmergency: true },
    { to: '/guides', label: t('nav.guides'), icon: BookOpen },
    { to: '/profile', label: t('nav.profile'), icon: User }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B192C]/98 border-t border-slate-800 backdrop-blur-lg pb-safe">
      <nav className="flex items-center justify-around h-16 px-1">
        {items.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          if (item.isEmergency) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 border-2 ${
                    isActive
                      ? 'bg-red-500 border-white text-white shadow-red-600/50'
                      : 'bg-red-600 border-red-400/60 text-white shadow-red-950/60 hover:bg-red-500'
                  }`}
                >
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[11px] font-bold text-red-400 mt-1">
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive
                  ? 'text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[11px]">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
