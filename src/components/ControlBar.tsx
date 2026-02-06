interface ControlBarProps {
  isPlaying: boolean;
  speed: number;
  currentStep: number;
  totalSteps: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onGoToStart: () => void;
  onGoToEnd: () => void;
  onSpeedChange: (speed: number) => void;
  disabled: boolean;
}

const SPEED_OPTIONS = [0.5, 1, 2, 4];

export default function ControlBar({
  isPlaying,
  speed,
  currentStep,
  totalSteps,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onGoToStart,
  onGoToEnd,
  onSpeedChange,
  disabled,
}: ControlBarProps) {
  return (
    <footer className="control-bar">
      <div className="control-speed">
        <label htmlFor="speed-select">Speed:</label>
        <select
          id="speed-select"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          disabled={disabled}
        >
          {SPEED_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}x
            </option>
          ))}
        </select>
      </div>

      <div className="control-buttons">
        <button onClick={onGoToStart} disabled={disabled} title="Go to start">
          ⏮
        </button>
        <button onClick={onStepBackward} disabled={disabled} title="Step backward">
          ⏪
        </button>
        {isPlaying ? (
          <button onClick={onPause} disabled={disabled} title="Pause" className="control-play">
            ⏸
          </button>
        ) : (
          <button onClick={onPlay} disabled={disabled} title="Play" className="control-play">
            ▶
          </button>
        )}
        <button onClick={onStepForward} disabled={disabled} title="Step forward">
          ⏩
        </button>
        <button onClick={onGoToEnd} disabled={disabled} title="Go to end">
          ⏭
        </button>
      </div>

      <div className="control-progress">
        {totalSteps > 0 && (
          <span>
            Step {Math.min(currentStep + 1, totalSteps)} / {totalSteps}
          </span>
        )}
      </div>
    </footer>
  );
}
