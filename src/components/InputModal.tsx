import { useState, useEffect, useRef } from 'react';

interface InputModalProps {
  title: string;
  placeholder?: string;
  onSubmit: (value: number) => void;
  onCancel: () => void;
}

export default function InputModal({
  title,
  placeholder = 'Enter a number…',
  onSubmit,
  onCancel,
}: InputModalProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseInt(input, 10);
    if (!isNaN(num) && num >= 0) {
      onSubmit(num);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onCancel();
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
      >
        <h3 className="modal-title">{title}</h3>
        <input
          ref={inputRef}
          className="modal-input"
          type="number"
          min={0}
          max={999}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
        />
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="modal-btn modal-btn-ok">
            Go
          </button>
        </div>
      </form>
    </div>
  );
}
