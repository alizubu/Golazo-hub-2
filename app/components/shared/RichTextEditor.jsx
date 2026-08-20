import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import * as Popover from '@radix-ui/react-popover';
import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Link as LinkIcon, Unlink, Eraser, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

const ToolbarBtn = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "p-1.5 rounded-md transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500",
      active ? "bg-amber-500/20 text-amber-500" : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
    )}
  >
    {children}
  </button>
);

const MenuBar = ({ editor }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [isLinkOpen, setIsLinkOpen] = useState(false);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setIsLinkOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-card overflow-x-auto no-scrollbar">
      {/* Text Styles */}
      <div className="flex items-center gap-1">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
          <Strikethrough size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} active={false}>
          <Eraser size={16} />
        </ToolbarBtn>
      </div>
      
      <div className="w-px h-5 bg-border/50 mx-1" />
      
      {/* Headings */}
      <div className="flex items-center gap-1">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
          <Heading1 size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          <Heading2 size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          <Heading3 size={16} />
        </ToolbarBtn>
      </div>
      
      <div className="w-px h-5 bg-border/50 mx-1" />
      
      {/* Lists */}
      <div className="flex items-center gap-1">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered size={16} />
        </ToolbarBtn>
      </div>
      
      <div className="w-px h-5 bg-border/50 mx-1" />
      
      {/* Links */}
      <div className="flex items-center gap-1">
        <Popover.Root open={isLinkOpen} onOpenChange={setIsLinkOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                setLinkUrl(previousUrl || '');
              }}
              className={cn(
                "p-1.5 rounded-md transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500",
                editor.isActive('link') ? "bg-amber-500/20 text-amber-500" : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              <LinkIcon size={16} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="z-50 w-64 p-3 bg-popover border border-border rounded-lg shadow-xl" sideOffset={5}>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-foreground">Insert Link</p>
                <div className="flex gap-2">
                  <Input 
                    value={linkUrl} 
                    onChange={e => setLinkUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setLink();
                      }
                    }}
                  />
                  <Button size="icon" className="h-8 w-8 shrink-0 bg-amber-500 hover:bg-amber-600 text-black" onClick={setLink}>
                    <Check size={14} />
                  </Button>
                </div>
              </div>
              <Popover.Arrow className="fill-border" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <ToolbarBtn onClick={() => editor.chain().focus().unsetLink().run()} active={false}>
          <Unlink size={16} />
        </ToolbarBtn>
      </div>
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
          class: 'text-amber-500 hover:underline',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'max-w-none focus:outline-none min-h-[180px] p-4 text-sm text-foreground leading-relaxed [&_p]:mb-3 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_strong]:font-bold [&_strong]:text-foreground [&_h1]:text-2xl [&_h1]:font-black [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_a]:text-amber-500 [&_a]:hover:underline',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background flex flex-col focus-within:ring-1 focus-within:ring-amber-500/50 focus-within:border-amber-500/50 transition-all shadow-sm">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="flex-grow cursor-text" />
    </div>
  );
}
