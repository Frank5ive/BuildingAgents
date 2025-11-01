const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function generateContent(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function startChat() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  return model.startChat({
    history: [],
  });
}

module.exports = { generateContent, startChat };
