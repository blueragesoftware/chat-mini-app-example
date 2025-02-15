
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  role: string;
}

export const ChatMessage = ({ message, isUser, role }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "mb-4 flex w-full animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm transition-all",
          isUser
            ? "bg-[#007AFF] text-white"
            : "bg-[#F2F2F7] text-black dark:bg-[#1C1C1E] dark:text-white"
        )}
      >
        <div className="text-xs opacity-60 mb-1">{role}</div>
        {message}
      </div>
    </div>
  );
};
