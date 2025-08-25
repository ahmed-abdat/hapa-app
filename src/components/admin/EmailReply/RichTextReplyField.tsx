'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Underline, List, ListOrdered, Link2, Undo, Redo } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextReplyFieldProps {
  value: string
  onChange: (content: string, richText?: any) => void
  locale?: string
  placeholder?: string
  className?: string
}

export const RichTextReplyField: React.FC<RichTextReplyFieldProps> = ({
  value,
  onChange,
  locale = 'fr',
  placeholder = 'Type your message...',
  className,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isRTL = locale === 'ar'

  // For now, we'll use a enhanced textarea with formatting buttons
  // In a production implementation, we'd use Lexical or another rich text editor
  const handleFormat = useCallback((format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let formattedText = ''
    let newCursorPos = start

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        newCursorPos = start + 2
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        newCursorPos = start + 1
        break
      case 'underline':
        formattedText = `__${selectedText}__`
        newCursorPos = start + 2
        break
      case 'list':
        formattedText = selectedText
          ? `\n- ${selectedText.split('\n').join('\n- ')}\n`
          : '\n- '
        newCursorPos = start + 3
        break
      case 'ordered-list':
        formattedText = selectedText
          ? `\n1. ${selectedText.split('\n').join('\n2. ')}\n`
          : '\n1. '
        newCursorPos = start + 4
        break
      case 'link':
        const url = prompt('Enter URL:')
        if (url) {
          formattedText = `[${selectedText || 'link text'}](${url})`
          newCursorPos = selectedText ? start + formattedText.length : start + 1
        } else {
          return
        }
        break
      default:
        return
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end)
    onChange(newValue)

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Add keyboard shortcuts for formatting
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          handleFormat('bold')
          break
        case 'i':
          e.preventDefault()
          handleFormat('italic')
          break
        case 'u':
          e.preventDefault()
          handleFormat('underline')
          break
        case 'k':
          e.preventDefault()
          handleFormat('link')
          break
      }
    }
  }, [handleFormat])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`
    }
  }, [value])

  return (
    <div className={cn('space-y-2', className)}>
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 p-2 border rounded-t-md bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('bold')}
          title="Bold (Ctrl+B)"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('italic')}
          title="Italic (Ctrl+I)"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('underline')}
          title="Underline (Ctrl+U)"
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('list')}
          title="Bullet List"
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('ordered-list')}
          title="Numbered List"
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('link')}
          title="Insert Link (Ctrl+K)"
          className="h-8 w-8 p-0"
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Area */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'min-h-[200px] resize-none rounded-t-none font-mono text-sm',
          isRTL && 'text-right direction-rtl'
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      />

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Use **text** for bold, *text* for italic, __text__ for underline.
        Press Ctrl+B/I/U/K for shortcuts.
      </p>
    </div>
  )
}