"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Color from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Heading1, 
  Heading2, 
  Heading3,
  Palette,
  Quote,
  Undo,
  Redo,
  Type
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import type { ThemeTokens } from "@/services/theme"

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  themeColors?: Partial<ThemeTokens>
}

const FALLBACK_THEME_COLORS: Partial<ThemeTokens> = {
  primary: "#111827",
  primaryForeground: "#FFFFFF",
  secondary: "#1F2937",
  secondaryForeground: "#FFFFFF",
  accent: "#2563EB",
  accentForeground: "#FFFFFF",
  foreground: "#111827",
  mutedForeground: "#6B7280",
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",
}

function buildColorOptions(themeColors?: Partial<ThemeTokens>) {
  const colors = { ...FALLBACK_THEME_COLORS, ...themeColors }
  return [
    { label: "Szöveg", value: colors.foreground },
    { label: "Primary foreground", value: colors.primaryForeground },
    { label: "Secondary", value: colors.secondary },
    { label: "Secondary foreground", value: colors.secondaryForeground },
    { label: "Accent", value: colors.accent },
    { label: "Muted", value: colors.mutedForeground },
    { label: "Success", value: colors.success },
    { label: "Warning", value: colors.warning },
    { label: "Error", value: colors.error },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value))
}

const MenuBar = ({ editor, themeColors }: { editor: any; themeColors?: Partial<ThemeTokens> }) => {
  if (!editor) {
    return null
  }
  const colorOptions = buildColorOptions(themeColors)

  const items = [
    {
      icon: Bold,
      title: "Félkövér",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: Italic,
      title: "Dőlt",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: UnderlineIcon,
      title: "Aláhúzott",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive("underline"),
    },
    {
      type: "divider",
    },
    {
      icon: Heading1,
      title: "Címsor 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      title: "Címsor 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      title: "Címsor 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive("heading", { level: 3 }),
    },
    {
      type: "divider",
    },
    {
      icon: List,
      title: "Felsorolás",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      title: "Számozott lista",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      title: "Idézet",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive("blockquote"),
    },
    {
      type: "divider",
    },
    {
      icon: LinkIcon,
      title: "Link",
      action: () => {
        const url = window.prompt("URL megadása:")
        if (url) {
          editor.chain().focus().setLink({ href: url }).run()
        }
      },
      isActive: () => editor.isActive("link"),
    },
    {
      type: "divider",
    },
    {
      icon: Undo,
      title: "Visszavonás",
      action: () => editor.chain().focus().undo().run(),
    },
    {
      icon: Redo,
      title: "Ismétlés",
      action: () => editor.chain().focus().redo().run(),
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-neutral-900 border-b border-white/10">
      {items.map((item, index) => (
        item.type === "divider" ? (
          <div key={index} className="w-px h-6 bg-white/10 mx-1 self-center" />
        ) : (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault()
              item.action?.()
            }}
            className={cn(
              "w-8 h-8 rounded-none hover:bg-white/10 hover:text-white transition-colors",
              item.isActive?.() ? "bg-white/15 text-white" : "text-neutral-400"
            )}
            title={item.title}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
          </Button>
        )
      ))}
      <div className="w-px h-6 bg-white/10 mx-1 self-center" />
      <div className="flex flex-wrap items-center gap-1 pl-1">
        <Palette className="h-4 w-4 text-neutral-500" />
        {colorOptions.map((item) => (
          <button
            key={`${item.label}-${item.value}`}
            type="button"
            title={item.label}
            aria-label={`Szövegszín: ${item.label}`}
            onClick={(event) => {
              event.preventDefault()
              editor.chain().focus().setColor(item.value).run()
            }}
            className={cn(
              "h-7 w-7 rounded-none border border-white/15 transition-transform hover:scale-110",
              editor.isActive("textStyle", { color: item.value }) && "ring-2 ring-white"
            )}
            style={{ backgroundColor: item.value }}
          />
        ))}
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            editor.chain().focus().unsetColor().run()
          }}
          className="h-7 rounded-none border border-white/15 px-2 text-[10px] font-black uppercase tracking-widest text-neutral-300 hover:bg-white/10 hover:text-white"
        >
          Alap
        </button>
      </div>
    </div>
  )
}

export function RichTextEditor({ value, onChange, placeholder, themeColors }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "admin-link-accent cursor-pointer",
        },
      }),
    ],
    immediatelyRender: false,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[256px] p-6 text-black bg-white ql-editor",
      },
    },
  })

  // Update logic to handle external value changes (like initial load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  return (
    <div className="bg-white border border-white/5 rounded-none overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary">
      <MenuBar editor={editor} themeColors={themeColors} />
      <EditorContent editor={editor} />
      
      <style jsx global>{`
        .prose h1 { font-size: 2.25rem; font-weight: 900; margin-bottom: 1.5rem; text-transform: uppercase; }
        .prose h2 { font-size: 1.875rem; font-weight: 800; margin-bottom: 1.25rem; text-transform: uppercase; }
        .prose h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; text-transform: uppercase; }
        .prose p { margin-bottom: 1rem; line-height: 1.6; }
        .prose ul, .prose ol { margin-left: 1.5rem; margin-bottom: 1rem; }
        .prose ul { list-style-type: disc; }
        .prose ol { list-style-type: decimal; }
        .prose blockquote { border-left: 4px solid #FF5500; padding-left: 1rem; font-style: italic; color: #555; }
        
        /* Ensure the editor content area looks consistent with the old design for better transition */
        .tiptap {
           color: #000 !important;
        }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
      `}</style>
    </div>
  )
}
