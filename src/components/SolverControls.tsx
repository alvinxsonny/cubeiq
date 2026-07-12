import React, { useState, useEffect, useRef } from 'react';
import { CubeState, applyMoveToState, invertMove } from '@/lib/cubeState';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Copy, Download, Info } from 'lucide-react';

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
}: SolverControlsProps) {
  const moves = solutionStr.trim() ? solutionStr.split(/\s+/) : [];
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

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

  const togglePlay = () => {
    if (currentStep >= moves.length) {
      // Loop back if reached the end
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
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
    <div className="flex flex-col gap-6 p-6 glass-card rounded-3xl w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-borders/50 pb-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-lg font-bold font-geist">Solving Steps</h3>
          <span className="text-[10px] text-muted-text uppercase font-semibold tracking-wider font-mono">
            {currentStep} / {moves.length} moves • Difficulty: Optimal (Kociemba)
          </span>
        </div>
        
        {/* Speed Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-charcoal/5 rounded-xl border border-borders/50">
          {SPEED_OPTIONS.map((spd) => (
            <button
              key={spd}
              onClick={() => setAnimationSpeed(spd)}
              className={`
                px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer
                ${animationSpeed === spd ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal'}
              `}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Orientation Guide Card */}
      <div className="p-4 bg-accent-orange/5 border border-accent-orange/15 rounded-2xl flex flex-col gap-1.5 shadow-sm">
        <span className="text-[10px] uppercase font-bold text-accent-orange tracking-wider font-geist">How to Hold Your Cube</span>
        <p className="text-xs font-semibold text-charcoal leading-normal">
          Hold your cube with <span className="text-success font-bold font-geist">Green facing you</span> and <span className="text-charcoal font-bold font-geist underline">White on top</span>. Keep this holding orientation constant throughout all step moves.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full flex flex-col gap-2">
        <div className="w-full h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-orange rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Active Navigation HUD */}
      <div className="flex items-center justify-center gap-4 py-2">
        <button
          onClick={restartSolve}
          disabled={currentStep === 0 && !activeMove}
          className="p-3 bg-white text-charcoal rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer neo-btn-sm"
          title="Restart solve"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={stepBackward}
          disabled={currentStep === 0 || activeMove !== null}
          className="p-3 bg-white text-charcoal rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer neo-btn-sm"
          title="Previous move"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="p-5 bg-charcoal text-white rounded-2xl cursor-pointer flex items-center justify-center neo-btn"
          title={isPlaying ? 'Pause solve' : 'Play animation'}
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
        </button>

        <button
          onClick={stepForward}
          disabled={currentStep >= moves.length || activeMove !== null}
          className="p-3 bg-white text-charcoal rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer neo-btn-sm"
          title="Next move"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Current Move Description */}
      {moves.length > 0 && (
        <div className="p-4 bg-charcoal/5 border border-borders/60 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-text tracking-wider font-geist">
              {currentStep >= moves.length ? 'Solved!' : `Active Step (${currentStep + 1} of ${moves.length})`}
            </span>
            {currentStep < moves.length && (
              <span className="px-2 py-0.5 bg-accent-orange text-white text-xs font-bold rounded-lg font-mono">
                {moves[currentStep]}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-charcoal leading-normal">
            {currentStep >= moves.length
              ? "Congratulations! The Rubik's cube is fully solved."
              : getMoveDescription(moves[currentStep])}
          </p>
        </div>
      )}

      {/* Algorithm Flow */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text font-geist">Move Sequence</span>
        <div className="flex flex-wrap items-center gap-2 p-4 bg-charcoal/5 rounded-2xl border border-borders/60 max-h-[140px] overflow-y-auto">
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
                    px-2 py-1 rounded-md text-sm font-bold font-jetbrains border transition-all duration-200
                    ${isCurrent ? 'bg-accent-orange border-accent-orange text-white scale-110 shadow-sm' : ''}
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

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-borders/50 pt-4 mt-2">
        <div className="flex items-center gap-1 text-[10px] text-muted-text font-semibold font-geist">
          <Info className="w-3.5 h-3.5 text-accent-orange" />
          <span>Optimal solver completed in {moves.length} turns.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 bg-white text-[10px] font-bold rounded-xl text-charcoal cursor-pointer flex items-center gap-1.5 neo-btn-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={downloadTextFile}
            className="px-3 py-1.5 bg-white text-[10px] font-bold rounded-xl text-charcoal cursor-pointer flex items-center gap-1.5 neo-btn-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
