'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThreeCube from '@/components/ThreeCube';
import { useSolver } from '@/hooks/useSolver';
import {
  DEFAULT_SOLVED_STATE,
  cubeStateToFaceletString,
  applyMoveToState,
  CubeState,
} from '@/lib/cubeState';
import {
  Sparkles,
  HelpCircle,
  History,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  // FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Hero demo cube
  const [demoMove, setDemoMove] = useState<string | null>(null);
  const [demoQueue, setDemoQueue] = useState<string[]>([]);
  const [demoCube, setDemoCube] = useState<CubeState>(DEFAULT_SOLVED_STATE);
  const [heroCameraResetTrigger, setHeroCameraResetTrigger] = useState<number>(0);

  const { solveCube } = useSolver();

  const handleHeroMove = (move: string) => {
    if (demoMove || demoQueue.length > 0) return;
    setHeroCameraResetTrigger((prev) => prev + 1);
    setDemoMove(move);
  };

  const handleHeroScramble = () => {
    if (demoMove || demoQueue.length > 0) return;
    setHeroCameraResetTrigger((prev) => prev + 1);
    const moves = ['R', 'L', 'U', 'D', 'F', 'B', "R'", "L'", "U'", "D'", "F'", "B'"];
    const newQueue: string[] = [];
    for (let i = 0; i < 15; i++) {
      newQueue.push(moves[Math.floor(Math.random() * moves.length)]);
    }
    setDemoQueue(newQueue);
  };

  const handleHeroReset = async () => {
    if (demoMove || demoQueue.length > 0) return;
    setHeroCameraResetTrigger((prev) => prev + 1);
    try {
      const faceletStr = cubeStateToFaceletString(demoCube);
      const solution = await solveCube(faceletStr);
      if (solution && solution.trim()) {
        setDemoQueue(solution.trim().split(/\s+/));
      } else {
        setDemoCube(DEFAULT_SOLVED_STATE);
      }
    } catch {
      setDemoCube(DEFAULT_SOLVED_STATE);
    }
  };

  const handleDemoComplete = () => {
    if (demoMove) {
      setDemoCube((prev) => applyMoveToState(prev, demoMove));
      setDemoMove(null);
    }
  };

  // Keyboard controls on home
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) return;
      const key = e.key.toUpperCase();
      if (['U', 'D', 'L', 'R', 'F', 'B'].includes(key)) {
        e.preventDefault();
        handleHeroMove(key);
      } else if (key === 'S') {
        e.preventDefault();
        handleHeroScramble();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [demoMove, demoCube]);

  // Process move queue
  useEffect(() => {
    if (!demoMove && demoQueue.length > 0) {
      const nextMove = demoQueue[0];
      setDemoMove(nextMove);
      setDemoQueue((prev) => prev.slice(1));
    }
  }, [demoMove, demoQueue]);

  // Scroll to FAQ if hash present
  useEffect(() => {
    if (window.location.hash === '#faq-section') {
      setTimeout(() => {
        const el = document.getElementById('faq-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, []);

  const scrollToFaq = () => {
    const el = document.getElementById('faq-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-1 pb-10 w-full flex flex-col gap-10">
        {/* ── Hero Section ── */}
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-80px-20px)] py-6 md:py-0">
          <div className="md:col-span-6 flex flex-col gap-8 justify-center md:pl-6 lg:pl-12">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-orange/5 border border-accent-orange/10 rounded-full self-start">
                <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
                <span className="text-[10px] font-bold text-accent-orange font-geist uppercase tracking-wider">
                  Interactive 3D Workspace
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold font-geist leading-[1.1] tracking-tight text-charcoal">
                Solve a 3x3 <br />
                Rubik's Cube.
              </h1>
              <p className="text-sm text-muted-text leading-relaxed max-w-lg">
                Scan your cube with your camera or paint it in 2D. Watch it reconstruct in a premium 3D canvas, and learn to solve it layer-by-step with optimal algorithms.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/scan')}
                className="px-6 py-3 bg-accent-orange text-white text-xs font-bold rounded-2xl neo-btn cursor-pointer"
              >
                Start Scanning
              </button>
              <button
                onClick={() => router.push('/learn')}
                className="px-6 py-3 bg-white text-charcoal text-xs font-bold rounded-2xl neo-btn cursor-pointer"
              >
                Learn Notation
              </button>
            </div>

            {/* Fun fact callout */}
            <div className="flex items-center gap-4 max-w-lg mt-3 bg-accent-orange/[0.03] border border-accent-orange/20 rounded-3xl p-4 backdrop-blur-[1px]">
              <div className="p-2 bg-accent-orange/10 border border-accent-orange/20 rounded-2xl text-accent-orange shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider font-geist">Did You Know?</span>
                <p className="text-xs leading-relaxed text-muted-text font-geist">
                  A standard 3x3 Rubik's Cube has over <strong className="text-accent-orange font-bold">43 quintillion</strong> (43,252,003,274,489,856,000) possible configurations, yet every single one is solvable in 20 moves or less.
                </p>
              </div>
            </div>
          </div>

          {/* Hero 3D interactive preview */}
          <div className="md:col-span-6 flex flex-col md:flex-row items-stretch gap-4 w-full relative">
            <div className="w-full absolute -top-8 -left-8 h-full bg-accent-orange/5 filter blur-3xl pointer-events-none rounded-full" />

            <ThreeCube
              cubeState={demoCube}
              currentMove={demoMove}
              onMoveComplete={handleDemoComplete}
              animationSpeed={demoQueue.length > 0 ? 3.2 : 0.8}
              className="flex-1 h-[320px] md:h-[400px] lg:h-[480px] relative rounded-3xl overflow-hidden bg-charcoal/5 border-none shadow-none"
              resetCameraTrigger={heroCameraResetTrigger}
            />

            {/* Vertical Controls Panel */}
            <div className="flex flex-row md:flex-col gap-3 items-center justify-between md:justify-center p-3.5 md:p-3 bg-white/40 rounded-3xl backdrop-blur-sm z-10 shrink-0 md:w-16 neo-card">
              <span className="hidden md:block text-[8px] uppercase font-bold tracking-wider text-muted-text font-geist rotate-180 [writing-mode:vertical-lr] select-none my-2">Controls</span>

              <div className="flex flex-row md:flex-col gap-1.5 flex-1 md:flex-initial justify-center">
                {['U', 'D', 'L', 'R', 'F', 'B'].map((face) => (
                  <button
                    key={face}
                    onClick={() => handleHeroMove(face)}
                    disabled={demoMove !== null || demoQueue.length > 0}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold text-charcoal disabled:opacity-40 cursor-pointer bg-white neo-btn-sm"
                    title={`Turn ${face}`}
                  >
                    {face}
                  </button>
                ))}
              </div>

              <div className="w-[1px] md:w-8 h-6 md:h-[1px] bg-borders/40 mx-2 md:mx-0 md:my-3 shrink-0" />

              <div className="flex flex-row md:flex-col gap-1.5 shrink-0">
                <button
                  onClick={handleHeroScramble}
                  disabled={demoMove !== null || demoQueue.length > 0}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-charcoal disabled:opacity-40 cursor-pointer neo-btn-sm"
                  title="Scramble Cube"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
                </button>
                <button
                  onClick={handleHeroReset}
                  disabled={demoMove !== null || demoQueue.length > 0}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-charcoal disabled:opacity-40 cursor-pointer neo-btn-sm"
                  title="Reset Solved state"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-muted-text" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section Separator ── */}
        <div className="relative w-full py-1 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-dashed border-borders/75" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#F4F4F1] px-3 text-[10px] font-bold text-muted-text/40 font-geist uppercase tracking-widest select-none">
              :: DETAILED_HISTORY ::
            </span>
          </div>
        </div>

        {/* ── Rubik's Cube History Timeline ── */}
        <section className="py-6 flex flex-col gap-8">
          <div className="max-w-2xl flex flex-col items-center text-center mx-auto gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-orange/5 border border-accent-orange/10 rounded-full self-center">
              <History className="w-3.5 h-3.5 text-accent-orange" />
              <span className="text-[10px] font-bold text-accent-orange font-geist uppercase tracking-wider">
                The World's Most Famous Puzzle
              </span>
            </div>
            <h2 className="text-3xl font-extrabold font-geist tracking-tight text-charcoal">
              A Brief History of the Rubik's Cube
            </h2>
            <p className="text-sm text-muted-text leading-relaxed">
              Invented by Ernő Rubik in 1974, the Magic Cube has fascinated mathematicians, speedcubers, and casual players for over five decades.
            </p>
          </div>

          {/* Vertical Timeline */}
          <div className="relative border-l-2 border-borders/60 md:border-l-0 md:flex md:flex-col md:items-center py-6 w-full">
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-borders/60" />

            {/* 1974 */}
            <div className="relative flex flex-col md:flex-row md:justify-start md:items-start w-full mb-12 md:mb-20 group">
              <div className="absolute -left-[9px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-accent-orange border-4 border-cloud-white z-10 top-1" />
              <div className="pl-6 md:pl-0 md:w-1/2 md:pr-12 md:text-right flex flex-col items-start md:items-end gap-3">
                <span className="text-xs font-bold text-accent-orange font-geist">1974</span>
                <h3 className="font-bold text-base font-geist text-charcoal">The Wooden Prototype</h3>
                <p className="text-xs text-muted-text leading-relaxed max-w-sm">
                  Ernő Rubik, a Hungarian architecture professor, created a wooden prototype in Budapest to help his students understand 3D geometry and structural design.
                </p>
                <img
                  src="/rubiks_wooden_prototype.png"
                  alt="Original 1974 Wooden Rubik's Cube Prototype"
                  className="w-48 rounded-2xl border border-borders shadow-sm mt-1 hover:scale-[1.02] transition-smooth select-none"
                />
              </div>
            </div>

            {/* 1980 */}
            <div className="relative flex flex-col md:flex-row md:justify-end md:items-start w-full mb-12 md:mb-20 group">
              <div className="absolute -left-[9px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-accent-orange border-4 border-cloud-white z-10 top-1" />
              <div className="pl-6 md:pl-0 md:w-1/2 md:pl-12 flex flex-col items-start gap-3">
                <span className="text-xs font-bold text-accent-orange font-geist">1980</span>
                <h3 className="font-bold text-base font-geist text-charcoal">Global Phenomenon</h3>
                <p className="text-xs text-muted-text leading-relaxed max-w-sm">
                  Licensed to Ideal Toy Corp and renamed the Rubik's Cube, the puzzle took the world by storm, selling over 450 million copies to become the best-selling toy in history.
                </p>
                <img
                  src="/rubiks_classic_1980.png"
                  alt="Classic 1980 Rubik's Cube"
                  className="w-48 rounded-2xl border border-borders shadow-sm mt-1 hover:scale-[1.02] transition-smooth select-none"
                />
              </div>
            </div>

            {/* Modern Era */}
            <div className="relative flex flex-col md:flex-row md:justify-start md:items-start w-full group">
              <div className="absolute -left-[9px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-accent-orange border-4 border-cloud-white z-10 top-1" />
              <div className="pl-6 md:pl-0 md:w-1/2 md:pr-12 md:text-right flex flex-col items-start md:items-end gap-3">
                <span className="text-xs font-bold text-accent-orange font-geist">Modern Era</span>
                <h3 className="font-bold text-base font-geist text-charcoal">Speedcubing &amp; Math</h3>
                <p className="text-xs text-muted-text leading-relaxed max-w-sm">
                  Today, speedcubers solve stickerless magnetic cubes in under 4 seconds. Mathematicians proved any of the 43 quintillion states can be solved in 20 moves or less.
                </p>
                <img
                  src="/rubiks_modern_speedcube.png"
                  alt="Modern Magnetic Speedcube"
                  className="w-48 rounded-2xl border border-borders shadow-sm mt-1 hover:scale-[1.02] transition-smooth select-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Section Separator ── */}
        <div className="relative w-full py-1 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-dashed border-borders/75" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#F4F4F1] px-3 text-[10px] font-bold text-muted-text/40 font-geist uppercase tracking-widest select-none">
              :: KNOWLEDGE_BASE ::
            </span>
          </div>
        </div>

        {/* ── FAQ Section ── */}
        <section id="faq-section" className="py-6 flex flex-col items-center gap-8 scroll-mt-24">
          <div className="max-w-2xl flex flex-col items-center text-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-orange/5 border border-accent-orange/10 rounded-full self-center">
              <HelpCircle className="w-3.5 h-3.5 text-accent-orange" />
              <span className="text-[10px] font-bold text-accent-orange font-geist uppercase tracking-wider">
                Got Questions?
              </span>
            </div>
            <h2 className="text-3xl font-extrabold font-geist tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-text leading-relaxed">
              Everything you need to know about the Rubik's Cube, optimal algorithms, and parities.
            </p>
          </div>

          <div className="max-w-3xl flex flex-col gap-4 w-full mx-auto">
            {[
              {
                q: "Who invented the Rubik's Cube?",
                a: "The Rubik's Cube was invented in 1974 by Ernő Rubik, a Hungarian sculptor and professor of architecture. He originally created it as a tool to help his students understand three-dimensional geometry, spending a month trying to solve his own invention for the first time."
              },
              {
                q: "How does the solver find the optimal solution?",
                a: "Our solver employs Herbert Kociemba's optimal Two-Phase Algorithm. In the first phase, it solves the edge orientations and corner positions using a subset of moves. In the second phase, it solves the remaining pieces using only U, D, R2, L2, F2, and B2 turns, resulting in solutions of 20-22 moves in milliseconds."
              },
              {
                q: "Why does the solver say my cube state is invalid?",
                a: "A physical Rubik's Cube has mathematical parities. Only a fraction of random color arrangements can actually be solved. If one corner piece is twisted, or edges are swapped incorrectly, the cube becomes mathematically unsolvable. The solver performs parity checks on edge/corner orientations and permutations to prevent solving loops."
              },
              {
                q: "How many moves does it take to solve any cube state?",
                a: "Mathematically, any of the 43 quintillion scrambled positions of a standard 3x3 Rubik's Cube can be solved in 20 moves or less. This absolute limit is known in mathematics as \"God's Number\", which was proven in 2010 using supercomputer processing power."
              },
              {
                q: "What is the best way to learn to solve a Rubik's Cube manually?",
                a: "For beginners, the Layer-by-Layer method is highly recommended. It breaks down the process into simple stages: solving a white cross, placing corners, solving the middle layer, and orienting the top layer. Once mastered, speedcubers transition to the advanced CFOP (Cross, F2L, OLL, PLL) method."
              }
            ].map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-borders/50 bg-white rounded-3xl overflow-hidden transition-all duration-200 hover:border-borders hover:shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-sm font-bold font-geist text-charcoal group-hover:text-accent-orange transition-smooth">
                      {faq.q}
                    </span>
                    <span className={`text-muted-text transition-transform duration-300 transform ${isOpen ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-5 pt-1 text-xs text-muted-text leading-relaxed border-t border-borders/30">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </>
  );
}
