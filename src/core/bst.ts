import type { TreeNode, AnimationStep, HighlightType } from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Deep-clone a tree (cheap for typical BST sizes). */
export function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return { value: node.value, left: cloneTree(node.left), right: cloneTree(node.right) };
}

/** Count nodes. */
export function countNodes(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

/** Compute height. */
export function treeHeight(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
}

/** Find minimum-value node in a subtree. */
function findMin(node: TreeNode): TreeNode {
  let cur = node;
  while (cur.left) cur = cur.left;
  return cur;
}

/** Find maximum-value node in a subtree. */
function findMax(node: TreeNode): TreeNode {
  let cur = node;
  while (cur.right) cur = cur.right;
  return cur;
}

// ── Step builder utility ───────────────────────────────────────────────────

function makeStep(
  tree: TreeNode | null,
  description: string,
  highlights: Array<[number, HighlightType]> = [],
  edges: Array<[number, number]> = [],
  codeLine?: number,
  activeNode?: number,
): AnimationStep {
  return {
    tree: cloneTree(tree),
    description,
    highlightNodes: new Map(highlights),
    highlightEdges: [...edges],
    codeLine,
    activeNode,
  };
}

// ── Search ─────────────────────────────────────────────────────────────────
// Pseudocode lines (0-indexed):
//  0: if this == null
//  1:   return null
//  2: else if this.key == search value
//  3:   return this
//  4: else if this.key < search value
//  5:   search right
//  6: else search left

export function searchNode(
  root: TreeNode | null,
  value: number,
): { found: boolean; steps: AnimationStep[] } {
  const steps: AnimationStep[] = [];
  const pathEdges: Array<[number, number]> = [];
  const pathNodes = new Map<number, HighlightType>();
  let node = root;
  let parent: number | null = null;

  while (node) {
    // Add edge from parent to this node
    if (parent !== null) {
      pathEdges.push([parent, node.value]);
    }

    // Mark this node as visiting
    pathNodes.set(node.value, 'visiting');
    steps.push(makeTraversalStep(root, `Visit node ${node.value}`, node.value, 'visiting', pathNodes, pathEdges, 0));

    if (value === node.value) {
      pathNodes.set(node.value, 'found');
      steps.push(makeTraversalStep(root, `${node.value} == ${value}. Found!`, node.value, 'found', pathNodes, pathEdges, 2));
      steps.push(makeTraversalStep(root, `Value ${value} is found.`, node.value, 'found', pathNodes, pathEdges, 3));
      return { found: true, steps };
    }

    if (value < node.value) {
      steps.push(makeTraversalStep(root, `${value} < ${node.value}, go left`, node.value, 'visiting', pathNodes, pathEdges, 6));
    } else {
      steps.push(makeTraversalStep(root, `${value} > ${node.value}, go right`, node.value, 'visiting', pathNodes, pathEdges, 5));
    }

    parent = node.value;
    node = value < node.value ? node.left : node.right;
  }

  steps.push(makeStep(root, `Reached null`, [...pathNodes.entries()], [...pathEdges], 0));
  steps.push(makeStep(root, `${value} not found in tree`, [...pathNodes.entries()], [...pathEdges], 1));
  return { found: false, steps };
}

// ── Insert ─────────────────────────────────────────────────────────────────
// Pseudocode lines (0-indexed):
//  0: if this == null
//  1:   create new node
//  2: else if value < this.key
//  3:   go left
//  4: else if value > this.key
//  5:   go right

export function insertNode(
  root: TreeNode | null,
  value: number,
): { root: TreeNode; steps: AnimationStep[] } {
  const steps: AnimationStep[] = [];
  const pathEdges: Array<[number, number]> = [];
  const pathNodes = new Map<number, HighlightType>();

  function insert(node: TreeNode | null, parent: number | null): TreeNode {
    if (!node) {
      const newNode: TreeNode = { value, left: null, right: null };
      return newNode;
    }

    if (parent !== null) {
      pathEdges.push([parent, node.value]);
    }
    pathNodes.set(node.value, 'visiting');
    steps.push(makeTraversalStep(root, `Compare ${value} with ${node.value}`, node.value, 'visiting', pathNodes, pathEdges, 0));

    if (value < node.value) {
      steps.push(makeTraversalStep(root, `${value} < ${node.value}, go left`, node.value, 'visiting', pathNodes, pathEdges, 2));
      node.left = insert(node.left, node.value);
    } else if (value > node.value) {
      steps.push(makeTraversalStep(root, `${value} > ${node.value}, go right`, node.value, 'visiting', pathNodes, pathEdges, 4));
      node.right = insert(node.right, node.value);
    }
    return node;
  }

  if (!root) {
    const newRoot: TreeNode = { value, left: null, right: null };
    steps.push(makeStep(newRoot, `Insert ${value} as root`, [[value, 'inserting']], [], 1));
    return { root: newRoot, steps };
  }

  root = cloneTree(root)!;
  root = insert(root, null);
  pathNodes.set(value, 'inserting');
  steps.push(makeStep(root, `Inserted ${value}`, [...pathNodes.entries()], [...pathEdges], 1));
  return { root, steps };
}

// ── Remove ─────────────────────────────────────────────────────────────────
// Pseudocode lines (0-indexed):
//  0: if this == null
//  1:   return (not found)
//  2: else if value < this.key
//  3:   go left
//  4: else if value > this.key
//  5:   go right
//  6: else (found node)
//  7:   if leaf: remove it
//  8:   if one child: replace
//  9:   if two children: find successor
// 10:     replace key with successor
// 11:     remove successor from right

export function removeNode(
  root: TreeNode | null,
  value: number,
): { root: TreeNode | null; steps: AnimationStep[] } {
  const steps: AnimationStep[] = [];
  const pathEdges: Array<[number, number]> = [];
  const pathNodes = new Map<number, HighlightType>();

  function remove(node: TreeNode | null, parent: number | null): TreeNode | null {
    if (!node) {
      steps.push(makeStep(root, `${value} not found`, [...pathNodes.entries()], [...pathEdges], 1));
      return null;
    }

    if (parent !== null) {
      pathEdges.push([parent, node.value]);
    }
    pathNodes.set(node.value, 'visiting');
    steps.push(makeTraversalStep(root, `Visit ${node.value}`, node.value, 'visiting', pathNodes, pathEdges, 0));

    if (value < node.value) {
      steps.push(makeTraversalStep(root, `${value} < ${node.value}, go left`, node.value, 'visiting', pathNodes, pathEdges, 2));
      node.left = remove(node.left, node.value);
      return node;
    }
    if (value > node.value) {
      steps.push(makeTraversalStep(root, `${value} > ${node.value}, go right`, node.value, 'visiting', pathNodes, pathEdges, 4));
      node.right = remove(node.right, node.value);
      return node;
    }

    // Found the node to remove → line 6
    pathNodes.set(node.value, 'removing');
    steps.push(makeTraversalStep(root, `Found ${node.value}, removing`, node.value, 'removing', pathNodes, pathEdges, 6));

    if (!node.left && !node.right) {
      steps.push(makeTraversalStep(root, `${node.value} is a leaf, remove it`, node.value, 'removing', pathNodes, pathEdges, 7));
      return null;
    }
    if (!node.left) {
      steps.push(makeTraversalStep(root, `${node.value} has one child, replace`, node.value, 'removing', pathNodes, pathEdges, 8));
      return node.right;
    }
    if (!node.right) {
      steps.push(makeTraversalStep(root, `${node.value} has one child, replace`, node.value, 'removing', pathNodes, pathEdges, 8));
      return node.left;
    }

    // Two children: replace with in-order successor → line 9
    const successor = findMin(node.right);
    pathNodes.set(successor.value, 'found');
    steps.push(makeStep(root, `Two children, find successor: ${successor.value}`, [...pathNodes.entries()], [...pathEdges], 9));
    steps.push(makeStep(root, `Replace ${node.value} with ${successor.value}`, [...pathNodes.entries()], [...pathEdges], 10));
    node.value = successor.value;
    node.right = remove(node.right, node.value);
    return node;
  }

  root = cloneTree(root);
  root = remove(root, null);
  steps.push(makeStep(root, `Removal complete`, [...pathNodes.entries()], [...pathEdges], undefined));
  return { root, steps };
}

// ── Traversals ─────────────────────────────────────────────────────────────
//
// Traversal steps accumulate edges and visited nodes so that previously
// traversed paths stay coloured throughout the animation.

/** Build a parent→child edge map for the whole tree. */
function buildParentMap(node: TreeNode | null, parent: number | null, out: Map<number, number>) {
  if (!node) return;
  if (parent !== null) out.set(node.value, parent);
  buildParentMap(node.left, node.value, out);
  buildParentMap(node.right, node.value, out);
}

/** Helper: create a traversal step that keeps all previously visited edges/nodes. */
function makeTraversalStep(
  tree: TreeNode | null,
  description: string,
  currentNode: number,
  currentType: HighlightType,
  visitedNodes: Map<number, HighlightType>,
  visitedEdges: Array<[number, number]>,
  codeLine: number,
): AnimationStep {
  // Merge visited nodes with the current highlight (current node on top)
  const highlights = new Map(visitedNodes);
  highlights.set(currentNode, currentType);
  return {
    tree: cloneTree(tree),
    description,
    highlightNodes: highlights,
    highlightEdges: [...visitedEdges],
    codeLine,
    activeNode: currentNode,
  };
}

// In-order pseudocode (0-indexed):
//  0: if node == null
//  1:   return
//  2: inorder(node.left)
//  3: visit node
//  4: inorder(node.right)

export function inorderTraversal(root: TreeNode | null): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const visitedNodes = new Map<number, HighlightType>();
  const visitedEdges: Array<[number, number]> = [];
  const parentMap = new Map<number, number>();
  buildParentMap(root, null, parentMap);

  function walk(node: TreeNode | null) {
    if (!node) return;

    // Going left
    steps.push(makeTraversalStep(root, `Go left from ${node.value}`, node.value, 'visiting', visitedNodes, visitedEdges, 2));
    if (node.left) {
      visitedEdges.push([node.value, node.left.value]);
    }
    walk(node.left);

    // Visit this node
    visitedNodes.set(node.value, 'found');
    steps.push(makeTraversalStep(root, `Visit ${node.value} (in-order)`, node.value, 'found', visitedNodes, visitedEdges, 3));

    // Going right
    steps.push(makeTraversalStep(root, `Go right from ${node.value}`, node.value, 'visiting', visitedNodes, visitedEdges, 4));
    if (node.right) {
      visitedEdges.push([node.value, node.right.value]);
    }
    walk(node.right);
  }

  walk(root);
  steps.push(makeStep(root, 'In-order traversal complete', [...visitedNodes.entries()], [...visitedEdges]));
  return steps;
}

