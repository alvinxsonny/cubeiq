import React, { useState, useEffect, useRef } from 'react';
import { CubeState, applyMoveToState, invertMove } from '@/lib/cubeState';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Info, RefreshCw, Sparkles } from 'lucide-react';

interface SolverControlsProps {
  solutionStr: string;
  cubeState: CubeState;
  onCubeStateChange: (state: CubeState) => void;
  activeMove: string | null;
  setActiveMove: (move: string | null) => void;
  onMoveDirectionChange: (direction: 'forward' | 'backward') => void;
  moveDirection: 'forward' | 'backward';
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  className?: string;
  onResetCamera?: () => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 4];

// Helper: Translate standard move notation to human-friendly text
function getMoveDescription(move: string): string {
  if (!move) return '';
  const base = move[0];
  const isPrime = move.includes("'");
  const isDouble = move.includes('2');

  const faceNames: Record<string, string> = {
    U: 'Top (White)',
    D: 'Bottom (Yellow)',
    L: 'Left (Orange)',
    R: 'Right (Red)',
    F: 'Front (Green)',
    B: 'Back (Blue)',
  };

  const face = faceNames[base] || base;
  let direction = '90° clockwise';
  if (isPrime) direction = '90° counter-clockwise';
  if (isDouble) direction = '180° (twice)';

  return `Turn the ${face} face ${direction}.`;
}

