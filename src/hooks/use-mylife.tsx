
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    MyLife: {
      WebApp: {
        MiniAppChatCompletions: (params: { role: string; message: string }) => void;
      };
      WebView: {
        onEvent: (event: string, callback: (eventData: any) => void) => void;
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

    window.MyLife.WebView.onEvent('receiveEvent', (eventData) => {
      if (eventData?.type === 'MiniAppChatCompletionsResult') {
        setIsLoading(false);
        
        const data = eventData.data;
        
        if (data.error) {
          console.error('Error in response:', data.error);
          setError(data.error);
          return;
        }
        
        if (data.response) {
          setResponses(prev => [...prev, data.response]);
        }
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
      window.MyLife.WebApp.MiniAppChatCompletions({ role, message });
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
