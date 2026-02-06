'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { SendHorizontal, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatBot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !user || !token) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get conversation ID from the last assistant message if available
      const lastConversationMessage = messages.findLast(m => m.role === 'assistant');
      const conversationId = lastConversationMessage?.id || null;

      // Call the chat API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${user.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: input.trim(),
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: data.conversation_id,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Trigger task list refresh if chatbot performed task operations
      if (data.tool_calls && data.tool_calls.length > 0) {
        const taskOperations = ['add_task', 'delete_task', 'update_task', 'complete_task'];
        const hasTaskOperation = data.tool_calls.some((call: any) =>
          taskOperations.includes(call.name)
        );

        if (hasTaskOperation) {
          // Dispatch custom event to notify dashboard to refresh tasks
          window.dispatchEvent(new CustomEvent('taskListChanged'));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Chat Assistant</h2>
        </div>
        <div className="text-gray-600 dark:text-gray-300">
          <p>Please sign in to use the chat assistant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 px-6 pt-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Task Assistant
        </h2>
      </div>
      <div className="p-6">
        <div className="flex flex-col h-[500px]">
          <div className="flex-grow mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-y-auto max-h-96">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <Bot className="h-12 w-12 mb-4" />
                <p>Hello! I'm your AI task assistant.</p>
                <p className="text-sm mt-2">Ask me to add, list, update, or manage your tasks.</p>
                <div className="mt-4 space-y-2 text-left text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                  <p><span className="font-medium">Examples:</span></p>
                  <p>• "Add a task to buy groceries"</p>
                  <p>• "Show me my tasks"</p>
                  <p>• "Mark task as complete"</p>
                  <p>• "Update task description"</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[80%] ${
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center h-8 w-8 rounded-full ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[80%]">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-lg p-3 bg-gray-100 dark:bg-gray-700">
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 rounded-full bg-gray-500 animate-bounce"></div>
                          <div className="h-2 w-2 rounded-full bg-gray-500 animate-bounce delay-75"></div>
                          <div className="h-2 w-2 rounded-full bg-gray-500 animate-bounce delay-150"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to manage your tasks..."
              disabled={isLoading}
              className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isLoading || !input.trim()
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}