import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Mention from '@tiptap/extension-mention';
import * as Popover from '@radix-ui/react-popover';
import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Link as LinkIcon, Unlink, Eraser, Check, AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, Highlighter, Image as ImageIcon, Youtube as YoutubeIcon, Table as TableIcon, Quote, Minus, Trash2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import getMentionSuggestionConfig from './mentionSuggestion';

const PRESET_COLORS = ['#ffffff', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#a855f7'];

const ToolbarBtn = ({ active, onClick, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "p-1.5 sm:p-2 rounded-lg transition-all flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500",
      active ? "bg-amber-500/20 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]" : "text-slate-400 hover:text-white hover:bg-white/5"
    )}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-white/[0.08] mx-1 sm:mx-2" />;

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

  const addImage = () => {
    const url = window.prompt('URL of the image:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt('URL of the YouTube video:');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 p-2 sm:p-3 border-b border-white/[0.08] bg-[#0a0c14] overflow-x-auto no-scrollbar rounded-t-xl z-10 relative">
      {/* Text Styles */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <ToolbarBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold size={16} /></ToolbarBtn>
        <ToolbarBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic size={16} /></ToolbarBtn>
        <ToolbarBtn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Strikethrough size={16} /></ToolbarBtn>
        <ToolbarBtn title="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}><Highlighter size={16} /></ToolbarBtn>
        <ToolbarBtn title="Clear Formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} active={false}><Eraser size={16} /></ToolbarBtn>
      </div>
      
      <Divider />
      
      {/* Colors */}
      <div className="flex items-center gap-1">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none flex items-center gap-1">
              <Palette size={16} />
              <ChevronDown size={12} className="opacity-50" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="z-50 p-2 bg-[#0a0c14] border border-white/10 rounded-xl shadow-2xl flex flex-wrap gap-2 w-32" sideOffset={5}>
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => editor.chain().focus().setColor(c).run()}
                  className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <button
                onClick={() => editor.chain().focus().unsetColor().run()}
                className="w-full mt-2 py-1 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
              >
                Reset Color
              </button>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      <Divider />
      
      {/* Alignment */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <ToolbarBtn title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}><AlignLeft size={16} /></ToolbarBtn>
        <ToolbarBtn title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}><AlignCenter size={16} /></ToolbarBtn>
        <ToolbarBtn title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}><AlignRight size={16} /></ToolbarBtn>
        <ToolbarBtn title="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })}><AlignJustify size={16} /></ToolbarBtn>
      </div>

      <Divider />

      {/* Headings */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <ToolbarBtn title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}><Heading1 size={16} /></ToolbarBtn>
        <ToolbarBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 size={16} /></ToolbarBtn>
        <ToolbarBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}><Heading3 size={16} /></ToolbarBtn>
      </div>
      
      <Divider />
      
      {/* Blocks & Lists */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <ToolbarBtn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}><Quote size={16} /></ToolbarBtn>
        <ToolbarBtn title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List size={16} /></ToolbarBtn>
        <ToolbarBtn title="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered size={16} /></ToolbarBtn>
        <ToolbarBtn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false}><Minus size={16} /></ToolbarBtn>
      </div>
      
      <Divider />
      
      {/* Links & Media */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <Popover.Root open={isLinkOpen} onOpenChange={setIsLinkOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                setLinkUrl(previousUrl || '');
              }}
              className={cn(
                "p-1.5 sm:p-2 rounded-lg transition-all flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500",
                editor.isActive('link') ? "bg-amber-500/20 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <LinkIcon size={16} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="z-50 w-64 p-3 bg-[#0a0c14] border border-white/10 rounded-xl shadow-2xl" sideOffset={5}>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-white/70">Insert Link</p>
                <div className="flex gap-2">
                  <Input 
                    value={linkUrl} 
                    onChange={e => setLinkUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="h-8 text-sm bg-white/5 border-white/10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setLink();
                      }
                    }}
                  />
                  <Button size="icon" className="h-8 w-8 shrink-0 bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]" onClick={setLink}>
                    <Check size={14} />
                  </Button>
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <ToolbarBtn title="Unlink" onClick={() => editor.chain().focus().unsetLink().run()} active={false}><Unlink size={16} /></ToolbarBtn>
        <ToolbarBtn title="Image" onClick={addImage} active={editor.isActive('image')}><ImageIcon size={16} /></ToolbarBtn>
        <ToolbarBtn title="YouTube" onClick={addYoutube} active={editor.isActive('youtube')}><YoutubeIcon size={16} /></ToolbarBtn>
      </div>

      <Divider />

      {/* Tables */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className={cn(
              "p-1.5 sm:p-2 rounded-lg transition-all flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500",
              editor.isActive('table') ? "bg-amber-500/20 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}>
              <TableIcon size={16} />
              <ChevronDown size={12} className="opacity-50 ml-1" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="z-50 p-2 bg-[#0a0c14] border border-white/10 rounded-xl shadow-2xl flex flex-col gap-1 w-40" sideOffset={5}>
              <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="w-full px-3 py-2 text-xs text-left text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"><TableIcon size={14} /> Insert Table (3x3)</button>
              {editor.isActive('table') && (
                <>
                  <div className="h-px bg-white/10 my-1" />
                  <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="w-full px-3 py-1.5 text-xs text-left text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">Add Column Before</button>
                  <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="w-full px-3 py-1.5 text-xs text-left text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">Add Column After</button>
                  <button onClick={() => editor.chain().focus().deleteColumn().run()} className="w-full px-3 py-1.5 text-xs text-left text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors flex justify-between items-center">Delete Column <Trash2 size={12}/></button>
                  <div className="h-px bg-white/10 my-1" />
                  <button onClick={() => editor.chain().focus().addRowBefore().run()} className="w-full px-3 py-1.5 text-xs text-left text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">Add Row Before</button>
                  <button onClick={() => editor.chain().focus().addRowAfter().run()} className="w-full px-3 py-1.5 text-xs text-left text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">Add Row After</button>
                  <button onClick={() => editor.chain().focus().deleteRow().run()} className="w-full px-3 py-1.5 text-xs text-left text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors flex justify-between items-center">Delete Row <Trash2 size={12}/></button>
                  <div className="h-px bg-white/10 my-1" />
                  <button onClick={() => editor.chain().focus().deleteTable().run()} className="w-full px-3 py-1.5 text-xs text-left font-bold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors flex justify-between items-center">Delete Table <Trash2 size={12}/></button>
                </>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

    </div>
  );
};

export default function RichTextEditor({ value, onChange, players = [] }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({ multicolor: false }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-amber-500 hover:underline cursor-pointer',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-bold tracking-tight shadow-[0_0_10px_rgba(52,211,153,0.1)]',
        },
        suggestion: getMentionSuggestionConfig(players),
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'max-w-none focus:outline-none min-h-[300px] p-6 text-sm text-white leading-relaxed font-sans' +
               ' [&_p]:mb-4 last:[&_p]:mb-0' +
               ' [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:text-white/90' +
               ' [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:text-white/90' +
               ' [&_li]:mb-1.5' +
               ' [&_strong]:font-black [&_strong]:text-white' +
               ' [&_h1]:text-3xl sm:[&_h1]:text-4xl [&_h1]:font-black [&_h1]:mb-6 [&_h1]:tracking-tight [&_h1]:text-white' +
               ' [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-extrabold [&_h2]:mb-4 [&_h2]:tracking-tight [&_h2]:text-white/95' +
               ' [&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mb-3 [&_h3]:text-white/90' +
               ' [&_a]:text-amber-400 [&_a]:hover:text-amber-300 [&_a]:transition-colors' +
               ' [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-6 [&_blockquote]:bg-white/[0.02] [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-white/80' +
               ' [&_hr]:border-t-2 [&_hr]:border-white/[0.08] [&_hr]:my-8' +
               ' [&_img]:rounded-xl [&_img]:shadow-2xl [&_img]:border [&_img]:border-white/10 [&_img]:my-6 [&_img]:max-w-full' +
               ' [&_iframe]:rounded-xl [&_iframe]:shadow-2xl [&_iframe]:border [&_iframe]:border-white/10 [&_iframe]:my-6 [&_iframe]:w-full [&_iframe]:aspect-video' +
               ' [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:shadow-2xl' +
               ' [&_th]:border [&_th]:border-white/10 [&_th]:bg-white/[0.05] [&_th]:p-3 [&_th]:font-bold [&_th]:text-left [&_th]:text-white/80 [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-xs' +
               ' [&_td]:border [&_td]:border-white/10 [&_td]:p-3 [&_td]:bg-[#0a0c14]/50 [&_td]:text-white/90' +
               ' [&_mark]:bg-amber-500/20 [&_mark]:text-amber-400 [&_mark]:px-1 [&_mark]:rounded-md',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="relative border border-white/[0.08] rounded-xl overflow-hidden bg-[#0a0c14]/80 backdrop-blur-md flex flex-col focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500/50 transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      {/* Decorative gradient background for the editor container */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] via-transparent to-emerald-500/[0.02] pointer-events-none" />
      
      <MenuBar editor={editor} />
      
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100, animation: 'scale-subtle' }}>
          <div className="flex items-center gap-1 p-1.5 bg-[#0a0c14] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl">
            <ToolbarBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold size={14} /></ToolbarBtn>
            <ToolbarBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic size={14} /></ToolbarBtn>
            <ToolbarBtn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Strikethrough size={14} /></ToolbarBtn>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <ToolbarBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 size={14} /></ToolbarBtn>
            <ToolbarBtn title="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}><Highlighter size={14} /></ToolbarBtn>
          </div>
        </BubbleMenu>
      )}

      <div className="relative z-10 w-full">
        <EditorContent editor={editor} className="w-full cursor-text" />
      </div>
    </div>
  );
}
