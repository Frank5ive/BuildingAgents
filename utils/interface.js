const readline = require('readline');

class AgentInterface {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  clearLine() {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  }

  printBanner() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              🤖 AI AGENT INTERFACE v1.0 🤖                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('💡 Commands: Type your message or "exit" to quit\n');
    console.log('─'.repeat(60));
  }

  printUser(message) {
    console.log(`👤 You: ${message}`);
  }

  printAgent(message) {
    console.log(`\n🤖 Agent: ${message}`);
    console.log('\n' + '─'.repeat(60));
  }

  printError(error) {
    console.log(`\n❌ Error: ${error}`);
    console.log('─'.repeat(60));
  }

  printSystem(message) {
    console.log(`\n⚙️  ${message}\n`);
  }

  async getUserInput(prompt = '\n💬 ') {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  close() {
    console.log('\n\n👋 Goodbye! Thank you for using AI Agent.\n');
    this.rl.close();
    process.exit(0);
  }
}

module.exports = AgentInterface;
