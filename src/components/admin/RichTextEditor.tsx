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
  Quote,
  Undo,
  Redo,
  Type
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

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
    <div className="flex flex-wrap gap-1 p-2 bg-neutral-900 border-b border-white/10">
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
              "w-8 h-8 rounded-none hover:bg-accent/20 hover:text-accent transition-colors",
              item.isActive?.() ? "bg-accent/20 text-accent" : "text-neutral-400"
            )}
            title={item.title}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
          </Button>
        )
      ))}
    </div>
  )
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-accent underline cursor-pointer",
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
    <div className="bg-white border border-white/5 rounded-none overflow-hidden transition-all focus-within:ring-2 focus-within:ring-accent">
      <MenuBar editor={editor} />
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
