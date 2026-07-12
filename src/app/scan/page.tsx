'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThreeCube from '@/components/ThreeCube';
import CubeOverlay from '@/components/CubeOverlay';
import Scanner from '@/components/Scanner';
import SolverControls from '@/components/SolverControls';
import { useSolver } from '@/hooks/useSolver';
import {
  CubeState,
  DEFAULT_SOLVED_STATE,
  cubeStateToFaceletString,
  validateCubeState,
  CubeColor,
  FaceName,
} from '@/lib/cubeState';
import { Info, Layers, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ScanView = 'scanning' | 'reviewing' | 'solving';

export default function ScanPage() {
  const router = useRouter();

  const [scanView, setScanView] = useState<ScanView>('scanning');
  const [cubeState, setCubeState] = useState<CubeState>(DEFAULT_SOLVED_STATE);
  const [scrambleState, setScrambleState] = useState<CubeState>(DEFAULT_SOLVED_STATE);

  const [activeMove, setActiveMove] = useState<string | null>(null);
  const [moveDirection, setMoveDirection] = useState<'forward' | 'backward'>('forward');
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [solutionStr, setSolutionStr] = useState<string>('');

  const [isEditing2D, setIsEditing2D] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { isSolving, solveCube } = useSolver();

  // Auto-dismiss validation error toast after 6 seconds
  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => {
        setValidationError(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [validationError]);

  // Reset scrambled state hook for SolverControls
  useEffect(() => {
    (window as any)._resetToScrambled = () => {
      setCubeState(scrambleState);
      setActiveMove(null);
    };
    return () => { delete (window as any)._resetToScrambled; };
  }, [scrambleState]);

  const handle3DMoveComplete = () => {
    if ((window as any)._on3DMoveComplete) {
      (window as any)._on3DMoveComplete();
    }
  };

  const handleScanComplete = (scannedState: CubeState) => {
    setScrambleState(scannedState);
    setCubeState(scannedState);
    setValidationError(null);
    setScanView('reviewing');
  };

  const handleStickerClick = (face: FaceName, index: number) => {
    if (index === 4) return; // center locked
    const colors: CubeColor[] = ['white', 'red', 'green', 'yellow', 'orange', 'blue'];
    const nextColorIdx = (colors.indexOf(cubeState[face][index]) + 1) % colors.length;
    const newFaceStickers = [...cubeState[face]];
    newFaceStickers[index] = colors[nextColorIdx];
    const newState = { ...cubeState, [face]: newFaceStickers };
    setCubeState(newState);
    setScrambleState(newState);
  };

  const handleSolve = async () => {
    setValidationError(null);
    const result = validateCubeState(cubeState);
    if (!result.valid) {
      setValidationError(result.reason || 'Invalid cube state');
      return;
    }
    const faceletStr = cubeStateToFaceletString(cubeState);
    try {
      const solution = await solveCube(faceletStr);
      setSolutionStr(solution);
      setScanView('solving');
    } catch (err: any) {
      setValidationError(err.message || 'Solving failed. Please verify sticker colors.');
    }
  };

  const colorMap: Record<string, string> = {
    white: 'bg-cube-white border-borders/40',
    red: 'bg-cube-red/80',
    green: 'bg-cube-green/80',
    yellow: 'bg-cube-yellow/90',
    orange: 'bg-cube-orange/80',
    blue: 'bg-cube-blue/80',
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-6 pt-4 pb-10 w-full flex flex-col gap-6">
      <AnimatePresence mode="wait">

        {/* ── SCANNING VIEW ── */}
        {scanView === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <Scanner
              onScanComplete={handleScanComplete}
              onCancel={() => router.push('/')}
            />
          </motion.div>
        )}

        {/* ── REVIEWING VIEW ── */}
        {scanView === 'reviewing' && (
          <motion.div
            key="reviewing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-6"
          >
            {/* Title bar */}
            <div className="flex items-center justify-between w-full pb-3 border-b border-borders/40">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-xl font-extrabold font-geist tracking-tight text-charcoal">Scan Cube</h2>
                <p className="text-xs text-muted-text">Review the reconstructed cube and generate an optimal solution.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScanView('scanning')}
                  className="flex items-center gap-1.5 px-4 py-2 border border-borders text-xs font-bold font-geist rounded-full text-charcoal hover:bg-charcoal/5 transition-smooth cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retake Scan
                </button>
                <button
                  onClick={() => setIsEditing2D(!isEditing2D)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-charcoal text-white text-xs font-bold font-geist rounded-full hover:bg-charcoal/90 transition-smooth cursor-pointer shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {isEditing2D ? 'Hide 2D Editor' : '2D Paint Editor'}
                </button>
              </div>
            </div>

            {/* Main grid: 7/5 split */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch w-full">

              {/* Left: 3D Cube / 2D Paint Editor */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <AnimatePresence mode="wait">
                  {!isEditing2D ? (
                    <motion.div
                      key="3d-cube"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-3"
                    >
                      <div className="rounded-3xl overflow-hidden border border-borders/50 bg-white/40 shadow-sm">
                        <ThreeCube
                          cubeState={cubeState}
                          currentMove={null}
                          onMoveComplete={() => {}}
                          animationSpeed={1}
                          onStickerClick={handleStickerClick}
                          isEditMode={true}
                          className="w-full h-[480px] lg:h-[540px]"
                          showHint={false}
                        />
                      </div>
                      <p className="text-[11px] text-muted-text text-center">
                        Click any sticker on the 3D cube to cycle its color, or use the 2D Paint Editor for flat grid paint.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="2d-editor"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-3"
                    >
                      <div className="rounded-3xl overflow-hidden border border-borders/50 bg-white/40 shadow-sm p-4 flex items-center justify-center min-h-[480px] lg:h-[540px] overflow-y-auto">
                        <CubeOverlay cubeState={cubeState} onChange={(ns) => {
                          setCubeState(ns);
                          setScrambleState(ns);
                        }} />
                      </div>
                      <p className="text-[11px] text-muted-text text-center">
                        Use the 2D Net Paint Editor to paint colors. Click "Hide 2D Editor" to return to 3D.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right: Dashboard */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1 pb-3 border-b border-borders/40">
                  <h3 className="text-base font-extrabold font-geist text-charcoal">Solve Dashboard</h3>
                  <p className="text-xs text-muted-text">Parity verification &amp; solution engine.</p>
                </div>


                {/* Verification Parameters */}
                <div className="p-4 bg-white/70 rounded-2xl border border-borders/60 flex flex-col gap-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text font-geist">Verify Parameters</span>
                  <div className="flex flex-col gap-2">
                    {[
                      {
                        label: 'Unique centers (6)',
                        pass: new Set([cubeState.U[4], cubeState.D[4], cubeState.L[4], cubeState.R[4], cubeState.F[4], cubeState.B[4]]).size === 6,
                      },
                      {
                        label: '9 stickers per color',
                        pass: Object.values(cubeState).flatMap(x => x).reduce((acc: Record<string, number>, curr) => {
                          acc[curr] = (acc[curr] || 0) + 1; return acc;
                        }, {} as Record<string, number>).white === 9,
                      },
                    ].map(({ label, pass }) => (
                      <div key={label} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-charcoal/[0.03] border border-borders/30">
                        <span className="text-xs font-medium text-charcoal/80">{label}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pass ? 'bg-success/10 text-success' : 'bg-cube-red/10 text-cube-red'}`}>
                          {pass ? '✓ Pass' : '✗ Fail'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sticker count */}
                <div className="p-4 bg-white/70 rounded-2xl border border-borders/60 flex flex-col gap-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text font-geist">Sticker Count</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['white', 'red', 'green', 'yellow', 'orange', 'blue'] as const).map((color) => {
                      const count = Object.values(cubeState).flatMap(x => x).filter(c => c === color).length;
                      return (
                        <div key={color} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-charcoal/[0.03] border border-borders/30">
                          <div className={`w-5 h-5 rounded-md border ${colorMap[color]}`} />
                          <span className={`text-xs font-bold ${count === 9 ? 'text-success' : 'text-cube-red'}`}>{count}/9</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 pt-4">
                  {isSolving ? (
                    <div className="py-3.5 bg-charcoal text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2">
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
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SOLVING VIEW ── */}
        {scanView === 'solving' && (
          <motion.div
            key="solving"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid md:grid-cols-12 gap-8 items-start w-full"
          >
            {/* Left: 3D Animated Canvas */}
            <div className="md:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-lg font-bold font-geist">Interactive 3D Solver</h3>
                  <p className="text-xs text-muted-text">Play, pause, or step through moves at your own speed.</p>
                </div>
                <button
                  onClick={() => { setCubeState(scrambleState); setActiveMove(null); }}
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
                showHint={false}
              />
            </div>

            {/* Right: Playback Controls */}
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
                  setScanView('scanning');
                }}
                className="w-full py-3 border border-borders text-xs font-bold rounded-2xl text-charcoal hover:bg-charcoal/5 bg-white shadow-sm transition-smooth cursor-pointer"
              >
                Scan a New Cube
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Toast Notification for Verification Failure */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, x: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 w-full max-w-sm bg-white/95 backdrop-blur-md border border-cube-red/20 shadow-2xl rounded-2xl p-4 flex items-start gap-3.5 neo-card"
          >
            <div className="p-2 bg-cube-red/10 border border-cube-red/20 rounded-xl text-cube-red shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-xs font-bold font-geist text-charcoal">Verification Failed</span>
              <span className="text-[11px] leading-relaxed text-muted-text">{validationError}</span>
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="p-1 text-muted-text hover:text-charcoal rounded-lg hover:bg-charcoal/5 transition-smooth cursor-pointer shrink-0 mt-0.5"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
