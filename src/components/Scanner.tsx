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
    <div className="flex flex-col items-center gap-6 p-6 glass-card rounded-3xl w-full max-w-4xl mx-auto">
      {/* Step Indicator Header */}
      <div className="w-full flex items-center justify-between border-b border-borders/50 pb-4 overflow-x-auto gap-3">
        {FACES.map((face, idx) => {
          const isCurrent = idx === currentStep;
          const isDone = scannedFaces[face.key] !== null;

          return (
            <button
              key={face.key}
              onClick={() => setCurrentStep(idx)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer
                ${isCurrent ? 'bg-charcoal text-white border-charcoal scale-105 shadow-sm' : ''}
                ${!isCurrent && isDone ? 'bg-success/5 text-success border-success/20 hover:bg-success/10' : ''}
                ${!isCurrent && !isDone ? 'bg-transparent text-muted-text border-borders hover:bg-charcoal/5' : ''}
              `}
            >
              <div className={`w-3.5 h-3.5 rounded-md border ${face.centerColor.split(' ')[0]} ${face.centerColor.split(' ')[1]}`} />
              <span className="font-geist">{face.key}</span>
              {isDone && <Check className="w-3 h-3" />}
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-12 gap-8 w-full items-start">
        {/* Left Side: Camera & Live Preview */}
        <div className="md:col-span-7 flex flex-col items-center gap-4 w-full">
          <div className="w-full aspect-square max-w-[360px] relative rounded-3xl overflow-hidden bg-charcoal/95 border border-charcoal shadow-inner flex items-center justify-center">
            {useCamera ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover pointer-events-none"
                />
                
                {/* 3x3 Overlay Grid */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-4/5 h-4/5 border border-white/30 rounded-2xl grid grid-cols-3 grid-rows-3 gap-2 p-2 bg-black/10 backdrop-blur-[1px] relative">
                    {realtimeColors.map((color, idx) => {
                      const isCenter = idx === 4;
                      const displayColor = manualOverrides[idx] || color;
                      const colorStyles = COLOR_MAP[displayColor];
                      return (
                        <div
                          key={`realtime-${idx}`}
                          onClick={() => handleCellTap(idx)}
                          className={`
                            w-full h-full rounded-lg border border-dashed border-white/40 flex items-center justify-center bg-black/5 backdrop-blur-[0.5px] transition-all duration-200
                            ${isCenter ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-white/10 active:scale-95'}
                          `}
                          title={isCenter ? 'Locked center sticker' : 'Click to cycle override color'}
                        >
                          <div
                            className={`w-9 h-9 rounded-md border shadow-sm transition-all duration-200 ${colorStyles.split(' ')[0]} ${colorStyles.split(' ')[1]}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-white/60">
                <CameraOff className="w-12 h-12 mb-3 text-white/35 animate-pulse" />
                <span className="text-xs font-semibold font-geist mb-4">Camera is inactive</span>
                
                <label className="px-4 py-2 bg-white text-charcoal font-semibold text-xs rounded-xl shadow-md cursor-pointer hover:bg-white/90 active:scale-95 transition-all">
                  <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Hidden capture canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Camera controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseCamera(!useCamera)}
              className="p-2.5 rounded-xl border border-borders bg-white hover:bg-charcoal/5 transition-smooth cursor-pointer text-charcoal"
              title={useCamera ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              <Camera className="w-4 h-4" />
            </button>

            {useCamera && devices.length > 1 && (
              <button
                onClick={switchCamera}
                className="p-2.5 rounded-xl border border-borders bg-white hover:bg-charcoal/5 transition-smooth cursor-pointer text-charcoal"
                title="Switch Camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {useCamera && (
              <button
                onClick={handleCapture}
                className="px-5 py-2.5 bg-accent-orange text-white text-xs font-bold rounded-xl shadow-md hover:bg-accent-orange/90 active:scale-95 transition-smooth cursor-pointer"
              >
                Capture Face
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Step Instruction & Captured State Review */}
        <div className="md:col-span-5 flex flex-col gap-6 w-full justify-between h-full min-h-[360px]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent-orange font-geist">
                Step {currentStep + 1} of 6
              </span>
              <h2 className="text-xl font-bold font-geist">Scan {activeFace.name} Face</h2>
              <p className="text-xs text-muted-text">{activeFace.description}</p>
            </div>

            {/* Rotation Guidance card */}
            <div className="p-4 bg-accent-orange/5 border border-accent-orange/15 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent-orange text-white shadow-md shadow-accent-orange/15 shrink-0">
                {ROTATION_INSTRUCTIONS[currentStep].direction === 'none' && (
                  <GraduationCap className="w-5 h-5" />
                )}
                {ROTATION_INSTRUCTIONS[currentStep].direction === 'right' && (
                  <motion.div
                    animate={{ x: [-3, 3, -3] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
                {ROTATION_INSTRUCTIONS[currentStep].direction === 'left' && (
                  <motion.div
                    animate={{ x: [3, -3, 3] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.div>
                )}
                {ROTATION_INSTRUCTIONS[currentStep].direction === 'down' && (
                  <motion.div
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  >
                    <ArrowDown className="w-5 h-5" />
                  </motion.div>
                )}
                {ROTATION_INSTRUCTIONS[currentStep].direction === 'up' && (
                  <motion.div
                    animate={{ y: [3, -3, 3] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </motion.div>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-accent-orange tracking-wider font-geist">
                  {currentStep === 0 ? 'Starting Orientation' : 'Next Physical Rotation'}
                </span>
                <p className="text-xs font-semibold text-charcoal leading-normal">
                  {ROTATION_INSTRUCTIONS[currentStep].text}
                </p>
              </div>
            </div>

            {/* Guide illustration card */}
            <div className="p-4 bg-charcoal/5 rounded-2xl border border-borders/60 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg shadow-sm ${activeFace.centerColor}`}>
                {activeFace.key}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold font-geist text-charcoal">Center sticker</span>
                <span className="text-[10px] text-muted-text">This sticker MUST match the target face color.</span>
              </div>
            </div>

            {/* Scanned face previews list */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-text font-geist">Scan History</span>
              <div className="grid grid-cols-3 gap-2">
                {FACES.map((face) => {
                  const stateColors = scannedFaces[face.key];
                  return (
                    <div
                      key={`preview-${face.key}`}
                      className="p-2 border border-borders/50 rounded-xl bg-white flex flex-col items-center gap-1.5"
                    >
                      <span className="text-[9px] font-bold text-muted-text">{face.name.split(' ')[0]}</span>
                      {stateColors ? (
                        <div className="grid grid-cols-3 gap-0.5 w-8 h-8">
                          {stateColors.map((c, i) => (
                            <div
                              key={i}
                              className={`w-full h-full rounded-[1px] border-[0.5px] border-black/10 ${COLOR_MAP[c].split(' ')[0]}`}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg border border-dashed border-borders/80 flex items-center justify-center bg-charcoal/5 text-[9px] text-muted-text/50 font-bold">
                          —
                        </div>
                      )}
                      {stateColors && (
                        <button
                          onClick={() => handleRetake(face.key)}
                          className="text-[8px] font-semibold text-cube-red hover:underline cursor-pointer"
                        >
                          Retake
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-borders/50 pt-4 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-borders text-xs font-bold rounded-xl text-charcoal bg-white hover:bg-charcoal/5 transition-smooth cursor-pointer"
            >
              Cancel
            </button>

            {Object.values(scannedFaces).every((f) => f !== null) ? (
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 bg-success text-white text-xs font-bold rounded-xl shadow-lg shadow-success/20 hover:bg-success/90 active:scale-95 transition-smooth cursor-pointer flex items-center gap-2"
              >
                Complete Scan <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="p-2 border border-borders rounded-xl hover:bg-charcoal/5 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth cursor-pointer text-charcoal"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentStep === 5}
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="p-2 border border-borders rounded-xl hover:bg-charcoal/5 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth cursor-pointer text-charcoal"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
