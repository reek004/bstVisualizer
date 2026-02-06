// ── Tree Node ──────────────────────────────────────────────────────────────
export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// ── Positioned node (after layout pass) ────────────────────────────────────
export interface PositionedNode {
  value: number;
  x: number;
  y: number;
  left: PositionedNode | null;
  right: PositionedNode | null;
}

// ── Animation ──────────────────────────────────────────────────────────────
export type HighlightType =
  | 'visiting'   // currently being compared / traversed (green)
  | 'found'      // search target found (orange)
  | 'inserting'  // node being inserted (cyan)
  | 'removing'   // node being removed (red)
  | 'path';      // edge on the active path (yellow)

export interface AnimationStep {
  /** Which node values should be highlighted this frame */
  highlightNodes: Map<number, HighlightType>;
  /** Which edges (parent→child value pairs) should be highlighted */
  highlightEdges: Array<[number, number]>;
  /** Snapshot of the tree at this step (so the canvas can redraw) */
  tree: TreeNode | null;
  /** Optional description shown in the UI */
  description: string;
  /** Index of the active pseudocode line (0-based) for the algorithm panel */
  codeLine?: number;
  /** The node value currently being examined (arrow indicator) */
  activeNode?: number;
}

// ── Operation types exposed by the sidebar ─────────────────────────────────
export type OperationType =
  | 'create'
  | 'search'
  | 'insert'
  | 'remove'
  | 'predecessor'
  | 'successor'
  | 'selectKth'
  | 'inorder'
  | 'preorder'
  | 'postorder';

// ── Playback state ─────────────────────────────────────────────────────────
export interface PlaybackState {
  steps: AnimationStep[];
  currentIndex: number;
  isPlaying: boolean;
  speed: number; // multiplier: 0.5, 1, 2, 4
}
