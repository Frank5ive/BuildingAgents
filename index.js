require('dotenv').config({ quiet: true });
const { startChat } = require("./utils/llm.js");
const { runAgent } = require("./utils/agent.js");
const { addMessages, clearMessages } = require("./utils/memory.js");
const AgentInterface = require("./utils/interface.js");

// Mode selection
const MODE = process.env.MODE || 'chat'; // 'chat' or 'agent'

async function chatMode(ui, chat) {
  const conversationLoop = async () => {
    const userInput = await ui.getUserInput();
    
    if (!userInput) {
      await conversationLoop();
      return;
    }
    
    if (userInput.toLowerCase() === 'exit') {
      ui.close();
      return;
    }
    
    if (userInput.toLowerCase() === 'clear') {
      await clearMessages();
      ui.printSystem('Conversation history cleared');
      await conversationLoop();
      return;
    }
    
    try {
      const result = await chat.sendMessage(userInput);
      const response = await result.response;
      const responseText = response.text();
      
      await addMessages([
        { role: 'user', parts: [{ text: userInput }] },
        { role: 'model', parts: [{ text: responseText }] }
      ]);
      
      ui.printAgent(responseText);
    } catch (error) {
      ui.printError(error.message);
    }
    
    await conversationLoop();
  };
  
  await conversationLoop();
}

async function agentMode(ui) {
  const conversationLoop = async () => {
    const userInput = await ui.getUserInput();
    
    if (!userInput) {
      await conversationLoop();
      return;
    }
    
    if (userInput.toLowerCase() === 'exit') {
      ui.close();
      return;
    }
    
    if (userInput.toLowerCase() === 'clear') {
      await clearMessages();
      ui.printSystem('Conversation history cleared');
      await conversationLoop();
      return;
    }
    
    try {
      await runAgent({ userMessage: userInput, ui });
    } catch (error) {
      ui.printError(error.message);
    }
    
    await conversationLoop();
  };
  
  await conversationLoop();
}

async function main(){
  const ui = new AgentInterface();
  
  ui.printBanner();
  
  if (MODE === 'agent') {
    ui.printSystem(`🤖 Agent Mode - With tool calling capabilities`);
    await agentMode(ui);
  } else {
    ui.printSystem(`💬 Chat Mode - Simple conversation`);
    const chat = await startChat();
    await chatMode(ui, chat);
  }
}

main().catch(console.error);
