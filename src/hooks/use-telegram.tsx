
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
        };
        backgroundColor: string;
        chat_completions: (prompt: string, role: string) => void;
        onEvent: (event: string, callback: (data: any) => void) => void;
      };
    };
  }
}

export const useTelegram = () => {
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    tg.onEvent('chat_completions_response', (data) => {
      setIsLoading(false);
      try {
        const parsedData = JSON.parse(data);
        setResponse(parsedData.response);
      } catch (error) {
        console.error('Error parsing response:', error);
      }
    });
  }, []);

  const sendMessage = async (prompt: string, role: string = 'user') => {
    setIsLoading(true);
    window.Telegram.WebApp.chat_completions(prompt, role);
  };

  return { sendMessage, response, isLoading };
};