// Pre-order pseudocode (0-indexed):
//  0: if node == null
//  1:   return
//  2: visit node
//  3: preorder(node.left)
//  4: preorder(node.right)

export function preorderTraversal(root: TreeNode | null): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const visitedNodes = new Map<number, HighlightType>();
  const visitedEdges: Array<[number, number]> = [];
  const parentMap = new Map<number, number>();
  buildParentMap(root, null, parentMap);

  function walk(node: TreeNode | null) {
    if (!node) return;

    // Visit this node first
    visitedNodes.set(node.value, 'found');
    steps.push(makeTraversalStep(root, `Visit ${node.value} (pre-order)`, node.value, 'found', visitedNodes, visitedEdges, 2));

    // Go left
    steps.push(makeTraversalStep(root, `Go left from ${node.value}`, node.value, 'visiting', visitedNodes, visitedEdges, 3));
    if (node.left) {
      visitedEdges.push([node.value, node.left.value]);
    }
    walk(node.left);

    // Go right
    steps.push(makeTraversalStep(root, `Go right from ${node.value}`, node.value, 'visiting', visitedNodes, visitedEdges, 4));
    if (node.right) {
      visitedEdges.push([node.value, node.right.value]);
    }
    walk(node.right);
  }

  walk(root);
  steps.push(makeStep(root, 'Pre-order traversal complete', [...visitedNodes.entries()], [...visitedEdges]));
  return steps;
}

