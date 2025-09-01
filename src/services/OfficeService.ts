import { DocumentStats, OfficeContext, InsertOptions } from '../types';

export class OfficeService {
  private context: OfficeContext;
  private selectionChangeHandler: ((selection: string) => void) | null = null;

  constructor() {
    this.context = {
      isWord: false,
      isExcel: false,
      version: '',
      platform: 'PC'
    };
  }

  async initialize(): Promise<void> {
    return new Promise((resolve) => {
      Office.onReady((info) => {
        this.context = {
          isWord: info.host === Office.HostType.Word,
          isExcel: info.host === Office.HostType.Excel,
          version: '',
          platform: info.platform === Office.PlatformType.PC ? 'PC' : 
                   info.platform === Office.PlatformType.Mac ? 'Mac' : 'Web'
        };
        
        if (this.context.isWord) {
          this.initializeWordHandlers();
        } else if (this.context.isExcel) {
          this.initializeExcelHandlers();
        }
        
        resolve();
      });
    });
  }

  private initializeWordHandlers(): void {
    // Word doesn't have a direct onSelectionChanged event in all versions
    // We can use a polling approach or manual triggers
    // For simplicity, we'll trigger on user actions
    setInterval(async () => {
      if (this.selectionChangeHandler) {
        try {
          await this.handleSelectionChange();
        } catch (error) {
          // Silently ignore errors during polling
        }
      }
    }, 2000); // Check every 2 seconds
  }

  private initializeExcelHandlers(): void {
    Excel.run(async (context) => {
      const worksheet = context.workbook.worksheets.getActiveWorksheet();
      worksheet.onSelectionChanged.add(async () => {
        await this.handleSelectionChange();
      });
      await context.sync();
    }).catch(error => console.error('Failed to initialize Excel handlers:', error));
  }

  private handleSelectionChange(): Promise<void> {
    return this.getSelectedText().then(selectedText => {
      if (this.selectionChangeHandler) {
        this.selectionChangeHandler(selectedText);
      }
    });
  }

  onSelectionChange(handler: (selection: string) => void): void {
    this.selectionChangeHandler = handler;
  }

  async getFullDocument(): Promise<string> {
    if (this.context.isWord) {
      return Word.run(async (context) => {
        const body = context.document.body;
        body.load('text');
        await context.sync();
        return body.text;
      });
    } else if (this.context.isExcel) {
      return Excel.run(async (context) => {
        const worksheet = context.workbook.worksheets.getActiveWorksheet();
        const range = worksheet.getUsedRange();
        range.load('values');
        await context.sync();
        
        if (range.values) {
          return range.values
            .map(row => row.join('\t'))
            .join('\n');
        }
        return '';
      });
    }
    return '';
  }

  async getSelectedText(): Promise<string> {
    if (this.context.isWord) {
      return Word.run(async (context) => {
        const selection = context.document.getSelection();
        selection.load('text');
        await context.sync();
        return selection.text;
      });
    } else if (this.context.isExcel) {
      return Excel.run(async (context) => {
        const range = context.workbook.getSelectedRange();
        range.load('values');
        await context.sync();
        
        if (range.values) {
          return range.values
            .map(row => row.join('\t'))
            .join('\n');
        }
        return '';
      });
    }
    return '';
  }

  async insertText(text: string, replace: boolean = false): Promise<void> {
    if (this.context.isWord) {
      return Word.run(async (context) => {
        const selection = context.document.getSelection();
        
        if (replace) {
          selection.insertText(text, Word.InsertLocation.replace);
        } else {
          selection.insertText(text, Word.InsertLocation.end);
        }
        
        await context.sync();
      });
    } else if (this.context.isExcel) {
      return Excel.run(async (context) => {
        const range = context.workbook.getSelectedRange();
        range.values = [[text]];
        await context.sync();
      });
    }
  }

  async replaceSelection(text: string): Promise<void> {
    return this.insertText(text, true);
  }

  async insertAtCursor(text: string): Promise<void> {
    return this.insertText(text, false);
  }

  async appendToDocument(text: string): Promise<void> {
    if (this.context.isWord) {
      return Word.run(async (context) => {
        const body = context.document.body;
        body.insertText(text, Word.InsertLocation.end);
        await context.sync();
      });
    } else if (this.context.isExcel) {
      return Excel.run(async (context) => {
        const worksheet = context.workbook.worksheets.getActiveWorksheet();
        const lastCell = worksheet.getUsedRange().getLastCell();
        lastCell.getOffsetRange(1, 0).values = [[text]];
        await context.sync();
      });
    }
  }

  getDocumentStats(text: string): DocumentStats {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characters = text.length;
    const paragraphs = text.split(/\n\n+/).filter(para => para.trim().length > 0).length;
    
    return {
      words,
      characters,
      paragraphs
    };
  }

  async getDocumentInfo(): Promise<any> {
    if (this.context.isWord) {
      return Word.run(async (context) => {
        const properties = context.document.properties;
        properties.load(['title', 'author', 'subject']);
        await context.sync();
        
        return {
          title: properties.title,
          author: properties.author,
          subject: properties.subject
        };
      });
    } else if (this.context.isExcel) {
      return Excel.run(async (context) => {
        const workbook = context.workbook;
        workbook.load('name');
        await context.sync();
        
        return {
          name: workbook.name
        };
      });
    }
    return {};
  }

  async highlightText(searchText: string): Promise<void> {
    if (this.context.isWord) {
      return Word.run(async (context) => {
        const searchResults = context.document.body.search(searchText, {
          matchCase: false,
          matchWholeWord: false
        });
        
        searchResults.load('items');
        await context.sync();
        
        searchResults.items.forEach(item => {
          item.font.highlightColor = '#FFFF00';
        });
        
        await context.sync();
      });
    }
  }

  async clearHighlights(): Promise<void> {
    if (this.context.isWord) {
      return Word.run(async (context) => {
        const body = context.document.body;
        body.font.highlightColor = '#FFFFFF';
        await context.sync();
      });
    }
  }

  isWordDocument(): boolean {
    return this.context.isWord;
  }

  isExcelWorkbook(): boolean {
    return this.context.isExcel;
  }

  getContext(): OfficeContext {
    return this.context;
  }
}