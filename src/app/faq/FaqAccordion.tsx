"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqEntry {
    id: string;
    question: string;
    answer: string;
}

export function FaqAccordion({ items }: { items: FaqEntry[] }) {
    const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

    return (
        <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
            {items.map((item) => {
                const isOpen = openId === item.id;
                return (
                    <div key={item.id}>
                        <button
                            onClick={() => setOpenId(isOpen ? null : item.id)}
                            className="w-full flex items-center justify-between gap-4 py-5 text-left"
                        >
                            <span className="font-medium text-gray-900 text-[15px]">{item.question}</span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && (
                            <p className="text-gray-600 text-[14px] leading-relaxed pb-5 pr-8">{item.answer}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
