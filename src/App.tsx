import { useState, useCallback, useRef, useEffect } from 'react';
import type { TreeNode, OperationType, AnimationStep, HighlightType } from './types';
import {
  insertNode,
  removeNode,
  searchNode,
  createRandomTree,
  createDefaultTree,
  inorderTraversal,
  preorderTraversal,
  postorderTraversal,
  findPredecessor,
  findSuccessor,
  selectKth,
} from './core/bst';
import { useCanvas, createPlayback } from './canvas/useCanvas';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ControlBar from './components/ControlBar';
import InputModal from './components/InputModal';
import AlgorithmPanel from './components/AlgorithmPanel';
import './App.css';

// Operations that require a numeric input
const INPUT_OPS: OperationType[] = [
  'search',
  'insert',
  'remove',
  'predecessor',
  'successor',
  'selectKth',
];

function App() {
  // ── Tree state (initialise with a default tree of height 7) ──────────────
  const [tree, setTree] = useState<TreeNode | null>(() => createDefaultTree());

  // ── Animation / highlight state ──────────────────────────────────────────
  const [highlightNodes, setHighlightNodes] = useState<Map<number, HighlightType>>(new Map());
  const [highlightEdges, setHighlightEdges] = useState<Array<[number, number]>>([]);
  const [description, setDescription] = useState('Default BST loaded (N=21, h=7). Pick an operation.');

  // ── Playback state ───────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [animating, setAnimating] = useState(false);

  const playbackRef = useRef<ReturnType<typeof createPlayback> | null>(null);

  // ── Algorithm panel state ────────────────────────────────────────────────
  const [activeOperation, setActiveOperation] = useState<{ op: OperationType; value?: number } | null>(null);
  const [activeLine, setActiveLine] = useState<number | undefined>(undefined);
  const [stepLog, setStepLog] = useState<Array<{ index: number; description: string }>>([]);

  // ── Modal state ──────────────────────────────────────────────────────────
  const [modalOp, setModalOp] = useState<OperationType | null>(null);

  // ── Canvas hook ──────────────────────────────────────────────────────────
  const { canvasRef } = useCanvas({ tree, highlightNodes, highlightEdges });

  // ── Cleanup playback on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => playbackRef.current?.destroy();
  }, []);

  // ── Run animation steps ──────────────────────────────────────────────────
  const runAnimation = useCallback(
    (steps: AnimationStep[], finalTree: TreeNode | null, op: OperationType, opValue?: number) => {
      // Stop any previous playback and clear previous highlights
      playbackRef.current?.destroy();
      setHighlightNodes(new Map());
      setHighlightEdges([]);

      // Set the active operation for the algorithm panel
      setActiveOperation({ op, value: opValue });
      setStepLog([]);
      setActiveLine(undefined);

      if (steps.length === 0) {
        setTree(finalTree);
        return;
      }

      setAnimating(true);
      setTotalSteps(steps.length);
      setCurrentStep(0);
      setIsPlaying(true);

      const logAccumulator: Array<{ index: number; description: string }> = [];

      const pb = createPlayback(steps, {
        onStep: (step) => {
          setHighlightNodes(step.highlightNodes);
          setHighlightEdges(step.highlightEdges);
          setDescription(step.description);
          setActiveLine(step.codeLine);
          if (step.tree) setTree(step.tree);
          setCurrentStep(pb.getIndex());

          // Append to step log
          const idx = pb.getIndex() - 1;
          logAccumulator.push({ index: idx, description: step.description });
          setStepLog([...logAccumulator]);
        },
        onComplete: () => {
          setIsPlaying(false);
          setAnimating(false);
          setTree(finalTree);
          // Keep highlights visible — they are cleared when the next operation starts
          setCurrentStep(pb.getTotal());
          setActiveLine(undefined);
        },
      });

      pb.setSpeed(speed);
      playbackRef.current = pb;
      pb.play();
    },
    [speed],
  );

  // ── Handle operations ────────────────────────────────────────────────────
  const handleOperation = useCallback(
    (op: OperationType) => {
      // Some operations need a numeric input → show modal
      if (INPUT_OPS.includes(op)) {
        setModalOp(op);
        return;
      }

      switch (op) {
        case 'create': {
          const size = Math.floor(Math.random() * 6) + 5; // 5-10 nodes
          const { root, steps } = createRandomTree(size);
          runAnimation(steps, root, 'create');
          break;
        }
        case 'inorder':
          runAnimation(inorderTraversal(tree), tree, 'inorder');
          break;
        case 'preorder':
          runAnimation(preorderTraversal(tree), tree, 'preorder');
          break;
        case 'postorder':
          runAnimation(postorderTraversal(tree), tree, 'postorder');
          break;
      }
    },
    [tree, runAnimation],
  );

  // ── Handle modal submit ──────────────────────────────────────────────────
  const handleModalSubmit = useCallback(
    (value: number) => {
      setModalOp(null);

      switch (modalOp) {
        case 'search': {
          const { steps } = searchNode(tree, value);
          runAnimation(steps, tree, 'search', value);
          break;
        }
        case 'insert': {
          const { root, steps } = insertNode(tree, value);
          runAnimation(steps, root, 'insert', value);
          break;
        }
        case 'remove': {
          const { root, steps } = removeNode(tree, value);
          runAnimation(steps, root, 'remove', value);
          break;
        }
        case 'predecessor': {
          const { steps } = findPredecessor(tree, value);
          runAnimation(steps, tree, 'predecessor', value);
          break;
        }
        case 'successor': {
          const { steps } = findSuccessor(tree, value);
          runAnimation(steps, tree, 'successor', value);
          break;
        }
        case 'selectKth': {
          const { steps } = selectKth(tree, value);
          runAnimation(steps, tree, 'selectKth', value);
          break;
        }
      }
    },
    [modalOp, tree, runAnimation],
  );

  // ── Playback controls ────────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    playbackRef.current?.play();
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    playbackRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const handleStepForward = useCallback(() => {
    playbackRef.current?.stepForward();
    setIsPlaying(false);
    setCurrentStep(playbackRef.current?.getIndex() ?? 0);
  }, []);

  const handleStepBackward = useCallback(() => {
    playbackRef.current?.stepBackward();
    setIsPlaying(false);
    setCurrentStep(playbackRef.current?.getIndex() ?? 0);
  }, []);

  const handleGoToStart = useCallback(() => {
    playbackRef.current?.goToStart();
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  const handleGoToEnd = useCallback(() => {
    playbackRef.current?.goToEnd();
    setIsPlaying(false);
    setCurrentStep(playbackRef.current?.getTotal() ?? 0);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSpeed(s);
    playbackRef.current?.setSpeed(s);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <Header description={description} />

      <div className="main-area">
        <Sidebar onOperation={handleOperation} disabled={animating} />

        <div className="canvas-container">
          <canvas ref={canvasRef} />
        </div>

        <AlgorithmPanel
          activeOperation={activeOperation}
          description={description}
          activeLine={activeLine}
          isAnimating={animating}
          stepLog={stepLog}
        />
      </div>

      <ControlBar
        isPlaying={isPlaying}
        speed={speed}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onPlay={handlePlay}
        onPause={handlePause}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onGoToStart={handleGoToStart}
        onGoToEnd={handleGoToEnd}
        onSpeedChange={handleSpeedChange}
        disabled={!animating && totalSteps === 0}
      />

      {modalOp && (
        <InputModal
          title={modalOp === 'selectKth' ? 'Select k-th smallest' : `${modalOp}(v)`}
          placeholder={modalOp === 'selectKth' ? 'Enter k…' : 'Enter value…'}
          onSubmit={handleModalSubmit}
          onCancel={() => setModalOp(null)}
        />
      )}
    </div>
  );
}

export default App;