// Post-order pseudocode (0-indexed):
//  0: if node == null
//  1:   return
//  2: postorder(node.left)
//  3: postorder(node.right)
//  4: visit node

export function postorderTraversal(root: TreeNode | null): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const visitedNodes = new Map<number, HighlightType>();
  const visitedEdges: Array<[number, number]> = [];
  const parentMap = new Map<number, number>();
  buildParentMap(root, null, parentMap);

  function walk(node: TreeNode | null) {
    if (!node) return;

    // Go left
    steps.push(makeTraversalStep(root, `Go left from ${node.value}`, node.value, 'visiting', visitedNodes, visitedEdges, 2));
    if (node.left) {
      visitedEdges.push([node.value, node.left.value]);
    }
    walk(node.left);

    // Go right
    steps.push(makeTraversalStep(root, `Go right from ${node.value}`, node.value, 'visiting', visitedNodes, visitedEdges, 3));
    if (node.right) {
      visitedEdges.push([node.value, node.right.value]);
    }
    walk(node.right);

    // Visit this node last
    visitedNodes.set(node.value, 'found');
    steps.push(makeTraversalStep(root, `Visit ${node.value} (post-order)`, node.value, 'found', visitedNodes, visitedEdges, 4));
  }

  walk(root);
  steps.push(makeStep(root, 'Post-order traversal complete', [...visitedNodes.entries()], [...visitedEdges]));
  return steps;
}

