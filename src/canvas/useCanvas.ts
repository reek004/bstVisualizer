import { useRef, useEffect, useCallback } from 'react';
import type { TreeNode, AnimationStep, HighlightType } from '../types';
import { layoutTree } from '../core/layout';
import { countNodes, treeHeight } from '../core/bst';
import { renderTree } from './renderer';

interface UseCanvasOptions {
  tree: TreeNode | null;
  highlightNodes: Map<number, HighlightType>;
  highlightEdges: Array<[number, number]>;
}

/**
 * Hook that manages an HTML Canvas element for BST rendering.
 *
 * Returns a ref to attach to a <canvas> element and a `redraw` function
 * that can be called imperatively (e.g. on window resize).
 */
export function useCanvas({ tree, highlightNodes, highlightEdges }: UseCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafId = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // Resize canvas to fill its container (CSS pixels → device pixels for sharpness)
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const positioned = layoutTree(tree, w);
    const meta = {
      nodeCount: countNodes(tree),
      treeHeight: treeHeight(tree),
    };

    renderTree(ctx, positioned, w, h, highlightNodes, highlightEdges, meta);
  }, [tree, highlightNodes, highlightEdges]);

  // Redraw whenever inputs change
  useEffect(() => {
    rafId.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId.current);
  }, [draw]);

  // Redraw on window resize
  useEffect(() => {
    const onResize = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(draw);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  return { canvasRef, redraw: draw };
}

// ── Playback controller ────────────────────────────────────────────────────

interface PlaybackCallbacks {
  onStep: (step: AnimationStep) => void;
  onComplete: () => void;
}

/**
 * Simple step-through controller for animation steps.
 * Returns functions to control playback.
 */
export function createPlayback(steps: AnimationStep[], callbacks: PlaybackCallbacks) {
  let index = 0;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let speed = 1; // multiplier

  const baseDelay = 600; // ms per step at 1x speed

  function emitCurrent() {
    if (index >= 0 && index < steps.length) {
      callbacks.onStep(steps[index]);
    }
  }

  function stop() {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  function play() {
    stop();
    function tick() {
      if (index >= steps.length) {
        callbacks.onComplete();
        return;
      }
      emitCurrent();
      index++;
      timerId = setTimeout(tick, baseDelay / speed);
    }
    tick();
  }

  function pause() {
    stop();
  }

  function stepForward() {
    stop();
    if (index < steps.length) {
      emitCurrent();
      index++;
    }
    if (index >= steps.length) {
      callbacks.onComplete();
    }
  }

  function stepBackward() {
    stop();
    if (index > 0) {
      index--;
      emitCurrent();
    }
  }

  function goToStart() {
    stop();
    index = 0;
    emitCurrent();
  }

  function goToEnd() {
    stop();
    index = steps.length - 1;
    emitCurrent();
    index = steps.length;
  }

  function setSpeed(s: number) {
    speed = s;
  }

  function getIndex() {
    return index;
  }

  function getTotal() {
    return steps.length;
  }

  function destroy() {
    stop();
  }

  return {
    play,
    pause,
    stepForward,
    stepBackward,
    goToStart,
    goToEnd,
    setSpeed,
    getIndex,
    getTotal,
    destroy,
  };
}
