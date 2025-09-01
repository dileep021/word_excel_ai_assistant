import React from 'react';

interface HeaderProps {
  onClose: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onClose }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <span className="menu-icon">☰</span>
          <h1 className="app-title">iPixxel AI Assistant</h1>
        </div>
        <button className="close-button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
    </header>
  );
};