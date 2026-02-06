import type { TreeNode, PositionedNode } from '../types';

/**
 * Lay out a BST so that:
 *  - y is determined by depth (each level separated by LEVEL_GAP)
 *  - x is determined by in-order index (each node separated by NODE_GAP)
 *
 * The algorithm performs an in-order walk to assign sequential x-indices,
 * then scales and centres the result within the given canvas dimensions.
 */

const NODE_RADIUS = 22;
const LEVEL_GAP = 80;
const PADDING_TOP = 60;
const PADDING_X = 40;

export { NODE_RADIUS };

// ── In-order index assignment ──────────────────────────────────────────────

interface RawPos {
  value: number;
  inorderIdx: number;
  depth: number;
  left: RawPos | null;
  right: RawPos | null;
}

function assignIndices(
  node: TreeNode | null,
  depth: number,
  counter: { idx: number },
): RawPos | null {
  if (!node) return null;

  const left = assignIndices(node.left, depth + 1, counter);
  const inorderIdx = counter.idx++;
  const right = assignIndices(node.right, depth + 1, counter);

  return { value: node.value, inorderIdx, depth, left, right };
}

// ── Scale to canvas coordinates ────────────────────────────────────────────

function scaleTree(
  raw: RawPos | null,
  totalNodes: number,
  canvasWidth: number,
): PositionedNode | null {
  if (!raw) return null;

  const usableWidth = canvasWidth - PADDING_X * 2;
  const gap = totalNodes > 1 ? usableWidth / (totalNodes - 1) : 0;
  const x = PADDING_X + raw.inorderIdx * gap;
  const y = PADDING_TOP + raw.depth * LEVEL_GAP;

  return {
    value: raw.value,
    x,
    y,
    left: scaleTree(raw.left, totalNodes, canvasWidth),
    right: scaleTree(raw.right, totalNodes, canvasWidth),
  };
}

// ── Count nodes helper ─────────────────────────────────────────────────────

function countNodes(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Given a BST root and the available canvas width, return a positioned tree
 * ready for rendering.
 */
export function layoutTree(
  root: TreeNode | null,
  canvasWidth: number,
): PositionedNode | null {
  if (!root) return null;

  const total = countNodes(root);
  const raw = assignIndices(root, 0, { idx: 0 });
  return scaleTree(raw, total, canvasWidth);
}
