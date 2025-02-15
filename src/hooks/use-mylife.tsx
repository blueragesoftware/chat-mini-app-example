
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    MyLife: {
      WebApp: {
        chat_completions: (prompt: string, role: string) => void;
        onEvent: (event: string, callback: (data: any) => void) => void;
      };
    };
  }
}

export const useMyLife = () => {
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if MyLife.WebApp exists
    if (!window.MyLife?.WebApp) {
      console.error('MyLife WebApp is not initialized');
      setError('MyLife WebApp is not initialized');
      return;
    }

    const ml = window.MyLife.WebApp;

    ml.onEvent('chat_completions_response', (data) => {
      setIsLoading(false);
      try {
        const parsedData = JSON.parse(data);
        setResponse(parsedData.response);
      } catch (error) {
        console.error('Error parsing response:', error);
        setError('Error parsing response');
      }
    });
  }, []);

  const sendMessage = async (prompt: string, role: string = 'user') => {
    if (!window.MyLife?.WebApp) {
      console.error('MyLife WebApp is not initialized');
      setError('MyLife WebApp is not initialized');
      return;
    }

    setIsLoading(true);
    try {
      window.MyLife.WebApp.chat_completions(prompt, role);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error sending message');
      setIsLoading(false);
    }
  };

  return { sendMessage, response, isLoading, error };
};
