import React, { useRef, useState } from 'react';
import { ExternalDocument } from '../../types';

interface DocumentPickerProps {
  documents: ExternalDocument[];
  onAddDocument: (file: File) => void;
  onRemoveDocument: (id: string) => void;
  onReadDocument: (id: string) => void;
}

export const DocumentPicker: React.FC<DocumentPickerProps> = ({
  documents,
  onAddDocument,
  onRemoveDocument,
  onReadDocument
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(documents.length > 0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onAddDocument(files[0]);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onAddDocument(files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      default:
        return '📎';
    }
  };

  return (
    <div className="document-picker">
      <div className="document-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Documents</h3>
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        {documents.length > 0 && (
          <span className="document-count">{documents.length}</span>
        )}
      </div>

      {isExpanded && (
        <div className="document-content">
          {documents.length > 0 && (
            <div className="document-list">
              {documents.map((doc) => (
                <div key={doc.id} className="document-item">
                  <div className="document-icon">{getFileIcon(doc.type)}</div>
                  <div className="document-info">
                    <div className="document-name">
                      {doc.name.length > 30 
                        ? doc.name.substring(0, 27) + '...' 
                        : doc.name}
                    </div>
                    <div className="document-meta">
                      {formatFileSize(doc.size)} • {doc.type.toUpperCase()}
                    </div>
                  </div>
                  <div className="document-actions">
                    <button
                      className="doc-action-button"
                      onClick={() => onReadDocument(doc.id)}
                      title="Read this file"
                    >
                      Read this file
                    </button>
                    <button
                      className="doc-remove-button"
                      onClick={() => onRemoveDocument(doc.id)}
                      title="Remove document"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            className={`document-dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <div className="dropzone-content">
              <div className="dropzone-icon">➕</div>
              <p className="dropzone-text">
                {isDragging 
                  ? 'Drop file here' 
                  : 'Click or drag file to upload'}
              </p>
              <p className="dropzone-hint">
                Supports PDF, DOCX, TXT (Max 10MB)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};