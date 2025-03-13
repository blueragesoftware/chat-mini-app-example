import { useState, useRef, useEffect, useCallback } from "react";
import { useBluerage } from "@/hooks/use-bluerage";
import { ChatMessage } from "@/components/ChatMessage";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  text: string;
  isUser: boolean;
  role: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, conversationHistory, isLoading, error, safeAreaInsets } = useBluerage();
  const { toast } = useToast();
  const conversationLengthRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  // Update messages when conversation history changes
  useEffect(() => {
    // Only update if the length has changed
    if (conversationHistory.length !== conversationLengthRef.current) {
      conversationLengthRef.current = conversationHistory.length;

      // Convert the conversation history to the format expected by our UI
      const updatedMessages = conversationHistory.map(msg => ({
        text: msg.content,
        isUser: msg.role === 'user',
        role: msg.role
      }));

      setMessages(updatedMessages);
    }
  }, [conversationHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setInput("");
    // Always use 'user' as the role
    await sendMessage(input, 'user');
  };

  // Apply safe area insets as inline styles
  const safeAreaStyle = {
    paddingTop: `${safeAreaInsets.top}px`,
    paddingBottom: `${safeAreaInsets.bottom}px`,
    paddingLeft: `${safeAreaInsets.left}px`,
    paddingRight: `${safeAreaInsets.right}px`,
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-black" style={safeAreaStyle}>
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
