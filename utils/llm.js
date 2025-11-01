const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getMessages } = require("./memory");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function generateContent(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function startChat() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const history = await getMessages();
  
  return model.startChat({
    history: history,
  });
}

async function runLLM({ messages, tools }) {
  const modelConfig = { 
    model: "gemini-2.5-flash",
  };
  
  if (tools && tools.length > 0) {
    modelConfig.tools = tools;
  }
  
  const model = genAI.getGenerativeModel(modelConfig);
  
  const chat = model.startChat({
    history: messages.slice(0, -1),
  });
  
  const lastMessage = messages[messages.length - 1];
  
  // Handle different message types
  let result;
  if (lastMessage.role === 'function') {
    // For function responses, send the entire message
    result = await chat.sendMessage(lastMessage.parts);
  } else if (lastMessage.parts[0].text) {
    // For user messages with text
    result = await chat.sendMessage(lastMessage.parts[0].text);
  } else {
    throw new Error('Invalid message format');
  }
  
  const response = result.response;
  
  const functionCalls = response.functionCalls();
  
  if (functionCalls && functionCalls.length > 0) {
    return {
      role: 'model',
      parts: functionCalls.map(fc => ({
        functionCall: {
          name: fc.name,
          args: fc.args,
        },
      })),
    };
  }
  
  return {
    role: 'model',
    parts: [{ text: response.text() }],
  };
}

module.exports = { generateContent, startChat, runLLM };
