import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { wishlistService } from '../../services/wishlistService';
import { AiResponse } from '../../types';

interface Message {
  sender: 'user' | 'ai';
  text?: string;
  data?: AiResponse;
}

export const AiChatDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your WishWise AI Assistant. Ask me anything about your saved wishlists, budgets, target prices, or price drop deals!',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const text = queryText || promptInput;
    if (!text.trim()) return;

    const newMsgs: Message[] = [...messages, { sender: 'user', text }];
    setMessages(newMsgs);
    setPromptInput('');
    setIsLoading(true);

    try {
      const res: any = await wishlistService.askAiAssistant(text);
      setMessages([...newMsgs, { sender: 'ai', data: res.data }]);
    } catch {
      setMessages([
        ...newMsgs,
        { sender: 'ai', text: 'Sorry, I encountered an issue analyzing your wishlists. Please check your connection.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20"
      >
        <Sparkles className="w-4 h-4 fill-white animate-pulse" />
        <span>AI Wishlist Assistant</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-gray-100">
            
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/40 border border-purple-400/40 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">WishWise AI Assistant</h3>
                  <p className="text-[10px] text-purple-300">Intelligent Wishlist & Budget Decision Support</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-gray-300 hover:text-white rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="bg-purple-50/70 p-2.5 border-b border-purple-100 flex gap-2 overflow-x-auto text-[11px]">
              {[
                'I have ₹15,000 budget, what should I buy?',
                'Show price drop deals',
                'Check Wishlist Health',
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-full font-medium shadow-xs transition"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                    m.sender === 'user'
                      ? 'bg-pink-600 text-white rounded-br-none shadow-md font-medium'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                    {m.text && <p className="leading-relaxed">{m.text}</p>}

                    {m.data && (
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm text-purple-900">{m.data.replyHeading}</h4>
                        <div className="text-gray-700 whitespace-pre-line leading-relaxed">{m.data.detailedExplanation}</div>

                        {m.data.recommendations?.length > 0 && (
                          <div className="mt-2 space-y-1.5 pt-2 border-t border-purple-100">
                            {m.data.recommendations.map((rec, rIdx) => (
                              <div key={rIdx} className="p-2 bg-purple-50 rounded-xl text-[11px] border border-purple-100">
                                <div className="flex justify-between font-bold text-purple-900">
                                  <span>{rec.name}</span>
                                  <span>₹{rec.price.toLocaleString('en-IN')}</span>
                                </div>
                                <p className="text-gray-600 text-[10px] mt-0.5">{rec.reason}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-700 text-white flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 items-center text-xs text-purple-600 font-medium">
                  <Bot className="w-4 h-4 animate-spin" /> Analyzing wishlist price histories and stock constraints...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
              <input
                type="text"
                placeholder="Ask AI assistant..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-3.5 py-2 bg-gray-100 border border-transparent rounded-full text-xs focus:bg-white focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !promptInput.trim()}
                className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-full transition shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
