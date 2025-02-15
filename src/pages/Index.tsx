
import { useState, useRef, useEffect } from "react";
import { useTelegram } from "@/hooks/use-telegram";
import { ChatMessage } from "@/components/ChatMessage";
import { cn } from "@/lib/utils";

interface Message {
  text: string;
  isUser: boolean;
  role: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [role, setRole] = useState("user");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, response, isLoading } = useTelegram();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (response) {
      setMessages((prev) => [
        ...prev,
        { text: response, isUser: false, role: "assistant" },
      ]);
    }
  }, [response]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { text: input, isUser: true, role };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    await sendMessage(input, role);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-black">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isUser={message.isUser}
              role={message.role}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-2xl px-4 py-2 animate-pulse">
                <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4"
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-all",
                role === "user"
                  ? "bg-[#007AFF] text-white"
                  : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setRole("system")}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-all",
                role === "system"
                  ? "bg-[#007AFF] text-white"
                  : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              System
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full px-4 py-2 bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#007AFF] text-white rounded-full px-4 py-2 font-medium disabled:opacity-50 transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Index;
