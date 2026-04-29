"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Bot, User, Loader2, Phone } from "lucide-react";

function renderMessage(content: string) {
  const urlRegex = /(https?:\/\/[^\s\)\]]+)/g;
  const parts = content.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer"
        className="underline text-[#2d5a27] font-medium break-all">
        Ver producto →
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type ContactFlow = null | "asking_name" | "asking_phone";

export const AIChatDrawer = ({ isOpen, onClose }: AIChatDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! 🌿 Soy Araí, tu guía en el mundo del mate. Contame, ¿cómo te gusta el mate? ¿Suave, intenso, o estás buscando algo especial?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contactFlow, setContactFlow] = useState<ContactFlow>(null);
  const [contactName, setContactName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleContactSeller = () => {
    if (contactFlow !== null) return;
    setMessages(prev => [
      ...prev,
      { role: "user", content: "Quiero que me contacte un vendedor" },
      { role: "assistant", content: "¡Con gusto! Para que uno de nuestros vendedores se comunique con vos, necesito un par de datos. ¿Cuál es tu nombre?" },
    ]);
    setContactFlow("asking_name");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (contactFlow === "asking_name") {
      setContactName(text);
      setMessages(prev => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: `¡Perfecto, ${text}! ¿Y cuál es tu número de WhatsApp para que te contacten?` },
      ]);
      setInput("");
      setContactFlow("asking_phone");
      return;
    }

    if (contactFlow === "asking_phone") {
      setMessages(prev => [...prev, { role: "user", content: text }]);
      setInput("");
      setLoading(true);
      try {
        await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: contactName, phone: text }),
        });
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: `¡Gracias, ${contactName}! 💚 Vamos a contactarte al ${text} a la brevedad por WhatsApp. ¡Hasta pronto!` },
        ]);
      } catch {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Hubo un problema al guardar tus datos. ¿Podés intentarlo de nuevo?" },
        ]);
      } finally {
        setLoading(false);
        setContactFlow(null);
        setContactName("");
      }
      return;
    }

    // Normal AI flow
    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "No pude procesar tu consulta." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Hubo un problema de conexión. ¿Podés intentarlo de nuevo?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed bottom-0 right-0 z-50 flex flex-col w-full sm:w-[400px] sm:bottom-8 sm:right-8 sm:rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
          isOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
        style={{ height: "min(600px, calc(100dvh - 2rem))" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#2d5a27] rounded-t-2xl">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">Araí IA</p>
            <p className="text-white/70 text-xs">Experta en yerba mate</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Cerrar chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f9f6f1]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-[#2d5a27] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#2d5a27] text-white rounded-tr-sm"
                    : "bg-white text-gray-800 rounded-tl-sm shadow-sm"
                }`}
              >
                {renderMessage(msg.content)}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-[#2d5a27] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-[#2d5a27]/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-[#2d5a27]/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-[#2d5a27]/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 bg-white border-t border-gray-100 rounded-b-2xl">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                contactFlow === "asking_name" ? "Escribe tu nombre..." :
                contactFlow === "asking_phone" ? "Escribe tu número de WhatsApp..." :
                "Preguntame sobre nuestras yerbas..."
              }
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-lg bg-[#2d5a27] flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e3d1a] transition-colors flex-shrink-0"
              aria-label="Enviar mensaje"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Contact seller CTA - always visible */}
          {contactFlow === null && (
            <button
              onClick={handleContactSeller}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#2d5a27]/5 hover:bg-[#2d5a27]/10 border border-[#2d5a27]/20 text-[#2d5a27] text-xs font-medium transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Quiero que me contacte un vendedor
            </button>
          )}

          <p className="text-center text-xs text-gray-400 mt-2">Araí IA · Powered by Groq</p>
        </div>
      </div>
    </>
  );
};
