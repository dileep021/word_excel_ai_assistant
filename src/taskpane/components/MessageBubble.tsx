import React, { useState } from 'react';
import { ChatMessage } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
  onInsert?: (content: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onInsert }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h3 key={index}>{line.substring(2)}</h3>;
        } else if (line.startsWith('## ')) {
          return <h4 key={index}>{line.substring(3)}</h4>;
        } else if (line.startsWith('- ') || line.startsWith('• ')) {
          return <li key={index}>{line.substring(2)}</li>;
        } else if (line.startsWith('```')) {
          return <code key={index} className="code-block">{line.substring(3)}</code>;
        } else if (line.trim() === '') {
          return <br key={index} />;
        } else {
          return <p key={index}>{line}</p>;
        }
      });
  };

  return (
    <div className={`message-bubble ${message.role}`}>
      <div className="message-header">
        <span className="message-author">
          {message.role === 'user' ? 'You' : 
           message.role === 'assistant' ? 'AI Assistant' : 'System'}
        </span>
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>
      
      <div className="message-content">
        {renderContent(message.content)}
      </div>

      {message.role === 'assistant' && (
        <div className="message-actions">
          <button
            className="action-button"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          
          {onInsert && (
            <button
              className="action-button primary"
              onClick={() => onInsert(message.content)}
              title="Insert into document"
            >
              ↓ Insert
            </button>
          )}
          
          <button
            className="action-button"
            onClick={() => {/* Implement refresh logic */}}
            title="Regenerate response"
          >
            🔄
          </button>
        </div>
      )}

      {message.context && (
        <div className="message-context">
          <span className="context-badge">
            {message.context.mode === 'full' ? '📄 Full Document' : '✂️ Selection'}
          </span>
          {message.context.attachedDocs.length > 0 && (
            <span className="context-badge">
              📎 {message.context.attachedDocs.length} file(s)
            </span>
          )}
        </div>
      )}
    </div>
  );
};