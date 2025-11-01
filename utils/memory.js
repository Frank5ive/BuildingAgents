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

const addMessages = async (messages) => {
  const db = await getDb();
  db.data.messages.push(...messages.map(addMetadata));
  await db.write();
};

const getMessages = async () => {
  const db = await getDb();
  return db.data.messages.map(removeMetadata);
};

const clearMessages = async () => {
  const db = await getDb();
  db.data.messages = [];
  await db.write();
};

const saveToolResponse = async (toolName, toolResult) => {
  const db = await getDb();
  db.data.messages.push(addMetadata({
    role: 'function',
    name: toolName,
    parts: [{ text: JSON.stringify(toolResult) }],
  }));
  await db.write();
};

module.exports = {
  addMessages,
  getMessages,
  clearMessages,
  saveToolResponse,
};
