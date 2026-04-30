"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminUtils } from "@/components/admin/AdminUtilsProvider";
import { MessageSquare, Bot, User, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
}

function ConversationRow({ conv }: { conv: Conversation }) {
  const [expanded, setExpanded] = useState(false);

  const userMessages = conv.messages.filter((m) => m.role === "user");
  const preview = userMessages[0]?.content ?? "Sin mensajes del usuario";
  const duration = Math.round(
    (new Date(conv.updatedAt).getTime() - new Date(conv.createdAt).getTime()) / 60000
  );

  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-full bg-[#2d5a27]/20 border border-[#2d5a27]/30 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="h-4 w-4 text-[#2d5a27]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[13px] truncate">{preview}</p>
          <p className="text-white/30 text-[11px] mt-0.5">
            {new Date(conv.createdAt).toLocaleDateString("es-AR", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
            {duration > 0 ? ` · ${duration} min` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
            {conv.messages.length} msgs
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-white/30" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/30" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 bg-white/[0.01] space-y-3 border-t border-white/5 max-h-[500px] overflow-y-auto">
              {conv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-[#2d5a27] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#2d5a27]/20 border border-[#2d5a27]/20 text-white rounded-tr-sm"
                        : "bg-white/5 border border-white/5 text-white/80 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                    <p className="text-[10px] text-white/20 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString("es-AR", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-white/60" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminConversacionesPage() {
  const { user } = useAuthStore();
  const { showToast } = useAdminUtils();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/conversations?adminId=${user.id}`);
        const data = await res.json();
        if (data.conversations) setConversations(data.conversations);
      } catch {
        showToast("Error al cargar conversaciones", "error");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.id]);

  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
  const userMessages = conversations.reduce(
    (sum, c) => sum + c.messages.filter((m) => m.role === "user").length,
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">conversaciones</h1>
        <p className="text-white/40 text-[11px] uppercase tracking-widest">historial del chat de IA · todas las sesiones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#2d5a27]/10 border border-[#2d5a27]/20 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="h-4 w-4 text-[#2d5a27]" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#2d5a27]">Sesiones</span>
          </div>
          <p className="text-3xl font-light font-montserrat text-white">{conversations.length}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <User className="h-4 w-4 text-white/40" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Msgs usuarios</span>
          </div>
          <p className="text-3xl font-light font-montserrat text-white">{userMessages}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Bot className="h-4 w-4 text-white/40" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Total msgs</span>
          </div>
          <p className="text-3xl font-light font-montserrat text-white">{totalMessages}</p>
        </div>
      </div>

      {/* Conversations list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl px-6 py-24 text-center">
            <p className="text-white/20 text-[11px] uppercase tracking-widest">Cargando conversaciones...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl px-6 py-24 text-center">
            <MessageSquare className="h-8 w-8 text-white/5 mx-auto mb-4" />
            <p className="text-white/20 text-[11px] uppercase tracking-widest">
              Aún no hay conversaciones registradas.
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationRow key={conv.id} conv={conv} />
          ))
        )}
      </div>
    </div>
  );
}
