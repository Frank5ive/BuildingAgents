const { JSONFilePreset } = require('lowdb/node');
const { v4: uuidv4 } = require('uuid');

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
  const db = await JSONFilePreset('db.json', defaultData);
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

module.exports = {
  addMessages,
  getMessages,
  clearMessages,
};
