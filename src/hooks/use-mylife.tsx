
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    MyLife: {
      WebApp: {
        chatCompletions: (params: { role: string; message: string }) => void;
      };
      WebView: {
        onEvent: (event: string, callback: (eventType: string, eventData: any) => void) => void;
      };
    };
  }
}

export const useMyLife = () => {
  const [responses, setResponses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if MyLife.WebView exists
    if (!window.MyLife?.WebView) {
      console.error('MyLife WebView is not initialized');
      setError('MyLife WebView is not initialized');
      return;
    }

    window.MyLife.WebView.onEvent('chat_completions_response', (eventType, eventData) => {
      setIsLoading(false);
      if (eventData.error) {
        console.error('Error in response:', eventData.error);
        setError(eventData.error);
        return;
      }
      if (eventData.response) {
        setResponses(prev => [...prev, eventData.response]);
      }
    });
  }, []);

  const sendMessage = async (message: string, role: string = 'user') => {
    if (!window.MyLife?.WebApp) {
      console.error('MyLife WebApp is not initialized');
      setError('MyLife WebApp is not initialized');
      return;
    }

    setIsLoading(true);
    try {
      window.MyLife.WebApp.chatCompletions({ role, message });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error sending message');
      setIsLoading(false);
    }
  };

  return { 
    sendMessage, 
    responses,
    latestResponse: responses[responses.length - 1] || '', 
    isLoading, 
    error 
  };
};
