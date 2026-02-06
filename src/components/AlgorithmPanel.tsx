import { useState, useEffect, useRef } from 'react';
import type { OperationType } from '../types';
import { getPseudocode } from '../core/pseudocode';

interface StepLogEntry {
  index: number;
  description: string;
}

interface AlgorithmPanelProps {
  /** Current operation being animated (null if idle) */
  activeOperation: { op: OperationType; value?: number } | null;
  /** Current step description */
  description: string;
  /** Active pseudocode line index */
  activeLine?: number;
  /** Whether the panel should be open */
  isAnimating: boolean;
  /** Accumulated step log */
  stepLog: StepLogEntry[];
}

export default function AlgorithmPanel({
  activeOperation,
  description,
  activeLine,
  isAnimating,
  stepLog,
}: AlgorithmPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-expand when animation starts
  useEffect(() => {
    if (isAnimating) setCollapsed(false);
  }, [isAnimating]);

  // Auto-scroll step log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [stepLog.length]);

  const pseudocode = activeOperation ? getPseudocode(activeOperation.op) : null;

  const operationLabel = activeOperation
    ? activeOperation.value !== undefined
      ? `${pseudocode?.title ?? activeOperation.op}(${activeOperation.value})`
      : (pseudocode?.title ?? activeOperation.op)
    : null;

  // Determine description banner colour
  const isComplete = description.toLowerCase().includes('complete') ||
                     description.toLowerCase().includes('found') ||
                     description.toLowerCase().includes('inserted') ||
                     description.toLowerCase().includes('result');
  const isError = description.toLowerCase().includes('not found') ||
                  description.toLowerCase().includes('out of range');

  return (
    <aside className={`algo-panel ${collapsed ? 'algo-panel--collapsed' : ''}`}>
      {/* Collapse toggle tab */}
      <button
        className="algo-panel-toggle"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? 'Expand panel' : 'Collapse panel'}
      >
        {collapsed ? '‹' : '›'}
      </button>

      {!collapsed && (
        <div className="algo-panel-content">
          {/* ── Header ──────────────────────────────── */}
          {operationLabel && (
            <div className="algo-panel-header">{operationLabel}</div>
          )}

          {/* ── Status banner ───────────────────────── */}
          {description && (
            <div
              className={`algo-panel-status ${
                isError ? 'algo-panel-status--error' : isComplete ? 'algo-panel-status--success' : ''
              }`}
            >
              {description}
            </div>
          )}

          {/* ── Pseudocode ──────────────────────────── */}
          {pseudocode && pseudocode.lines.length > 0 && (
            <div className="algo-panel-code">
              {pseudocode.lines.map((line, i) => (
                <div
                  key={i}
                  className={`algo-code-line ${activeLine === i ? 'algo-code-line--active' : ''}`}
                >
                  <pre>{line}</pre>
                </div>
              ))}
            </div>
          )}

          {/* ── Step log (accordion) ────────────────── */}
          {stepLog.length > 0 && (
            <details className="algo-panel-log" open>
              <summary className="algo-panel-log-header">
                Step History ({stepLog.length})
              </summary>
              <div className="algo-panel-log-list">
                {stepLog.map((entry) => (
                  <div key={entry.index} className="algo-log-entry">
                    <span className="algo-log-idx">{entry.index + 1}.</span>
                    <span className="algo-log-desc">{entry.description}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </details>
          )}

          {/* ── Empty state ─────────────────────────── */}
          {!activeOperation && stepLog.length === 0 && (
            <div className="algo-panel-empty">
              Run an operation to see the algorithm steps here.
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