// ── Predecessor / Successor ────────────────────────────────────────────────
// Predecessor pseudocode (0-indexed):
//  0: predecessor = null
//  1: while node != null
//  2:   if value <= node.key
//  3:     go left
//  4:   else
//  5:     predecessor = node
//  6:     go right
//  7: return predecessor

export function findPredecessor(
  root: TreeNode | null,
  value: number,
): { result: number | null; steps: AnimationStep[] } {
  const steps: AnimationStep[] = [];
  const pathEdges: Array<[number, number]> = [];
  const pathNodes = new Map<number, HighlightType>();
  let predecessor: TreeNode | null = null;
  let node = root;
  let parent: number | null = null;

  steps.push(makeStep(root, `Finding predecessor of ${value}`, [], [], 0));

  while (node) {
    if (parent !== null) pathEdges.push([parent, node.value]);
    pathNodes.set(node.value, 'visiting');
    steps.push(makeTraversalStep(root, `Visit ${node.value}`, node.value, 'visiting', pathNodes, pathEdges, 1));

    if (value <= node.value) {
      steps.push(makeTraversalStep(root, `${value} <= ${node.value}, go left`, node.value, 'visiting', pathNodes, pathEdges, 3));
      parent = node.value;
      node = node.left;
    } else {
      pathNodes.set(node.value, 'found');
      steps.push(makeTraversalStep(root, `${value} > ${node.value}, candidate`, node.value, 'found', pathNodes, pathEdges, 5));
      predecessor = node;
      parent = node.value;
      node = node.right;
    }
  }

  if (predecessor) {
    steps.push(makeStep(root, `Predecessor of ${value} is ${predecessor.value}`, [...pathNodes.entries()], [...pathEdges], 7));
  } else {
    steps.push(makeStep(root, `No predecessor for ${value}`, [...pathNodes.entries()], [...pathEdges], 7));
  }
  return { result: predecessor?.value ?? null, steps };
}

// Successor pseudocode (0-indexed):
//  0: successor = null
//  1: while node != null
//  2:   if value >= node.key
//  3:     go right
//  4:   else
//  5:     successor = node
//  6:     go left
//  7: return successor

export function findSuccessor(
  root: TreeNode | null,
  value: number,
): { result: number | null; steps: AnimationStep[] } {
  const steps: AnimationStep[] = [];
  const pathEdges: Array<[number, number]> = [];
  const pathNodes = new Map<number, HighlightType>();
  let successor: TreeNode | null = null;
  let node = root;
  let parent: number | null = null;

  steps.push(makeStep(root, `Finding successor of ${value}`, [], [], 0));

  while (node) {
    if (parent !== null) pathEdges.push([parent, node.value]);
    pathNodes.set(node.value, 'visiting');
    steps.push(makeTraversalStep(root, `Visit ${node.value}`, node.value, 'visiting', pathNodes, pathEdges, 1));

    if (value >= node.value) {
      steps.push(makeTraversalStep(root, `${value} >= ${node.value}, go right`, node.value, 'visiting', pathNodes, pathEdges, 3));
      parent = node.value;
      node = node.right;
    } else {
      pathNodes.set(node.value, 'found');
      steps.push(makeTraversalStep(root, `${value} < ${node.value}, candidate`, node.value, 'found', pathNodes, pathEdges, 5));
      successor = node;
      parent = node.value;
      node = node.left;
    }
  }

  if (successor) {
    steps.push(makeStep(root, `Successor of ${value} is ${successor.value}`, [...pathNodes.entries()], [...pathEdges], 7));
  } else {
    steps.push(makeStep(root, `No successor for ${value}`, [...pathNodes.entries()], [...pathEdges], 7));
  }
  return { result: successor?.value ?? null, steps };
}

