import type { PositionedNode, HighlightType } from '../types';
import { NODE_RADIUS } from '../core/layout';

// ── Colour palette ─────────────────────────────────────────────────────────

const COLORS: Record<HighlightType, string> = {
  visiting: '#4caf50',   // green
  found: '#ff9800',      // orange
  inserting: '#00bcd4',  // cyan
  removing: '#f44336',   // red
  path: '#ffeb3b',       // yellow
};

const BG_COLOR = '#1a1a2e';
const NODE_FILL = '#16213e';
const NODE_STROKE = '#e0e0e0';
const NODE_TEXT = '#ffffff';
const EDGE_COLOR = '#888888';
const META_TEXT = '#aaaaaa';

// ── Draw helpers ───────────────────────────────────────────────────────────

function drawEdge(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  highlighted: boolean,
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = highlighted ? COLORS.path : EDGE_COLOR;
  ctx.lineWidth = highlighted ? 2.5 : 1.5;
  ctx.stroke();
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: number,
  highlight: HighlightType | null,
) {
  ctx.beginPath();
  ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);

  if (highlight) {
    ctx.fillStyle = COLORS[highlight];
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
  } else {
    ctx.fillStyle = NODE_FILL;
    ctx.strokeStyle = NODE_STROKE;
    ctx.lineWidth = 2;
  }

  ctx.fill();
  ctx.stroke();

  // Value label
  ctx.fillStyle = highlight ? '#000000' : NODE_TEXT;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), x, y);
}

// ── Draw active-node arrow indicator ────────────────────────────────────────

const ARROW_GAP = 6;       // space between node circle and arrow tip
const ARROW_HEIGHT = 14;
const ARROW_HALF_WIDTH = 7;

function drawActiveArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
) {
  const tipY = y + NODE_RADIUS + ARROW_GAP;
  const baseY = tipY + ARROW_HEIGHT;

  ctx.beginPath();
  ctx.moveTo(x, tipY);                        // tip (pointing down)
  ctx.lineTo(x - ARROW_HALF_WIDTH, baseY);    // bottom-left
  ctx.lineTo(x + ARROW_HALF_WIDTH, baseY);    // bottom-right
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
}

// ── Main render function ───────────────────────────────────────────────────

export function renderTree(
  ctx: CanvasRenderingContext2D,
  root: PositionedNode | null,
  width: number,
  height: number,
  highlightNodes: Map<number, HighlightType>,
  highlightEdges: Array<[number, number]>,
  meta: { nodeCount: number; treeHeight: number },
  activeNode?: number,
) {
  // Clear canvas
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  if (!root) {
    ctx.fillStyle = META_TEXT;
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Empty tree — use Create or Insert to begin', width / 2, height / 2);
    return;
  }

  // Metadata header
  ctx.fillStyle = META_TEXT;
  ctx.font = '13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`N=${meta.nodeCount}, h=${meta.treeHeight}`, width / 2, 12);

  // Build edge highlight set for O(1) lookup
  const edgeSet = new Set(highlightEdges.map(([a, b]) => `${a}-${b}`));

  // First pass: draw edges
  drawEdges(ctx, root, edgeSet);

  // Second pass: draw nodes (on top of edges)
  drawNodes(ctx, root, highlightNodes);

  // Third pass: draw active-node arrow indicator
  if (activeNode !== undefined) {
    const pos = findNodePosition(root, activeNode);
    if (pos) {
      const hl = highlightNodes.get(activeNode);
      const arrowColor = hl ? COLORS[hl] : '#ffffff';
      drawActiveArrow(ctx, pos.x, pos.y, arrowColor);
    }
  }
}

// ── Recursive edge drawing ─────────────────────────────────────────────────

function drawEdges(
  ctx: CanvasRenderingContext2D,
  node: PositionedNode,
  edgeSet: Set<string>,
) {
  if (node.left) {
    const key = `${node.value}-${node.left.value}`;
    drawEdge(ctx, node.x, node.y, node.left.x, node.left.y, edgeSet.has(key));
    drawEdges(ctx, node.left, edgeSet);
  }
  if (node.right) {
    const key = `${node.value}-${node.right.value}`;
    drawEdge(ctx, node.x, node.y, node.right.x, node.right.y, edgeSet.has(key));
    drawEdges(ctx, node.right, edgeSet);
  }
}

// ── Find node position by value ─────────────────────────────────────────────

function findNodePosition(
  node: PositionedNode | null,
  value: number,
): { x: number; y: number } | null {
  if (!node) return null;
  if (node.value === value) return { x: node.x, y: node.y };
  return findNodePosition(node.left, value) ?? findNodePosition(node.right, value);
}

// ── Recursive node drawing ─────────────────────────────────────────────────

function drawNodes(
  ctx: CanvasRenderingContext2D,
  node: PositionedNode,
  highlightNodes: Map<number, HighlightType>,
) {
  if (node.left) drawNodes(ctx, node.left, highlightNodes);
  if (node.right) drawNodes(ctx, node.right, highlightNodes);
  drawNode(ctx, node.x, node.y, node.value, highlightNodes.get(node.value) ?? null);
}
