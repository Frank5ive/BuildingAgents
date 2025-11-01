require('dotenv').config({ quiet: true });
const { startChat } = require("./utils/llm.js");
const { addMessages } = require("./utils/memory.js");
const AgentInterface = require("./utils/interface.js");

async function main(){
  const ui = new AgentInterface();
  const chat = await startChat();
  
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

main().catch(console.error);
