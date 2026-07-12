'use client';

import LogoCube from './LogoCube';

export default function Footer() {
  return (
    <footer className="w-full bg-surface/40 border-t border-borders/50 py-10 mt-auto backdrop-blur-md shadow-[0_-8px_30px_rgba(60,58,50,0.04)]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

        {/* Left: Logo + description */}
        <div className="flex flex-col gap-3 max-w-sm">
          <div className="flex items-center gap-2">
            <LogoCube />
            <span className="font-geist font-bold tracking-tight text-lg text-charcoal">
              Cube<span className="text-accent-orange">iQ</span>
            </span>
          </div>
          <p className="text-xs text-muted-text leading-relaxed">
            A premium, browser-native 3D Rubik's Cube scanner and solver. Simple, elegant, and interactive.
          </p>
          <a
            href="https://alvinsonny.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-charcoal hover:text-accent-orange transition-smooth self-start"
          >
            Made by <span className="underline">Alvin</span>
          </a>
        </div>

        {/* Right: Social + GitHub */}
        <div className="flex gap-8 sm:gap-12 items-stretch">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider font-geist">Social</span>
            <div className="flex flex-col gap-2">
              {[
                {
                  name: 'Instagram',
                  href: 'https://instagram.com/_martin.max_',
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x={2} y={2} width={20} height={20} rx={5} ry={5} />
                      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  ),
                },
                {
                  name: 'LinkedIn',
                  href: 'https://linkedin.com/in/alvinsonny',
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                      <rect x={2} y={9} width={4} height={12} />
                      <circle cx={4} cy={4} r={2} />
                    </svg>
                  ),
                },
                {
                  name: 'X / Twitter',
                  href: 'https://x.com/martinxmathew',
                  icon: (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-xs text-muted-text hover:text-charcoal flex items-center gap-2 transition-smooth cursor-pointer"
                >
                  {link.icon}
                  <span>{link.name}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-smooth text-[9px]">↗</span>
                </a>
              ))}
            </div>
          </div>

          <div className="border-l border-borders/40 self-stretch my-1" />

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider font-geist">Github</span>
            <div className="flex flex-col gap-2">
              <a
                href="https://github.com/alvinxsonny/cubeiq"
                target="_blank"
                rel="noopener noreferrer"
                className="group text-xs text-muted-text hover:text-charcoal flex items-center gap-2 transition-smooth cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
                <span className="opacity-0 group-hover:opacity-100 transition-smooth text-[9px]">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
