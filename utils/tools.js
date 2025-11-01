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
  // API-based tools
  {
    name: 'get_weather',
    description: 'Get current weather information for a city',
    parameters: z.object({
      city: z.string().describe('City name (e.g., "London", "New York")'),
    }),
    execute: async ({ city }) => {
      try {
        const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        if (!response.ok) return `Error: Could not fetch weather for ${city}`;
        
        const data = await response.json();
        const current = data.current_condition[0];
        const location = data.nearest_area[0];
        
        return `Weather in ${location.areaName[0].value}, ${location.country[0].value}:
- Temperature: ${current.temp_C}°C (${current.temp_F}°F)
- Feels Like: ${current.FeelsLikeC}°C
- Condition: ${current.weatherDesc[0].value}
- Humidity: ${current.humidity}%
- Wind: ${current.windspeedKmph} km/h ${current.winddir16Point}
- Visibility: ${current.visibility} km`;
      } catch (error) {
        return `Error fetching weather: ${error.message}`;
      }
    },
  },
  {
    name: 'get_random_fact',
    description: 'Get a random interesting fact',
    parameters: z.object({}),
    execute: async () => {
      try {
        const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
        if (!response.ok) return 'Error: Could not fetch fact';
        
        const data = await response.json();
        return `Random Fact: ${data.text}`;
      } catch (error) {
        return `Error fetching fact: ${error.message}`;
      }
    },
  },
  {
    name: 'get_advice',
    description: 'Get a random piece of advice',
    parameters: z.object({}),
    execute: async () => {
      try {
        const response = await fetch('https://api.adviceslip.com/advice');
        if (!response.ok) return 'Error: Could not fetch advice';
        
        const data = await response.json();
        return `Advice: ${data.slip.advice}`;
      } catch (error) {
        return `Error fetching advice: ${error.message}`;
      }
    },
  },
  {
    name: 'get_joke',
    description: 'Get a random programming joke',
    parameters: z.object({}),
    execute: async () => {
      try {
        const response = await fetch('https://official-joke-api.appspot.com/random_joke');
        if (!response.ok) return 'Error: Could not fetch joke';
        
        const data = await response.json();
        return `${data.setup}\n\n${data.punchline}`;
      } catch (error) {
        return `Error fetching joke: ${error.message}`;
      }
    },
  },
  {
    name: 'get_dog_image',
    description: 'Get a random dog image URL',
    parameters: z.object({}),
    execute: async () => {
      try {
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        if (!response.ok) return 'Error: Could not fetch dog image';
        
        const data = await response.json();
        return `Random dog image: ${data.message}`;
      } catch (error) {
        return `Error fetching dog image: ${error.message}`;
      }
    },
  },
  {
    name: 'get_cat_fact',
    description: 'Get a random cat fact',
    parameters: z.object({}),
    execute: async () => {
      try {
        const response = await fetch('https://catfact.ninja/fact');
        if (!response.ok) return 'Error: Could not fetch cat fact';
        
        const data = await response.json();
        return `Cat Fact: ${data.fact}`;
      } catch (error) {
        return `Error fetching cat fact: ${error.message}`;
      }
    },
  },
  {
    name: 'get_quote',
    description: 'Get a random inspirational quote',
    parameters: z.object({}),
    execute: async () => {
      try {
        const response = await fetch('https://api.quotable.io/random');
        if (!response.ok) return 'Error: Could not fetch quote';
        
        const data = await response.json();
        return `"${data.content}"\n\n— ${data.author}`;
      } catch (error) {
        return `Error fetching quote: ${error.message}`;
      }
    },
  },
  {
    name: 'get_crypto_price',
    description: 'Get current cryptocurrency price in USD',
    parameters: z.object({
      crypto: z.string().describe('Cryptocurrency symbol (e.g., "bitcoin", "ethereum", "dogecoin")'),
    }),
    execute: async ({ crypto }) => {
      try {
        const cryptoLower = crypto.toLowerCase();
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoLower}&vs_currencies=usd&include_24hr_change=true`);
        if (!response.ok) return `Error: Could not fetch price for ${crypto}`;
        
        const data = await response.json();
        if (!data[cryptoLower]) return `Error: Cryptocurrency "${crypto}" not found`;
        
        const price = data[cryptoLower].usd;
        const change = data[cryptoLower].usd_24h_change;
        const changeStr = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
        
        return `${crypto.toUpperCase()} Price:
- Current: $${price.toLocaleString()}
- 24h Change: ${changeStr}`;
      } catch (error) {
        return `Error fetching crypto price: ${error.message}`;
      }
    },
  },
  {
    name: 'get_github_user',
    description: 'Get information about a GitHub user',
    parameters: z.object({
      username: z.string().describe('GitHub username'),
    }),
    execute: async ({ username }) => {
      try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) return `Error: GitHub user "${username}" not found`;
        
        const data = await response.json();
        return `GitHub User: ${data.login}
- Name: ${data.name || 'N/A'}
- Bio: ${data.bio || 'No bio'}
- Public Repos: ${data.public_repos}
- Followers: ${data.followers}
- Following: ${data.following}
- Profile: ${data.html_url}`;
      } catch (error) {
        return `Error fetching GitHub user: ${error.message}`;
      }
    },
  },
  {
    name: 'get_ip_info',
    description: 'Get information about an IP address or your current IP',
    parameters: z.object({
      ip: z.string().describe('IP address to lookup (leave empty for current IP)'),
    }),
    execute: async ({ ip }) => {
      try {
        const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
        const response = await fetch(url);
        if (!response.ok) return 'Error: Could not fetch IP information';
        
        const data = await response.json();
        if (data.error) return `Error: ${data.reason}`;
        
        return `IP Information:
- IP: ${data.ip}
- City: ${data.city}
- Region: ${data.region}
- Country: ${data.country_name}
- ISP: ${data.org}
- Timezone: ${data.timezone}`;
      } catch (error) {
        return `Error fetching IP info: ${error.message}`;
      }
    },
  },
  {
    name: 'get_reddit_posts',
    description: 'Get top posts from a Reddit subreddit',
    parameters: z.object({
      subreddit: z.string().describe('Subreddit name (e.g., "programming", "javascript", "news")'),
      limit: z.string().describe('Number of posts to fetch (default: 5, max: 25)'),
    }),
    execute: async ({ subreddit, limit }) => {
      try {
        const postLimit = Math.min(parseInt(limit) || 5, 25);
        const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=${postLimit}`);
        if (!response.ok) return `Error: Could not fetch posts from r/${subreddit}`;
        
        const data = await response.json();
        const posts = data.data.children;
        
        if (posts.length === 0) return `No posts found in r/${subreddit}`;
        
        let result = `Top posts from r/${subreddit}:\n\n`;
        posts.forEach((post, index) => {
          const p = post.data;
          result += `${index + 1}. ${p.title}\n`;
          result += `   👍 ${p.ups} upvotes | 💬 ${p.num_comments} comments\n`;
          result += `   🔗 https://reddit.com${p.permalink}\n\n`;
        });
        
        return result.trim();
      } catch (error) {
        return `Error fetching Reddit posts: ${error.message}`;
      }
    },
  },
  {
    name: 'search_reddit',
    description: 'Search Reddit for posts across all subreddits',
    parameters: z.object({
      query: z.string().describe('Search query'),
      limit: z.string().describe('Number of results (default: 5, max: 25)'),
    }),
    execute: async ({ query, limit }) => {
      try {
        const postLimit = Math.min(parseInt(limit) || 5, 25);
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(`https://www.reddit.com/search.json?q=${encodedQuery}&limit=${postLimit}&sort=relevance`);
        if (!response.ok) return `Error: Could not search Reddit for "${query}"`;
        
        const data = await response.json();
        const posts = data.data.children;
        
        if (posts.length === 0) return `No results found for "${query}"`;
        
        let result = `Reddit search results for "${query}":\n\n`;
        posts.forEach((post, index) => {
          const p = post.data;
          result += `${index + 1}. ${p.title}\n`;
          result += `   📍 r/${p.subreddit} | 👍 ${p.ups} upvotes | 💬 ${p.num_comments} comments\n`;
          result += `   🔗 https://reddit.com${p.permalink}\n\n`;
        });
        
        return result.trim();
      } catch (error) {
        return `Error searching Reddit: ${error.message}`;
      }
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
