const { z } = require('zod');

// Everyday useful tools
const tools = [
  {
    name: 'get_current_time',
    description: 'Get the current time and date',
    parameters: z.object({}),
    execute: async () => {
      const now = new Date();
      return `Current date and time: ${now.toLocaleString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        timeZoneName: 'short'
      })}`;
    },
  },
  {
    name: 'calculate',
    description: 'Perform mathematical calculations. Supports basic operations (+, -, *, /), exponents (**), and parentheses',
    parameters: z.object({
      expression: z.string().describe('Mathematical expression to evaluate (e.g., "2 + 2", "10 * (5 + 3)")'),
    }),
    execute: async ({ expression }) => {
      try {
        const result = Function(`'use strict'; return (${expression})`)();
        return `${expression} = ${result}`;
      } catch (error) {
        return `Error: Invalid expression - ${error.message}`;
      }
    },
  },
  {
    name: 'generate_random_number',
    description: 'Generate a random number within a specified range',
    parameters: z.object({
      min: z.string().describe('Minimum value (inclusive)'),
      max: z.string().describe('Maximum value (inclusive)'),
    }),
    execute: async ({ min, max }) => {
      const minNum = parseInt(min);
      const maxNum = parseInt(max);
      if (isNaN(minNum) || isNaN(maxNum)) {
        return 'Error: Min and max must be valid numbers';
      }
      const random = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      return `Random number between ${min} and ${max}: ${random}`;
    },
  },
  {
    name: 'convert_temperature',
    description: 'Convert temperature between Celsius, Fahrenheit, and Kelvin',
    parameters: z.object({
      value: z.string().describe('Temperature value to convert'),
      from: z.string().describe('Source unit: celsius, fahrenheit, or kelvin'),
      to: z.string().describe('Target unit: celsius, fahrenheit, or kelvin'),
    }),
    execute: async ({ value, from, to }) => {
      const temp = parseFloat(value);
      if (isNaN(temp)) return 'Error: Invalid temperature value';
      
      const fromUnit = from.toLowerCase();
      const toUnit = to.toLowerCase();
      
      let celsius;
      if (fromUnit === 'celsius') celsius = temp;
      else if (fromUnit === 'fahrenheit') celsius = (temp - 32) * 5/9;
      else if (fromUnit === 'kelvin') celsius = temp - 273.15;
      else return 'Error: Invalid source unit. Use celsius, fahrenheit, or kelvin';
      
      let result;
      if (toUnit === 'celsius') result = celsius;
      else if (toUnit === 'fahrenheit') result = (celsius * 9/5) + 32;
      else if (toUnit === 'kelvin') result = celsius + 273.15;
      else return 'Error: Invalid target unit. Use celsius, fahrenheit, or kelvin';
      
      return `${value}° ${from} = ${result.toFixed(2)}° ${to}`;
    },
  },
  {
    name: 'count_words',
    description: 'Count words, characters, sentences, and paragraphs in text',
    parameters: z.object({
      text: z.string().describe('Text to analyze'),
    }),
    execute: async ({ text }) => {
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
      
      return `Text Analysis:
- Words: ${words}
- Characters (with spaces): ${characters}
- Characters (without spaces): ${charactersNoSpaces}
- Sentences: ${sentences}
- Paragraphs: ${paragraphs}`;
    },
  },
  {
    name: 'create_timer',
    description: 'Create a countdown timer for a specified duration',
    parameters: z.object({
      duration: z.string().describe('Duration in seconds'),
      label: z.string().describe('Optional label for the timer'),
    }),
    execute: async ({ duration, label }) => {
      const seconds = parseInt(duration);
      if (isNaN(seconds) || seconds <= 0) {
        return 'Error: Duration must be a positive number of seconds';
      }
      
      const timerLabel = label || 'Timer';
      return `${timerLabel} set for ${seconds} seconds (${Math.floor(seconds / 60)}m ${seconds % 60}s). Note: This is a notification only - I cannot actually run timers in this environment.`;
    },
  },
  {
    name: 'format_date',
    description: 'Format a date string into various formats',
    parameters: z.object({
      date: z.string().describe('Date to format (e.g., "2025-11-01" or "November 1, 2025")'),
      format: z.string().describe('Output format: "short" (11/1/25), "long" (November 1, 2025), "iso" (2025-11-01), or "relative" (X days ago)'),
    }),
    execute: async ({ date, format }) => {
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Error: Invalid date format';
        
        const formatType = format.toLowerCase();
        let result;
        
        if (formatType === 'short') {
          result = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
        } else if (formatType === 'long') {
          result = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } else if (formatType === 'iso') {
          result = d.toISOString().split('T')[0];
        } else if (formatType === 'relative') {
          const now = new Date();
          const diffTime = Math.abs(now - d);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          result = d > now ? `in ${diffDays} days` : `${diffDays} days ago`;
        } else {
          return 'Error: Format must be "short", "long", "iso", or "relative"';
        }
        
        return `Formatted date: ${result}`;
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },
  },
  {
    name: 'generate_password',
    description: 'Generate a random secure password',
    parameters: z.object({
      length: z.string().describe('Password length (default: 16)'),
      include_symbols: z.string().describe('Include symbols? (yes/no, default: yes)'),
    }),
    execute: async ({ length, include_symbols }) => {
      const len = parseInt(length) || 16;
      if (len < 8 || len > 128) return 'Error: Length must be between 8 and 128';
      
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      let chars = lowercase + uppercase + numbers;
      if (include_symbols.toLowerCase() !== 'no') {
        chars += symbols;
      }
      
      let password = '';
      for (let i = 0; i < len; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      return `Generated password: ${password}`;
    },
  },
];

const runTool = async (toolName, args) => {
  const tool = tools.find(t => t.name === toolName);
  
  if (!tool) {
    throw new Error(`Tool "${toolName}" not found`);
  }
  
  try {
    const validatedArgs = tool.parameters.parse(args);
    const result = await tool.execute(validatedArgs);
    return result;
  } catch (error) {
    throw new Error(`Tool execution failed: ${error.message}`);
  }
};

const getToolDeclarations = () => {
  return tools.map(tool => {
    const shape = tool.parameters.shape || {};
    const hasParams = Object.keys(shape).length > 0;
    
    return {
      functionDeclarations: [{
        name: tool.name,
        description: tool.description,
        parameters: hasParams ? {
          type: 'OBJECT',
          properties: Object.entries(shape).reduce((acc, [key, value]) => {
            acc[key] = {
              type: 'STRING',
              description: value.description || key,
            };
            return acc;
          }, {}),
          required: Object.keys(shape),
        } : {
          type: 'OBJECT',
          properties: {},
        },
      }]
    };
  });
};

module.exports = {
  tools,
  runTool,
  getToolDeclarations,
};
