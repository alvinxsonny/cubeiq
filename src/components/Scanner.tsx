import React, { useState, useEffect, useRef } from 'react';
import { CubeState, CubeColor, FaceName, DEFAULT_SOLVED_STATE } from '@/lib/cubeState';
import { Camera, CameraOff, Upload, RefreshCw, Check, AlertCircle, ArrowRight, ArrowLeft, ArrowDown, ArrowUp, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScannerProps {
  onScanComplete: (scannedState: CubeState) => void;
  onCancel: () => void;
}

const FACES: { key: FaceName; name: string; centerColor: string; description: string }[] = [
  { key: 'F', name: 'Front', centerColor: 'bg-green-600 border-green-700 text-white', description: 'Show the Green center face to the camera. Keep White on top.' },
  { key: 'R', name: 'Right', centerColor: 'bg-red-600 border-red-700 text-white', description: 'Show the Red center face to the camera. Keep White on top.' },
  { key: 'B', name: 'Back', centerColor: 'bg-blue-600 border-blue-700 text-white', description: 'Show the Blue center face to the camera. Keep White on top.' },
  { key: 'L', name: 'Left', centerColor: 'bg-orange-500 border-orange-600 text-white', description: 'Show the Orange center face to the camera. Keep White on top.' },
  { key: 'U', name: 'Up (Top)', centerColor: 'bg-white border-gray-300 text-charcoal', description: 'Show the White center face to the camera. Keep Red on top.' },
  { key: 'D', name: 'Down (Bottom)', centerColor: 'bg-yellow-400 border-yellow-500 text-charcoal', description: 'Show the Yellow center face to the camera. Keep Orange on top.' },
];

const COLOR_MAP: Record<CubeColor, string> = {
  white: 'bg-white border-gray-300',
  yellow: 'bg-yellow-400 border-yellow-500',
  green: 'bg-green-600 border-green-700',
  blue: 'bg-blue-600 border-blue-700',
  red: 'bg-red-600 border-red-700',
  orange: 'bg-orange-500 border-orange-600',
};

const ROTATION_INSTRUCTIONS = [
  { text: "Orient your cube: Show the Green face to the camera. Keep White on top and Yellow on bottom.", direction: 'none' },
  { text: "Rotate the entire cube 90° to the Left (show Red center face, White remains on top).", direction: 'left' },
  { text: "Rotate the entire cube 90° to the Left (show Blue center face, White remains on top).", direction: 'left' },
  { text: "Rotate the entire cube 90° to the Left (show Orange center face, White remains on top).", direction: 'left' },
  { text: "Tilt the entire cube 90° Up away from you (show White center face, Red is now on top).", direction: 'up' },
  { text: "Tilt the entire cube 180° Up away from you (show Yellow center face, Orange is now on top).", direction: 'up' },
];

// Helper: RGB to HSL
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Classifier for Rubik's cube colors
function classifyColor(r: number, g: number, b: number): CubeColor {
  const { h, s, l } = rgbToHsl(r, g, b);

  // White has very low saturation and high lightness
  if (l > 75 && s < 25) return 'white';
  if (l > 85) return 'white';
  if (s < 12) return 'white';

  // Hues for standard colors
  if (h >= 345 || h < 12) return 'red';
  if (h >= 12 && h < 44) return 'orange';
  if (h >= 44 && h < 75) return 'yellow';
  if (h >= 75 && h < 165) return 'green';
  if (h >= 165 && h < 265) return 'blue';

  // Fallback
  return 'red';
}

// Helper: Rotate 3x3 array representation of a face 90 degrees counter-clockwise
function rotate90Ccw(arr: CubeColor[]): CubeColor[] {
  return [
    arr[2], arr[5], arr[8],
    arr[1], arr[4], arr[7],
    arr[0], arr[3], arr[6]
  ];
}

// Helper: Rotate 3x3 array representation of a face 90 degrees clockwise
function rotate90Cw(arr: CubeColor[]): CubeColor[] {
  return [
    arr[6], arr[3], arr[0],
    arr[7], arr[4], arr[1],
    arr[8], arr[5], arr[2]
  ];
}

interface DemoCubeProps {
  faceKey: FaceName;
}

function WebcamLaptopGuide({ faceKey }: DemoCubeProps) {
  let faceColor = 'green';
  let topColor = 'white';

  switch (faceKey) {
    case 'F': faceColor = 'green'; topColor = 'white'; break;
    case 'R': faceColor = 'red'; topColor = 'white'; break;
    case 'B': faceColor = 'blue'; topColor = 'white'; break;
    case 'L': faceColor = 'orange'; topColor = 'white'; break;
    case 'U': faceColor = 'white'; topColor = 'red'; break;
    case 'D': faceColor = 'yellow'; topColor = 'orange'; break;
  }

  const getBgClass = (c: string) => {
    switch (c) {
      case 'white': return 'bg-cube-white';
      case 'yellow': return 'bg-cube-yellow';
      case 'green': return 'bg-cube-green';
      case 'blue': return 'bg-cube-blue';
      case 'red': return 'bg-cube-red';
      case 'orange': return 'bg-cube-orange';
      default: return 'bg-charcoal';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-3.5 bg-white/40 border border-borders/20 rounded-2xl shadow-none w-full relative overflow-hidden select-none">
      <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-2.5">Camera Scan Orientation Guide</span>
      
      {/* Visual illustration box */}
      <div className="w-full h-36 flex items-center justify-between px-6 relative">
        {/* Camera Lens SVG Profile on the left (pointing right) */}
        <div className="w-20 h-20 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 80" className="w-full h-full">
            {/* Viewfinder eyepiece on the back (left side) */}
            <rect x="18" y="34" width="4" height="12" rx="1" fill="none" stroke="#1E293B" strokeWidth="2" />
            
            {/* Camera Body */}
            <rect x="22" y="26" width="38" height="28" rx="4" fill="none" stroke="#1E293B" strokeWidth="2.5" />
            
            {/* Viewfinder hump on top */}
            <path d="M34 26 L38 21 L46 21 L50 26" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />
            
            {/* Lens Base Barrel sticking right */}
            <rect x="60" y="30" width="8" height="20" rx="1.5" fill="none" stroke="#1E293B" strokeWidth="2.5" />
            
            {/* Lens Front Barrel extending further right */}
            <rect x="68" y="34" width="6" height="12" rx="1" fill="none" stroke="#1E293B" strokeWidth="2.5" />
            
            {/* Front Glass lens tip curved profile */}
            <path d="M74 34 C75.5 36 75.5 44 74 46" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            
            {/* Blue lens glass reflection accent */}
            <path d="M72 36 C73 38 73 42 72 44" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" fill="none" />
            
            {/* Active LED */}
            <circle cx="30" cy="33" r="1.5" fill="#22C55E" className="animate-pulse" />
          </svg>
        </div>

        {/* Laser line between camera lens (left) and cube (right) */}
        <div className="absolute left-[83px] right-[64px] top-1/2 -translate-y-1/2 h-[1.5px] border-t-2 border-dashed border-accent-orange/60 animate-pulse pointer-events-none" />
        
        {/* Cube on the right (facing the laptop on the left) */}
        <div 
          className="w-20 h-20 flex items-center justify-center shrink-0" 
          style={{ perspective: '400px' }}
        >
          <div 
            className="w-12 h-12 relative"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: 'rotateX(-20deg) rotateY(35deg)' 
            }}
          >
            {/* Top face of cube */}
            <div 
              className="absolute inset-0 bg-[#121212] border border-charcoal/30 p-[0.5px] rounded"
              style={{ transform: 'rotateX(90deg) translateZ(24px)', backfaceVisibility: 'visible' }}
            >
              <div className="grid grid-cols-3 gap-[0.5px] w-full h-full">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${getBgClass(topColor)}`} />
                ))}
              </div>
            </div>

            {/* Left face of cube (facing left, towards the laptop webcam) */}
            <div 
              className="absolute inset-0 bg-[#121212] border border-charcoal/30 p-[0.5px] rounded"
              style={{ transform: 'rotateY(-90deg) translateZ(24px)', backfaceVisibility: 'visible' }}
            >
              <div className="grid grid-cols-3 gap-[0.5px] w-full h-full">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${getBgClass(faceColor)}`} />
                ))}
              </div>
            </div>

            {/* Front-Right face of cube (facing us / viewer) */}
            <div 
              className="absolute inset-0 bg-[#121212] border border-charcoal/30 p-[0.5px] rounded"
              style={{ transform: 'rotateY(0deg) translateZ(24px)', backfaceVisibility: 'visible' }}
            >
              <div className="grid grid-cols-3 gap-[0.5px] w-full h-full">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="rounded-[1px] bg-charcoal/55" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-bold text-charcoal flex gap-4 justify-center items-center mt-1.5 w-full">
        <span className="flex items-center gap-1.5">
          <span className={`inline-block w-2.5 h-2.5 rounded border border-black/10 ${getBgClass(faceColor)}`} />
          Show: <strong className="text-accent-orange uppercase font-bold">{faceColor}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block w-2.5 h-2.5 rounded border border-black/10 ${getBgClass(topColor)}`} />
          Top: <strong className="text-charcoal uppercase font-bold">{topColor}</strong>
        </span>
      </div>
    </div>
  );
}

export default function Scanner({ onScanComplete, onCancel }: ScannerProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [scannedFaces, setScannedFaces] = useState<Record<FaceName, CubeColor[] | null>>({
    U: null, L: null, F: null, R: null, B: null, D: null,
  });

  const [useCamera, setUseCamera] = useState<boolean>(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [realtimeColors, setRealtimeColors] = useState<CubeColor[]>(Array(9).fill('white'));
  const [manualOverrides, setManualOverrides] = useState<(CubeColor | null)[]>(Array(9).fill(null));

  // Reset overrides when step changes
  useEffect(() => {
    setManualOverrides(Array(9).fill(null));
  }, [currentStep]);

  const activeFace = FACES[currentStep];

  // Enumerate camera devices
  useEffect(() => {
    if (typeof window === 'undefined') return;
    navigator.mediaDevices.enumerateDevices().then((deviceList) => {
      const videoDevices = deviceList.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        // Prefer environment (back) camera on mobile
        const backCam = videoDevices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
        setActiveDeviceId(backCam ? backCam.deviceId : videoDevices[0].deviceId);
      }
    });
  }, []);

  // Initialize camera stream
  useEffect(() => {
    if (!useCamera || typeof window === 'undefined') {
      stopCamera();
      return;
    }

    let active = true;

    async function startCamera() {
      stopCamera();
      setCameraError(null);

      const constraints: MediaStreamConstraints = {
        video: activeDeviceId
          ? { deviceId: { exact: activeDeviceId } }
          : { facingMode: 'environment' },
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError('Unable to access camera. Please check permissions or upload photos instead.');
        setUseCamera(false);
      }
    }

    startCamera();

    return () => {
      active = false;
      stopCamera();
    };
  }, [useCamera, activeDeviceId]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const switchCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex((d) => d.deviceId === activeDeviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      setActiveDeviceId(devices[nextIndex].deviceId);
    }
  };

  // Real-time canvas sampling loop
  useEffect(() => {
    let animFrame: number;

    const sampleColors = () => {
      if (useCamera && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          // Sync canvas dimensions with video aspect ratio
          const size = Math.min(video.videoWidth, video.videoHeight) * 0.6;
          canvas.width = size;
          canvas.height = size;

          // Draw cropped centered square from video stream
          const sx = (video.videoWidth - size) / 2;
          const sy = (video.videoHeight - size) / 2;

          ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

          // Sample 3x3 grid coordinates
          const cellSize = size / 3;
          const detected: CubeColor[] = [];

          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
              // Sample a 10x10 block in the center of each cell to reduce noise
              const cx = col * cellSize + cellSize / 2;
              const cy = row * cellSize + cellSize / 2;
              const imgData = ctx.getImageData(cx - 5, cy - 5, 10, 10);
              
              let rSum = 0, gSum = 0, bSum = 0;
              const pixelCount = imgData.data.length / 4;
              for (let i = 0; i < imgData.data.length; i += 4) {
                rSum += imgData.data[i];
                gSum += imgData.data[i + 1];
                bSum += imgData.data[i + 2];
              }

              const rAvg = rSum / pixelCount;
              const gAvg = gSum / pixelCount;
              const bAvg = bSum / pixelCount;

              detected.push(classifyColor(rAvg, gAvg, bAvg));
            }
          }

          setRealtimeColors(detected);
        }
      }
      animFrame = requestAnimationFrame(sampleColors);
    };

    sampleColors();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [useCamera]);

  const handleCapture = () => {
    // Save captured colors for this face, merging with manual overrides
    const finalColors = realtimeColors.map((color, idx) => manualOverrides[idx] || color);

    // Force the center sticker to match the face identity to maintain calibration
    // U -> white, L -> orange, F -> green, R -> red, B -> blue, D -> yellow
    const fixedCenters: Record<FaceName, CubeColor> = {
      U: 'white', L: 'orange', F: 'green', R: 'red', B: 'blue', D: 'yellow',
    };
    finalColors[4] = fixedCenters[activeFace.key];

    let savedColors = finalColors;
    if (activeFace.key === 'U') {
      savedColors = rotate90Cw(finalColors);
    } else if (activeFace.key === 'D') {
      savedColors = rotate90Ccw(finalColors);
    }

    setScannedFaces((prev) => ({
      ...prev,
      [activeFace.key]: savedColors,
    }));

    // Proceed to next face
    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleCellTap = (idx: number) => {
    if (idx === 4) return; // centers are locked
    const currentColor = manualOverrides[idx] || realtimeColors[idx];
    const colors: CubeColor[] = ['white', 'yellow', 'green', 'blue', 'red', 'orange'];
    const nextIdx = (colors.indexOf(currentColor) + 1) % colors.length;

    const newOverrides = [...manualOverrides];
    newOverrides[idx] = colors[nextIdx];
    setManualOverrides(newOverrides);
  };

  const handleRetake = (faceKey: FaceName) => {
    const stepIndex = FACES.findIndex((f) => f.key === faceKey);
    setCurrentStep(stepIndex);
    setScannedFaces((prev) => ({
      ...prev,
      [faceKey]: null,
    }));
  };

  // Image upload handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const size = Math.min(img.width, img.height);
            canvas.width = size;
            canvas.height = size;
            
            // Crop image to center square
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

            // Extract colors from the static grid
            const cellSize = size / 3;
            const detected: CubeColor[] = [];

            for (let row = 0; row < 3; row++) {
              for (let col = 0; col < 3; col++) {
                const cx = col * cellSize + cellSize / 2;
                const cy = row * cellSize + cellSize / 2;
                const imgData = ctx.getImageData(cx - 5, cy - 5, 10, 10);
                
                let rSum = 0, gSum = 0, bSum = 0;
                const pixelCount = imgData.data.length / 4;
                for (let i = 0; i < imgData.data.length; i += 4) {
                  rSum += imgData.data[i];
                  gSum += imgData.data[i + 1];
                  bSum += imgData.data[i + 2];
                }

                detected.push(classifyColor(rSum / pixelCount, gSum / pixelCount, bSum / pixelCount));
              }
            }

            // Force center
            const fixedCenters: Record<FaceName, CubeColor> = {
              U: 'white', L: 'orange', F: 'green', R: 'red', B: 'blue', D: 'yellow',
            };
            detected[4] = fixedCenters[activeFace.key];

            let savedColors = detected;
            if (activeFace.key === 'U') {
              savedColors = rotate90Cw(detected);
            } else if (activeFace.key === 'D') {
              savedColors = rotate90Ccw(detected);
            }

            setScannedFaces((prev) => ({
              ...prev,
              [activeFace.key]: savedColors,
            }));

            if (currentStep < 5) {
              setCurrentStep((s) => s + 1);
            }
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFinish = () => {
    // Verify all faces are scanned
    const incomplete = Object.values(scannedFaces).some((f) => f === null);
    if (incomplete) return;

    onScanComplete(scannedFaces as CubeState);
  };

  return (
    <div className="w-full max-w-7xl mx-auto" style={{ height: 'calc(100vh - 172px)', minHeight: 480 }}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 w-full h-full items-stretch">

        {/* ── Col 1: Camera — centered ── */}
        <div className="lg:col-span-4 pr-0 lg:pr-5 flex flex-col items-center justify-center py-2 h-full">

          <div className="flex flex-col items-center justify-center gap-3 w-full max-w-[300px]">
            {/* Camera box */}
            <div className="w-full aspect-square relative rounded-2xl overflow-hidden bg-charcoal/95 border-2 border-charcoal shadow-[4px_4px_0px_0px_#1E1E1C] flex items-center justify-center shrink-0">
              {useCamera ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover pointer-events-none" />
                  <div className="absolute inset-0 flex items-center justify-center p-5">
                    <div className="w-full h-full border border-white/30 rounded-xl grid grid-cols-3 grid-rows-3 gap-1.5 p-1.5 bg-black/10 backdrop-blur-[1px]">
                      {realtimeColors.map((color, idx) => {
                        const isCenter = idx === 4;
                        const displayColor = manualOverrides[idx] || color;
                        const colorStyles = COLOR_MAP[displayColor];
                        return (
                          <div
                            key={`realtime-${idx}`}
                            onClick={() => handleCellTap(idx)}
                            className={`w-full h-full rounded-md border border-dashed border-white/40 flex items-center justify-center bg-black/5 transition-all duration-200 ${isCenter ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-white/10 active:scale-95'}`}
                            title={isCenter ? 'Locked center' : 'Tap to override color'}
                          >
                            <div className={`w-7 h-7 rounded border shadow-sm transition-all duration-200 ${colorStyles.split(' ')[0]} ${colorStyles.split(' ')[1]}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-white/60">
                  <CameraOff className="w-10 h-10 mb-3 text-white/35 animate-pulse" />
                  <span className="text-xs font-semibold font-geist mb-3">Camera inactive</span>
                  <label className="px-4 py-2 bg-white text-charcoal font-semibold text-xs rounded-lg cursor-pointer neo-btn-sm inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 w-full">
              <button onClick={() => setUseCamera(!useCamera)} className="p-2 rounded-lg bg-white cursor-pointer text-charcoal neo-btn-sm" title={useCamera ? 'Turn Camera Off' : 'Turn Camera On'}>
                <Camera className="w-3.5 h-3.5" />
              </button>
              {useCamera && devices.length > 1 && (
                <button onClick={switchCamera} className="p-2 rounded-lg bg-white cursor-pointer text-charcoal neo-btn-sm" title="Switch Camera">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
              {useCamera && (
                <button onClick={handleCapture} className="flex-1 py-2 bg-accent-orange text-white text-xs font-bold rounded-lg cursor-pointer neo-btn flex items-center justify-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Capture Face
                </button>
              )}
            </div>

            {cameraError && (
              <div className="w-full p-2.5 bg-cube-red/5 border border-cube-red/20 rounded-xl flex items-start gap-2 text-cube-red">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="text-[10px] leading-relaxed">{cameraError}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Col 2: Instructions — centered ── */}
        <div className="lg:col-span-4 border-l border-r border-borders/20 px-5 flex flex-col items-center justify-center py-2 h-full">
          <div className="w-full max-w-[340px] flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase font-extrabold tracking-wider text-accent-orange font-geist">Step {currentStep + 1} of 6</span>
              <h2 className="text-2xl lg:text-3xl font-extrabold font-geist tracking-tight leading-tight">Scan {activeFace.name} Face</h2>
              <p className="text-sm text-muted-text leading-relaxed">{activeFace.description}</p>
            </div>

            <div className="p-4 bg-accent-orange/5 border border-accent-orange/15 rounded-xl flex items-start gap-3 shadow-sm">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-orange text-white shadow-sm shrink-0 mt-0.5">
                {ROTATION_INSTRUCTIONS[currentStep].direction === 'none' && <GraduationCap className="w-5 h-5" />}
                {ROTATION_INSTRUCTIONS[currentStep].direction === 'right' && (
                  <motion.div animate={{ x: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}>
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
                {ROTATION_INSTRUCTIONS[currentStep].direction === 'left' && (
                  <motion.div animate={{ x: [2, -2, 2] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}>
                    <ArrowLeft className="w-5 h-5" />
                  </motion.div>
                )}
                {ROTATION_INSTRUCTIONS[currentStep].direction === 'down' && (
                  <motion.div animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}>
                    <ArrowDown className="w-5 h-5" />
                  </motion.div>
                )}
                {ROTATION_INSTRUCTIONS[currentStep].direction === 'up' && (
                  <motion.div animate={{ y: [2, -2, 2] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}>
                    <ArrowUp className="w-5 h-5" />
                  </motion.div>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-extrabold text-accent-orange tracking-wider font-geist">
                  {currentStep === 0 ? 'Starting Orientation' : 'Next Physical Rotation'}
                </span>
                <p className="text-sm font-semibold text-charcoal leading-snug">{ROTATION_INSTRUCTIONS[currentStep].text}</p>
              </div>
            </div>

            <WebcamLaptopGuide faceKey={activeFace.key} />
          </div>
        </div>

        {/* ── Col 3: Scan Progress — compact, buttons pinned ── */}
        <div className="lg:col-span-4 pl-0 lg:pl-5 flex flex-col gap-3 py-2 h-full">
          <span className="text-[9px] uppercase tracking-wider font-bold text-muted-text font-geist shrink-0">Scan Progress</span>

          <div className="grid grid-cols-2 grid-rows-3 gap-2 flex-1 min-h-0">
            {FACES.map((face, idx) => {
              const isCurrent = idx === currentStep;
              const stateColors = scannedFaces[face.key];
              const isDone = stateColors !== null;
              return (
                <div
                  key={`preview-${face.key}`}
                  onClick={() => setCurrentStep(idx)}
                  className={`p-2.5 border rounded-xl flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                    isCurrent ? 'bg-white border-accent-orange/50 shadow-sm ring-1 ring-accent-orange/20'
                    : isDone ? 'bg-white/70 border-success/30'
                    : 'bg-white/40 border-borders/35 hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full shrink-0">
                    <div className="flex items-center gap-1">
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 border-black/10 ${face.centerColor.split(' ')[0]}`}>
                        {isDone && <Check className={`w-2.5 h-2.5 stroke-[3px] ${face.key === 'U' ? 'text-charcoal' : 'text-white'}`} />}
                      </div>
                      <span className="text-[9px] font-bold text-charcoal font-geist truncate">{face.name}</span>
                    </div>
                    {isDone && (
                      <button onClick={(e) => { e.stopPropagation(); handleRetake(face.key); }} className="text-[8px] font-bold text-cube-red hover:underline cursor-pointer shrink-0">
                        Redo
                      </button>
                    )}
                  </div>
                  {stateColors ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 flex-1 py-1">
                      <div className="grid grid-cols-3 gap-[1px] w-16 h-16 border border-black/5 p-[2px] rounded-lg bg-charcoal/5">
                        {stateColors.map((c, i) => (
                          <div key={i} className={`w-full h-full rounded-[1.5px] border-[0.5px] border-black/10 ${COLOR_MAP[c].split(' ')[0]}`} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 flex-1 py-1">
                      <div className="grid grid-cols-3 gap-[1px] w-16 h-16 border border-dashed border-borders/40 p-[2px] rounded-lg">
                        {[...Array(9)].map((_, i) => <div key={i} className="w-full h-full rounded-[1.5px] bg-charcoal/5" />)}
                      </div>
                    </div>
                  )}
                  <span className={`text-[9px] font-bold text-center w-full leading-none shrink-0 ${isDone ? 'text-success' : isCurrent ? 'text-accent-orange' : 'text-muted-text/50'}`}>
                    {isDone ? '✓ Scanned' : isCurrent ? 'Scanning…' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Buttons always visible at bottom */}
          <div className="flex flex-col gap-2 pt-2.5 border-t border-borders/40 shrink-0">
            {Object.values(scannedFaces).every((f) => f !== null) ? (
              <button onClick={handleFinish} className="w-full py-2.5 bg-success text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 neo-btn">
                Complete Scan <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex gap-2 w-full">
                <button disabled={currentStep === 0} onClick={() => setCurrentStep((s) => s - 1)} className="flex-1 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-charcoal bg-white border border-borders/40 font-bold text-xs flex justify-center items-center gap-1 neo-btn-sm">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button disabled={currentStep === 5} onClick={() => setCurrentStep((s) => s + 1)} className="flex-1 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-charcoal bg-white border border-borders/40 font-bold text-xs flex justify-center items-center gap-1 neo-btn-sm">
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button onClick={onCancel} className="w-full py-2 border border-charcoal/20 bg-white text-charcoal text-xs font-bold rounded-xl hover:bg-charcoal/5 hover:border-charcoal/40 transition-smooth cursor-pointer flex items-center justify-center neo-btn-sm">
              Cancel &amp; Exit
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
