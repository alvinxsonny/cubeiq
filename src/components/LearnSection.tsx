import React, { useState, useRef } from 'react';
import { BookOpen, GraduationCap, Search, Cpu, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotationItem {
  key: string;
  name: string;
  desc: string;
}

interface NotationGroup {
  title: string;
  description: string;
  items: NotationItem[];
}

const NOTATION_GROUPS: NotationGroup[] = [
  {
    title: 'Face Turns',
    description: 'The basic moves turn a single outer layer clockwise (looking directly at that face), counter-clockwise (prime), or twice (double).',
    items: [
      { key: 'R', name: 'Right (R)', desc: 'Turn the right layer clockwise (upward).' },
      { key: "R'", name: "Right Prime (R')", desc: 'Turn the right layer counter-clockwise (downward).' },
      { key: 'R2', name: 'Right Double (R2)', desc: 'Turn the right layer twice.' },
      { key: 'L', name: 'Left (L)', desc: 'Turn the left layer clockwise (downward).' },
      { key: "L'", name: "Left Prime (L')", desc: 'Turn the left layer counter-clockwise (upward).' },
      { key: 'L2', name: 'Left Double (L2)', desc: 'Turn the left layer twice.' },
      { key: 'U', name: 'Up (U)', desc: 'Turn the top layer clockwise (leftward).' },
      { key: "U'", name: "Up Prime (U')", desc: 'Turn the top layer counter-clockwise (rightward).' },
      { key: 'U2', name: 'Up Double (U2)', desc: 'Turn the top layer twice.' },
      { key: 'D', name: 'Down (D)', desc: 'Turn the bottom layer clockwise (rightward).' },
      { key: "D'", name: "Down Prime (D')", desc: 'Turn the bottom layer counter-clockwise (leftward).' },
      { key: 'D2', name: 'Down Double (D2)', desc: 'Turn the bottom layer twice.' },
      { key: 'F', name: 'Front (F)', desc: 'Turn the front face clockwise.' },
      { key: "F'", name: "Front Prime (F')", desc: 'Turn the front face counter-clockwise.' },
      { key: 'F2', name: 'Front Double (F2)', desc: 'Turn the front face twice.' },
      { key: 'B', name: 'Back (B)', desc: 'Turn the back layer clockwise looking at the back face.' },
      { key: "B'", name: "Back Prime (B')", desc: 'Turn the back layer counter-clockwise looking at the back face.' },
      { key: 'B2', name: 'Back Double (B2)', desc: 'Turn the back layer twice.' },
    ],
  },
  {
    title: 'Wide Moves',
    description: 'Wide moves turn two layers at once. They are written in lowercase or followed by a "w".',
    items: [
      { key: 'Uw', name: 'Wide Up (Uw / u)', desc: 'Turn the top two layers clockwise.' },
      { key: "Uw'", name: "Wide Up Prime (Uw' / u')", desc: 'Turn the top two layers counter-clockwise.' },
      { key: 'Uw2', name: 'Wide Up Double (Uw2 / u2)', desc: 'Turn the top two layers twice.' },
      { key: 'Dw', name: 'Wide Down (Dw / d)', desc: 'Turn the bottom two layers clockwise.' },
      { key: "Dw'", name: "Wide Down Prime (Dw' / d')", desc: 'Turn the bottom two layers counter-clockwise.' },
      { key: 'Dw2', name: 'Wide Down Double (Dw2 / d2)', desc: 'Turn the bottom two layers twice.' },
      { key: 'Rw', name: 'Wide Right (Rw / r)', desc: 'Turn the right two layers clockwise.' },
      { key: "Rw'", name: "Wide Right Prime (Rw' / r')", desc: 'Turn the right two layers counter-clockwise.' },
      { key: 'Rw2', name: 'Wide Right Double (Rw2 / r2)', desc: 'Turn the right two layers twice.' },
      { key: 'Lw', name: 'Wide Left (Lw / l)', desc: 'Turn the left two layers clockwise.' },
      { key: "Lw'", name: "Wide Left Prime (Lw' / l')", desc: 'Turn the left two layers counter-clockwise.' },
      { key: 'Lw2', name: 'Wide Left Double (Lw2 / l2)', desc: 'Turn the left two layers twice.' },
      { key: 'Fw', name: 'Wide Front (Fw / f)', desc: 'Turn the front two layers clockwise.' },
      { key: "Fw'", name: "Wide Front Prime (Fw' / f')", desc: 'Turn the front two layers counter-clockwise.' },
      { key: 'Fw2', name: 'Wide Front Double (Fw2 / f2)', desc: 'Turn the front two layers twice.' },
      { key: 'Bw', name: 'Wide Back (Bw / b)', desc: 'Turn the back two layers clockwise.' },
      { key: "Bw'", name: "Wide Back Prime (Bw' / b')", desc: 'Turn the back two layers counter-clockwise.' },
      { key: 'Bw2', name: 'Wide Back Double (Bw2 / b2)', desc: 'Turn the back two layers twice.' },
    ],
  },
  {
    title: 'Cube Rotations',
    description: 'Rotations rotate the entire cube in space without changing any of the stickers relative to each other.',
    items: [
      { key: 'x', name: 'Rotate X (x)', desc: 'Rotate the entire cube upward (following R).' },
      { key: "x'", name: "Rotate X Prime (x')", desc: 'Rotate the entire cube downward (following R\').' },
      { key: 'x2', name: 'Rotate X Double (x2)', desc: 'Rotate the entire cube twice around the X axis.' },
      { key: 'y', name: 'Rotate Y (y)', desc: 'Rotate the entire cube to the left (following U).' },
      { key: "y'", name: "Rotate Y Prime (y')", desc: 'Rotate the entire cube to the right (following U\').' },
      { key: 'y2', name: 'Rotate Y Double (y2)', desc: 'Rotate the entire cube twice around the Y axis.' },
      { key: 'z', name: 'Rotate Z (z)', desc: 'Rotate the entire cube clockwise (following F).' },
      { key: "z'", name: "Rotate Z Prime (z')", desc: 'Rotate the entire cube counter-clockwise (following F\').' },
      { key: 'z2', name: 'Rotate Z Double (z2)', desc: 'Rotate the entire cube twice around the Z axis.' },
    ],
  },
  {
    title: 'Slice Moves',
    description: 'Slice moves turn only the middle layer of the cube. The sides remain stationary.',
    items: [
      { key: 'M', name: 'Middle (M)', desc: 'Turn the middle vertical slice downward (following L).' },
      { key: "M'", name: "Middle Prime (M')", desc: 'Turn the middle vertical slice upward (following L\').' },
      { key: 'M2', name: 'Middle Double (M2)', desc: 'Turn the middle vertical slice twice.' },
      { key: 'E', name: 'Equator (E)', desc: 'Turn the middle horizontal slice clockwise looking from bottom (following D).' },
      { key: "E'", name: "Equator Prime (E')", desc: 'Turn the middle horizontal slice counter-clockwise looking from bottom (following D\').' },
      { key: 'E2', name: 'Equator Double (E2)', desc: 'Turn the equator slice twice.' },
      { key: 'S', name: 'Standing (S)', desc: 'Turn the standing vertical slice between Front and Back clockwise (following F).' },
      { key: "S'", name: "Standing Prime (S')", desc: 'Turn the standing vertical slice counter-clockwise (following F\').' },
      { key: 'S2', name: 'Standing Double (S2)', desc: 'Turn the standing vertical slice twice.' },
    ],
  },
];

interface CFOPCase {
  name: string;
  algorithm: string;
}

const TWO_LOOK_OLL: CFOPCase[] = [
  { name: 'Dot', algorithm: "F R U R' U' F' f R U R' U' f'" },
  { name: 'I-Shape', algorithm: "F R U R' U' F'" },
  { name: 'L-Shape', algorithm: "f R U R' U' f'" },
  { name: 'Antisune', algorithm: "R U2 R' U' R U' R'" },
  { name: 'H', algorithm: "R U R' U R U' R' U R U2 R'" },
  { name: 'L', algorithm: "F R' F' r U R U' r'" },
  { name: 'Pi', algorithm: "R U2 R2 U' R2 U' R2 U2 R" },
  { name: 'Sune', algorithm: "R U R' U R U2 R'" },
  { name: 'T', algorithm: "r U R' U' r' F R F'" },
  { name: 'U', algorithm: "R2 D R' U2 R D' R' U2 R'" }
];

const TWO_LOOK_PLL: CFOPCase[] = [
  { name: 'Diagonal', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'" },
  { name: 'Headlights', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'" },
  { name: 'PLL (H)', algorithm: "M2 U M2 U2 M2 U M2" },
  { name: 'PLL (Ua)', algorithm: "R U' R U R U R U' R' U' R2" },
  { name: 'PLL (Ub)', algorithm: "R2 U R U R' U' R' U' R' U R'" },
  { name: 'PLL (Z)', algorithm: "M' U M2 U M2 U M' U2 M2" }
];

const FULL_PLL: CFOPCase[] = [
  { name: 'Aa Perm', algorithm: "x L2 D2 L' U' L D2 L' U L'" },
  { name: 'Ab Perm', algorithm: "x' L2 D2 L U L' D2 L U' L" },
  { name: 'F Perm', algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R" },
  { name: 'Ga Perm', algorithm: "R2 U R' U R' U' R U' R2 U' D R' U R D'" },
  { name: 'Gb Perm', algorithm: "R' U' R U D' R2 U R' U R U' R U' R2 D" },
  { name: 'Gc Perm', algorithm: "R2 U' R U' R U R' U R2 U D' R U' R' D" },
  { name: 'Gd Perm', algorithm: "R U R' U' D R2 U' R U' R' U R' U R2 D'" },
  { name: 'Ja Perm', algorithm: "x R2 F R F' R U2 r' U r U2" },
  { name: 'Jb Perm', algorithm: "R U R' F' R U R' U' R' F R2 U' R'" },
  { name: 'Ra Perm', algorithm: "R U' R' U' R U R D R' U' R D' R' U2 R'" },
  { name: 'Rb Perm', algorithm: "R2 F R U R U' R' F' R U2 R' U2 R" },
  { name: 'T Perm', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'" },
  { name: 'E Perm', algorithm: "x' L' U L D' L' U' L D L' U' L D' L' U L D" },
  { name: 'Na Perm', algorithm: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'" },
  { name: 'Nb Perm', algorithm: "R' U R U' R' F' U' F R U R' F R' F' R U' R" },
  { name: 'V Perm', algorithm: "R' U R' U' y R' F' R2 U' R' U R' F R F" },
  { name: 'Y Perm', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'" },
  { name: 'H Perm', algorithm: "M2 U M2 U2 M2 U M2" },
  { name: 'Ua Perm', algorithm: "M2 U M U2 M' U M2" },
  { name: 'Ub Perm', algorithm: "M2 U' M U2 M' U' M2" },
  { name: 'Z Perm', algorithm: "M' U M2 U M2 U M' U2 M2" }
];

const FULL_OLL: CFOPCase[] = [
  { name: 'OLL 1', algorithm: "R U2 R2 F R F' U2 R' F R F'" },
  { name: 'OLL 2', algorithm: "r U r' U2 r U2 R' U2 R U' r'" },
  { name: 'OLL 3', algorithm: "r' R2 U R' U r U2 r' U M'" },
  { name: 'OLL 4', algorithm: "M U' r U2 r' U' R U' R' M'" },
  { name: 'OLL 5', algorithm: "l' U2 L U L' U l" },
  { name: 'OLL 6', algorithm: "r U2 R' U' R U' r'" },
  { name: 'OLL 7', algorithm: "r U R' U R U2 r'" },
  { name: 'OLL 8', algorithm: "l' U' L U' L' U2 l" },
  { name: 'OLL 9', algorithm: "R U R' U' R' F R2 U R' U' F'" },
  { name: 'OLL 10', algorithm: "R U R' U R' F R F' R U2 R'" },
  { name: 'OLL 11', algorithm: "r U R' U R' F R F' R U2 r'" },
  { name: 'OLL 12', algorithm: "M' R' U' R U' R' U2 R U' R r'" },
  { name: 'OLL 13', algorithm: "F U R U' R2 F' R U R U' R'" },
  { name: 'OLL 14', algorithm: "R' F R U R' F' R F U' F'" },
  { name: 'OLL 15', algorithm: "l' U' l L' U' L U l' U l" },
  { name: 'OLL 16', algorithm: "r U r' R U R' U' r U' r'" },
  { name: 'OLL 17', algorithm: "F R' F' R2 r' U R U' R' U' M'" },
  { name: 'OLL 18', algorithm: "r U R' U R U2 r2 U' R U' R' U2 r" },
  { name: 'OLL 19', algorithm: "r' R U R U R' U' M' R' F R F'" },
  { name: 'OLL 20', algorithm: "r U R' U' M2 U R U' R' U' M'" },
  { name: 'OLL 21', algorithm: "R U2 R' U' R U R' U' R U' R'" },
  { name: 'OLL 22', algorithm: "R U2 R2 U' R2 U' R2 U2 R" },
  { name: 'OLL 23', algorithm: "R2 D' R U2 R' D R U2 R" },
  { name: 'OLL 24', algorithm: "r U R' U' r' F R F'" },
  { name: 'OLL 25', algorithm: "F' r U R' U' r' F R" },
  { name: 'OLL 26', algorithm: "R U2 R' U' R U' R'" },
  { name: 'OLL 27', algorithm: "R U R' U R U2 R'" },
  { name: 'OLL 28', algorithm: "r U R' U' r' R U R U' R'" },
  { name: 'OLL 29', algorithm: "R U R' U' R U' R' F' U' F R U R'" },
  { name: 'OLL 30', algorithm: "F R' F R2 U' R' U' R U R' F2" },
  { name: 'OLL 31', algorithm: "R' U' F U R U' R' F' R" },
  { name: 'OLL 32', algorithm: "L U F' U' L' U L F L'" },
  { name: 'OLL 33', algorithm: "R U R' U' R' F R F'" },
  { name: 'OLL 34', algorithm: "R U R2 U' R' F R U R U' F'" },
  { name: 'OLL 35', algorithm: "R U2 R2 F R F' R U2 R'" },
  { name: 'OLL 36', algorithm: "L' U' L U L F' L' F" },
  { name: 'OLL 37', algorithm: "F R' F' R U R U' R'" },
  { name: 'OLL 38', algorithm: "R U R' U R U2 R' F R U R' U' F'" },
  { name: 'OLL 39', algorithm: "L F' L' U' L U F U' L'" },
  { name: 'OLL 40', algorithm: "R' F R U R' U' F' U R" },
  { name: 'OLL 41', algorithm: "R U R' U R U2 R' F R U R' U' F'" },
  { name: 'OLL 42', algorithm: "R' U2 R U R' U R F R U R' U' F'" },
  { name: 'OLL 43', algorithm: "F' U' L' U L F" },
  { name: 'OLL 44', algorithm: "F U R U' R' F'" },
  { name: 'OLL 45', algorithm: "F R U R' U' F'" },
  { name: 'OLL 46', algorithm: "R' U' R' F R F' R' F R F' U R" },
  { name: 'OLL 47', algorithm: "F' L' U' L U L' U' L U F" },
  { name: 'OLL 48', algorithm: "r U' r2 U r2 U r2 U' r" },
  { name: 'OLL 49', algorithm: "r' U r2 U' r2 U' r2 U r'" },
  { name: 'OLL 50', algorithm: "F U R U' R' U R U' R' F'" },
  { name: 'OLL 51', algorithm: "R U R' U R U' B U' B' R'" },
  { name: 'OLL 52', algorithm: "l' U2 L U L' U' L U L' U l" },
  { name: 'OLL 53', algorithm: "r U2 R' U' R U R' U' R U' r'" },
  { name: 'OLL 54', algorithm: "R' F R U R U' R2 F' R2 U' R' U R U R'" },
  { name: 'OLL 55', algorithm: "R' F R U R' U' F' U R" },
  { name: 'OLL 56', algorithm: "R U R' U' M' U R U' r'" },
  { name: 'OLL 57', algorithm: "R U R' U' r R' U R U' r'" }
];

interface NotationCardProps {
  moveKey: string;
  name: string;
  desc: string;
  isSearchHighlighted: boolean;
  hoverDisabled: boolean;
}

function NotationCard({ moveKey, name, desc, isSearchHighlighted, hoverDisabled }: NotationCardProps) {
  const sanitizedMove = moveKey.replace("'", "_prime");
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (hoverDisabled) return; // Ignore mouse hover when a search is currently playing
    if (videoRef.current) {
      videoRef.current.currentTime = 0; // restart
      videoRef.current.play().catch((err) => {
        console.log('Play on hover failed:', err);
      });
    }
  };

  const handleMouseLeave = () => {
    if (hoverDisabled && isSearchHighlighted) return; // Keep playing search animation
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // reset to solved state
      videoRef.current.load(); // force complete reload & frame repaint to solved state
    }
  };

  return (
    <div
      id={`notation-card-${moveKey}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`p-4 border bg-white rounded-2xl transition-all duration-300 flex flex-row gap-4 items-center select-none group text-left w-full min-h-[110px] ${
        isSearchHighlighted 
          ? 'border-accent-orange bg-accent-orange/10 shadow-md ring-2 ring-accent-orange/20 scale-[1.02]' 
          : `border-borders/50 ${hoverDisabled ? 'pointer-events-none' : 'hover:border-accent-orange/40 hover:bg-accent-orange/5 hover:shadow-sm'}`
      }`}
    >
      {/* Loop video container */}
      <div className="w-[84px] h-[84px] flex-shrink-0 bg-charcoal/5 rounded-xl overflow-hidden border border-borders/30 relative flex items-center justify-center">
        <video
          id={`notation-video-${moveKey}`}
          ref={videoRef}
          src={`/animations/${sanitizedMove}.webm`}
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <span className={`text-sm font-bold font-geist text-charcoal truncate transition-colors ${
          isSearchHighlighted 
            ? 'text-accent-orange' 
            : `${hoverDisabled ? '' : 'group-hover:text-accent-orange'}`
        }`}>
          {name}
        </span>
        <span className="text-xs text-muted-text leading-snug line-clamp-2">
          {desc}
        </span>
      </div>
    </div>
  );
}

// Display image directly on main container without box borders/backgrounds
function BeginnerMethodImage({ num, label, height = 'h-[140px]' }: { num: number; label: string; height?: string }) {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return (
      <div className="w-full text-center py-3 text-xs text-accent-orange font-mono select-none">
        [Image {num}.png: {label}]
      </div>
    );
  }

  return (
    <div className={`w-full flex justify-center py-2 ${height} relative overflow-hidden select-none`}>
      <img
        src={`/beginner-method/${num}.png`}
        alt={label}
        onError={() => setHasError(true)}
        className="h-full object-contain max-w-full"
      />
    </div>
  );
}

// Custom Image slot for God's Algorithm historical/supercomputer images
function GodsAlgorithmImage({ src, label, filename, className = 'w-full max-w-[180px] h-[120px]' }: { src: string; label: string; filename: string; className?: string }) {
  const [hasError, setHasError] = useState(false);
  return (
    <div className={`${className} bg-charcoal/5 border border-borders/20 rounded-2xl relative flex items-center justify-center overflow-hidden flex-shrink-0 group hover:border-accent-orange/40 transition-colors duration-200`}>
      {!hasError ? (
        <img
          src={src}
          alt={label}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover relative z-10"
        />
      ) : null}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-charcoal/[0.01]">
        <span className="text-[10px] font-bold text-accent-orange font-jetbrains">{filename}</span>
        <span className="text-[9px] text-muted-text mt-0.5 leading-tight">{label}</span>
      </div>
    </div>
  );
}

// Custom Image slot for CFOP algorithm tables
function CfopCaseImage({ category, num, label }: { category: string; num: number; label: string }) {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return (
      <div className="w-[72px] h-[72px] bg-charcoal/5 border border-borders/20 rounded-xl flex items-center justify-center text-[11px] text-accent-orange font-mono select-none">
        {num}.png
      </div>
    );
  }
  return (
    <div className="w-[72px] h-[72px] flex items-center justify-center overflow-hidden bg-charcoal/5 rounded-xl border border-borders/10 relative">
      <img
        src={`/cfop/${category}/${num}.png`}
        alt={label}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain relative z-10"
      />
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-charcoal/30 to-transparent my-8 relative flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-charcoal flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-accent-orange" />
      </div>
    </div>
  );
}

function GodsAlgorithmIllustration() {
  return (
    <svg viewBox="0 0 800 300" className="w-full h-auto bg-charcoal/5 rounded-3xl border border-borders/40 p-6 shadow-inner overflow-hidden relative">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff5722" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ff5722" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vectorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff5722" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ff9800" stopOpacity="0.2" />
        </linearGradient>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="4"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path 
            d="M 2,2 L 8,5 L 2,8" 
            fill="none" 
            stroke="#ff5722" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </marker>
      </defs>
      
      {/* Background glow */}
      <circle cx="400" cy="150" r="220" fill="url(#glow)" />
      
      {/* Blueprint grid lines */}
      <g stroke="currentColor" className="text-charcoal" strokeWidth="0.5" opacity="0.04">
        {Array.from({ length: 40 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="300" />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 20} x2="800" y2={i * 20} />
        ))}
      </g>
      
      {/* Connection Links with proper chevrons markers */}
      {/* Phase 1 Arc */}
      <path d="M 210,150 Q 300,80 385,146" fill="none" stroke="url(#vectorGrad)" strokeWidth="2.5" markerEnd="url(#arrow)" />
      
      {/* Phase 2 Arc */}
      <path d="M 450,150 Q 545,80 631,146" fill="none" stroke="url(#vectorGrad)" strokeWidth="2.5" markerEnd="url(#arrow)" />

      {/* Bubbles */}
      {/* G0: Scrambled bubble */}
      <circle cx="150" cy="150" r="60" fill="none" stroke="currentColor" className="text-charcoal" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      
      {/* G1: Oriented bubble */}
      <circle cx="420" cy="150" r="30" fill="none" stroke="currentColor" className="text-charcoal" strokeWidth="1.5" opacity="0.6" />
      
      {/* Solved State bubble */}
      <circle cx="650" cy="150" r="10" fill="#ff5722" stroke="none" />
      <circle cx="650" cy="150" r="16" fill="none" stroke="#ff5722" strokeWidth="1" opacity="0.4" />

      {/* Isometric Cube Visual representations */}
      {/* Scrambled Cube wireframe inside G0 */}
      <g transform="translate(150, 150)" stroke="currentColor" className="text-charcoal/80" strokeWidth="1" fill="none">
        <path d="M 0,-25 L 22,-12 L 0,1 L -22,-12 Z" />
        <path d="M -22,-12 L 0,1 L 0,25 L -22,12 Z" />
        <path d="M 22,-12 L 0,1 L 0,25 L 22,12 Z" />
        <line x1="0" y1="-12" x2="0" y2="1" strokeDasharray="1 1" opacity="0.5" />
      </g>

      {/* Oriented Cube wireframe inside G1 */}
      <g transform="translate(420, 150)" stroke="currentColor" className="text-charcoal" strokeWidth="1" fill="none">
        <path d="M 0,-15 L 13,-7 L 0,1 L -13,-7 Z" />
        <path d="M -13,-7 L 0,1 L 0,15 L -13,7 Z" />
        <path d="M 13,-7 L 0,1 L 0,15 L 13,7 Z" />
      </g>

      {/* Labels - properly spaced under and above the elements */}
      <g fill="currentColor" className="text-charcoal font-sans text-[10px] md:text-[11px] font-bold text-center" textAnchor="middle">
        {/* Nodes labels */}
        <text x="150" y="235">G0: Scrambled Cube</text>
        <text x="150" y="250" className="font-mono font-normal opacity-60 text-[9px] md:text-[10px]">43 Quintillion States</text>
        
        <text x="420" y="200">G1: Oriented Subgroup</text>
        <text x="420" y="215" className="font-mono font-normal opacity-60 text-[9px] md:text-[10px]">20 Billion States</text>
        
        <text x="650" y="182" fill="#ff5722">Solved State</text>
        <text x="650" y="197" className="font-mono font-normal opacity-60 text-[9px] md:text-[10px]">1 Target Configuration</text>

        {/* Phase transition labels */}
        <text x="300" y="90" fill="#ff5722" className="text-[9px] md:text-[10px]">Phase 1: Orient (≤ 12 Moves)</text>
        <text x="545" y="90" fill="#ff5722" className="text-[9px] md:text-[10px]">Phase 2: Permute (≤ 10 Moves)</text>
      </g>
      
      {/* Mathematical Formulas overlay background */}
      <g fill="currentColor" className="text-charcoal/30 font-mono text-[9px]" opacity="0.6">
        <text x="25" y="45">G0 = ⟨U, D, R, L, F, B⟩</text>
        <text x="25" y="60">N = 8! × 3⁷ × 12! × 2¹⁰ / 2</text>
        <text x="580" y="45">G1 = ⟨U, D, R2, L2, F2, B2⟩</text>
        <text x="580" y="60">Max moves d ≤ 20 (God's Number)</text>
      </g>
    </svg>
  );
}

export default function LearnSection() {
  const [activeTab, setActiveTab] = useState<'notation' | 'gods-algorithm' | 'beginner' | 'cfop'>('notation');
  const [activeCfopCat, setActiveCfopCat] = useState<'2look-oll' | '2look-pll' | 'oll' | 'pll'>('2look-oll');
  const [completedAlgs, setCompletedAlgs] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const saved = localStorage.getItem('cubeiq-cfop-progress');
    if (saved) {
      try {
        setCompletedAlgs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse CFOP progress:', e);
      }
    }
  }, []);

  const toggleAlg = (category: string, name: string) => {
    const key = `${category}-${name}`;
    const newStates = { ...completedAlgs, [key]: !completedAlgs[key] };
    setCompletedAlgs(newStates);
    localStorage.setItem('cubeiq-cfop-progress', JSON.stringify(newStates));
  };
  
  const [highlightedSearchKey, setHighlightedSearchKey] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (query: string) => {
    if (!query) return;
    
    // Find matching move key
    const match = NOTATION_GROUPS.flatMap(g => g.items).find(
      item => item.key.toLowerCase() === query.trim().toLowerCase()
    );

    if (match) {
      // 1. If not on notation tab, switch to it
      if (activeTab !== 'notation') {
        setActiveTab('notation');
      }

      // 2. Wait a tick for tab content mounting
      setTimeout(() => {
        const cardEl = document.getElementById(`notation-card-${match.key}`);
        const videoEl = document.getElementById(`notation-video-${match.key}`) as HTMLVideoElement | null;

        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedSearchKey(match.key);

          if (videoEl) {
            videoEl.currentTime = 0;
            videoEl.play().catch(err => console.log('Play on search failed:', err));
          }

          // Clear any existing search timeouts
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
          }

          // Stop playing and clear highlight after 3 seconds
          searchTimeoutRef.current = setTimeout(() => {
            if (videoEl) {
              videoEl.pause();
              videoEl.currentTime = 0;
              videoEl.load();
            }
            setHighlightedSearchKey(null);
          }, 3000);
        }
      }, 80);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e.currentTarget.value);
    }
  };

  // Helper to fetch matching CFOP category lists
  const getCfopList = () => {
    switch (activeCfopCat) {
      case '2look-oll': return TWO_LOOK_OLL;
      case '2look-pll': return TWO_LOOK_PLL;
      case 'oll': return FULL_OLL;
      case 'pll': return FULL_PLL;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 glass-card rounded-3xl w-full max-w-4xl mx-auto min-h-[500px] relative z-20">
      {/* Header with Centered Tabs */}
      <div className="flex justify-center border-b border-borders/50 pb-4 w-full">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setActiveTab('notation')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer
              ${activeTab === 'notation' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'}
            `}
          >
            <BookOpen className="w-4 h-4" />
            Notation Guide
          </button>

          <button
            onClick={() => setActiveTab('gods-algorithm')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer
              ${activeTab === 'gods-algorithm' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'}
            `}
          >
            <Cpu className="w-4 h-4" />
            God's Algorithm
          </button>

          <button
            onClick={() => setActiveTab('beginner')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer
              ${activeTab === 'beginner' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'}
            `}
          >
            <GraduationCap className="w-4 h-4" />
            Beginner Method
          </button>

          <button
            onClick={() => setActiveTab('cfop')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer
              ${activeTab === 'cfop' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'}
            `}
          >
            <Zap className="w-4 h-4" />
            CFOP Method
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Notation Tab */}
        {activeTab === 'notation' && (
          <motion.div
            key="notation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6 w-full"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borders/20 pb-3">
              <div className="flex flex-col gap-1 text-left">
                <h3 className="text-lg font-bold font-geist">Standard Cube Notation</h3>
                <p className="text-xs text-muted-text">
                  Hover over any card below to watch the 3D cube animation play. Grouped logically matching J Perm's cheat sheet.
                </p>
              </div>

              {/* Small Search Bar */}
              <div className="relative w-full md:w-[200px] flex-shrink-0">
                <input
                  type="text"
                  placeholder="Search move (e.g. M', U2)"
                  onKeyDown={handleKeyDown}
                  className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl border border-borders/60 bg-white/50 focus:border-accent-orange focus:outline-none transition-smooth placeholder-muted-text font-jetbrains text-charcoal"
                />
                <Search className="absolute right-2.5 top-2 w-3.5 h-3.5 text-muted-text pointer-events-none" />
              </div>
            </div>

            {NOTATION_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="flex flex-col gap-3 mt-4">
                <div className="flex flex-col gap-1 border-l-4 border-accent-orange pl-3 py-0.5">
                  <h4 className="text-base font-bold text-charcoal font-geist">{group.title}</h4>
                  <p className="text-[11px] text-muted-text">{group.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                  {group.items.map((item) => (
                    <NotationCard
                      key={item.key}
                      moveKey={item.key}
                      name={item.name}
                      desc={item.desc}
                      isSearchHighlighted={highlightedSearchKey === item.key}
                      hoverDisabled={highlightedSearchKey !== null}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* God's Algorithm Tab (Sequential Long-Form Text Layout) */}
        {activeTab === 'gods-algorithm' && (
          <motion.div
            key="gods-algorithm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-8 w-full text-left font-geist"
          >
            <div className="flex flex-col gap-1 border-b border-borders/50 pb-4">
              <h3 className="text-xl font-bold font-geist text-charcoal">God's Algorithm: How Computers Solve the Cube</h3>
              <p className="text-xs text-muted-text mt-1">
                While humans solve the cube using structured algorithms step-by-step, computers analyze the cube's mathematical group theory to discover the absolute shortest path.
              </p>
            </div>

            {/* Glowing SVG Diagram */}
            <div className="w-full">
              <GodsAlgorithmIllustration />
            </div>

            {/* Section 1: The Mathematics */}
            <div className="flex flex-col gap-3">
              <h4 className="text-base font-bold text-charcoal font-geist border-b border-borders/20 pb-1">
                The Math: 43 Quintillion States
              </h4>
              <p className="text-xs text-muted-text leading-relaxed">
                A standard 3x3 Rubik's Cube has exactly <span className="font-bold text-charcoal">43,252,003,274,489,856,000</span> possible configurations (approximately 43 quintillion). 
                This colossal state space is calculated as:
              </p>
              <div className="p-4 bg-charcoal/5 border border-borders/30 rounded-2xl font-mono text-xs text-charcoal/90 text-center max-w-lg mx-auto w-full my-2">
                8! × 3⁷ × 12! × 2¹⁰ / 2
              </div>
              <p className="text-xs text-muted-text leading-relaxed">
                Here is why the math breaks down like this:
              </p>
              <ul className="list-disc list-inside text-xs text-muted-text leading-relaxed flex flex-col gap-2 pl-2">
                <li><span className="font-bold text-charcoal">8! (40,320):</span> There are 8 corner pieces which can be arranged in any position.</li>
                <li><span className="font-bold text-charcoal">3⁷ (2,187):</span> Each corner has 3 orientations. Once 7 corners are oriented, the 8th orientation is locked by parity constraints (hence $3^7$, not $3^8$).</li>
                <li><span className="font-bold text-charcoal">12! (479,001,600):</span> There are 12 edge pieces which can be arranged in any position.</li>
                <li><span className="font-bold text-charcoal">2¹⁰ (1,024):</span> Each edge has 2 orientations. Similar to corners, the 11th edge orientation locks the 12th (hence $2^{10}$, not $2^{11}$).</li>
                <li><span className="font-bold text-charcoal">Division by 2:</span> Due to the physical mechanics of the cube, only half of all mathematically possible configurations can actually be reached by turning the faces. Doing a single corner twist or single edge swap makes the cube unsolvable.</li>
              </ul>
            </div>

            <SectionDivider />

            {/* Section 2: Herbert Kociemba & Two-Phase Solver */}
            <div className="flex flex-col gap-4">
              <h4 className="text-base font-bold text-charcoal font-geist border-b border-borders/20 pb-1">
                The Solver: Herbert Kociemba's Two-Phase Reduction
              </h4>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 flex flex-col items-center gap-1.5 self-stretch justify-center">
                  <GodsAlgorithmImage 
                    src="/gods-algorithm/kociemba.png" 
                    filename="kociemba.png" 
                    label="Herbert Kociemba" 
                    className="w-[150px] h-[220px]"
                  />
                  <span className="text-[9px] text-muted-text italic text-center max-w-[150px]">
                    Herbert Kociemba (1992)
                  </span>
                </div>
                <div className="flex-1 text-xs text-muted-text leading-relaxed flex flex-col gap-3">
                  <p>
                    Searching 43 quintillion states directly using traditional pathfinders is completely impossible, as it would exhaust any computer's RAM in seconds.
                  </p>
                  <p>
                    In 1992, German mathematician <span className="font-bold text-charcoal">Herbert Kociemba</span> resolved this bottleneck by developing the <span className="italic">Two-Phase Solver</span>. Instead of attempting to solve the whole cube at once, the algorithm divides the search space into two mathematical subgroups:
                  </p>
                  <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
                    <li>
                      <span className="font-bold text-charcoal">Phase 1 (Orient Subgroups):</span> Restricts the search space to a subgroup <span className="font-mono text-charcoal">G1</span> where the orientations of all 8 corners and 12 edges are fully solved, and the placement of the 4 middle-layer edges is set. This phase requires at most 12 moves and shrinks the remaining configurations down to just 20 billion.
                    </li>
                    <li>
                      <span className="font-bold text-charcoal">Phase 2 (Solve Rest):</span> Solves the remaining cube states from subgroup <span className="font-mono text-charcoal">G1</span> using only double turns of the faces (<span className="font-mono text-charcoal">R2, L2, F2, B2</span>) and normal <span className="font-mono text-charcoal">U/D</span> turns. This phase requires at most 10 moves.
                    </li>
                  </ul>
                  <p>
                    By splitting the search, Kociemba's algorithm can calculate a near-optimal solution of 21–22 moves in just a few milliseconds on standard consumer laptops!
                  </p>
                </div>
              </div>
            </div>

            <SectionDivider />

            {/* Section 3: Google Supercomputer Proof */}
            <div className="flex flex-col gap-4">
              <h4 className="text-base font-bold text-charcoal font-geist border-b border-borders/20 pb-1">
                God's Number & The Google Supercomputer Proof (2010)
              </h4>
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Left Column: Both Images stacked on the left side */}
                <div className="flex-shrink-0 flex flex-col gap-4 items-center justify-center self-stretch">
                  <div className="flex flex-col items-center gap-1">
                    <GodsAlgorithmImage 
                      src="/gods-algorithm/supercomputer.png" 
                      filename="supercomputer.png" 
                      label="Google Supercomputer cluster" 
                      className="w-[140px] h-[120px]"
                    />
                    <span className="text-[9px] text-muted-text italic text-center max-w-[140px]">
                      Google Server Farm (2010)
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <GodsAlgorithmImage 
                      src="/gods-algorithm/rokicki.png" 
                      filename="rokicki.png" 
                      label="Tomas Rokicki" 
                      className="w-[140px] h-[120px]"
                    />
                    <span className="text-[9px] text-muted-text italic text-center max-w-[140px]">
                      Tomas Rokicki (2010)
                    </span>
                  </div>
                </div>

                {/* Right Column: Paragraph Text */}
                <div className="flex-1 text-xs text-muted-text leading-relaxed flex flex-col gap-3">
                  <p>
                    For decades, the math community debated the exact value of <span className="font-bold text-charcoal">God's Number</span> — the absolute maximum number of moves required to solve the most difficult possible scramble on a 3x3 Rubik's Cube.
                  </p>
                  <p>
                    In July 2010, a research team consisting of <span className="font-bold text-charcoal">Tomas Rokicki</span> (a programmer from Palo Alto who spent 15 years optimizing solver code), <span className="font-bold text-charcoal">Herbert Kociemba</span>, <span className="font-bold text-charcoal">Morley Davidson</span>, and <span className="font-bold text-charcoal">John Dethridge</span> finally solved the mystery.
                  </p>
                  <p>
                    They divided the 43 quintillion possible cube configurations into 2.2 billion cosets. By applying symmetry reduction to eliminate redundant configurations, they ran the remaining sets on <span className="font-bold text-charcoal">Google's idle supercomputer clusters</span>.
                  </p>
                  <p>
                    The computation consumed approximately <span className="font-bold text-charcoal">35 CPU-years</span> of processing time, confirming that <span className="font-bold text-charcoal">every single possible scramble of the Rubik's Cube can be solved in 20 moves or fewer</span>.
                  </p>
                  <p>
                    <span className="font-bold text-charcoal">Tomas Rokicki's Code Optimization:</span> Rokicki wrote optimized solver programs utilizing <span className="font-bold text-charcoal">Iterative Deepening A* (IDA*)</span> search trees. He designed massive RAM-based <span className="font-bold text-charcoal">Pattern Databases</span> that let the supercomputer determine the exact move-distance of subgroups in less than a nanosecond.
                  </p>
                </div>
              </div>
            </div>

            <SectionDivider />

            {/* Section 4: Human vs Computer (Funny & Short Bullet Points) */}
            <div className="flex flex-col gap-3">
              <h4 className="text-base font-bold text-charcoal font-geist border-b border-borders/20 pb-1">
                Why Humans Can't Solve It (Without A Biological System Crash)
              </h4>
              <p className="text-xs text-muted-text leading-relaxed">
                Let's be completely honest: you are not going to be using God's Algorithm. Trying to run this math inside a human brain is a guaranteed recipe for a biological crash:
              </p>
              <ul className="list-disc list-inside text-xs text-muted-text leading-relaxed flex flex-col gap-2 pl-2">
                <li>
                  <span className="font-bold text-charcoal">No Brain-RAM:</span> Computers query gigabytes of precomputed Pattern Databases in RAM. Humans struggle to recall what they had for breakfast, let alone look up 20 billion subgroup orientations.
                </li>
                <li>
                  <span className="font-bold text-charcoal">Cerebral Meltdown:</span> God's Algorithm runs millions of recursive depth-first scans per second. Mentally simulating this would start steaming your skull and require a hard reboot.
                </li>
                <li>
                  <span className="font-bold text-charcoal">Existential Dread Moves:</span> Humans rely on visual safety nets (like keeping layers solved). God's Algorithm will happily break your solved cross and scramble colors temporarily to reach a 20-move solved state, triggering immediate trust issues.
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Beginner Method Tab (Direct Sequential J Perm Layout) */}
        {activeTab === 'beginner' && (
          <motion.div
            key="beginner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-8 w-full text-left font-geist"
          >
            <div className="flex flex-col gap-1 border-b border-borders/50 pb-4">
              <h3 className="text-xl font-bold font-geist text-charcoal">How To Solve The 3x3 Rubik's Cube</h3>
              <p className="text-xs text-muted-text mt-1">
                Dylan Wang's (J Perm) standard layer-by-layer beginner method tutorial. Read sequentially with full illustrations.
              </p>
            </div>

            {/* Step 1 */}
            <div className="flex flex-col gap-5">
              <h4 className="text-lg font-bold text-charcoal font-geist border-b border-borders/20 pb-1">Step 1. White Cross</h4>
              
              <div className="flex flex-col gap-2 items-center w-full">
                <BeginnerMethodImage num={1} label="Hold white center on top → Solve white cross edges" />
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm text-charcoal/80">Hold the white center piece on top, and find an edge in the bottom layer that has white on it.</h5>
                <p><span className="font-bold">Note:</span> An edge piece has 2 colors on it.</p>
                <h5 className="font-bold text-sm text-charcoal/80">Look at the edge piece's other color, and turn the bottom layer so the edge is under the center of the same color.</h5>
                <h5 className="font-bold text-sm text-charcoal/80">Turn that face to bring the edge piece to the top.</h5>
              </div>

              {/* Substep 1.1 */}
              <div className="flex flex-col gap-2 text-xs text-charcoal/90 leading-relaxed">
                <span className="font-bold text-sm text-charcoal/70">Example Turns:</span>
                <div className="flex flex-col items-center w-full mt-1">
                  <BeginnerMethodImage num={2} label="Example turns sequence" />
                </div>
              </div>

              {/* Substep 1.2 */}
              <div className="flex flex-col gap-2 text-xs text-charcoal/90 leading-relaxed">
                <span className="font-bold text-sm text-charcoal/70">Another Example:</span>
                <div className="flex flex-col items-center w-full mt-1">
                  <BeginnerMethodImage num={3} label="Another example turns sequence" />
                </div>
              </div>

              {/* Substep 1.3 */}
              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-2">
                <h5 className="font-bold text-sm">Anytime an edge piece is flipped (example above), fix it by doing the following moves:</h5>
                <div className="flex flex-col items-center w-full mt-1">
                  <BeginnerMethodImage num={4} label="Flipped edge fix moves sequence" />
                </div>
              </div>

              {/* Substep 1.4 */}
              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-2">
                <h5 className="font-bold text-sm">Anytime you find a white edge piece that is not in the bottom layer, you can move it into the bottom by doing the following moves:</h5>
                <div className="flex flex-col items-center w-full mt-1">
                  <BeginnerMethodImage num={5} label="Stuck edge bottom moves sequence" />
                </div>
                <h5 className="font-bold text-sm mt-2">And then solve it like you would for any white edge in the bottom layer.</h5>
                <h5 className="font-bold text-sm text-charcoal/80">Solve all 4 of the white edge pieces to make a cross. Make sure you always look at both colors on each piece so that you end up with the side colors matching as well.</h5>
              </div>
            </div>

            <SectionDivider />

            {/* Step 2 */}
            <div className="flex flex-col gap-5">
              <h4 className="text-lg font-bold text-charcoal font-geist border-b border-borders/20 pb-1">Step 2. First Layer</h4>
              
              <div className="flex flex-col gap-2 items-center w-full">
                <BeginnerMethodImage num={6} label="White cross on bottom → Solved first layer white corners" />
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm">Hold the white cross on the bottom.</h5>
                <h5 className="font-bold text-sm">Before solving anything, do this 4-move sequence repeatedly until you have it memorized. It will be very important later on!</h5>
              </div>

              {/* Right 4-moves */}
              <div className="flex flex-col gap-2 text-xs text-charcoal/90 leading-relaxed">
                <span className="font-bold text-sm text-charcoal/70">Right handed 4-moves:</span>
                <div className="flex flex-col items-center w-full mt-1">
                  <BeginnerMethodImage num={7} label="Right 4-moves sequence" />
                </div>
              </div>

              {/* Left 4-moves */}
              <div className="flex flex-col gap-2 text-xs text-charcoal/90 leading-relaxed">
                <span className="font-bold text-sm text-charcoal/70">Left handed 4-moves:</span>
                <div className="flex flex-col items-center w-full mt-1">
                  <BeginnerMethodImage num={8} label="Left 4-moves sequence" />
                </div>
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm">Now we'll use the 4-moves to solve the first layer.</h5>
                <h5 className="font-bold text-sm">With the cross on the bottom, find a corner piece in the top layer with white on it. Turn the top layer so the surrounding centers match the colors on the corner.</h5>
                <p><span className="font-bold">Note:</span> A corner piece has 3 colors on it.</p>
                
                <div className="flex flex-col items-center w-full">
                  <BeginnerMethodImage num={9} label="Surrounding centers matching corner colors" />
                </div>

                <h5 className="font-bold text-sm">Hold the cube so the corner piece is on the front/right, and repeat the right handed 4-moves until this corner is solved.</h5>

                <div className="flex flex-col items-center w-full">
                  <BeginnerMethodImage num={10} label="Corner solved in slot sequence" />
                </div>

                <h5 className="font-bold text-sm">You can also use the left 4-moves if you hold the piece on the front/left to start.</h5>
                <h5 className="font-bold text-sm">Repeat until all of the first layer corners are solved. If find a white corner incorrectly stuck in the bottom layer, you can bring it into the top layer by holding it on the front/right and doing the right 4-moves.</h5>
              </div>
            </div>

            <SectionDivider />

            {/* Step 3 */}
            <div className="flex flex-col gap-5">
              <h4 className="text-lg font-bold text-charcoal font-geist border-b border-borders/20 pb-1">Step 3. Second Layer</h4>
              
              <div className="flex flex-col gap-2 items-center w-full">
                <BeginnerMethodImage num={11} label="First layer solved → First two layers solved (F2L)" />
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm">Find an edge piece in the top layer without yellow as either of its 2 colors.</h5>
                <h5 className="font-bold text-sm">Turn the top so that it matches a center.</h5>
                <h5 className="font-bold text-sm">Face the piece and check if the top color matches the right center or left center.</h5>
              </div>

              <div className="flex flex-col items-center w-full">
                <BeginnerMethodImage num={12} label="Matches right center / matches left center check" />
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm">If it matches the <span className="underline">right</span> side, do the following moves:</h5>

                <div className="flex flex-col items-center w-full">
                  <BeginnerMethodImage num={13} label="Matches right side algorithm sequence" />
                </div>

                <h5 className="font-bold text-sm mt-2">If it matches the <span className="underline">left</span> side, do the following moves:</h5>

                <div className="flex flex-col items-center w-full">
                  <BeginnerMethodImage num={14} label="Matches left side algorithm sequence" />
                </div>

                <h5 className="font-bold text-sm">Repeat this until all of the 2nd layer edges are solved.</h5>
                <h5 className="font-bold text-sm">If an edge you are looking for is stuck somewhere in the 2nd layer, move any edge into its spot using one of the 2 algorithms above. This will cause the edge to come out into the top layer.</h5>
              </div>
            </div>

            <SectionDivider />

            {/* Step 4 */}
            <div className="flex flex-col gap-5">
              <h4 className="text-lg font-bold text-charcoal font-geist border-b border-borders/20 pb-1">Step 4. Top Cross</h4>
              
              <div className="flex flex-col gap-2 items-center w-full">
                <BeginnerMethodImage num={15} label="F2L solved → Yellow cross solved on top" />
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm">Hold the cube to match one of the following (ignore the corner pieces):</h5>
              </div>

              <div className="flex flex-col items-center w-full">
                <BeginnerMethodImage num={16} label="Top cross cases (Dot / L-Shape / Line / Cross)" />
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm">Then do the following moves:</h5>

                <div className="flex flex-col items-center w-full">
                  <BeginnerMethodImage num={17} label="Top cross algorithm sequence" />
                </div>

                <h5 className="font-bold text-sm">If the cross is not solved yet, hold the cube to match the new case and repeat.</h5>
                <p><span className="font-bold">Note:</span> Focus on the colors on edge pieces, and not corner pieces. If you have 1 or 3 edge pieces facing up, your cube is unsolvable, and needs to be taken apart and reassembled.</p>
              </div>
            </div>

            <SectionDivider />

            {/* Step 5 */}
            <div className="flex flex-col gap-5">
              <h4 className="text-lg font-bold text-charcoal font-geist border-b border-borders/20 pb-1">Step 5. Match Cross Colors</h4>
              
              <div className="flex flex-col gap-2 items-center w-full">
                <BeginnerMethodImage num={18} label="Yellow cross unaligned → Yellow cross aligned with centers" />
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm">Turn the top face until 2 cross pieces match the side color (if all 4 match, you have finished this step!)</h5>
              </div>

              <div className="flex flex-col items-center w-full">
                <BeginnerMethodImage num={19} label="Turn top layer to find matching side edges" />
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm">Hold the 2 matching edges at the back/right. If they are across from each other, hold them in any way.</h5>

                <div className="flex flex-col items-center w-full">
                  <BeginnerMethodImage num={20} label="Adjacent matching (Back/Right) and Opposite matching cases" />
                </div>

                <h5 className="font-bold text-sm">Then do the following moves:</h5>

                <div className="flex flex-col items-center w-full">
                  <BeginnerMethodImage num={21} label="Sune algorithm sequence" />
                </div>

                <h5 className="font-bold text-sm">Turn the top to match all 4 colors. If you can only match 2 colors, then repeat this step.</h5>
              </div>
            </div>

            <SectionDivider />

            {/* Step 6 */}
            <div className="flex flex-col gap-5">
              <h4 className="text-lg font-bold text-charcoal font-geist border-b border-borders/20 pb-1">Step 6. Match Corners</h4>
              
              <div className="flex flex-col gap-2 items-center w-full">
                <BeginnerMethodImage num={22} label="Edges matched, corners unaligned → Corners cycled into correct positions" />
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm">A corner is in the correct position if all 3 colors on the piece match the surrounding colors.</h5>
                <h5 className="font-bold text-sm">Examples of corner pieces in the correct position:</h5>
              </div>

              <div className="flex flex-col items-center w-full">
                <BeginnerMethodImage num={23} label="Corner pieces in the correct position examples" />
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm">If 1 corner is correct, hold it in the front/right (if 0 are correct, hold any corner in the front/right).</h5>
                <h5 className="font-bold text-sm">Then do the following moves:</h5>

                <div className="flex flex-col items-center w-full">
                  <BeginnerMethodImage num={24} label="Nicklas corner cycle algorithm sequence" />
                </div>

                <h5 className="font-bold text-sm">Check if all 4 corners are in the correct position. If not, hold a correct corner on the front/right and repeat.</h5>
                <p><span className="font-bold">Note:</span> If you only have 2 corners in the correct position, your cube is unsolvable, and needs to be taken apart and reassembled.</p>
              </div>
            </div>

            <SectionDivider />

            {/* Step 7 */}
            <div className="flex flex-col gap-5 border-b border-borders/20 pb-4">
              <h4 className="text-lg font-bold text-charcoal font-geist border-b border-borders/20 pb-1">Step 7. Solve the Cube!</h4>
              
              <div className="flex flex-col gap-2 items-center w-full">
                <BeginnerMethodImage num={25} label="Unsolved corners on bottom → Solved Rubik's Cube" />
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm text-accent-orange">It is very easy to make a mistake during this step, so I recommend reading the whole thing, including the common mistakes, before attempting it.</h5>
                <h5 className="font-bold text-sm">Turn the cube over so that the unsolved corners are all in the bottom layer.</h5>
                <p>You may have 2, 3, or 4 unsolved corner pieces.</p>
              </div>

              <div className="flex flex-col items-center w-full">
                <BeginnerMethodImage num={26} label="Bottom view unsolved corner cases" />
              </div>

              <div className="text-xs text-charcoal/90 leading-relaxed flex flex-col gap-3">
                <h5 className="font-bold text-sm">Repeatedly do the 4-move sequence until the front/right corner is solved (has yellow on the bottom).</h5>
                <h5 className="font-bold text-sm">Then turn the bottom layer (not the whole cube) to bring an unsolved corner to the front/right. Repeat until the whole cube is solved.</h5>

                <div className="flex flex-col items-center w-full">
                  <BeginnerMethodImage num={27} label="Orient last layer corners Sexy moves sequence" />
                </div>

                <div className="px-4 py-3 bg-red-500/5 rounded-2xl border border-red-500/10 max-w-3xl">
                  <span className="font-bold text-xs text-red-600">Common mistakes:</span>
                  <ul className="list-disc list-inside mt-1 flex flex-col gap-1 text-[11px] text-muted-text">
                    <li>Turning the whole cube to get the next corner to the bottom/right. <span className="font-bold text-charcoal">Make sure you turn only the bottom layer.</span></li>
                    <li>Not finishing the 4-moves because the corner is solved after 3 moves. <span className="font-bold text-charcoal">Make sure you always finish the 4-moves.</span></li>
                  </ul>
                </div>

                <p className="mt-2"><span className="font-bold">Note:</span> If you only have 1 corner unsolved while the rest of the cube is solved, or if you followed step 7 correctly but it does not work, then your cube is unsolvable, and needs to be taken apart and reassembled.</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="flex flex-col gap-3 mt-4">
              <h4 className="text-lg font-bold text-charcoal font-geist">Next Steps</h4>
              <p className="text-xs text-muted-text leading-relaxed">
                Congrats on solving the Rubik's Cube! With practice, you should be able to do this in a few minutes, or even under 1 minute if you practice a lot. Some people stop there, which is totally fine. But if you want to get even faster, you should learn how to do finger tricks and transition to the speedsolving CFOP Method.
              </p>
            </div>
          </motion.div>
        )}

        {/* CFOP Method Tab */}
        {activeTab === 'cfop' && (
          <motion.div
            key="cfop"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6 w-full text-left font-geist"
          >
            {/* Intro */}
            <div className="flex flex-col gap-2 border-b border-borders/50 pb-4">
              <h3 className="text-xl font-bold font-geist text-charcoal">CFOP Method (Speedsolving)</h3>
              <p className="text-xs text-muted-text leading-relaxed">
                CFOP (sometimes called the Fridrich Method) is the most widely used speedsolving method in the world, originally proposed by David Singmaster in 1980 and popularized by Jessica Fridrich in 1997. In contrast to the beginner method which solves corner-by-corner and edge-by-edge, CFOP uses advanced pattern recognition to solve multiple pieces at once. By mastering the 78 full algorithms of CFOP, speedcubers can reduce their solve times from over a minute to under 10 seconds.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                <div className="p-3 bg-charcoal/5 border border-borders/30 rounded-xl text-center">
                  <div className="text-xs font-bold text-accent-orange font-jetbrains">C - Cross</div>
                  <div className="text-[10px] text-muted-text mt-0.5 leading-tight">Solve 4 edges on bottom (≤ 8 moves)</div>
                </div>
                <div className="p-3 bg-charcoal/5 border border-borders/30 rounded-xl text-center">
                  <div className="text-xs font-bold text-accent-orange font-jetbrains">F - F2L</div>
                  <div className="text-[10px] text-muted-text mt-0.5 leading-tight">First Two Layers solved together (4 pairs)</div>
                </div>
                <div className="p-3 bg-charcoal/5 border border-borders/30 rounded-xl text-center">
                  <div className="text-xs font-bold text-accent-orange font-jetbrains">O - OLL</div>
                  <div className="text-[10px] text-muted-text mt-0.5 leading-tight">Orient top face yellow (57 cases)</div>
                </div>
                <div className="p-3 bg-charcoal/5 border border-borders/30 rounded-xl text-center">
                  <div className="text-xs font-bold text-accent-orange font-jetbrains">P - PLL</div>
                  <div className="text-[10px] text-muted-text mt-0.5 leading-tight">Permute top face solved (21 cases)</div>
                </div>
              </div>
              <p className="text-xs text-accent-orange font-bold leading-relaxed mt-3">
                💡 Tip: Once you have learned a particular algorithm, you can toggle it as &quot;Learnt&quot; by tapping the row itself. This will apply a green progress tint and remember your status.
              </p>
            </div>

            {/* Category Selectors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full border-b border-borders/30 pb-3">
              <button
                onClick={() => setActiveCfopCat('2look-oll')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer w-full text-center ${
                  activeCfopCat === '2look-oll' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'
                }`}
              >
                2-Look OLL
              </button>
              <button
                onClick={() => setActiveCfopCat('2look-pll')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer w-full text-center ${
                  activeCfopCat === '2look-pll' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'
                }`}
              >
                2-Look PLL
              </button>
              <button
                onClick={() => setActiveCfopCat('oll')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer w-full text-center ${
                  activeCfopCat === 'oll' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'
                }`}
              >
                OLL (Full)
              </button>
              <button
                onClick={() => setActiveCfopCat('pll')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer w-full text-center ${
                  activeCfopCat === 'pll' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'
                }`}
              >
                PLL (Full)
              </button>
            </div>

            {/* Category Table */}
            <div className="w-full overflow-hidden border border-borders/40 rounded-2xl bg-white shadow-md">
              <table className="w-full border-collapse text-left text-sm text-charcoal">
                <thead>
                  <tr className="bg-charcoal/5 border-b border-borders/40 font-bold text-muted-text">
                    <th className="px-6 py-4 w-[200px]">Name</th>
                    <th className="px-6 py-4 w-[140px] text-center">Case</th>
                    <th className="px-6 py-4">Algorithm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borders/30">
                  {getCfopList().map((item, idx) => {
                    const isCompleted = !!completedAlgs[`${activeCfopCat}-${item.name}`];
                    return (
                      <tr 
                        key={idx} 
                        onClick={() => toggleAlg(activeCfopCat, item.name)}
                        className={`transition-all duration-200 cursor-pointer select-none active:scale-[0.995] ${
                          isCompleted 
                            ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-l-4 border-l-emerald-500' 
                            : 'hover:bg-charcoal/[0.01] border-l-4 border-l-transparent'
                        }`}
                      >
                        <td className="px-6 py-5 font-bold text-charcoal/90 text-sm">{item.name}</td>
                        <td className="px-6 py-5 flex justify-center">
                          <CfopCaseImage
                            category={activeCfopCat}
                            num={idx + 1}
                            label={item.name}
                          />
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-xs md:text-sm bg-charcoal/5 px-3.5 py-2 rounded-xl border border-borders/20 inline-block font-semibold select-all text-charcoal/95">
                            {item.algorithm}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
