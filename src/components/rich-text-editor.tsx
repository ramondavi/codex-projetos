"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import type { ReactNode } from "react";
import { AppIcon } from "./app-icon";

export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: false }), Link.configure({ openOnClick: false, autolink: true })],
    content: value,
    immediatelyRender: false,
    editorProps: { attributes: { "aria-label": "Conteúdo completo", class: "rich-editor__content" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  if (!editor) return <div className="rich-editor__loading">Carregando editor…</div>;

  const button = (label: string, run: () => void, active = false, content: ReactNode = label) => (
    <button type="button" aria-label={label} aria-pressed={active} title={label} className={active ? "is-active" : ""} onClick={run}>{content}</button>
  );
  const editLink = () => {
    const current = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Endereço do link (https://)", current ?? "https://");
    if (url === null) return;
    if (!url.trim()) { editor.chain().focus().unsetLink().run(); return; }
    if (!/^https:\/\/[^\s]+$/i.test(url.trim())) { window.alert("Use um endereço HTTPS válido."); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return <div className="rich-editor">
    <div className="rich-editor__toolbar" role="toolbar" aria-label="Formatação do conteúdo">
      {button("Parágrafo", () => editor.chain().focus().setParagraph().run(), editor.isActive("paragraph") && !editor.isActive("heading"), "P")}
      {button("Título de seção", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }), "T2")}
      {button("Subtítulo", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }), "T3")}
      <span aria-hidden="true" className="rich-editor__divider" />
      {button("Negrito", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), <strong>B</strong>)}
      {button("Itálico", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), <em>I</em>)}
      {button("Tachado", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"), <s>S</s>)}
      {button("Link", editLink, editor.isActive("link"), <AppIcon name="link" />)}
      <span aria-hidden="true" className="rich-editor__divider" />
      {button("Lista com marcadores", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"), "• ≡")}
      {button("Lista numerada", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"), "1. ≡")}
      {button("Citação", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"), "❝")}
      {button("Linha divisória", () => editor.chain().focus().setHorizontalRule().run(), false, "―")}
      <span aria-hidden="true" className="rich-editor__divider" />
      {button("Desfazer", () => editor.chain().focus().undo().run(), false, "↶")}
      {button("Refazer", () => editor.chain().focus().redo().run(), false, "↷")}
    </div>
    <EditorContent editor={editor} />
  </div>;
}
