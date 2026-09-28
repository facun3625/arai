"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, Color, FontSize } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { productDescriptionHtml, sanitizeProductHtml } from "@/lib/productRichText";

export function ProductTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const lastEmitted = useRef(value);
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ heading: { levels: [2, 3] }, link: false, code: false, codeBlock: false, horizontalRule: false }),
            TextStyle, Color, FontSize,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        content: productDescriptionHtml(value),
        editorProps: {
            attributes: { class: "product-rich-text min-h-64 p-5 outline-none", role: "textbox", "aria-label": "Descripción del producto", "aria-multiline": "true" },
            transformPastedHTML: sanitizeProductHtml,
        },
        onUpdate: ({ editor }) => {
            const html = editor.isEmpty ? "" : editor.getHTML();
            lastEmitted.current = html;
            onChange(html);
        },
    });
    const state = useEditorState({
        editor,
        selector: ({ editor }) => editor ? {
            bold: editor.isActive("bold"), italic: editor.isActive("italic"), underline: editor.isActive("underline"),
            bulletList: editor.isActive("bulletList"), orderedList: editor.isActive("orderedList"),
            heading: editor.isActive("heading", { level: 2 }) ? "2" : editor.isActive("heading", { level: 3 }) ? "3" : "p",
            fontSize: editor.getAttributes("textStyle").fontSize || "14px",
            alignment: ["left", "center", "right", "justify"].find(textAlign => editor.isActive({ textAlign })) || "left",
            undo: editor.can().undo(), redo: editor.can().redo(),
        } : null,
    }) ?? { bold: false, italic: false, underline: false, bulletList: false, orderedList: false, heading: "p", fontSize: "14px", alignment: "left", undo: false, redo: false };

    useEffect(() => {
        if (editor && value !== lastEmitted.current) {
            editor.commands.setContent(productDescriptionHtml(value), { emitUpdate: false });
            lastEmitted.current = value;
        }
    }, [editor, value]);

    if (!editor) return <div className="min-h-64 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Cargando editor…</div>;

    const button = (label: string, action: () => void, active = false, disabled = false) => (
        <button type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled}
            onMouseDown={event => event.preventDefault()} onClick={action}
            className={`rounded-md border px-2.5 py-2 text-xs font-medium transition-colors disabled:opacity-40 ${active ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}>
            {label}
        </button>
    );

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-primary">
            <div role="group" aria-label="Formato de la descripción" className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-3">
                <select aria-label="Estilo de párrafo" className="rounded-md border-slate-200 py-1.5 text-xs" value={state.heading}
                    onChange={event => event.target.value === "p" ? editor.chain().focus().setParagraph().run() : editor.chain().focus().setHeading({ level: Number(event.target.value) as 2 | 3 }).run()}>
                    <option value="p">Párrafo</option><option value="2">Título</option><option value="3">Subtítulo</option>
                </select>
                <select aria-label="Tamaño de texto" className="rounded-md border-slate-200 py-1.5 text-xs" value={state.fontSize}
                    onChange={event => editor.chain().focus().setFontSize(event.target.value).run()}>
                    {[12, 14, 16, 18, 20, 24, 28, 32].map(size => <option key={size} value={`${size}px`}>{size} px</option>)}
                </select>
                {button("Negrita", () => { editor.chain().focus().toggleBold().run(); }, state.bold)}
                {button("Cursiva", () => { editor.chain().focus().toggleItalic().run(); }, state.italic)}
                {button("Subrayado", () => { editor.chain().focus().toggleUnderline().run(); }, state.underline)}
                <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
                    Color <input type="color" aria-label="Color del texto" defaultValue="#475569" className="h-7 w-8 cursor-pointer border-0 bg-transparent p-0"
                        onChange={event => editor.chain().focus().setColor(event.target.value).run()} />
                </label>
                <select aria-label="Alineación del texto" className="rounded-md border-slate-200 py-1.5 text-xs" value={state.alignment}
                    onChange={event => editor.chain().focus().setTextAlign(event.target.value).run()}>
                    <option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option><option value="justify">Justificado</option>
                </select>
                {button("Viñetas", () => { editor.chain().focus().toggleBulletList().run(); }, state.bulletList)}
                {button("Numeración", () => { editor.chain().focus().toggleOrderedList().run(); }, state.orderedList)}
                {button("Quitar formato", () => { editor.chain().focus().unsetAllMarks().clearNodes().unsetTextAlign().run(); })}
                {button("Deshacer", () => { editor.chain().focus().undo().run(); }, false, !state.undo)}
                {button("Rehacer", () => { editor.chain().focus().redo().run(); }, false, !state.redo)}
            </div>
            <EditorContent editor={editor} />
            <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">Seleccioná el texto para darle formato. Los cambios se guardan al guardar el producto.</p>
        </div>
    );
}
