import React, { useState } from 'react';
import ThreeCube from './ThreeCube';
import { DEFAULT_SOLVED_STATE, CubeState, applyMoveToState } from '@/lib/cubeState';
import { BookOpen, HelpCircle, GraduationCap, ChevronRight, CheckCircle2, Award, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NOTATIONS = [
  { key: 'R', name: 'Right (R)', desc: 'Turn the right layer counter-clockwise (upward) looking at the right face.' },
  { key: "R'", name: "Right Prime (R')", desc: 'Turn the right layer clockwise (downward) looking at the right face.' },
  { key: 'L', name: 'Left (L)', desc: 'Turn the left layer counter-clockwise (downward) looking at the left face.' },
  { key: "L'", name: "Left Prime (L')", desc: 'Turn the left layer clockwise (upward) looking at the left face.' },
  { key: 'U', name: 'Up (U)', desc: 'Turn the top layer counter-clockwise (leftward) looking at the top face.' },
  { key: "U'", name: "Up Prime (U')", desc: 'Turn the top layer clockwise (rightward) looking at the top face.' },
  { key: 'F', name: 'Front (F)', desc: 'Turn the front face clockwise.' },
  { key: "F'", name: "Front Prime (F')", desc: 'Turn the front face counter-clockwise.' },
];

const TUTORIAL_STEPS = [
  {
    title: '1. The White Cross',
    desc: 'Solve the four white edge pieces on the bottom (or top) face, aligning their secondary colors with the corresponding side centers.',
    algo: 'No fixed algorithm (intuitive stage)',
    tip: 'Look for white edges in the middle layer first, as they are easiest to rotate into place.',
  },
  {
    title: '2. White Corners (First Layer)',
    desc: 'Insert the four white corner pieces into their correct spots to complete the first layer.',
    algo: "R U R' U' (repeat 1-5 times)",
    tip: 'Position the target corner on the top layer directly above its slot, then execute the Sexy Move until solved.',
  },
  {
    title: '3. Middle Layer (Second Layer)',
    desc: 'Insert the four middle layer edge pieces. This completes the bottom two layers.',
    algo: "To Right: U R U' R' U' F' U F | To Left: U' L' U L U F U' F'",
    tip: 'Hold the cube so the matching side color faces you, then execute the corresponding algorithm.',
  },
  {
    title: '4. Yellow Cross (OLL Step 1)',
    desc: 'Create a yellow cross on the top face. Do not worry about matching the side colors yet.',
    algo: "F (R U R' U') F'",
    tip: 'If you have a Dot, execute the algorithm to get an L-shape, then a Line, then the Cross.',
  },
  {
    title: '5. Yellow Edges (OLL Step 2)',
    desc: 'Align the side colors of the yellow cross edges with their corresponding centers.',
    algo: "R U R' U R U2 R' (Sune)",
    tip: 'Hold the cube so only one correct edge faces you, then run the Sune algorithm.',
  },
  {
    title: '6. Position Yellow Corners (PLL Step 1)',
    desc: 'Move the four yellow corner pieces to their correct physical positions, even if they are rotated incorrectly.',
    algo: "U R U' L' U R' U' L",
    tip: 'Find a corner that is already in the correct slot. Hold it in the front-right-top slot, then execute.',
  },
  {
    title: '7. Orient Yellow Corners (PLL Step 2)',
    desc: 'Twist the yellow corners so the yellow side faces UP. This solves the Rubik\'s Cube completely!',
    algo: "R' D' R D (repeat until yellow faces up, then turn U)",
    tip: 'IMPORTANT: Keep the same Front face throughout this entire step. Only turn the top layer (U) to bring the next twisted corner to the front-right slot.',
  },
];

const QUIZ_OPTIONS = ['R', "R'", 'L', "L'", 'U', "U'", 'F', "F'"];

export default function LearnSection() {
  const [activeTab, setActiveTab] = useState<'notation' | 'beginner' | 'quiz'>('notation');
  
  // Notation visualizer state
  const [notationCube, setNotationCube] = useState<CubeState>(DEFAULT_SOLVED_STATE);
  const [activeNotationMove, setActiveNotationMove] = useState<string | null>(null);

  // Quiz state
  const [quizState, setQuizState] = useState<{
    score: number;
    total: number;
    currentMove: string;
    showResult: boolean;
    selectedAnswer: string | null;
    isCorrect: boolean;
  }>({
    score: 0,
    total: 0,
    currentMove: 'R',
    showResult: false,
    selectedAnswer: null,
    isCorrect: false,
  });

  const [quizCube, setQuizCube] = useState<CubeState>(DEFAULT_SOLVED_STATE);
  const [quizMove, setQuizMove] = useState<string | null>(null);

  const playNotationMove = (move: string) => {
    if (activeNotationMove) return;
    setActiveNotationMove(move);
  };

  const handleNotationComplete = () => {
    if (activeNotationMove) {
      setNotationCube((prev) => applyMoveToState(prev, activeNotationMove));
      setActiveNotationMove(null);
    }
  };

  const resetNotationCube = () => {
    setNotationCube(DEFAULT_SOLVED_STATE);
    setActiveNotationMove(null);
  };

  // Start a new quiz question
  const startNewQuizQuestion = (currentScore = quizState.score, currentTotal = quizState.total) => {
    const randomMove = QUIZ_OPTIONS[Math.floor(Math.random() * QUIZ_OPTIONS.length)];
    
    // Reset quiz cube to solved, then animate the random move
    setQuizCube(DEFAULT_SOLVED_STATE);
    setQuizState({
      score: currentScore,
      total: currentTotal,
      currentMove: randomMove,
      showResult: false,
      selectedAnswer: null,
      isCorrect: false,
    });
    
    // Short timeout to trigger animation
    setTimeout(() => {
      setQuizMove(randomMove);
    }, 100);
  };

  const handleQuizMoveComplete = () => {
    if (quizMove) {
      setQuizCube((prev) => applyMoveToState(prev, quizMove));
      setQuizMove(null);
    }
  };

  const handleAnswerSubmit = (option: string) => {
    if (quizState.selectedAnswer) return; // Prevent double clicks

    const isCorrect = option === quizState.currentMove;
    const nextScore = isCorrect ? quizState.score + 1 : quizState.score;
    const nextTotal = quizState.total + 1;

    setQuizState((prev) => ({
      ...prev,
      selectedAnswer: option,
      showResult: true,
      isCorrect,
      score: nextScore,
      total: nextTotal,
    }));
  };

  return (
    <div className="flex flex-col gap-6 p-6 glass-card rounded-3xl w-full max-w-4xl mx-auto min-h-[500px]">
      {/* Tabs */}
      <div className="flex items-center justify-center border-b border-borders/50 pb-4 gap-2">
        <button
          onClick={() => {
            setActiveTab('notation');
            resetNotationCube();
          }}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer
            ${activeTab === 'notation' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'}
          `}
        >
          <BookOpen className="w-4 h-4" />
          Notation Guide
        </button>

        <button
          onClick={() => setActiveTab('beginner')}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer
            ${activeTab === 'beginner' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'}
          `}
        >
          <GraduationCap className="w-4 h-4" />
          Beginner Method
        </button>

        <button
          onClick={() => {
            setActiveTab('quiz');
            startNewQuizQuestion(0, 0);
          }}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer
            ${activeTab === 'quiz' ? 'bg-charcoal text-white shadow-sm' : 'text-muted-text hover:text-charcoal hover:bg-charcoal/5'}
          `}
        >
          <HelpCircle className="w-4 h-4" />
          Notation Quiz
        </button>
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
            className="grid md:grid-cols-12 gap-8 items-start w-full"
          >
            <div className="md:col-span-7 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold font-geist">Standard Cube Notation</h3>
                <p className="text-xs text-muted-text">
                  Hover or click a card to see the corresponding turn animated on the 3D cube.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {NOTATIONS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => playNotationMove(item.key)}
                    className="p-3 text-left border border-borders/50 bg-white hover:border-accent-orange/40 rounded-2xl hover:bg-accent-orange/5 hover:shadow-sm transition-smooth flex flex-col gap-1 select-none cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-geist text-charcoal group-hover:text-accent-orange">
                        {item.name}
                      </span>
                      <Play className="w-3 h-3 text-muted-text group-hover:text-accent-orange opacity-0 group-hover:opacity-100 transition-smooth" />
                    </div>
                    <span className="text-[11px] text-muted-text leading-relaxed">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={resetNotationCube}
                className="mt-2 self-start px-4 py-2 border border-borders text-xs font-semibold rounded-xl hover:bg-charcoal/5 transition-smooth text-charcoal cursor-pointer"
              >
                Reset Visualizer Cube
              </button>
            </div>

            <div className="md:col-span-5 flex flex-col items-center justify-center w-full">
              <ThreeCube
                cubeState={notationCube}
                currentMove={activeNotationMove}
                onMoveComplete={handleNotationComplete}
                animationSpeed={1.5}
              />
            </div>
          </motion.div>
        )}

        {/* Beginner Method Tab */}
        {activeTab === 'beginner' && (
          <motion.div
            key="beginner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6 w-full"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold font-geist">Layer-by-Layer Tutorial</h3>
              <p className="text-xs text-muted-text">
                The standard beginner's method. Learn these 7 steps to solve any scrambled Rubik's cube.
              </p>
            </div>

            <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1">
              {TUTORIAL_STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className="p-5 border border-borders/50 bg-white rounded-3xl flex flex-col sm:flex-row gap-4 sm:items-start"
                >
                  <div className="flex-1 flex flex-col gap-2">
                    <h4 className="text-sm font-bold font-geist text-charcoal flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-accent-orange" />
                      {step.title}
                    </h4>
                    <p className="text-xs text-muted-text leading-relaxed">{step.desc}</p>
                    
                    {/* Tip tag */}
                    <div className="mt-1 px-3 py-1.5 bg-accent-orange/5 border border-accent-orange/10 rounded-xl text-[10px] text-accent-orange">
                      <span className="font-bold">Tip: </span>{step.tip}
                    </div>
                  </div>

                  <div className="sm:w-64 p-4 bg-charcoal/5 rounded-2xl border border-borders/60 flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-text font-geist">Algorithm</span>
                    <span className="text-xs font-bold font-jetbrains text-charcoal leading-normal break-words">
                      {step.algo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid md:grid-cols-12 gap-8 items-center w-full"
          >
            <div className="md:col-span-7 flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent-orange font-geist">
                  Practice Mode
                </span>
                <h3 className="text-lg font-bold font-geist">Notation Tester</h3>
                <p className="text-xs text-muted-text">
                  Identify which move was just animated on the 3D cube below.
                </p>
              </div>

              {/* Score HUD */}
              <div className="flex items-center gap-4 p-4 bg-charcoal/5 rounded-2xl border border-borders/60">
                <Award className="w-8 h-8 text-accent-orange" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-text">Score</span>
                  <span className="text-lg font-bold font-geist text-charcoal">
                    {quizState.score} / {quizState.total} correct
                  </span>
                </div>
              </div>

              {/* Multiple Choice Answers */}
              <div className="grid grid-cols-4 gap-3">
                {QUIZ_OPTIONS.map((option) => {
                  const isSelected = quizState.selectedAnswer === option;
                  const isCorrectAnswer = option === quizState.currentMove;
                  
                  let buttonStyle = 'bg-white border-borders hover:bg-charcoal/5 text-charcoal';
                  if (quizState.showResult) {
                    if (isCorrectAnswer) buttonStyle = 'bg-success/15 border-success text-success';
                    else if (isSelected) buttonStyle = 'bg-cube-red/15 border-cube-red text-cube-red';
                    else buttonStyle = 'bg-white border-borders/40 text-charcoal/40 cursor-not-allowed';
                  }

                  return (
                    <button
                      key={option}
                      disabled={quizState.showResult}
                      onClick={() => handleAnswerSubmit(option)}
                      className={`
                        py-3 border font-bold font-jetbrains rounded-xl transition-all duration-200 cursor-pointer text-center
                        ${buttonStyle}
                        ${!quizState.showResult ? 'hover:scale-105 active:scale-95' : ''}
                      `}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Quiz feedback & Next Button */}
              {quizState.showResult && (
                <div className="flex items-center justify-between border-t border-borders/50 pt-4 mt-2">
                  <div className="text-xs font-semibold font-geist">
                    {quizState.isCorrect ? (
                      <span className="text-success">Correct! Well done.</span>
                    ) : (
                      <span className="text-cube-red">
                        Incorrect. The move was <span className="font-jetbrains font-bold">{quizState.currentMove}</span>.
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => startNewQuizQuestion()}
                    className="px-4 py-2 bg-charcoal hover:bg-charcoal/90 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-1 active:scale-95 transition-smooth"
                  >
                    Next Question <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Play demo move again */}
              {!quizState.showResult && (
                <button
                  disabled={quizMove !== null}
                  onClick={() => setQuizMove(quizState.currentMove)}
                  className="px-4 py-2 border border-borders text-xs font-semibold rounded-xl text-charcoal bg-white hover:bg-charcoal/5 transition-smooth cursor-pointer active:scale-95 self-start disabled:opacity-50"
                >
                  Play Animation Again
                </button>
              )}
            </div>

            <div className="md:col-span-5 flex flex-col items-center justify-center w-full">
              <ThreeCube
                cubeState={quizCube}
                currentMove={quizMove}
                onMoveComplete={handleQuizMoveComplete}
                animationSpeed={1.2}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
