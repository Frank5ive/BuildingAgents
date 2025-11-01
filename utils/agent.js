const { runLLM } = require('./llm');
const { runTool, getToolDeclarations } = require('./tools');
const { addMessages, getMessages, saveToolResponse } = require('./memory');

const runAgent = async ({ userMessage, ui }) => {
  let loader;
  
  try {
    await addMessages([
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ]);

    loader = ui.showLoader('Thinking...');

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
        
        const functionResponse = {
          role: 'function',
          parts: [{
            functionResponse: {
              name: functionCall.name,
              response: {
                content: toolResult,
              },
            },
          }],
        };
        
        await addMessages([functionResponse]);
        
        toolLoader.stop();
        ui.logMessage(functionResponse);
        
        // Get final response after tool execution
        const finalLoader = ui.showLoader('Generating final response...');
        
        try {
          const finalHistory = await getMessages();
          const finalResponse = await runLLM({
            messages: finalHistory,
            tools: tools,
          });
          
          await addMessages([finalResponse]);
          
          finalLoader.stop();
          ui.logMessage(finalResponse);
        } catch (finalError) {
          finalLoader.stop();
          
          // If final response fails, at least show the tool result
          ui.printError(`Could not generate final response: ${finalError.message}`);
          ui.printSystem(`Tool returned: ${toolResult}`);
        }
      } catch (toolError) {
        toolLoader.stop();
        
        // Save error as function response so conversation state is maintained
        const errorResponse = {
          role: 'function',
          parts: [{
            functionResponse: {
              name: functionCall.name,
              response: {
                content: `Error: ${toolError.message}`,
              },
            },
          }],
        };
        
        await addMessages([errorResponse]);
        ui.printError(`Tool execution failed: ${toolError.message}`);
      }
    }

    return getMessages();
  } catch (error) {
    if (loader) loader.stop();
    
    // Try to recover by checking if we have orphaned function calls
    try {
      const messages = await getMessages();
      const lastMsg = messages[messages.length - 1];
      
      // If last message was a function call, remove it to clean up state
      if (lastMsg?.role === 'model' && lastMsg.parts[0]?.functionCall) {
        ui.printError(`Removing incomplete function call to recover state`);
        const db = await require('./memory').getDb();
        db.data.messages.pop();
        await db.write();
      }
    } catch (cleanupError) {
      // Cleanup failed, but don't crash
    }
    
    throw error;
  }
};

module.exports = { runAgent };
