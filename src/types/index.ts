export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: MessageContext;
}

export interface MessageContext {
  mode: 'full' | 'selection';
  attachedDocs: string[];
  documentStats?: DocumentStats;
}

export interface DocumentStats {
  words: number;
  characters: number;
  paragraphs?: number;
}

export interface ExternalDocument {
  id: string;
  name: string;
  size: number;
  type: 'pdf' | 'docx' | 'txt';
  uploadDate: Date;
  content?: string;
  extractedText?: string;
}

export type QuickAction = 
  | 'rewrite' 
  | 'grammar' 
  | 'translate' 
  | 'summarize' 
  | 'draft' 
  | 'explain';

export interface QuickActionButton {
  id: QuickAction;
  label: string;
  icon: string;
  description: string;
}

export interface AppState {
  messages: ChatMessage[];
  contextMode: 'full' | 'selection';
  attachedDocs: ExternalDocument[];
  isLoading: boolean;
  selectedText: string;
  fullDocumentText: string;
  error: string | null;
  documentStats: DocumentStats;
  currentUser: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  context: {
    mode: 'full' | 'selection';
    content: string;
    attachedDocs: Array<{
      id: string;
      content: string;
    }>;
  };
  action?: QuickAction;
  options?: ChatOptions;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  style?: 'professional' | 'casual' | 'creative' | 'concise' | 'expanded';
  language?: string;
}

export interface ChatResponse {
  response: string;
  tokensUsed: number;
  model: string;
  processingTime: number;
}

export interface OfficeContext {
  isWord: boolean;
  isExcel: boolean;
  version: string;
  platform: 'PC' | 'Mac' | 'Web';
}

export interface InsertOptions {
  replace: boolean;
  position?: 'cursor' | 'end' | 'beginning';
  format?: 'plain' | 'formatted';
}