import React, { useState } from 'react';
import { DocumentStats } from '../../types';

interface ContextSelectorProps {
  mode: 'full' | 'selection';
  onModeChange: (mode: 'full' | 'selection') => void;
  hasSelection: boolean;
  documentStats: DocumentStats;
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({
  mode,
  onModeChange,
  hasSelection,
  documentStats
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const handleToggle = () => {
    if (mode === 'full') {
      if (hasSelection) {
        onModeChange('selection');
      }
    } else {
      onModeChange('full');
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="context-selector">
      <div className="context-toggle-container">
        <input
          type="checkbox"
          id="context-toggle"
          className="context-toggle-checkbox"
          checked={mode === 'selection'}
          onChange={handleToggle}
          disabled={mode === 'selection' && !hasSelection}
        />
        <label htmlFor="context-toggle" className="context-toggle-label">
          <span className="toggle-text">
            Using <strong>{mode === 'full' ? 'Full document' : 'Selection'}</strong> as context
          </span>
        </label>
        
        <button
          className="info-button"
          onClick={() => setShowInfo(!showInfo)}
          aria-label="More information"
        >
          ℹ️
        </button>
      </div>

      {showInfo && (
        <div className="context-info">
          <p>
            <strong>Full document:</strong> The AI will use your entire document as context for responses.
          </p>
          <p>
            <strong>Selection:</strong> The AI will only use the text you've selected as context.
          </p>
          <div className="document-stats">
            <h4>Document Statistics:</h4>
            <ul>
              <li>Words: {formatNumber(documentStats.words)}</li>
              <li>Characters: {formatNumber(documentStats.characters)}</li>
              {documentStats.paragraphs && (
                <li>Paragraphs: {formatNumber(documentStats.paragraphs)}</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {mode === 'selection' && !hasSelection && (
        <div className="context-warning">
          ⚠️ No text selected. Select text in your document or switch to "Full document" mode.
        </div>
      )}
    </div>
  );
};