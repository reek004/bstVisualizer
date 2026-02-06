import type { OperationType } from '../types';

interface SidebarProps {
  onOperation: (op: OperationType) => void;
  disabled: boolean;
}

const OPERATIONS: { label: string; op: OperationType }[] = [
  { label: 'Create', op: 'create' },
  { label: 'Search(v)', op: 'search' },
  { label: 'Insert(v)', op: 'insert' },
  { label: 'Remove(v)', op: 'remove' },
  { label: 'Predecessor(v)', op: 'predecessor' },
  { label: 'Successor(v)', op: 'successor' },
  { label: 'Select(k)', op: 'selectKth' },
  { label: 'In-Order', op: 'inorder' },
  { label: 'Pre-Order', op: 'preorder' },
  { label: 'Post-Order', op: 'postorder' },
];

export default function Sidebar({ onOperation, disabled }: SidebarProps) {
  return (
    <aside className="sidebar">
      {OPERATIONS.map(({ label, op }) => (
        <button
          key={op}
          className="sidebar-btn"
          disabled={disabled}
          onClick={() => onOperation(op)}
        >
          {label}
        </button>
      ))}
    </aside>
  );
}
