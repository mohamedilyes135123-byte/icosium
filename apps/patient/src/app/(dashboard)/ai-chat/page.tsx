"use client";
export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Bot, User, Send, Loader2, Hospital, HeartHandshake } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function PatientAIChat() {
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  
  // Load from localStorage on mount or language change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMessagesStr = localStorage.getItem("inaya_ai_chat_messages");
      const savedTimestampStr = localStorage.getItem("inaya_ai_chat_timestamp");
      
      if (savedMessagesStr && savedTimestampStr) {
        const timestamp = parseInt(savedTimestampStr, 10);
        const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
        
        if (!isExpired) {
          try {
            const parsed = JSON.parse(savedMessagesStr);
            setMessages(parsed);
            setMessagesLoaded(true);
            return;
          } catch (e) {
            console.error("Error parsing saved messages:", e);
          }
        }
      }
      
      // Clean up if expired or empty
      localStorage.removeItem("inaya_ai_chat_messages");
      localStorage.removeItem("inaya_ai_chat_timestamp");
    }
    
    // Set initial welcome message
    setMessages([
      {
        id: 'system-welcome',
        role: 'assistant',
        content: t.aiChat.welcomeMessage
      }
    ]);
    setMessagesLoaded(true);
  }, [t.aiChat.welcomeMessage]);

  // Save to localStorage when messages change (only if conversation has started)
  useEffect(() => {
    if (messagesLoaded && typeof window !== "undefined" && messages.length > 0) {
      const hasUserMessage = messages.some(m => m.role === "user");
      if (hasUserMessage) {
        localStorage.setItem("inaya_ai_chat_messages", JSON.stringify(messages));
        if (!localStorage.getItem("inaya_ai_chat_timestamp")) {
          localStorage.setItem("inaya_ai_chat_timestamp", Date.now().toString());
        }
      }
    }
  }, [messages, messagesLoaded]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      
      const data = await res.json();
      
      if (res.ok && data.message) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: data.message }]);
      } else {
        setError(data.message || t.aiChat.unknownError);
      }
    } catch (err: any) {
      setError(err.message || t.aiChat.connectionFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const sendToDoctor = async () => {
    if (messages.length < 3) {
      alert(t.aiChat.talkMoreNotice);
      return;
    }
    setSubmitting(true);

    const chatLog = messages
      .filter(m => m.id !== 'system-welcome')
      .map(m => `${m.role === 'user' ? t.aiChat.patientLabel : t.aiChat.assistantLabel}: ${m.content}`)
      .join('\n');
    
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' | ');

    const { data: { user } } = await supabase.auth.getUser();

    const { error: dbError } = await supabase
      .from('requests')
      .insert([{
        patient_id: user?.id || '00000000-0000-0000-0000-000000000000',
        symptoms: `${t.aiChat.chatLogPrefix}${chatLog}`,
        ai_summary: `${t.aiChat.patientKeyPoints}${userMessages.substring(0, 150)}...`,
        status: 'pending'
      }]);

    setSubmitting(false);

    if (!dbError) {
      // Clear saved messages on successful submission to doctor
      localStorage.removeItem("inaya_ai_chat_messages");
      localStorage.removeItem("inaya_ai_chat_timestamp");
      router.push('/requests');
    } else {
      alert(t.aiChat.errorSending);
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-6rem)] pb-20" style={{ direction: isRtl ? "rtl" : "ltr" }}>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`px-5 pt-8 pb-4 bg-white/60 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-10 flex justify-between items-center ${isRtl ? "flex-row" : "flex-row-reverse"}`}
      >
        <div className={`flex items-center gap-3 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white shadow-lg overflow-hidden relative">
             <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
             <HeartHandshake className="w-6 h-6 relative z-10" />
          </div>
          <div className={isRtl ? "text-right" : "text-left"}>
            <h1 className="text-xl font-black text-slate-800">{t.aiChat.title}</h1>
            <p className={`text-xs font-bold text-emerald-600 flex items-center gap-1 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               {t.aiChat.connectedStatus}
            </p>
          </div>
        </div>

        <Button 
           onClick={sendToDoctor}
           disabled={submitting || messages.length < 3 || isLoading}
           className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-2 shadow-md flex items-center gap-2 transition-all disabled:opacity-40"
        >
           {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hospital className="w-4 h-4" />}
           {t.aiChat.shareWithDoctor}
        </Button>
      </motion.header>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold border border-rose-100 text-center">
               {t.aiChat.errorOccurred}{error}
               <br/>
               <span className="text-xs text-rose-400">{t.aiChat.aiConfigCheck}</span>
            </div>
        )}
        <AnimatePresence>
          {messages.map(m => (
            <motion.div 
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-start gap-3 w-full ${m.role === 'user' ? (isRtl ? 'flex-row' : 'flex-row-reverse') : (isRtl ? 'flex-row-reverse' : 'flex-row')}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                m.role === 'user' 
                  ? 'bg-slate-200 text-slate-500' 
                  : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
              }`}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div className={`max-w-[80%] rounded-3xl p-4 text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-sm shadow-md' 
                  : 'bg-white text-slate-700 rounded-tl-sm shadow-sm border border-slate-100 font-medium'
              }`} style={{ textAlign: isRtl ? "right" : "left" }}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-start gap-3 w-full ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
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

      <div className="px-5 pt-2 pb-6 bg-gradient-to-t from-slate-50 relative z-20">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input 
            value={input}
            onChange={handleInputChange}
            placeholder={t.aiChat.inputPlaceholder}
            className={`flex-1 h-14 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${isRtl ? "pl-16 pr-5" : "pr-16 pl-5"}`}
            disabled={isLoading}
            style={{ direction: isRtl ? "rtl" : "ltr" }}
          />
          <Button 
            type="submit" 
            disabled={!input?.trim() || isLoading}
            className={`absolute w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-lg flex items-center justify-center p-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isRtl ? "left-2" : "right-2"}`}
          >
            <Send className={`w-5 h-5 ${isRtl ? "left-2" : "right-2"} ${isRtl ? "rotate-180" : ""}`} />
          </Button>
        </form>
        <p className="text-center text-[10px] font-bold text-slate-400 mt-3">{t.aiChat.medicalDisclaimer}</p>
      </div>
    </div>
  );
}
