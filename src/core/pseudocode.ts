import type { OperationType } from '../types';

export interface PseudocodeEntry {
  lines: string[];
  title: string;
}

const PSEUDOCODE: Record<string, PseudocodeEntry> = {
  search: {
    title: 'Search',
    lines: [
      'if this == null',
      '  return null',
      'else if this.key == search value',
      '  return this',
      'else if this.key < search value',
      '  search right',
      'else search left',
    ],
  },
  insert: {
    title: 'Insert',
    lines: [
      'if this == null',
      '  create new node',
      'else if value < this.key',
      '  go left',
      'else if value > this.key',
      '  go right',
    ],
  },
  remove: {
    title: 'Remove',
    lines: [
      'if this == null',
      '  return (not found)',
      'else if value < this.key',
      '  go left',
      'else if value > this.key',
      '  go right',
      'else // found the node',
      '  if leaf node: remove it',
      '  if one child: bypass',
      '  if two children:',
      '    replace with successor',
      '    remove successor from right',
    ],
  },
  create: {
    title: 'Create',
    lines: [
      'if this == null',
      '  create new node',
      'else if value < this.key',
      '  go left',
      'else if value > this.key',
      '  go right',
    ],
  },
  inorder: {
    title: 'In-Order Traversal',
    lines: [
      'if node == null',
      '  return',
      'inorder(node.left)',
      'visit node',
      'inorder(node.right)',
    ],
  },
  preorder: {
    title: 'Pre-Order Traversal',
    lines: [
      'if node == null',
      '  return',
      'visit node',
      'preorder(node.left)',
      'preorder(node.right)',
    ],
  },
  postorder: {
    title: 'Post-Order Traversal',
    lines: [
      'if node == null',
      '  return',
      'postorder(node.left)',
      'postorder(node.right)',
      'visit node',
    ],
  },
  predecessor: {
    title: 'Predecessor',
    lines: [
      'predecessor = null',
      'while node != null',
      '  if value <= node.key',
      '    go left',
      '  else',
      '    predecessor = node',
      '    go right',
      'return predecessor',
    ],
  },
  successor: {
    title: 'Successor',
    lines: [
      'successor = null',
      'while node != null',
      '  if value >= node.key',
      '    go right',
      '  else',
      '    successor = node',
      '    go left',
      'return successor',
    ],
  },
  selectKth: {
    title: 'Select k-th',
    lines: [
      'count = 0, result = null',
      'inorder(node.left)',
      'count++',
      'if count == k',
      '  result = node.key',
      'inorder(node.right)',
      'return result',
    ],
  },
};

export function getPseudocode(op: OperationType): PseudocodeEntry {
  return PSEUDOCODE[op] ?? { title: op, lines: [] };
}
