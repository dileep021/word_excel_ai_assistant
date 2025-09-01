const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
const MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS) || 2000;

class OpenAIService {
  async chat(message, context, options = {}) {
    try {
      // Build system message based on context
      const systemMessage = this.buildSystemMessage(context);
      
      // Build user message with context
      const userMessage = this.buildUserMessage(message, context);
      
      const completion = await openai.chat.completions.create({
        model: options.model || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: options.maxTokens || MAX_TOKENS,
        temperature: options.temperature || 0.7,
      });
      
      return {
        content: completion.choices[0].message.content,
        tokensUsed: completion.usage?.total_tokens || 0,
        model: completion.model
      };
    } catch (error) {
      console.error('OpenAI chat error:', error);
      throw new Error('Failed to generate response');
    }
  }
  
  async rewrite(text, options = {}) {
    try {
      const style = options.style || 'professional';
      const prompt = `Rewrite the following text in a ${style} style. Maintain the original meaning but improve clarity and flow:\n\n${text}`;
      
      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional writing assistant. Rewrite text while preserving meaning and improving quality.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
      });
      
      return {
        content: completion.choices[0].message.content,
        tokensUsed: completion.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('OpenAI rewrite error:', error);
      throw new Error('Failed to rewrite text');
    }
  }
  
  async fixGrammar(text) {
    try {
      const prompt = `Fix all grammar and spelling mistakes in the following text. Return only the corrected text:\n\n${text}`;
      
      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are a grammar and spelling expert. Fix errors while maintaining the original tone and style.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.3,
      });
      
      return {
        content: completion.choices[0].message.content,
        tokensUsed: completion.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('OpenAI grammar fix error:', error);
      throw new Error('Failed to fix grammar');
    }
  }
  
  async checkGrammar(text) {
    try {
      const prompt = `Analyze the following text for grammar and spelling errors. Return a JSON object with:
      1. "corrected": the fully corrected text
      2. "corrections": an array of corrections, each with "original", "suggestion", and "type" fields
      
      Text: ${text}`;
      
      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are a grammar expert. Analyze text and provide detailed corrections in JSON format.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(completion.choices[0].message.content);
      return result;
    } catch (error) {
      console.error('OpenAI grammar check error:', error);
      throw new Error('Failed to check grammar');
    }
  }
  
  async translate(text, options = {}) {
    try {
      const targetLanguage = options.targetLanguage || 'Spanish';
      const sourceLanguage = options.sourceLanguage || 'auto-detect';
      
      const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Preserve formatting, tone, and style:\n\n${text}`;
      
      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional translator. Translate accurately while preserving tone, style, and formatting.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.3,
      });
      
      return {
        content: completion.choices[0].message.content,
        tokensUsed: completion.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('OpenAI translation error:', error);
      throw new Error('Failed to translate text');
    }
  }
  
  async summarize(text, options = {}) {
    try {
      const length = options.length || 'brief';
      const format = options.format || 'paragraph';
      
      let prompt = `Summarize the following text in a ${length} manner`;
      
      if (format === 'bullets') {
        prompt += ' using bullet points';
      }
      
      prompt += `:\n\n${text}`;
      
      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert at creating clear, concise summaries that capture key information.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.5,
      });
      
      return {
        content: completion.choices[0].message.content,
        tokensUsed: completion.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('OpenAI summarization error:', error);
      throw new Error('Failed to summarize text');
    }
  }
  
  async generateDraft(prompt, options = {}) {
    try {
      const { context, template } = options;
      
      let fullPrompt = prompt;
      
      if (context) {
        fullPrompt = `Context: ${context}\n\n${prompt}`;
      }
      
      if (template) {
        fullPrompt = `Use the following template as a guide: ${template}\n\n${fullPrompt}`;
      }
      
      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional content writer. Generate high-quality drafts based on prompts and context.' 
          },
          { role: 'user', content: fullPrompt }
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.8,
      });
      
      return {
        content: completion.choices[0].message.content,
        tokensUsed: completion.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('OpenAI draft generation error:', error);
      throw new Error('Failed to generate draft');
    }
  }
  
  async explain(text, options = {}) {
    try {
      const level = options.level || 'simple';
      
      const prompt = `Explain the following text in ${level === 'simple' ? 'simple, easy-to-understand terms' : 'detailed, comprehensive terms'}:\n\n${text}`;
      
      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert at explaining complex topics clearly. Adapt your explanations to the requested level.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.6,
      });
      
      return {
        content: completion.choices[0].message.content,
        tokensUsed: completion.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('OpenAI explanation error:', error);
      throw new Error('Failed to explain text');
    }
  }
  
  buildSystemMessage(context) {
    let message = 'You are an AI assistant for Microsoft Word and Excel documents. ';
    
    if (context.mode === 'full') {
      message += 'You have access to the full document content. ';
    } else {
      message += 'You are working with a selected portion of the document. ';
    }
    
    if (context.attachedDocs && context.attachedDocs.length > 0) {
      message += `You also have access to ${context.attachedDocs.length} additional document(s) as context. `;
    }
    
    message += 'Provide helpful, accurate, and contextually relevant responses.';
    
    return message;
  }
  
  buildUserMessage(message, context) {
    let fullMessage = message;
    
    if (context.content) {
      fullMessage = `Document content:\n${context.content}\n\nUser query: ${message}`;
    }
    
    if (context.attachedDocs && context.attachedDocs.length > 0) {
      fullMessage += '\n\nAdditional documents:';
      context.attachedDocs.forEach((doc, index) => {
        fullMessage += `\n\nDocument ${index + 1}:\n${doc.content}`;
      });
    }
    
    return fullMessage;
  }
}

module.exports = new OpenAIService();