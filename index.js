require('dotenv').config({ quiet: true });
const { startChat } = require("./utils/llm.js");
const AgentInterface = require("./utils/interface.js");

async function main(){
  const ui = new AgentInterface();
  const chat = startChat();
  
  ui.printBanner();
  
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
    
    try {
      const result = await chat.sendMessage(userInput);
      const response = await result.response;
      ui.printAgent(response.text());
    } catch (error) {
      ui.printError(error.message);
    }
    
    await conversationLoop();
  };
  
  await conversationLoop();
}

main().catch(console.error);