// ── Select k-th smallest ──────────────────────────────────────────────────
// Pseudocode (0-indexed):
//  0: count = 0, result = null
//  1: inorder(node.left)
//  2: count++
//  3: if count == k
//  4:   result = node.key
//  5: inorder(node.right)
//  6: return result

export function selectKth(
  root: TreeNode | null,
  k: number,
): { result: number | null; steps: AnimationStep[] } {
  const steps: AnimationStep[] = [];
  const visitedNodes = new Map<number, HighlightType>();
  const visitedEdges: Array<[number, number]> = [];
  let count = 0;
  let result: number | null = null;

  steps.push(makeStep(root, `Select ${k}-th smallest`, [], [], 0));

  function walk(node: TreeNode | null) {
    if (!node || result !== null) return;

    if (node.left) visitedEdges.push([node.value, node.left.value]);
    walk(node.left);

    count++;
    visitedNodes.set(node.value, 'visiting');
    steps.push(makeTraversalStep(root, `Visit ${node.value} (count=${count})`, node.value, 'visiting', visitedNodes, visitedEdges, 2));

    if (count === k) {
      result = node.value;
      visitedNodes.set(node.value, 'found');
      steps.push(makeTraversalStep(root, `${k}-th smallest is ${node.value}`, node.value, 'found', visitedNodes, visitedEdges, 4));
      return;
    }

    if (node.right) visitedEdges.push([node.value, node.right.value]);
    walk(node.right);
  }

  walk(root);
  if (result === null) {
    steps.push(makeStep(root, `k=${k} is out of range`, [...visitedNodes.entries()], [...visitedEdges], 6));
  } else {
    steps.push(makeStep(root, `Result: ${result}`, [...visitedNodes.entries()], [...visitedEdges], 6));
  }
  return { result, steps };
}

// ── Create random tree ─────────────────────────────────────────────────────

export function createRandomTree(size: number): { root: TreeNode | null; steps: AnimationStep[] } {
  const allSteps: AnimationStep[] = [];
  let root: TreeNode | null = null;

  // Generate unique random values
  const values = new Set<number>();
  while (values.size < size) {
    values.add(Math.floor(Math.random() * 99) + 1);
  }

  for (const v of values) {
    const { root: newRoot, steps } = insertNode(root, v);
    root = newRoot;
    allSteps.push(...steps);
  }

  allSteps.push(makeStep(root, `Created BST with ${size} nodes`));
  return { root, steps: allSteps };
}

// ── Create default tree (height 7, ~21 nodes) ─────────────────────────────

/** Plain insert without animation steps (used for initial tree building). */
function insertPlain(root: TreeNode | null, value: number): TreeNode {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) root.left = insertPlain(root.left, value);
  else if (value > root.value) root.right = insertPlain(root.right, value);
  return root;
}

/**
 * Create a pre-built BST with height 7 and ~21 nodes.
 * No animation steps are produced — this is for instant initialisation.
 *
 * Tree shape:
 *                     50
 *              30            70
 *          15     40      60     85
 *        8  22  35  45  55  65 80  95
 *      4  11 20 25
 *    2
 *  1
 */
export function createDefaultTree(): TreeNode | null {
  const insertOrder = [
    50, 30, 70, 15, 40, 60, 85,
    8, 22, 35, 45, 55, 65, 80, 95,
    4, 11, 20, 25,
    2, 1,
  ];

  let root: TreeNode | null = null;
  for (const v of insertOrder) {
    root = insertPlain(root, v);
  }
  return root; // height 7: 50→30→15→8→4→2→1
}

// Re-export helpers used by other modules
export { findMin, findMax };
