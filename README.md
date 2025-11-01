# 🤖 AI Agent Framework with Tool Calling

A production-ready, extensible AI agent framework built with Node.js and Google's Gemini AI. Features dual-mode operation (chat and autonomous agent), persistent memory, and a modular tool system for real-world applications.

## 🎯 Key Features

- **Dual Operation Modes**: Switch between simple chat and autonomous agent with tool execution
- **Persistent Memory**: Conversation history stored in JSON database with automatic session recovery
- **Extensible Tool System**: Modular architecture for adding custom tools and capabilities
- **Function Calling**: LLM autonomously decides when and which tools to use
- **Rich CLI Interface**: Beautiful terminal UI with loading animations and structured output
- **Type-Safe Validation**: Zod schema validation for tool parameters
- **Error Handling**: Robust error management and user feedback

## 🏗️ Architecture

```
BuildingAgents/
├── index.js                 # Main entry point with mode selection
├── utils/
│   ├── agent.js            # Agent orchestration & tool execution loop
│   ├── llm.js              # Google Gemini AI integration
│   ├── tools.js            # Tool definitions & execution engine
│   ├── memory.js           # Persistent storage with LowDB
│   └── interface.js        # CLI interface & visual feedback
└── db.json                 # Auto-generated conversation history
```

### Design Patterns Implemented

- **Strategy Pattern**: Dual-mode operation (chat vs agent)
- **Factory Pattern**: Tool registration and execution
- **Observer Pattern**: Loader animations and UI updates
- **Repository Pattern**: Memory management abstraction

## 🚀 Quick Start

### Prerequisites

```bash
node >= 14.x
npm >= 6.x
```

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd BuildingAgents

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your Google AI API key to .env
```

### Usage

**Chat Mode** (Simple conversation):
```bash
node index.js
```

**Agent Mode** (With tool calling):
```bash
MODE=agent node index.js
```

## 🛠️ Available Tools

The agent has access to 20 production-ready tools:

### 🧮 Utility Tools
| Tool | Description |
|------|-------------|
| `get_current_time` | Returns formatted date/time with timezone |
| `calculate` | Evaluates mathematical expressions |
| `generate_random_number` | Random number within range |
| `convert_temperature` | C°/F°/K° conversions |
| `count_words` | Text analysis (words, chars, sentences) |
| `create_timer` | Countdown timer setup |
| `format_date` | Multiple date formats (ISO, relative, etc.) |
| `generate_password` | Secure password generation |

### 🌐 API-Powered Tools
| Tool | Description |
|------|-------------|
| `get_weather` | Real-time weather for any city |
| `get_random_fact` | Random interesting facts |
| `get_advice` | Random life advice |
| `get_joke` | Programming jokes |
| `get_dog_image` | Random dog pictures |
| `get_cat_fact` | Cat facts |
| `get_quote` | Inspirational quotes |
| `get_crypto_price` | Live cryptocurrency prices |
| `get_github_user` | GitHub profile information |
| `get_ip_info` | IP address geolocation |
| `get_reddit_posts` | Top posts from any subreddit |
| `search_reddit` | Search Reddit across all subreddits |

## 💻 Technical Implementation

### Tool System

Tools are defined with Zod schemas for type safety:

```javascript
{
  name: 'tool_name',
  description: 'What the tool does',
  parameters: z.object({
    param: z.string().describe('Parameter description'),
  }),
  execute: async (args) => {
    // Tool implementation
    return result;
  }
}
```

### Memory Management

```javascript
// Automatic persistence
await addMessages([userMessage, aiResponse]);

// Retrieve history
const history = await getMessages();

// Clear conversation
await clearMessages();
```

### LLM Integration

```javascript
// Agent mode with function calling
const response = await runLLM({
  messages: conversationHistory,
  tools: availableTools
});

// Handles both text responses and function calls
if (response.parts[0].functionCall) {
  // Execute tool and continue conversation
}
```

## 📊 Key Technical Skills Demonstrated

- **API Integration**: Google Generative AI SDK implementation
- **Async/Await Patterns**: Clean asynchronous code throughout
- **Schema Validation**: Type-safe parameter validation with Zod
- **Database Design**: JSON-based persistent storage with metadata
- **CLI Development**: Interactive readline interface with visual feedback
- **Modular Architecture**: Separation of concerns, easy to test and extend
- **Error Handling**: Comprehensive try-catch with user-friendly messages
- **Environment Configuration**: Secure API key management with dotenv

## 🔧 Extending the Framework

### Adding a New Tool

```javascript
// In utils/tools.js
{
  name: 'your_tool',
  description: 'Description for the LLM',
  parameters: z.object({
    input: z.string().describe('What this parameter does'),
  }),
  execute: async ({ input }) => {
    // Your implementation
    return 'Tool result';
  }
}
```

### Creating a New Mode

```javascript
// In index.js
async function customMode(ui) {
  // Your mode logic
  // Access to ui, llm, memory utilities
}
```

## 📝 Commands

| Command | Action |
|---------|--------|
| `exit` | Quit the application |
| `clear` | Reset conversation history |

## 🔐 Environment Variables

```bash
API_KEY=your_google_gemini_api_key
MODE=chat                    # or 'agent'
```

## 📦 Dependencies

- **@google/generative-ai**: ^0.24.1 - Google's Gemini AI SDK
- **dotenv**: ^17.2.3 - Environment variable management
- **lowdb**: ^7.0.1 - Lightweight JSON database
- **uuid**: ^10.0.0 - Unique ID generation
- **zod**: ^3.23.8 - TypeScript-first schema validation

## 🎨 UI Features

- Loading animations during LLM thinking and tool execution
- Color-coded message types (user, agent, tool calls, tool results)
- Structured output with separators
- Error messages with clear feedback

## 🧪 Example Interactions

**Agent Mode - Tool Calling:**
```
💬 What's 25 celsius in fahrenheit?

🔧 Tool Call: convert_temperature
   Args: { value: "25", from: "celsius", to: "fahrenheit" }

📦 Tool Result: "25° celsius = 77.00° fahrenheit"

🤖 Agent: 25 degrees Celsius is equal to 77 degrees Fahrenheit.
```

**Memory Persistence:**
```
💬 Remember I'm learning Node.js

🤖 Agent: Got it! I'll remember that you're learning Node.js...

[Session closed, reopened later]

💬 What am I learning?

🤖 Agent: You mentioned you're learning Node.js!
```

## 🚀 Future Enhancements

- [ ] Web interface with real-time updates
- [ ] Tool execution history and analytics
- [ ] Multi-user support with session management
- [ ] Custom tool marketplace/plugin system
- [ ] Voice interaction capabilities
- [ ] Integration with external APIs (weather, news, etc.)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Frank Gondwe**

Built with modern JavaScript practices, demonstrating production-ready code organization, error handling, and extensible architecture patterns.

---

**Tech Stack**: Node.js • Google Gemini AI • LowDB • Zod • Async/Await • CLI Development
