import React, { useState } from 'react';
import { CubeState, CubeColor, FaceName, FACE_COLORS } from '@/lib/cubeState';
import { Lock } from 'lucide-react';

interface CubeOverlayProps {
  cubeState: CubeState;
  onChange: (newState: CubeState) => void;
}

const COLOR_MAP: Record<CubeColor, { bg: string; border: string; label: string }> = {
  white: { bg: 'bg-white', border: 'border-gray-300', label: 'W' },
  yellow: { bg: 'bg-yellow-400', border: 'border-yellow-500', label: 'Y' },
  green: { bg: 'bg-green-600', border: 'border-green-700', label: 'G' },
  blue: { bg: 'bg-blue-600', border: 'border-blue-700', label: 'B' },
  red: { bg: 'bg-red-600', border: 'border-red-700', label: 'R' },
  orange: { bg: 'bg-orange-500', border: 'border-orange-600', label: 'O' },
};

const FACES: { key: FaceName; name: string }[] = [
  { key: 'U', name: 'Up (Top)' },
  { key: 'L', name: 'Left' },
  { key: 'F', name: 'Front' },
  { key: 'R', name: 'Right' },
  { key: 'B', name: 'Back' },
  { key: 'D', name: 'Down (Bottom)' },
];

export default function CubeOverlay({ cubeState, onChange }: CubeOverlayProps) {
  const [selectedColor, setSelectedColor] = useState<CubeColor>('white');

  const handleStickerClick = (face: FaceName, index: number) => {
    // Center stickers (index 4) are fixed
    if (index === 4) return;

    const newFaceStickers = [...cubeState[face]];
    newFaceStickers[index] = selectedColor;

    const newState = {
      ...cubeState,
      [face]: newFaceStickers,
    };
    onChange(newState);
  };

  const handleReset = () => {
    const defaultState: CubeState = {
      U: Array(9).fill('white'),
      R: Array(9).fill('red'),
      F: Array(9).fill('green'),
      D: Array(9).fill('yellow'),
      L: Array(9).fill('orange'),
      B: Array(9).fill('blue'),
    };
    onChange(defaultState);
  };

  const handleClear = () => {
    // Clears all stickers except centers to a blank gray state (or U color)
    const clearedState: CubeState = {
      U: Array(9).fill('white'),
      R: Array(9).fill('white'),
      F: Array(9).fill('white'),
      D: Array(9).fill('white'),
      L: Array(9).fill('white'),
      B: Array(9).fill('white'),
    };
    // Re-set fixed centers
    clearedState.U[4] = 'white';
    clearedState.R[4] = 'red';
    clearedState.F[4] = 'green';
    clearedState.D[4] = 'yellow';
    clearedState.L[4] = 'orange';
    clearedState.B[4] = 'blue';
    onChange(clearedState);
  };

  const renderFaceGrid = (faceKey: FaceName) => {
    const stickers = cubeState[faceKey];
    return (
      <div className="grid grid-cols-3 gap-1.5 p-2 bg-charcoal/5 rounded-xl border border-borders/60 w-32 h-32 relative">
        {stickers.map((color, idx) => {
          const isCenter = idx === 4;
          const colorStyles = COLOR_MAP[color];

          return (
            <button
              key={`${faceKey}-${idx}`}
              onClick={() => handleStickerClick(faceKey, idx)}
              disabled={isCenter}
              className={`
                w-full h-full aspect-square rounded-md relative flex items-center justify-center
                border shadow-sm transition-all duration-200 cursor-pointer
                ${colorStyles.bg} ${colorStyles.border}
                ${isCenter ? 'cursor-not-allowed opacity-90' : 'hover:scale-105 active:scale-95'}
              `}
              title={isCenter ? `Center piece (${faceKey}) - Fixed` : `Click to paint ${selectedColor}`}
            >
              {isCenter && (
                <Lock className="w-3.5 h-3.5 text-charcoal/30 absolute pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 glass-card rounded-3xl w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-semibold font-geist">2D Face Editor</h3>
        <p className="text-xs text-muted-text text-center max-w-sm">
          Select a color from the palette, then tap any sticker to paint. Centers are locked to set the standard orientation.
        </p>
      </div>

      {/* Color Palette */}
      <div className="flex items-center justify-center gap-3 p-3 bg-charcoal/5 rounded-2xl border border-borders/60">
        {(Object.keys(COLOR_MAP) as CubeColor[]).map((color) => {
          const colorStyles = COLOR_MAP[color];
          const isSelected = selectedColor === color;
          return (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`
                w-10 h-10 rounded-xl relative flex items-center justify-center transition-all duration-200 cursor-pointer
                border shadow-sm hover:scale-110 active:scale-95
                ${colorStyles.bg} ${colorStyles.border}
                ${isSelected ? 'ring-2 ring-accent-orange ring-offset-2 scale-105' : 'opacity-85 hover:opacity-100'}
              `}
              title={`Select ${color}`}
            />
          );
        })}
      </div>

      {/* 2D Net Layout */}
      <div className="flex flex-col items-center select-none overflow-x-auto w-full py-4">
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, minmax(130px, 1fr))' }}>
          {/* Row 1: empty, U, empty, empty */}
          <div />
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-text mb-1">Up (U)</span>
            {renderFaceGrid('U')}
          </div>
          <div />
          <div />

          {/* Row 2: L, F, R, B */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-text mb-1">Left (L)</span>
            {renderFaceGrid('L')}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-text mb-1">Front (F)</span>
            {renderFaceGrid('F')}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-text mb-1">Right (R)</span>
            {renderFaceGrid('R')}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-text mb-1">Back (B)</span>
            {renderFaceGrid('B')}
          </div>

          {/* Row 3: empty, D, empty, empty */}
          <div />
          <div className="flex flex-col items-center mt-1">
            {renderFaceGrid('D')}
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-text mt-1">Down (D)</span>
          </div>
          <div />
          <div />
        </div>
      </div>

      {/* Helper Controls */}
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-xs font-semibold text-charcoal bg-charcoal/5 border border-borders hover:bg-charcoal/10 rounded-xl transition-smooth cursor-pointer"
        >
          Reset Solved State
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 text-xs font-semibold text-cube-red bg-cube-red/5 border border-cube-red/20 hover:bg-cube-red/10 rounded-xl transition-smooth cursor-pointer"
        >
          Clear Grid (Keep Centers)
        </button>
      </div>
    </div>
  );
}
