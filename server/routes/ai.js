const express = require('express');
const router = express.Router();
const openaiService = require('../services/openai');

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context, action, options } = req.body;
    
    if (!message || !context) {
      return res.status(400).json({
        success: false,
        error: 'Message and context are required'
      });
    }
    
    const startTime = Date.now();
    const response = await openaiService.chat(message, context, options);
    const processingTime = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        response: response.content,
        tokensUsed: response.tokensUsed,
        model: response.model,
        processingTime
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process chat request',
      timestamp: new Date().toISOString()
    });
  }
});

// Quick action endpoint
router.post('/quick-action', async (req, res) => {
  try {
    const { action, text, options } = req.body;
    
    if (!action || !text) {
      return res.status(400).json({
        success: false,
        error: 'Action and text are required'
      });
    }
    
    let result;
    
    switch (action) {
      case 'rewrite':
        result = await openaiService.rewrite(text, options);
        break;
      case 'grammar':
        result = await openaiService.fixGrammar(text);
        break;
      case 'translate':
        result = await openaiService.translate(text, options);
        break;
      case 'summarize':
        result = await openaiService.summarize(text, options);
        break;
      case 'draft':
        result = await openaiService.generateDraft(text, options);
        break;
      case 'explain':
        result = await openaiService.explain(text, options);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action type'
        });
    }
    
    res.json({
      success: true,
      data: {
        result: result.content,
        original: text
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Quick action error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to perform action',
      timestamp: new Date().toISOString()
    });
  }
});

// Grammar check endpoint
router.post('/grammar', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }
    
    const result = await openaiService.checkGrammar(text);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Grammar check error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check grammar',
      timestamp: new Date().toISOString()
    });
  }
});

// Translation endpoint
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Text and target language are required'
      });
    }
    
    const result = await openaiService.translate(text, {
      targetLanguage,
      sourceLanguage
    });
    
    res.json({
      success: true,
      data: {
        translated: result.content
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to translate text',
      timestamp: new Date().toISOString()
    });
  }
});

// Summarization endpoint
router.post('/summarize', async (req, res) => {
  try {
    const { text, options } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }
    
    const result = await openaiService.summarize(text, options);
    
    res.json({
      success: true,
      data: {
        summary: result.content
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to summarize text',
      timestamp: new Date().toISOString()
    });
  }
});

// Draft generation endpoint
router.post('/generate-draft', async (req, res) => {
  try {
    const { prompt, context, template } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }
    
    const result = await openaiService.generateDraft(prompt, { context, template });
    
    res.json({
      success: true,
      data: {
        draft: result.content
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Draft generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate draft',
      timestamp: new Date().toISOString()
    });
  }
});

// Explanation endpoint
router.post('/explain', async (req, res) => {
  try {
    const { text, level } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }
    
    const result = await openaiService.explain(text, { level });
    
    res.json({
      success: true,
      data: {
        explanation: result.content
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to explain text',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;