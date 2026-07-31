import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Link as LinkIcon, Unlink } from 'lucide-react';
import { cn } from '@/lib/utils';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const ToolbarBtn = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-md hover:bg-secondary/80 transition-colors",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-card">
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
        <Bold size={16} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
        <Italic size={16} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
        <Strikethrough size={16} />
      </ToolbarBtn>
      
      <div className="w-px h-5 bg-border mx-1" />
      
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
        <Heading1 size={16} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
        <Heading2 size={16} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
        <Heading3 size={16} />
      </ToolbarBtn>
      
      <div className="w-px h-5 bg-border mx-1" />
      
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
        <List size={16} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
        <ListOrdered size={16} />
      </ToolbarBtn>
      
      <div className="w-px h-5 bg-border mx-1" />
      
      <ToolbarBtn onClick={setLink} active={editor.isActive('link')}>
        <LinkIcon size={16} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().unsetLink().run()} active={false}>
        <Unlink size={16} />
      </ToolbarBtn>
    </div>
  );
};

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:underline',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border border-border rounded-md overflow-hidden bg-background flex flex-col focus-within:ring-2 focus-within:ring-pitch transition-shadow">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="flex-grow cursor-text" />
    </div>
  );
}
