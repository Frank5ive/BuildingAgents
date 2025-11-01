const { runLLM } = require('./llm');
const { runTool, getToolDeclarations } = require('./tools');
const { addMessages, getMessages, saveToolResponse } = require('./memory');

const runAgent = async ({ userMessage, ui }) => {
  await addMessages([
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ]);

  const loader = ui.showLoader('Thinking...');

  try {
    const history = await getMessages();
    const tools = getToolDeclarations();
    
    const response = await runLLM({
      messages: history,
      tools: tools,
    });

    await addMessages([response]);
    
    loader.stop();
    ui.logMessage(response);

    // If the response contains function calls, execute them
    if (response.parts[0].functionCall) {
      const functionCall = response.parts[0].functionCall;
      
      const toolLoader = ui.showLoader(`Executing ${functionCall.name}...`);
      
      try {
        const toolResult = await runTool(functionCall.name, functionCall.args);
        
        await saveToolResponse(functionCall.name, toolResult);
        
        toolLoader.stop();
        ui.logMessage({
          role: 'function',
          name: functionCall.name,
          parts: [{ text: JSON.stringify(toolResult) }],
        });
        
        // Get final response after tool execution
        const finalLoader = ui.showLoader('Generating final response...');
        const finalHistory = await getMessages();
        const finalResponse = await runLLM({
          messages: finalHistory,
          tools: tools,
        });
        
        await addMessages([finalResponse]);
        
        finalLoader.stop();
        ui.logMessage(finalResponse);
      } catch (error) {
        toolLoader.stop();
        ui.printError(`Tool execution failed: ${error.message}`);
      }
    }

    return getMessages();
  } catch (error) {
    loader.stop();
    throw error;
  }
};

module.exports = { runAgent };
