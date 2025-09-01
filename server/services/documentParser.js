const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class DocumentParser {
  async parseDocument(filePath, mimetype) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      
      switch (ext) {
        case '.pdf':
          return await this.parsePDF(filePath);
        case '.docx':
          return await this.parseDOCX(filePath);
        case '.txt':
          return await this.parseTXT(filePath);
        default:
          throw new Error(`Unsupported file type: ${ext}`);
      }
    } catch (error) {
      console.error('Document parsing error:', error);
      throw new Error(`Failed to parse document: ${error.message}`);
    }
  }
  
  async parsePDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      
      // Clean up the extracted text
      let text = data.text;
      
      // Remove excessive whitespace
      text = text.replace(/\s+/g, ' ');
      
      // Preserve paragraph breaks
      text = text.replace(/\n\n+/g, '\n\n');
      
      return text.trim();
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF file');
    }
  }
  
  async parseDOCX(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      
      if (result.messages && result.messages.length > 0) {
        console.warn('DOCX parsing warnings:', result.messages);
      }
      
      return result.value.trim();
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error('Failed to parse DOCX file');
    }
  }
  
  async parseTXT(filePath) {
    try {
      const text = await fs.readFile(filePath, 'utf8');
      return text.trim();
    } catch (error) {
      console.error('TXT parsing error:', error);
      throw new Error('Failed to parse TXT file');
    }
  }
  
  async getDocumentMetadata(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      const metadata = {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension: ext
      };
      
      if (ext === '.pdf') {
        try {
          const dataBuffer = await fs.readFile(filePath);
          const data = await pdfParse(dataBuffer);
          
          metadata.pages = data.numpages;
          metadata.info = data.info;
          metadata.metadata = data.metadata;
        } catch (error) {
          console.warn('Could not extract PDF metadata:', error);
        }
      }
      
      return metadata;
    } catch (error) {
      console.error('Error getting document metadata:', error);
      return {};
    }
  }
  
  extractTextChunks(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentChunk = '';
    let currentSize = 0;
    
    for (const sentence of sentences) {
      if (currentSize + sentence.length > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        
        // Add overlap from the end of the current chunk
        const overlapText = currentChunk.slice(-overlap);
        currentChunk = overlapText + sentence;
        currentSize = currentChunk.length;
      } else {
        currentChunk += sentence;
        currentSize += sentence.length;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
  
  async summarizeDocument(filePath, mimetype) {
    try {
      const text = await this.parseDocument(filePath, mimetype);
      const wordCount = text.split(/\s+/).length;
      const charCount = text.length;
      const paragraphs = text.split(/\n\n+/).length;
      
      // Extract first few sentences as preview
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      const preview = sentences.slice(0, 3).join(' ');
      
      return {
        wordCount,
        charCount,
        paragraphs,
        preview,
        fullText: text
      };
    } catch (error) {
      console.error('Document summarization error:', error);
      throw new Error('Failed to summarize document');
    }
  }
  
  cleanText(text) {
    // Remove control characters
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ');
    
    // Fix common encoding issues
    text = text.replace(/â€™/g, "'");
    text = text.replace(/â€œ/g, '"');
    text = text.replace(/â€/g, '"');
    text = text.replace(/â€"/g, '—');
    text = text.replace(/â€"/g, '–');
    
    return text.trim();
  }
}

module.exports = new DocumentParser();