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
    console.log('💡 Commands: "exit" to quit | "clear" to reset history\n');
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

  showLoader(message = 'Thinking...') {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    
    const interval = setInterval(() => {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`${frames[i]} ${message}`);
      i = (i + 1) % frames.length;
    }, 80);
    
    return {
      stop: () => {
        clearInterval(interval);
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
      },
    };
  }

  logMessage(message) {
    if (message.role === 'user') {
      console.log(`\n💬 ${message.parts[0].text}`);
    } else if (message.role === 'model') {
      if (message.parts[0].functionCall) {
        const fc = message.parts[0].functionCall;
        console.log(`\n🔧 Tool Call: ${fc.name}`);
        console.log(`   Args: ${JSON.stringify(fc.args, null, 2)}`);
      } else {
        console.log(`\n🤖 Agent: ${message.parts[0].text}`);
      }
    } else if (message.role === 'function') {
      const result = message.parts[0].functionResponse?.response?.content || message.parts[0].text;
      console.log(`\n📦 Tool Result: ${result}`);
    }
    console.log('─'.repeat(60));
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
