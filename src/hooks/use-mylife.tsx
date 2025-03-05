
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    MyLife: {
      WebApp: Record<string, any>;
      WebView: {
        onEvent: (event: string, callback: (eventData: any) => void) => void;
      };
    };
    webkit?: {
      messageHandlers: Record<string, {
        postMessage: (data: any) => void;
      }>;
    };
    MyLifeWebViewProxy?: {
      postEvent: (eventName: string, eventData: any) => void;
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
      } else if (eventData?.type === 'MiniAppChatCompletionsFailed') {
        setIsLoading(false);
        
        const errorData = eventData.data;
        const errorMessage = `Error: ${errorData.error_description || 'Unknown error'} (${errorData.error_reason || 'unknown reason'})`;
        
        console.error('Chat completion failed:', errorData);
        setError(errorMessage);
      }
    });
  }, []);

  const sendMessage = async (message: string, role: string = 'user') => {
    // Generate a unique request ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const requestPayload = {
      request_id: requestId,
      message,
      role
    };
    
    // Check if we have the WebViewProxy available (Swift client)
    if (window.MyLifeWebViewProxy?.postEvent) {
      setIsLoading(true);
      try {
        window.MyLifeWebViewProxy.postEvent('MiniAppChatCompletions', requestPayload);
      } catch (error) {
        console.error('Error sending message:', error);
        setError('Error sending message');
        setIsLoading(false);
      }
      return;
    }
    
    // Fallback to the old method if available
    if (window.MyLife?.WebApp) {
      setIsLoading(true);
      try {
        // Try to use the method dynamically if it exists
        if (typeof window.MyLife.WebApp.MiniAppChatCompletions === 'function') {
          window.MyLife.WebApp.MiniAppChatCompletions(requestPayload);
        } else {
          console.error('MiniAppChatCompletions method not found');
          setError('MiniAppChatCompletions method not found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setError('Error sending message');
        setIsLoading(false);
      }
    } else {
      console.error('MyLife WebApp is not initialized');
      setError('MyLife WebApp is not initialized');
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
