import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Quote, 
  RemoveFormatting 
} from 'lucide-react';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Write notes here...', 
  label, 
  error, 
  minHeight = '200px',
  readOnly = false 
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, disabled, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors text-sm font-medium ${
        isActive 
          ? 'bg-[#e2e8f0] text-[#1a2d5a]' 
          : 'text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#1e293b]'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col space-y-1">
      <style>{`
        .ProseMirror { 
          outline: none; 
          min-height: inherit; 
        }
        .ProseMirror p { 
          margin: 0 0 0.5rem 0; 
        }
        .ProseMirror ul { 
          list-style-type: disc; 
          padding-left: 1.5rem; 
          margin: 0.5rem 0; 
        }
        .ProseMirror ol { 
          list-style-type: decimal; 
          padding-left: 1.5rem; 
          margin: 0.5rem 0; 
        }
        .ProseMirror blockquote { 
          border-left: 3px solid #e2e8f0; 
          padding-left: 1rem; 
          color: #64748b; 
          margin: 0.5rem 0; 
        }
        .ProseMirror strong { 
          font-weight: 600; 
        }
        .ProseMirror em { 
          font-style: italic; 
        }
        .ProseMirror s { 
          text-decoration: line-through; 
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
        }
      `}</style>

      {label && (
        <label className="text-sm font-medium text-[#1e293b] mb-1">
          {label}
        </label>
      )}

      <div className={`border border-[#e2e8f0] rounded-md overflow-hidden bg-white focus-within:border-[#2c4a8e] transition-colors ${error ? 'border-red-500' : ''}`}>
        {!readOnly && (
          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex-wrap">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-5 bg-[#e2e8f0] mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-5 bg-[#e2e8f0] mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-5 bg-[#e2e8f0] mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              title="Clear Formatting"
            >
              <RemoveFormatting className="w-4 h-4" />
            </ToolbarButton>
          </div>
        )}

        <div 
          className="px-3 py-2 cursor-text overflow-y-auto"
          style={{ minHeight }}
          onClick={() => editor.chain().focus().run()}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && (
        <span className="text-xs text-red-500 mt-1">
          {error}
        </span>
      )}
    </div>
  );
};

export { RichTextEditor };
