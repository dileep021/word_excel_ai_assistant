import React from 'react';
import { QuickAction, QuickActionButton } from '../../types';

interface QuickActionsProps {
  onActionClick: (action: QuickAction) => void;
  disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick, disabled }) => {
  const actions: QuickActionButton[] = [
    {
      id: 'rewrite',
      label: 'Rewrite',
      icon: '✏️',
      description: 'Rewrite text in a different style'
    },
    {
      id: 'grammar',
      label: 'Fix Grammar',
      icon: '📝',
      description: 'Correct grammar and spelling mistakes'
    },
    {
      id: 'translate',
      label: 'Translate',
      icon: '🌐',
      description: 'Translate to another language'
    },
    {
      id: 'summarize',
      label: 'Summarize',
      icon: '📄',
      description: 'Create a concise summary'
    },
    {
      id: 'draft',
      label: 'Generate Draft',
      icon: '✨',
      description: 'Generate new content'
    },
    {
      id: 'explain',
      label: 'Explain',
      icon: '💡',
      description: 'Explain or clarify content'
    }
  ];

  return (
    <div className="quick-actions">
      <h3 className="quick-actions-title">Quick Actions</h3>
      <div className="action-buttons-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className="quick-action-button"
            onClick={() => onActionClick(action.id)}
            disabled={disabled}
            title={action.description}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};