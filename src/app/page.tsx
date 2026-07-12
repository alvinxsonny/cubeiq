'use client';

import React, { useState, useEffect } from 'react';
import ThreeCube from '@/components/ThreeCube';
import CubeOverlay from '@/components/CubeOverlay';
import Scanner from '@/components/Scanner';
import SolverControls from '@/components/SolverControls';
import LearnSection from '@/components/LearnSection';
import LogoCube from '@/components/LogoCube';
import { useSolver } from '@/hooks/useSolver';
import {
  CubeState,
  DEFAULT_SOLVED_STATE,
  cubeStateToFaceletString,
  validateCubeState,
  applyMoveToState,
  CubeColor,
  FaceName,
} from '@/lib/cubeState';
import {
  Shield,
  Cpu,
  Layers,
  Zap,
  BookOpen,
  HelpCircle,
  History,
  Sparkles,
  Clock,
  ArrowRight,
  Info,
  Trash2,
  Lock,
  Menu,
  X,
  Home as HomeIcon,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryItem {
  id: string;
  date: string;
  movesCount: number;
  scramble: string;
  solution: string;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'scanner' | 'solver' | 'learn' | 'privacy'>('home');
  const [cubeState, setCubeState] = useState<CubeState>(DEFAULT_SOLVED_STATE);
  const [scrambleState, setScrambleState] = useState<CubeState>(DEFAULT_SOLVED_STATE);
  
  // Solver controls state
  const [activeMove, setActiveMove] = useState<string | null>(null);
  const [moveDirection, setMoveDirection] = useState<'forward' | 'backward'>('forward');
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [solutionStr, setSolutionStr] = useState<string>('');
  
  // Scanning state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isEditing2D, setIsEditing2D] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [privateMode, setPrivateMode] = useState<boolean>(false);

  // Responsive mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // FAQ accordion active item state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Hero page demo animation state
  const [demoMove, setDemoMove] = useState<string | null>(null);
  const [demoQueue, setDemoQueue] = useState<string[]>([]);
  const [demoCube, setDemoCube] = useState<CubeState>(DEFAULT_SOLVED_STATE);

  const { isReady, isSolving, error: solverError, solveCube } = useSolver();

  // Load history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem('cubeiq_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      const storedPrivate = localStorage.getItem('cubeiq_private');
      if (storedPrivate) {
        setPrivateMode(JSON.parse(storedPrivate));
      }
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (moves: string[], scrambleStr: string, solStr: string) => {
    if (privateMode) return;

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      movesCount: moves.length,
      scramble: scrambleStr,
      solution: solStr,
    };

    const updated = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updated);
    localStorage.setItem('cubeiq_history', JSON.stringify(updated));
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('cubeiq_history', JSON.stringify(updated));
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('cubeiq_history');
  };

  const handlePrivateModeToggle = () => {
    const nextValue = !privateMode;
    setPrivateMode(nextValue);
    localStorage.setItem('cubeiq_private', JSON.stringify(nextValue));
  };

  // Reset to original scrambled state hook mapping
  useEffect(() => {
    (window as any)._resetToScrambled = () => {
      setCubeState(scrambleState);
      setActiveMove(null);
    };
    return () => {
      delete (window as any)._resetToScrambled;
    };
  }, [scrambleState]);

  // Solver complete event hook mapping
  const handle3DMoveComplete = () => {
    if ((window as any)._on3DMoveComplete) {
      (window as any)._on3DMoveComplete();
    }
  };

  // Hero page custom turn logic
  const handleHeroMove = (move: string) => {
    if (demoMove || demoQueue.length > 0) return; // Prevent moves while animating
    setDemoMove(move);
  };

  const handleHeroScramble = () => {
    if (demoMove || demoQueue.length > 0) return;
    const moves = ['R', 'L', 'U', 'D', 'F', 'B', "R'", "L'", "U'", "D'", "F'", "B'"];
    const newQueue: string[] = [];
    for (let i = 0; i < 15; i++) {
      newQueue.push(moves[Math.floor(Math.random() * moves.length)]);
    }
    setDemoQueue(newQueue);
  };

  const handleHeroReset = async () => {
    if (demoMove || demoQueue.length > 0) return;
    try {
      const faceletStr = cubeStateToFaceletString(demoCube);
      const solution = await solveCube(faceletStr);
      if (solution && solution.trim()) {
        const moves = solution.trim().split(/\s+/);
        setDemoQueue(moves);
      } else {
        setDemoCube(DEFAULT_SOLVED_STATE);
      }
    } catch (err) {
      setDemoCube(DEFAULT_SOLVED_STATE);
    }
  };

  const handleDemoComplete = () => {
    if (demoMove) {
      setDemoCube((prev) => applyMoveToState(prev, demoMove));
      setDemoMove(null);
    }
  };

  // Keyboard navigation controls listener for Hero section turns
  useEffect(() => {
    if (currentView !== 'home') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable)
      ) {
        return;
      }

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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentView, demoMove, demoCube]);

  // Process the queue of moves sequentially
  useEffect(() => {
    if (!demoMove && demoQueue.length > 0) {
      const nextMove = demoQueue[0];
      setDemoMove(nextMove);
      setDemoQueue((prev) => prev.slice(1));
    }
  }, [demoMove, demoQueue]);

  // Scan steps completed callback
  const handleScanComplete = (scannedState: CubeState) => {
    setScrambleState(scannedState);
    setCubeState(scannedState);
    setIsScanning(false);
    setValidationError(null);
  };

  // Paint sticker clicked on 3D Cube editor
  const handleStickerClick = (face: FaceName, index: number) => {
    // Only in 3D edit mode (which we integrate inside review phase)
    if (index === 4) return; // centers locked
    // Paints using active editor settings if integrated, fallback to cycle color
    const colors: CubeColor[] = ['white', 'red', 'green', 'yellow', 'orange', 'blue'];
    const currentColor = cubeState[face][index];
    const nextColorIdx = (colors.indexOf(currentColor) + 1) % colors.length;
    
    const newFaceStickers = [...cubeState[face]];
    newFaceStickers[index] = colors[nextColorIdx];

    const newState = {
      ...cubeState,
      [face]: newFaceStickers,
    };
    setCubeState(newState);
    setScrambleState(newState);
  };

  // Process validation & solve request
  const handleSolve = async () => {
    setValidationError(null);
    
    // 1. Validate physical state
    const result = validateCubeState(cubeState);
    if (!result.valid) {
      setValidationError(result.reason || 'Invalid cube state');
      return;
    }

    // 2. Map to Kociemba 54-facelet string
    const faceletStr = cubeStateToFaceletString(cubeState);

    try {
      // 3. Compute optimal moves via Worker solver
      const solution = await solveCube(faceletStr);
      setSolutionStr(solution);
      saveToHistory(solution.trim().split(/\s+/), faceletStr, solution);
      setCurrentView('solver');
    } catch (err: any) {
      setValidationError(err.message || 'Solving failed. Please verify sticker colors.');
    }
  };

  // Load a historical solve
  const loadHistorySolve = (item: HistoryItem) => {
    const historicalCube = faceletStringToCubeState(item.scramble);
    setScrambleState(historicalCube);
    setCubeState(historicalCube);
    setSolutionStr(item.solution);
    setCurrentView('solver');
  };

  const faceletStringToCubeState = (faceletStr: string): CubeState => {
    const state: CubeState = {
      U: [], R: [], F: [], D: [], L: [], B: [],
    };
    const facesOrder: FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B'];
    for (let i = 0; i < 6; i++) {
      const face = facesOrder[i];
      const segment = faceletStr.slice(i * 9, (i + 1) * 9);
      state[face] = Array.from(segment).map((char) => {
        switch (char) {
          case 'U': return 'white';
          case 'D': return 'yellow';
          case 'L': return 'orange';
          case 'R': return 'red';
          case 'F': return 'green';
          case 'B': return 'blue';
          default: return 'white';
        }
      });
    }
    return state;
  };

  const scrollToFaq = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setIsScanning(false);
      setTimeout(() => {
        const el = document.getElementById('faq-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else {
      const el = document.getElementById('faq-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen relative font-sans text-charcoal">
      {/* Background Grids */}
      <div className="grid-bg" />
      <div className="glow-gradient" />
      <div className="glow-gradient-secondary" />

      {/* Navigation */}
      <header className="relative z-50 w-full bg-surface/50 backdrop-blur-md border-b border-borders/50 shadow-[0_4px_30px_rgba(60,58,50,0.04)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => {
              setCurrentView('home');
              setIsScanning(false);
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <LogoCube />
            <span className="font-geist font-bold tracking-tight text-lg">
              Cube<span className="text-accent-orange">iQ</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => {
                setCurrentView('home');
                setIsScanning(false);
              }}
              className={`p-2 rounded-xl transition-smooth hover:bg-charcoal/5 cursor-pointer ${
                currentView === 'home' ? 'text-accent-orange' : 'text-muted-text hover:text-charcoal'
              }`}
              title="Home"
            >
              <HomeIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setCubeState(DEFAULT_SOLVED_STATE);
                setScrambleState(DEFAULT_SOLVED_STATE);
                setIsScanning(true);
                setCurrentView('scanner');
              }}
              className={`p-2 rounded-xl transition-smooth hover:bg-charcoal/5 cursor-pointer ${
                currentView === 'scanner' || currentView === 'solver' ? 'text-accent-orange' : 'text-muted-text hover:text-charcoal'
              }`}
              title="Solver Workspace"
            >
              <Cpu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentView('learn')}
              className={`p-2 rounded-xl transition-smooth hover:bg-charcoal/5 cursor-pointer ${
                currentView === 'learn' ? 'text-accent-orange' : 'text-muted-text hover:text-charcoal'
              }`}
              title="Learn Mode"
            >
              <BookOpen className="w-5 h-5" />
            </button>
          </nav>

          {/* Right side: FAQ button */}
          <div className="hidden md:flex items-center">
            <button
              onClick={scrollToFaq}
              className="p-2 rounded-xl transition-smooth hover:bg-charcoal/5 cursor-pointer text-muted-text hover:text-charcoal"
              title="FAQ"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-text hover:text-charcoal hover:bg-charcoal/5 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-borders/80 overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                <button
                  onClick={() => {
                    setCurrentView('home');
                    setIsScanning(false);
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold font-geist text-left text-muted-text hover:text-charcoal cursor-pointer flex items-center gap-2"
                >
                  <HomeIcon className="w-4 h-4" /> Home
                </button>
                <button
                  onClick={() => {
                    setCubeState(DEFAULT_SOLVED_STATE);
                    setScrambleState(DEFAULT_SOLVED_STATE);
                    setIsScanning(true);
                    setCurrentView('scanner');
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold font-geist text-left text-muted-text hover:text-charcoal cursor-pointer flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4" /> Solver Workspace
                </button>
                <button
                  onClick={() => {
                    setCurrentView('learn');
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold font-geist text-left text-muted-text hover:text-charcoal cursor-pointer flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" /> Learn Mode
                </button>
                <button
                  onClick={() => {
                    scrollToFaq();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold font-geist text-left text-muted-text hover:text-charcoal cursor-pointer flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" /> FAQ
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-1 pb-10 w-full flex flex-col gap-10">
        <AnimatePresence mode="wait">
          
          {/* HOME VIEW */}
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-16"
            >
              {/* Hero Section */}
              <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-64px-20px)] py-6 md:py-0">
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
                      onClick={() => {
                        setCubeState(DEFAULT_SOLVED_STATE);
                        setScrambleState(DEFAULT_SOLVED_STATE);
                        setIsScanning(true);
                        setCurrentView('scanner');
                      }}
                      className="px-6 py-3 bg-accent-orange text-white text-xs font-bold rounded-2xl neo-btn cursor-pointer"
                    >
                      Start Scanning
                    </button>
                    <button
                      onClick={() => setCurrentView('learn')}
                      className="px-6 py-3 bg-white text-charcoal text-xs font-bold rounded-2xl neo-btn cursor-pointer"
                    >
                      Learn Notation
                    </button>
                  </div>

                  {/* Highlighted Fun Fact Callout */}
                  <div className="flex items-center gap-4 max-w-lg mt-3 bg-accent-orange/[0.03] border border-accent-orange/20 rounded-3xl p-4 shadow-none backdrop-blur-[1px]">
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
                  
                  {/* 3D Cube Canvas */}
                  <ThreeCube
                    cubeState={demoCube}
                    currentMove={demoMove}
                    onMoveComplete={handleDemoComplete}
                    animationSpeed={demoQueue.length > 0 ? 3.2 : 0.8}
                    className="flex-1 h-[320px] md:h-[400px] lg:h-[480px] relative rounded-3xl overflow-hidden bg-charcoal/5 border-none shadow-none"
                  />
                  
                  {/* Vertical Interactive Controls Panel */}
                  <div className="flex flex-row md:flex-col gap-3 items-center justify-between md:justify-center p-3.5 md:p-3 bg-white/40 rounded-3xl backdrop-blur-sm z-10 shrink-0 md:w-16 neo-card">
                    <span className="hidden md:block text-[8px] uppercase font-bold tracking-wider text-muted-text font-geist rotate-180 [writing-mode:vertical-lr] select-none my-2">Controls</span>
                    
                    {/* Face turns Group */}
                    <div className="flex flex-row md:flex-col gap-1.5 flex-1 md:flex-initial justify-center">
                      {['U', 'D', 'L', 'R', 'F', 'B'].map((face) => (
                        <button
                          key={face}
                          onClick={() => handleHeroMove(face)}
                          disabled={demoMove !== null || demoQueue.length > 0}
                          className="w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold text-charcoal disabled:opacity-40 disabled:scale-100 cursor-pointer bg-white neo-btn-sm"
                          title={`Turn ${face}`}
                        >
                          {face}
                        </button>
                      ))}
                    </div>

                    {/* Separator line */}
                    <div className="w-[1px] md:w-8 h-6 md:h-[1px] bg-borders/40 mx-2 md:mx-0 md:my-3 shrink-0" />

                    {/* Scramble / Reset Group */}
                    <div className="flex flex-row md:flex-col gap-1.5 shrink-0">
                      <button
                        onClick={handleHeroScramble}
                        disabled={demoMove !== null || demoQueue.length > 0}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-charcoal disabled:opacity-40 disabled:scale-100 cursor-pointer neo-btn-sm"
                        title="Scramble Cube"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
                      </button>
                      <button
                        onClick={handleHeroReset}
                        disabled={demoMove !== null || demoQueue.length > 0}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-charcoal disabled:opacity-40 disabled:scale-100 cursor-pointer neo-btn-sm"
                        title="Reset Solved state"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-muted-text" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Separator */}
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

              {/* Rubik's Cube History Section (Vertical Timeline) */}
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

                {/* Vertical Timeline Wrapper */}
                <div className="relative border-l-2 border-borders/60 md:border-l-0 md:flex md:flex-col md:items-center py-6 w-full">
                  {/* Central vertical line for desktop */}
                  <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-borders/60" />

                  {/* 1974 Timeline Event */}
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

                  {/* 1980 Timeline Event */}
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

                  {/* Modern Timeline Event */}
                  <div className="relative flex flex-col md:flex-row md:justify-start md:items-start w-full group">
                    <div className="absolute -left-[9px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-accent-orange border-4 border-cloud-white z-10 top-1" />
                    
                    <div className="pl-6 md:pl-0 md:w-1/2 md:pr-12 md:text-right flex flex-col items-start md:items-end gap-3">
                      <span className="text-xs font-bold text-accent-orange font-geist">Modern Era</span>
                      <h3 className="font-bold text-base font-geist text-charcoal">Speedcubing & Math</h3>
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

              {/* Section Separator */}
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

              {/* FAQ Section */}
              <section id="faq-section" className="py-6 flex flex-col items-center gap-8 scroll-mt-6">
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

                <div className="max-w-3xl flex flex-col gap-4 w-full mx-auto animate-fade">
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
            </motion.div>
          )}

          {/* SCANNER VIEW */}
          {currentView === 'scanner' && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-8"
            >
              {isScanning ? (
                <Scanner
                  onScanComplete={handleScanComplete}
                  onCancel={() => setIsScanning(false)}
                />
              ) : (
                <div className="grid md:grid-cols-12 gap-8 items-start w-full">
                  {/* Left Column: Reconstructed 3D Preview */}
                  <div className="md:col-span-7 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-bold font-geist">Review Reconstructed Cube</h3>
                      <p className="text-xs text-muted-text">
                        Verify that the sticker colors match your physical cube. You can edit stickers in 3D by clicking them, or switch to the 2D Net editor.
                      </p>
                    </div>

                    <ThreeCube
                      cubeState={cubeState}
                      currentMove={null}
                      onMoveComplete={() => {}}
                      animationSpeed={1}
                      onStickerClick={handleStickerClick}
                      isEditMode={true}
                    />

                    {/* Navigation tools */}
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => setIsScanning(true)}
                        className="px-4 py-2 border border-borders text-xs font-semibold rounded-xl text-charcoal hover:bg-charcoal/5 transition-smooth cursor-pointer"
                      >
                        Retake Camera Scan
                      </button>

                      <button
                        onClick={() => setIsEditing2D(!isEditing2D)}
                        className="px-4 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl hover:bg-charcoal/90 transition-smooth cursor-pointer shadow-sm active:scale-95"
                      >
                        {isEditing2D ? 'Hide 2D Net Editor' : 'Open 2D Paint Editor'}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Validation Dashboard */}
                  <div className="md:col-span-5 flex flex-col gap-6 h-full justify-between min-h-[460px]">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold font-geist">Solve Dashboard</h3>
                        <p className="text-xs text-muted-text">Reconstruct and run parity verification tests.</p>
                      </div>

                      {/* Error Alert Box */}
                      {validationError && (
                        <div className="p-4 bg-cube-red/5 border border-cube-red/20 text-cube-red rounded-2xl flex items-start gap-3">
                          <Info className="w-5 h-5 shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold font-geist">Verification Failed</span>
                            <span className="text-[11px] leading-relaxed opacity-90">{validationError}</span>
                          </div>
                        </div>
                      )}

                      {/* Info Cards */}
                      <div className="p-4 bg-charcoal/5 rounded-2xl border border-borders/60 flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text font-geist">Verify Parameters</span>
                        <div className="flex flex-col gap-2 text-xs font-medium text-charcoal/80">
                          <div className="flex justify-between items-center py-1 border-b border-borders/40">
                            <span>Unique centers (6)</span>
                            <span>{new Set([cubeState.U[4], cubeState.D[4], cubeState.L[4], cubeState.R[4], cubeState.F[4], cubeState.B[4]]).size === 6 ? 'Pass' : 'Fail'}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-borders/40">
                            <span>9 stickers per color</span>
                            <span>
                              {Object.values(cubeState).flatMap(x => x).reduce((acc: Record<string, number>, curr) => {
                                acc[curr] = (acc[curr] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>).white === 9 ? 'Pass' : 'Incomplete'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-6 border-t border-borders/50 pt-4">
                      {isSolving ? (
                        <div className="py-3 bg-charcoal text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Generating Optimal Solution...</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleSolve}
                          className="w-full py-3.5 bg-accent-orange text-white text-xs font-bold rounded-2xl shadow-lg shadow-accent-orange/20 hover:bg-accent-orange/90 active:scale-95 transition-smooth cursor-pointer"
                        >
                          Generate Solution
                        </button>
                      )}
                      
                      <button
                        onClick={() => setCurrentView('home')}
                        className="w-full py-2.5 border border-borders text-xs font-semibold rounded-2xl text-charcoal hover:bg-charcoal/5 transition-smooth cursor-pointer bg-white"
                      >
                        Exit Workspace
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsible 2D Net Paint Editor */}
              <AnimatePresence>
                {isEditing2D && !isScanning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full overflow-hidden"
                  >
                    <CubeOverlay cubeState={cubeState} onChange={(ns) => {
                      setCubeState(ns);
                      setScrambleState(ns);
                    }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* SOLVER VIEW */}
          {currentView === 'solver' && (
            <motion.div
              key="solver"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-12 gap-8 items-start w-full"
            >
              {/* Left Column: 3D Animated Canvas */}
              <div className="md:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-lg font-bold font-geist">Interactive 3D Solver</h3>
                    <p className="text-xs text-muted-text">Play, pause, or step through moves at your own speed.</p>
                  </div>

                  <button
                    onClick={() => {
                      // Reload solve
                      setCubeState(scrambleState);
                      setActiveMove(null);
                    }}
                    className="px-3 py-1.5 border border-borders text-[10px] font-bold rounded-xl text-charcoal hover:bg-charcoal/5 shadow-sm transition-smooth cursor-pointer"
                  >
                    Reset Cube to Start
                  </button>
                </div>

                <ThreeCube
                  cubeState={cubeState}
                  currentMove={activeMove}
                  onMoveComplete={handle3DMoveComplete}
                  animationSpeed={animationSpeed}
                />
              </div>

              {/* Right Column: Playback controls Dashboard */}
              <div className="md:col-span-5 flex flex-col gap-6">
                <SolverControls
                  solutionStr={solutionStr}
                  cubeState={cubeState}
                  onCubeStateChange={setCubeState}
                  activeMove={activeMove}
                  setActiveMove={setActiveMove}
                  onMoveDirectionChange={setMoveDirection}
                  moveDirection={moveDirection}
                  animationSpeed={animationSpeed}
                  setAnimationSpeed={setAnimationSpeed}
                />

                <button
                  onClick={() => {
                    setCubeState(DEFAULT_SOLVED_STATE);
                    setScrambleState(DEFAULT_SOLVED_STATE);
                    setIsScanning(true);
                    setCurrentView('scanner');
                  }}
                  className="w-full py-3 border border-borders text-xs font-bold rounded-2xl text-charcoal hover:bg-charcoal/5 bg-white shadow-sm transition-smooth cursor-pointer"
                >
                  Scan a New Cube
                </button>
              </div>
            </motion.div>
          )}

          {/* LEARN MODE VIEW */}
          {currentView === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full animate-fade"
            >
              <LearnSection />
            </motion.div>
          )}

          {/* PRIVACY & FAQ VIEW */}
          {currentView === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl mx-auto flex flex-col gap-10"
            >
              {/* Privacy section */}
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold font-geist text-charcoal">Privacy Policy</h2>
                <p className="text-xs text-muted-text leading-relaxed">
                  CubeiQ is built as a privacy-first, local-first web application.
                </p>
                <div className="p-5 bg-success/5 border border-success/20 rounded-3xl flex flex-col gap-2">
                  <span className="text-xs font-bold text-success font-geist flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> 100% On-Device execution
                  </span>
                  <ul className="list-disc pl-5 text-[11px] text-muted-text flex flex-col gap-1.5 leading-relaxed">
                    <li>We do not collect, store, or transmit your camera video stream. It is processed in temporary canvas buffers locally.</li>
                    <li>No user accounts are required to use the service.</li>
                    <li>No tracking cookies or tracking scripts are deployed.</li>
                    <li>Solves are stored in your browser's local storage only. You can disable this by turning on Private Mode.</li>
                  </ul>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold font-geist text-charcoal">Frequently Asked Questions</h2>
                <div className="flex flex-col gap-4">
                  <div className="p-5 border border-borders/50 bg-white rounded-3xl flex flex-col gap-1">
                    <h4 className="text-sm font-bold font-geist text-charcoal">Why does the solver tell me my cube is invalid?</h4>
                    <p className="text-xs text-muted-text leading-relaxed">
                      A physical Rubik's cube has specific color parities. If you scramble it, only certain configurations are reachable. If one corner gets twisted manually or stickers are painted wrong, it becomes mathematically unsolvable. CubeiQ checks for corner orientation, edge orientation, and permutation parity before starting to guarantee success.
                    </p>
                  </div>

                  <div className="p-5 border border-borders/50 bg-white rounded-3xl flex flex-col gap-1">
                    <h4 className="text-sm font-bold font-geist text-charcoal">What is Kociemba's Algorithm?</h4>
                    <p className="text-xs text-muted-text leading-relaxed">
                      Developed by Herbert Kociemba, it solves the Rubik's Cube in two phases. Phase 1 solves the edge orientations and corner positions of a subset of moves, bringing the cube to a state solvable using only turns of U, D, R2, L2, F2, B2. Phase 2 solves the remaining pieces. It usually yields a near-optimal solution of 20-22 moves in seconds.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface/40 border-t border-borders/50 py-10 mt-auto backdrop-blur-md shadow-[0_-8px_30px_rgba(60,58,50,0.04)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Left Side: Logo, description, and authorship */}
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

          {/* Right Side: Social links and GitHub button */}
          <div className="flex gap-8 sm:gap-12 items-stretch">
            {/* SOCIAL Section */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider font-geist">
                Social
              </span>
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
                    )
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
                    )
                  },
                  {
                    name: 'X / Twitter',
                    href: 'https://x.com/martinxmathew',
                    icon: (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    )
                  }
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
                    <span className="opacity-0 group-hover:opacity-100 transition-smooth translate-y-0.5 group-hover:translate-y-0 group-hover:translate-x-0.5 text-[9px]">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Vertical Separator */}
            <div className="border-l border-borders/40 self-stretch my-1" />

            {/* GITHUB Section */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-charcoal uppercase tracking-wider font-geist">
                Github
              </span>
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
                  <span className="opacity-0 group-hover:opacity-100 transition-smooth translate-y-0.5 group-hover:translate-y-0 group-hover:translate-x-0.5 text-[9px]">
                    ↗
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
