import { useEffect, useState } from 'react';

// Define a message type for conversation history
interface ChatMessage {
  role: string;
  content: string;
}

// Define the safe area insets type
interface SafeAreaInsets {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

// Default safe area insets
const defaultInsets: SafeAreaInsets = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};

declare global {
  interface Window {
    MyLife: {
      WebApp: Record<string, any> & {
        MiniAppChatCompletions?: (data: any) => void;
        MiniAppInit?: (data: any) => void;
      };
      WebView: {
        onEvent: (event: string, callback: (eventData: any) => void) => void;
        receiveEvent?: (eventData: any) => void;
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>(defaultInsets);

  // Initialize with a system message that won't be displayed to the user
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: 'You are a helpful assistant' }
  ]);

  useEffect(() => {
    // Check if MyLife.WebView exists
    if (!window.MyLife?.WebView) {
      console.error('MyLife WebView is not initialized');
      setError('MyLife WebView is not initialized');
      return;
    }

    // Define a handler function that will process events from the MyLife platform
    const handleEvent = (eventData: any) => {
      console.log('Received event:', eventData);

      if (eventData?.type === 'MiniAppChatCompletionsResult') {
        setIsLoading(false);

        const data = eventData.data;

        if (data.error) {
          console.error('Error in response:', data.error);
          setError(data.error);
          return;
        }

        if (data.response) {
          console.log('Received response:', data.response);
          setResponses(prev => [...prev, data.response]);
          // Add assistant response to conversation history
          setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        }
      } else if (eventData?.type === 'MiniAppChatCompletionsFailed') {
        setIsLoading(false);

        const errorData = eventData.data;
        const errorMessage = `Error: ${errorData.error_description || 'Unknown error'} (${errorData.error_reason || 'unknown reason'})`;

        console.error('Chat completion failed:', errorData);
        setError(errorMessage);
      } else if (eventData?.type === 'MiniAppInitResult') {
        console.log('MiniAppInit successful:', eventData);
        setIsInitialized(true);
      } else if (eventData?.type === 'MiniAppDidUpdateConfig') {
        console.log('Received config update:', eventData);

        // Extract safe area insets from the event data
        const data = eventData.data;
        if (data && data.safe_area_insets) {
          const insets = data.safe_area_insets;
          console.log('Updating safe area insets:', insets);

          setSafeAreaInsets({
            top: Number(insets.top) || 0,
            left: Number(insets.left) || 0,
            right: Number(insets.right) || 0,
            bottom: Number(insets.bottom) || 0
          });

          // Also mark as initialized when we receive config updates
          setIsInitialized(true);
        }
      }
    };

    // Register the event handler with onEvent
    window.MyLife.WebView.onEvent('receiveEvent', handleEvent);

    // Also directly define the receiveEvent function as a fallback
    window.MyLife.WebView.receiveEvent = handleEvent;

    // Send MiniAppInit message
    const initializeApp = () => {
      // Generate a unique request ID
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const requestPayload = {
        request_id: requestId
      };

      console.log('Sending MiniAppInit with payload:', requestPayload);

      // Check if we have the WebViewProxy available (Swift client)
      if (window.MyLifeWebViewProxy?.postEvent) {
        try {
          window.MyLifeWebViewProxy.postEvent('MiniAppInit', requestPayload);
        } catch (error) {
          console.error('Error sending MiniAppInit:', error);
        }
        return;
      }

      // Fallback to the old method if available
      if (window.MyLife?.WebApp) {
        try {
          // Try to use the method dynamically if it exists
          if (typeof window.MyLife.WebApp.MiniAppInit === 'function') {
            window.MyLife.WebApp.MiniAppInit(requestPayload);
          } else {
            console.error('MiniAppInit method not found');
          }
        } catch (error) {
          console.error('Error sending MiniAppInit:', error);
        }
      } else {
        console.error('MyLife WebApp is not initialized');
      }
    };

    // Wait a short time to ensure MyLife is loaded, then initialize
    const timer = setTimeout(() => {
      if (!isInitialized) {
        initializeApp();
      }
    }, 500);

    // Cleanup function to remove event listeners
    return () => {
      clearTimeout(timer);
      // No direct way to remove the event listener with the MyLife API,
      // but we can replace it with a no-op function
      if (window.MyLife?.WebView) {
        window.MyLife.WebView.receiveEvent = () => { };
      }
    };
  }, [isInitialized]);

  const sendMessage = async (message: string, role: string = 'user') => {
    // Generate a unique request ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Add user message to conversation history
    const updatedMessages = [...messages, { role, content: message }];
    setMessages(updatedMessages);

    // Format messages as an array of objects with role and content as properties
    // This is the exact format expected by the API: [{"role": "system", "content": "You are a helpful assistant"}, {"role": "user", "content": "Hello"}, ...]
    const messagesForAPI = updatedMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const requestPayload = {
      request_id: requestId,
      messages: messagesForAPI
    };

    console.log('Sending message with payload:', requestPayload);

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
    error,
    isInitialized,
    safeAreaInsets,
    // Expose conversation history but filter out system messages
    conversationHistory: messages.filter(msg => msg.role !== 'system')
  };
};
