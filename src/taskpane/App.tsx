import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  ChatMessage, 
  ExternalDocument, 
  AppState, 
  QuickAction,
  DocumentStats 
} from '../types';
import { ChatInterface } from './components/ChatInterface';
import { ContextSelector } from './components/ContextSelector';
import { DocumentPicker } from './components/DocumentPicker';
import { QuickActions } from './components/QuickActions';
import { Header } from './components/Header';
import { OfficeService } from '../services/OfficeService';
import { OpenAIService } from '../services/OpenAIService';
import './styles/taskpane.css';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    messages: [],
    contextMode: 'full',
    attachedDocs: [],
    isLoading: false,
    selectedText: '',
    fullDocumentText: '',
    error: null,
    documentStats: { words: 0, characters: 0 },
    currentUser: 'User'
  });

  const officeService = new OfficeService();
  const aiService = new OpenAIService();

  useEffect(() => {
    Office.onReady(() => {
      initializeAddin();
    });
  }, []);

  const initializeAddin = async () => {
    try {
      await officeService.initialize();
      const fullText = await officeService.getFullDocument();
      const stats = officeService.getDocumentStats(fullText);
      
      setState(prev => ({
        ...prev,
        fullDocumentText: fullText,
        documentStats: stats
      }));

      officeService.onSelectionChange((selectedText) => {
        setState(prev => ({
          ...prev,
          selectedText
        }));
      });
    } catch (error) {
      console.error('Failed to initialize add-in:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to initialize add-in'
      }));
    }
  };

  const handleSendMessage = async (message: string) => {
    const newUserMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      context: {
        mode: state.contextMode,
        attachedDocs: state.attachedDocs.map(doc => doc.id),
        documentStats: state.documentStats
      }
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newUserMessage],
      isLoading: true,
      error: null
    }));

    try {
      const contextContent = state.contextMode === 'selection' 
        ? state.selectedText 
        : state.fullDocumentText;

      const response = await aiService.sendMessage({
        message,
        context: {
          mode: state.contextMode,
          content: contextContent,
          attachedDocs: state.attachedDocs.map(doc => ({
            id: doc.id,
            content: doc.extractedText || ''
          }))
        }
      });

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get response. Please try again.'
      }));
    }
  };

  const handleInsertResponse = async (content: string) => {
    try {
      await officeService.insertText(content, true);
    } catch (error) {
      console.error('Failed to insert text:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to insert text into document'
      }));
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    const contextContent = state.contextMode === 'selection' 
      ? state.selectedText 
      : state.fullDocumentText;

    if (!contextContent) {
      setState(prev => ({
        ...prev,
        error: 'No content selected for action'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const response = await aiService.performQuickAction(action, contextContent);
      
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: `[Quick Action: ${action}]`,
        timestamp: new Date()
      };

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.result,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage, assistantMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to perform quick action:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to perform action. Please try again.'
      }));
    }
  };

  const handleContextModeChange = (mode: 'full' | 'selection') => {
    setState(prev => ({
      ...prev,
      contextMode: mode
    }));
  };

  const handleAddDocument = async (file: File) => {
    try {
      const document = await aiService.uploadDocument(file);
      setState(prev => ({
        ...prev,
        attachedDocs: [...prev.attachedDocs, document]
      }));
    } catch (error) {
      console.error('Failed to upload document:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to upload document'
      }));
    }
  };

  const handleRemoveDocument = (id: string) => {
    setState(prev => ({
      ...prev,
      attachedDocs: prev.attachedDocs.filter(doc => doc.id !== id)
    }));
  };

  const handleReadDocument = async (id: string) => {
    const doc = state.attachedDocs.find(d => d.id === id);
    if (doc && doc.extractedText) {
      const message: ChatMessage = {
        id: generateId(),
        role: 'system',
        content: `Document "${doc.name}" has been loaded as context.`,
        timestamp: new Date()
      };
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }));
    }
  };

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  return (
    <div className="app-container">
      <Header onClose={() => Office.context.ui.closeContainer()} />
      
      <div className="app-content">
        <ContextSelector
          mode={state.contextMode}
          onModeChange={handleContextModeChange}
          hasSelection={!!state.selectedText}
          documentStats={state.documentStats}
        />

        <ChatInterface
          messages={state.messages}
          onSendMessage={handleSendMessage}
          onInsertResponse={handleInsertResponse}
          isLoading={state.isLoading}
        />

        <QuickActions
          onActionClick={handleQuickAction}
          disabled={state.isLoading}
        />

        <DocumentPicker
          documents={state.attachedDocs}
          onAddDocument={handleAddDocument}
          onRemoveDocument={handleRemoveDocument}
          onReadDocument={handleReadDocument}
        />

        {state.error && (
          <div className="error-toast">
            {state.error}
            <button onClick={() => setState(prev => ({ ...prev, error: null }))}>
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Office.onReady(() => {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(<App />);
});

export default App;