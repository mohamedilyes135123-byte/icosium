"use client";

export const dynamic = 'force-dynamic';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Bot, User, Send, Stethoscope, Loader2, Hospital, HeartHandshake } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientAIChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: [
       {
          id: 'system-welcome',
          role: 'assistant',
          content: 'Ã˜Â£Ã™â€¡Ã™â€žÃ˜Â§Ã™â€¹ Ã˜Â¨Ã™Æ’ Ã™ÂÃ™Å  Ã™â€¦Ã™â€ Ã˜ÂµÃ˜Â© Ã˜Â¹Ã™â€ Ã˜Â§Ã™Å Ã˜Â© Ã°Å¸ËœÅ . Ã˜Â£Ã™â€ Ã˜Â§ Ã™â€¡Ã™â€ Ã˜Â§ Ã™â€žÃ™â€¦Ã˜Â³Ã˜Â§Ã˜Â¹Ã˜Â¯Ã˜ÂªÃ™Æ’ Ã™Ë†Ã˜Â§Ã™â€žÃ˜Â§Ã˜Â³Ã˜ÂªÃ™â€¦Ã˜Â§Ã˜Â¹ Ã˜Â¥Ã™â€žÃ™Å Ã™Æ’ Ã˜Â¨Ã™Æ’Ã™â€ž Ã˜Â§Ã™â€¡Ã˜ÂªÃ™â€¦Ã˜Â§Ã™â€¦. Ã™Æ’Ã™Å Ã™Â Ã˜ÂªÃ˜Â´Ã˜Â¹Ã˜Â± Ã˜Â§Ã™â€žÃ™Å Ã™Ë†Ã™â€¦Ã˜Å¸ Ã™Ë†Ã˜Â£Ã˜Â®Ã˜Â¨Ã˜Â±Ã™â€ Ã™Å  Ã™â€¦Ã™â€¦Ã˜Â§ Ã˜ÂªÃ˜Â¹Ã˜Â§Ã™â€ Ã™Å  Ã˜Â¨Ã˜Â£Ã™Å  Ã™â€žÃ˜ÂºÃ˜Â© Ã˜ÂªÃ˜Â±Ã™Å Ã˜Â­Ã™Æ’.'
       }
    ]
  });
  
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendToDoctor = async () => {
    if (messages.length < 3) {
      alert("Ã˜Â§Ã™â€žÃ˜Â±Ã˜Â¬Ã˜Â§Ã˜Â¡ Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â­Ã˜Â¯Ã˜Â« Ã™â€¦Ã˜Â¹ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã˜Â§Ã˜Â¹Ã˜Â¯ Ã™â€šÃ™â€žÃ™Å Ã™â€žÃ˜Â§Ã™â€¹ Ã™â€žÃ™Å Ã˜ÂªÃ™â€¦Ã™Æ’Ã™â€  Ã™â€¦Ã™â€  Ã˜Â¬Ã™â€¦Ã˜Â¹ Ã˜ÂªÃ™ÂÃ˜Â§Ã˜ÂµÃ™Å Ã™â€ž Ã˜Â­Ã˜Â§Ã™â€žÃ˜ÂªÃ™Æ’ Ã™â€žÃ™â€žÃ˜Â·Ã˜Â¨Ã™Å Ã˜Â¨.");
      return;
    }
    setSubmitting(true);

    // Create a compiled summary text manually from the chat log for the doctor
    const chatLog = messages.filter(m => m.id !== 'system-welcome').map(m => `${m.role === 'user' ? 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â±Ã™Å Ã˜Â¶' : 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã˜Â§Ã˜Â¹Ã˜Â¯'}: ${m.content}`).join('\n');
    
    // Quick concise summary structure based on user prompts
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' | ');

    const { error: dbError } = await supabase
      .from('requests')
      .insert([
        { 
          patient_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for bypass mode
          symptoms: `Ã˜Â³Ã˜Â¬Ã™â€ž Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â­Ã˜Â§Ã˜Â¯Ã˜Â«Ã˜Â© Ã™â€¦Ã˜Â¹ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã˜Â§Ã˜Â¹Ã˜Â¯ Ã˜Â§Ã™â€žÃ˜Â°Ã™Æ’Ã™Å :\n\n${chatLog}`,
           // We use the raw user messages as a quick TL;DR for the doctor dashboard preview
          ai_summary: `Ã˜Â£Ã™â€¡Ã™â€¦ Ã™â€¦Ã˜Â§ Ã˜Â°Ã™Æ’Ã˜Â±Ã™â€¡ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â±Ã™Å Ã˜Â¶: ${userMessages.substring(0, 150)}...`, 
          status: 'pending'
        }
      ]);

    setSubmitting(false);

    if (!dbError) {
      router.push('/patient/requests');
    } else {
      alert("Ã˜Â­Ã˜Â¯Ã˜Â« Ã˜Â®Ã˜Â·Ã˜Â£ Ã˜Â£Ã˜Â«Ã™â€ Ã˜Â§Ã˜Â¡ Ã˜Â§Ã™â€žÃ˜Â¥Ã˜Â±Ã˜Â³Ã˜Â§Ã™â€ž. Ã™Å Ã˜Â±Ã˜Â¬Ã™â€° Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â­Ã˜Â§Ã™Ë†Ã™â€žÃ˜Â© Ã™â€¦Ã˜Â±Ã˜Â© Ã˜Â£Ã˜Â®Ã˜Â±Ã™â€°.");
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-6rem)] pb-20">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-5 pt-8 pb-4 bg-white/60 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-10 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white shadow-lg overflow-hidden relative">
             <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
             <HeartHandshake className="w-6 h-6 relative z-10" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Ã™â€¦Ã˜Â³Ã˜Â§Ã˜Â¹Ã˜Â¯ Ã˜Â¹Ã™â€ Ã˜Â§Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ™Ë†Ã˜Â¯Ã™Å </h1>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               Ã™â€¦Ã˜ÂªÃ˜ÂµÃ™â€ž Ã™Ë†Ã™Å Ã˜Â³Ã˜ÂªÃ™â€¦Ã˜Â¹ Ã˜Â¥Ã™â€žÃ™Å Ã™Æ’
            </p>
          </div>
        </div>

        <Button 
           onClick={sendToDoctor}
           disabled={submitting || messages.length < 3 || isLoading}
           variant="outline"
           className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl"
        >
           {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hospital className="w-4 h-4 ml-2" />}
           Ã™â€¦Ã˜Â´Ã˜Â§Ã˜Â±Ã™Æ’Ã˜Â© Ã™â€¦Ã˜Â¹ Ã˜Â§Ã™â€žÃ˜Â·Ã˜Â¨Ã™Å Ã˜Â¨
        </Button>
      </motion.header>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold border border-rose-100 text-center">
               Ã˜Â¹Ã˜Â°Ã˜Â±Ã˜Â§Ã™â€¹Ã˜Å’ Ã™â€žÃ™â€¦ Ã™â€ Ã˜ÂªÃ™â€¦Ã™Æ’Ã™â€  Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ™Ë†Ã˜ÂµÃ™Ë†Ã™â€ž Ã™â€žÃ™â€¦Ã˜Â­Ã˜Â±Ã™Æ’ Ã˜Â§Ã™â€žÃ˜Â°Ã™Æ’Ã˜Â§Ã˜Â¡ Ã˜Â§Ã™â€žÃ˜Â§Ã˜ÂµÃ˜Â·Ã™â€ Ã˜Â§Ã˜Â¹Ã™Å . Ã˜ÂªÃ˜Â£Ã™Æ’Ã˜Â¯ Ã™â€¦Ã™â€  Ã˜Â¥Ã˜Â¶Ã˜Â§Ã™ÂÃ˜Â© (API Key) Ã™ÂÃ™Å  Ã™â€¦Ã™â€žÃ™Â .env.local 
            </div>
        )}
        <AnimatePresence>
          {messages.map(m => (
            <motion.div 
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-start gap-3 w-full ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                m.role === 'user' 
                  ? 'bg-slate-200 text-slate-500' 
                  : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
              }`}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] rounded-3xl p-4 text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-sm shadow-md' 
                  : 'bg-white text-slate-700 rounded-tl-sm shadow-sm border border-slate-100 font-medium'
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 w-full">
               <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                 <Bot className="w-5 h-5" />
               </div>
               <div className="bg-white rounded-3xl rounded-tl-sm p-4 shadow-sm border border-slate-100 flex gap-1 items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-300 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-5 pt-2 pb-6 bg-gradient-to-t from-slate-50 relative z-20">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input 
            value={input}
            onChange={handleInputChange}
            placeholder="Ã˜Â§Ã™Æ’Ã˜ÂªÃ˜Â¨ Ã™â€¡Ã™â€ Ã˜Â§Ã˜Å’ Ã™Æ’Ã™Å Ã™Â Ã˜ÂªÃ˜Â´Ã˜Â¹Ã˜Â±Ã˜Å¸"
            className="flex-1 h-14 bg-white border border-slate-200 rounded-2xl pl-16 pr-5 shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!input?.trim() || isLoading}
            className="absolute left-2 w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md flex items-center justify-center p-0"
          >
            <Send className="w-5 h-5 rtl:-translate-x-0.5 rtl:rotate-180" />
          </Button>
        </form>
        <p className="text-center text-[10px] font-bold text-slate-400 mt-3">Ã˜Â§Ã™â€žÃ˜Â°Ã™Æ’Ã˜Â§Ã˜Â¡ Ã˜Â§Ã™â€žÃ˜Â§Ã˜ÂµÃ˜Â·Ã™â€ Ã˜Â§Ã˜Â¹Ã™Å  Ã™â€¦Ã˜Â¨Ã˜Â±Ã™â€¦Ã˜Â¬ Ã˜Â¹Ã™â€žÃ™â€° Ã˜Â§Ã™â€žÃ˜Â§Ã˜Â³Ã˜ÂªÃ™â€¦Ã˜Â§Ã˜Â¹ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â·Ã™â€¦Ã˜Â¦Ã™â€  Ã™Ë†Ã™â€žÃ˜Â§ Ã™Å Ã˜Â­Ã™â€ž Ã™â€¦Ã˜Â­Ã™â€ž Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â´Ã˜Â®Ã™Å Ã˜Âµ Ã˜Â§Ã™â€žÃ˜Â¹Ã™Å Ã˜Â§Ã˜Â¯Ã™Å  Ã™â€žÃ˜Â·Ã˜Â¨Ã™Å Ã˜Â¨Ã™Æ’.</p>
      </div>
    </div>
  );
}
