const { JSONFilePreset } = require('lowdb/node');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const addMetadata = (message) => ({
  ...message,
  id: uuidv4(),
  createdAt: new Date().toISOString(),
});

const removeMetadata = (message) => {
  const { id, createdAt, ...messageWithoutMetadata } = message;
  return messageWithoutMetadata;
};

const defaultData = { messages: [] };

const getDb = async () => {
  const dbPath = path.join(__dirname, '..', 'db.json');
  const db = await JSONFilePreset(dbPath, defaultData);
  return db;
};

// Export getDb for cleanup operations
const getDbDirect = getDb;

const addMessages = async (messages) => {
  const db = await getDb();
  db.data.messages.push(...messages.map(addMetadata));
  await db.write();
};

const getMessages = async () => {
  const db = await getDb();
  
  // Filter out any malformed messages
  const validMessages = db.data.messages.filter(msg => {
    try {
      // Check basic structure
      if (!msg.role || !msg.parts || !Array.isArray(msg.parts)) {
        return false;
      }
      
      // Validate function messages have correct format
      if (msg.role === 'function') {
        return msg.parts[0]?.functionResponse !== undefined;
      }
      
      // Validate model messages
      if (msg.role === 'model') {
        return msg.parts[0]?.text !== undefined || msg.parts[0]?.functionCall !== undefined;
      }
      
      // Validate user messages
      if (msg.role === 'user') {
        return msg.parts[0]?.text !== undefined;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  });
  
  // Ensure conversation flow is valid (no orphaned function calls)
  const cleanedMessages = [];
  for (let i = 0; i < validMessages.length; i++) {
    const msg = validMessages[i];
    
    // If we find a function call without a following function response, skip both
    if (msg.role === 'model' && msg.parts[0]?.functionCall) {
      const nextMsg = validMessages[i + 1];
      if (nextMsg && nextMsg.role === 'function') {
        cleanedMessages.push(msg);
      }
      // Otherwise skip this orphaned function call
    } else if (msg.role === 'function') {
      const prevMsg = cleanedMessages[cleanedMessages.length - 1];
      // Only include if previous was a model function call
      if (prevMsg && prevMsg.role === 'model' && prevMsg.parts[0]?.functionCall) {
        cleanedMessages.push(msg);
      }
      // Otherwise skip this orphaned function response
    } else {
      cleanedMessages.push(msg);
    }
  }
  
  return cleanedMessages.map(removeMetadata);
};

const clearMessages = async () => {
  const db = await getDb();
  db.data.messages = [];
  await db.write();
};

module.exports = {
  addMessages,
  getMessages,
  clearMessages,
  getDb: getDbDirect,
};
