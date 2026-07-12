'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Home as HomeIcon,
  Cpu,
  BookOpen,
  HelpCircle,
  Menu,
  X,
} from 'lucide-react';
import LogoCube from './LogoCube';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Home', icon: HomeIcon, href: '/' },
  { label: 'Scan Cube', icon: Cpu, href: '/scan' },
  { label: 'Learn', icon: BookOpen, href: '/learn' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const scrollToFaq = () => {
    if (pathname !== '/') {
      router.push('/#faq-section');
    } else {
      const el = document.getElementById('faq-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const pillBase =
    'flex items-center gap-1.5 h-10 px-4 rounded-full bg-white/90 border border-borders/50 shadow-sm hover:border-accent-orange/40 hover:shadow-md transition-smooth cursor-pointer shrink-0';

  return (
    <header className="w-full z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-3">

        {/* Left: Logo Pill */}
        <button
          onClick={() => router.push('/')}
          className={`${pillBase} gap-2`}
        >
          <LogoCube />
          <span className="font-geist font-bold tracking-tight text-sm">
            Cube<span className="text-accent-orange">iQ</span>
          </span>
        </button>

        {/* Center: Nav Pill group */}
        <nav className="hidden md:flex items-center h-10 px-1.5 gap-0.5 rounded-full bg-white/90 border border-borders/50 shadow-sm">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`flex items-center gap-1.5 px-3.5 h-7 rounded-full text-xs font-bold font-geist transition-smooth cursor-pointer ${
                isActive(href)
                  ? 'bg-accent-orange text-white shadow-sm'
                  : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </nav>

        {/* Right: FAQ Pill */}
        <button
          onClick={scrollToFaq}
          className={`hidden md:flex ${pillBase} text-xs font-bold font-geist text-muted-text hover:text-charcoal`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          FAQ
        </button>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden h-10 w-10 flex items-center justify-center rounded-full bg-white/90 border border-borders/50 shadow-sm text-muted-text hover:text-charcoal cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Navigation Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_ITEMS.map(({ label, icon: Icon, href }) => (
                <button
                  key={href}
                  onClick={() => { router.push(href); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold font-geist text-left cursor-pointer transition-smooth ${
                    isActive(href)
                      ? 'bg-accent-orange text-white shadow-sm'
                      : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
              <button
                onClick={() => { scrollToFaq(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold font-geist text-left text-muted-text hover:text-charcoal hover:bg-charcoal/5 cursor-pointer transition-smooth"
              >
                <HelpCircle className="w-4 h-4" />
                FAQ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
