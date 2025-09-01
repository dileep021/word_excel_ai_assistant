import axios, { AxiosInstance } from 'axios';
import {
  ChatRequest,
  ChatResponse,
  ExternalDocument,
  QuickAction,
  ApiResponse
} from '../types';

export class OpenAIService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await this.api.post<ApiResponse<ChatResponse>>('/chat', request);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to communicate with AI service');
    }
  }

  async performQuickAction(
    action: QuickAction, 
    text: string, 
    options?: any
  ): Promise<{ result: string; original: string }> {
    try {
      const response = await this.api.post<ApiResponse<{ result: string; original: string }>>(
        '/quick-action',
        {
          action,
          text,
          options
        }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to perform action');
      }
    } catch (error) {
      console.error('Failed to perform quick action:', error);
      throw new Error('Failed to perform the requested action');
    }
  }

  async uploadDocument(file: File): Promise<ExternalDocument> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await this.api.post<ApiResponse<ExternalDocument>>(
        '/documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw new Error('Failed to upload document');
    }
  }

  async getDocument(id: string): Promise<ExternalDocument> {
    try {
      const response = await this.api.get<ApiResponse<ExternalDocument>>(
        `/documents/${id}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Document not found');
      }
    } catch (error) {
      console.error('Failed to get document:', error);
      throw new Error('Failed to retrieve document');
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await this.api.delete(`/documents/${id}`);
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw new Error('Failed to delete document');
    }
  }

  async translateText(
    text: string, 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<string> {
    try {
      const response = await this.api.post<ApiResponse<{ translated: string }>>(
        '/translate',
        {
          text,
          targetLanguage,
          sourceLanguage
        }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data.translated;
      } else {
        throw new Error(response.data.error || 'Translation failed');
      }
    } catch (error) {
      console.error('Failed to translate text:', error);
      throw new Error('Failed to translate text');
    }
  }

  async checkGrammar(text: string): Promise<{
    corrected: string;
    corrections: Array<{
      original: string;
      suggestion: string;
      type: string;
    }>;
  }> {
    try {
      const response = await this.api.post<ApiResponse<any>>('/grammar', { text });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Grammar check failed');
      }
    } catch (error) {
      console.error('Failed to check grammar:', error);
      throw new Error('Failed to check grammar');
    }
  }

  async summarizeText(
    text: string, 
    options?: {
      length?: 'brief' | 'detailed';
      format?: 'paragraph' | 'bullets';
    }
  ): Promise<string> {
    try {
      const response = await this.api.post<ApiResponse<{ summary: string }>>(
        '/summarize',
        {
          text,
          options
        }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data.summary;
      } else {
        throw new Error(response.data.error || 'Summarization failed');
      }
    } catch (error) {
      console.error('Failed to summarize text:', error);
      throw new Error('Failed to summarize text');
    }
  }

  async generateDraft(
    prompt: string,
    context?: string,
    template?: string
  ): Promise<string> {
    try {
      const response = await this.api.post<ApiResponse<{ draft: string }>>(
        '/generate-draft',
        {
          prompt,
          context,
          template
        }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data.draft;
      } else {
        throw new Error(response.data.error || 'Draft generation failed');
      }
    } catch (error) {
      console.error('Failed to generate draft:', error);
      throw new Error('Failed to generate draft');
    }
  }

  async explainText(text: string, level?: 'simple' | 'detailed'): Promise<string> {
    try {
      const response = await this.api.post<ApiResponse<{ explanation: string }>>(
        '/explain',
        {
          text,
          level: level || 'simple'
        }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data.explanation;
      } else {
        throw new Error(response.data.error || 'Explanation failed');
      }
    } catch (error) {
      console.error('Failed to explain text:', error);
      throw new Error('Failed to explain text');
    }
  }

  setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }
}