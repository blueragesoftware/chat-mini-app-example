# Bluerage MiniApp Example

A simple Bluerage MiniApp that demonstrates the chat completions functionality using the Bluerage Platform script. Thanks to Bluerage Platform's capabilities, you can run chat completions completely free - not just for testing, but in production too! The model runs directly on your users' devices through the Bluerage webview.

🔗 [Try the live demo](https://chat-mini-app-example.lovable.app/)

Built with [Lovable.dev](https://lovable.dev)

## Overview

This mini app showcases how to integrate chat completion capabilities into a Bluerage MiniApp using React and TypeScript. It provides a clean and simple interface for sending messages and receiving responses through the Bluerage Platform. The best part? You can run and test all chat completion features without any cost or API keys, and deploy to production with the same capabilities - the model runs directly on your users' devices!

## How It Works

The Bluerage Platform provides a unique approach to LLM API:
- 🏃‍♂️ The model runs directly on the user's device through the Bluerage webview
- 💻 No server infrastructure needed - everything happens locally
- 🔄 Works the same in development and production
- 💰 Free to use in both testing and production environments
- 🚀 Scale effortlessly as each user runs their own instance

## Quick Start

1. Create a new project with Lovable.dev
2. Add the Bluerage Platform script to your `index.html`:
```html
<script src="https://blueragesoftware.github.io/mini-apps-runtime/script.js"></script>
```

That's it! No API keys or additional configuration needed. The Bluerage Platform handles all the chat completion functionality locally on your users' devices.

For more information about the Bluerage Platform script and its capabilities, visit the [repository](https://github.com/blueragesoftware/mini-apps-runtime).

## Usage

The app uses a custom React hook for managing chat completions through the Bluerage Platform. Here's how to use it:

```typescript
import { useBluerage } from './hooks/use-bluerage';

function ChatComponent() {
  const { sendMessage, responses, isLoading, error } = useBluerage();

  const handleSend = () => {
    sendMessage('Hello, how are you?', 'user');
  };

  return (
    <div>
      <button onClick={handleSend}>Send Message</button>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <div>
        {responses.map((response, index) => (
          <p key={index}>{response}</p>
        ))}
      </div>
    </div>
  );
}
```

## Features

- 🚀 Simple and lightweight implementation
- 💬 Free LLM API in both development and production
- 🔑 No API keys or external services required
- 📱 Runs directly on user devices through Bluerage webview

## Why Bluerage Platform?

- 🆓 Free LLM API in both development and production
- 🚫 No API keys needed
- 🔒 Privacy-focused - all processing happens on user devices
- 🌐 No server infrastructure required
- 📈 Infinite scaling - each user runs their own instance
- 🚀 Quick setup - just include the script and start building
- 💪 Powerful features without the complexity

## Production Benefits

- 💰 No hosting costs for AI functionality
- 🔒 Enhanced privacy as data stays on user devices
- 📈 Natural scaling - each user brings their own computing power
- 🚀 Low latency as processing happens locally
- 💻 Works offline once the model is loaded

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Lovable.dev](https://lovable.dev) ❤️
