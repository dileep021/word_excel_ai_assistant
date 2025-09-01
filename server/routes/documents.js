const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const documentParser = require('../services/documentParser');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for documents (in production, use a database)
const documents = new Map();

// Upload document endpoint
router.post('/upload', (req, res, next) => {
  const upload = req.app.locals.upload;
  
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    try {
      // Parse the document to extract text
      const extractedText = await documentParser.parseDocument(req.file.path, req.file.mimetype);
      
      // Create document record
      const document = {
        id: uuidv4(),
        name: req.file.originalname,
        size: req.file.size,
        type: path.extname(req.file.originalname).substring(1).toLowerCase(),
        uploadDate: new Date(),
        path: req.file.path,
        extractedText,
        mimetype: req.file.mimetype
      };
      
      // Store document in memory
      documents.set(document.id, document);
      
      // Return document info (without the full extracted text for response size)
      res.json({
        success: true,
        data: {
          id: document.id,
          name: document.name,
          size: document.size,
          type: document.type,
          uploadDate: document.uploadDate,
          extractedText: extractedText.substring(0, 500) + '...' // Preview only
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Document upload error:', error);
      
      // Clean up uploaded file on error
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Failed to delete uploaded file:', unlinkError);
        }
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process document',
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Get document by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = documents.get(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: document.id,
        name: document.name,
        size: document.size,
        type: document.type,
        uploadDate: document.uploadDate,
        content: document.extractedText,
        metadata: {
          mimetype: document.mimetype,
          wordCount: document.extractedText.split(/\s+/).length,
          characterCount: document.extractedText.length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve document',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = documents.get(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Delete the file from disk
    try {
      await fs.unlink(document.path);
    } catch (error) {
      console.error('Failed to delete file from disk:', error);
    }
    
    // Remove from memory
    documents.delete(id);
    
    res.json({
      success: true,
      message: 'Document deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete document',
      timestamp: new Date().toISOString()
    });
  }
});

// List all documents
router.get('/', (req, res) => {
  try {
    const documentList = Array.from(documents.values()).map(doc => ({
      id: doc.id,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      uploadDate: doc.uploadDate
    }));
    
    res.json({
      success: true,
      data: documentList,
      count: documentList.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list documents',
      timestamp: new Date().toISOString()
    });
  }
});

// Clean up old documents periodically (every hour)
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 3600000);
  
  for (const [id, doc] of documents.entries()) {
    if (doc.uploadDate < oneHourAgo) {
      // Delete old file
      fs.unlink(doc.path).catch(err => 
        console.error('Failed to delete old file:', err)
      );
      // Remove from memory
      documents.delete(id);
    }
  }
}, 3600000);

module.exports = router;