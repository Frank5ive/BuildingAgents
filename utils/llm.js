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

module.exports = { generateContent, startChat };