export default function SolverControls({
  solutionStr,
  cubeState,
  onCubeStateChange,
  activeMove,
  setActiveMove,
  onMoveDirectionChange,
  moveDirection,
  animationSpeed,
  setAnimationSpeed,
  className = '',
  onResetCamera,
}: SolverControlsProps) {
  const moves = solutionStr.trim() ? solutionStr.split(/\s+/) : [];
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [solveMode, setSolveMode] = useState<'full' | 'step'>('full');

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  // Handle external solution resets
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [solutionStr]);

  // Autoplay handler
  useEffect(() => {
    if (!isPlaying) return;

    let timer: NodeJS.Timeout;

    const triggerNext = () => {
      if (currentStepRef.current < moves.length && !activeMove) {
        onMoveDirectionChange('forward');
        setActiveMove(moves[currentStepRef.current]);
      } else if (currentStepRef.current >= moves.length) {
        setIsPlaying(false);
      }
    };

    // Trigger check immediately if not animating
    if (!activeMove) {
      timer = setTimeout(triggerNext, 150);
    }

    return () => clearTimeout(timer);
  }, [isPlaying, activeMove, moves.length]);

  // Callback from 3D Cube when turn animation finishes
  const handleMoveComplete = () => {
    if (!activeMove) return;

    if (moveDirection === 'forward') {
      const stepMove = moves[currentStep];
      const nextState = applyMoveToState(cubeState, stepMove);
      onCubeStateChange(nextState);
      setCurrentStep((s) => s + 1);
    } else {
      const stepMove = moves[currentStep - 1];
      const inverse = invertMove(stepMove);
      const nextState = applyMoveToState(cubeState, inverse);
      onCubeStateChange(nextState);
      setCurrentStep((s) => s - 1);
    }

    setActiveMove(null);
  };

  // Expose handles or hook complete
  useEffect(() => {
    // Register the completion handler globally or share it via callback
    (window as any)._on3DMoveComplete = handleMoveComplete;
    return () => {
      delete (window as any)._on3DMoveComplete;
    };
  }, [currentStep, activeMove, moveDirection, cubeState]);

  const stepForward = () => {
    if (currentStep < moves.length && !activeMove) {
      setIsPlaying(false);
      onMoveDirectionChange('forward');
      setActiveMove(moves[currentStep]);
    }
  };

  const stepBackward = () => {
    if (currentStep > 0 && !activeMove) {
      setIsPlaying(false);
      onMoveDirectionChange('backward');
      const stepMove = moves[currentStep - 1];
      const inverse = invertMove(stepMove);
      setActiveMove(inverse);
    }
  };

  const repeatMove = () => {
    if (currentStep > 0 && !activeMove) {
      const lastMove = moves[currentStep - 1];
      const inverse = invertMove(lastMove);
      const resetState = applyMoveToState(cubeState, inverse);
      onCubeStateChange(resetState);
      setCurrentStep((s) => s - 1);
      setTimeout(() => {
        onMoveDirectionChange('forward');
        setActiveMove(lastMove);
      }, 80);
    }
  };

  useEffect(() => {
    if (solveMode !== 'step') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        stepForward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [solveMode, currentStep, activeMove, moves.length]);

  const togglePlay = () => {
    if (currentStep >= moves.length) {
      // Loop back if reached the end
      setCurrentStep(0);
      setIsPlaying(true);
      onResetCamera?.();
    } else {
      const nextPlaying = !isPlaying;
      setIsPlaying(nextPlaying);
      if (nextPlaying) {
        onResetCamera?.();
      }
    }
  };

  const restartSolve = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setActiveMove(null);
    // Reset cube back to original state. The parent page should store the starting scrambled state!
    if ((window as any)._resetToScrambled) {
      (window as any)._resetToScrambled();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(solutionStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTextFile = () => {
    const element = document.createElement("a");
    const file = new Blob([solutionStr], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "cubeiq_solution.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const progressPercent = moves.length > 0 ? (currentStep / moves.length) * 100 : 0;

  return (
    <div className={`flex flex-col gap-3.5 p-4.5 bg-white/40 border border-borders/50 rounded-3xl w-full max-w-2xl mx-auto shadow-sm select-none ${className}`}>
      <div className="flex items-center justify-between border-b border-borders/40 pb-2.5">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-extrabold font-geist text-charcoal">Solving Steps</h3>
          <span className="text-[10px] text-muted-text uppercase font-semibold tracking-wider font-mono">
            {currentStep} / {moves.length} moves • Optimal (Kociemba)
          </span>
        </div>
      </div>

      {/* Segmented Mode Selector */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-charcoal/5 rounded-2xl border border-borders/60">
        <button
          onClick={() => {
            setSolveMode('full');
            setIsPlaying(false);
          }}
          className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            solveMode === 'full' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal'
          }`}
        >
          <span>See Full Solve</span>
        </button>
        <button
          onClick={() => {
            setSolveMode('step');
            setIsPlaying(false);
            onResetCamera?.();
          }}
          className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            solveMode === 'step' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal'
          }`}
        >
          <span>Step-by-Step</span>
        </button>
      </div>

      {/* Highlighted Orientation Guide Card */}
      <div className="p-4 bg-accent-orange/10 border-2 border-accent-orange rounded-2xl flex flex-col gap-1.5 shadow-md relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-accent-orange/20 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center gap-2 z-10">
          <div className="p-1 bg-accent-orange text-white rounded-lg">
            <Info className="w-3.5 h-3.5 fill-none stroke-current" />
          </div>
          <span className="text-[10px] uppercase font-extrabold text-accent-orange tracking-wider font-geist">How to Hold Your Cube</span>
        </div>
        <p className="text-xs font-semibold text-charcoal leading-relaxed z-10">
          Hold your cube with <strong className="text-success font-extrabold font-geist">Green facing you</strong> and <strong className="text-charcoal font-extrabold font-geist underline">White on top</strong>. Keep this holding orientation constant throughout all step moves.
        </p>
      </div>

      {/* Highlighted Solve Plan Card */}
      <div className="p-4 bg-cube-blue/10 border-2 border-cube-blue rounded-2xl flex flex-col gap-1.5 shadow-md relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-cube-blue/20 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center gap-2 z-10">
          <div className="p-1 bg-cube-blue text-white rounded-lg">
            <Sparkles className="w-3.5 h-3.5 fill-none stroke-current" />
          </div>
          <span className="text-[10px] uppercase font-extrabold text-cube-blue tracking-wider font-geist">Optimal Solve Plan</span>
        </div>
        <p className="text-xs font-semibold text-charcoal leading-relaxed z-10">
          This solve can be completed in <strong className="text-cube-blue font-extrabold font-geist">{moves.length} moves</strong> using the optimal <strong className="font-extrabold font-geist">Kociemba algorithm</strong>.
        </p>
      </div>

      {/* Algorithm Flow / Move Sequence (Show full sequence - Moved below Solve Plan) */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-borders/30">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text font-geist">Move Sequence</span>
          {solveMode === 'step' && (
            <span className="text-[9px] text-accent-orange font-bold font-geist animate-pulse">Tip: Press Enter to step</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 p-4 bg-charcoal/5 rounded-2xl border border-borders/60 max-h-[115px] overflow-y-auto">
          {moves.length === 0 ? (
            <span className="text-xs text-muted-text italic">No algorithm loaded</span>
          ) : (
            moves.map((move, idx) => {
              const isCurrent = idx === currentStep;
              const isPassed = idx < currentStep;

              return (
                <span
                  key={`${move}-${idx}`}
                  className={`
                    px-2 py-1 rounded-md text-xs font-bold font-jetbrains border transition-all duration-200
                    ${isCurrent ? 'bg-accent-orange border-accent-orange text-white scale-105 shadow-sm' : ''}
                    ${isPassed ? 'bg-charcoal/15 border-transparent text-charcoal/50' : ''}
                    ${!isCurrent && !isPassed ? 'bg-white border-borders text-charcoal' : ''}
                  `}
                >
                  {move}
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full flex flex-col gap-2 my-0.5">
        <div className="w-full h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-orange rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Dynamic Controls based on Solve Mode */}
      <div className="py-2 border-t border-borders/30 pt-3 mt-1">
        {solveMode === 'full' ? (
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-4 bg-charcoal text-white rounded-2xl cursor-pointer flex items-center justify-center neo-btn h-13 w-13 shrink-0"
                title={isPlaying ? 'Pause solve' : 'Play animation'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              {/* Restart (Close to play button!) */}
              <button
                onClick={restartSolve}
                disabled={currentStep === 0 && !activeMove}
                className="p-4 bg-white text-charcoal rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-2 border-charcoal flex items-center justify-center neo-btn h-13 w-13 shrink-0"
                title="Restart solve"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Speed Controls inside container (Improved UI) */}
            <div className="flex items-center gap-1 p-1 bg-charcoal/5 rounded-2xl border border-borders/60 h-13 px-2 shrink-0">
              {SPEED_OPTIONS.map((spd) => (
                <button
                  key={spd}
                  onClick={() => setAnimationSpeed(spd)}
                  className={`
                    px-3.5 py-1.5 text-xs font-extrabold font-geist rounded-xl transition-all duration-200 cursor-pointer
                    ${animationSpeed === spd ? 'bg-charcoal text-white shadow-md scale-105' : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'}
                  `}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {/* Reset Cube (Takes full width, resets sequence as well) */}
            <button
              onClick={restartSolve}
              disabled={currentStep === 0 && !activeMove}
              className="w-full py-3.5 bg-white text-charcoal border-2 border-charcoal font-bold text-xs rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 neo-btn"
              title="Reset cube and sequence to start"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Cube to Start</span>
            </button>

            <div className="grid grid-cols-2 gap-3 w-full">
              {/* Repeat button */}
              <button
                onClick={repeatMove}
                disabled={currentStep === 0 || activeMove !== null}
                className="py-3.5 bg-white text-charcoal border border-borders/60 font-bold text-xs rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 neo-btn-sm"
                title="Repeat last move"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Repeat Move</span>
              </button>

              {/* Next Step / Enter keyboard key hint */}
              <button
                onClick={stepForward}
                disabled={currentStep >= moves.length || activeMove !== null}
                className="py-3.5 bg-charcoal text-white font-bold text-xs rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 neo-btn"
                title="Next move (Press Enter)"
              >
                <span>Next Move</span>
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
