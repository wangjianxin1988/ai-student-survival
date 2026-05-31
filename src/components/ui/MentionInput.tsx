import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '@/lib/auth';

interface UserResult {
  id: string;
  name: string;
  avatar: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export function MentionInput({
  value,
  onChange,
  placeholder = '写下你的评论...',
  rows = 3,
  className = '',
  disabled = false,
}: MentionInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartPos, setMentionStartPos] = useState(-1);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 搜索用户
  const searchUsers = useCallback(async (query: string) => {
    if (!query) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
        setShowDropdown(data.data.length > 0);
        setSelectedIndex(0);
      }
    } catch {
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理文本变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    onChange(newValue);

    // 检查光标前是否有 @ 符号
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // @ 前面必须是空格、换行或文本开头
      const charBeforeAt = lastAtIndex > 0 ? newValue[lastAtIndex - 1] : ' ';
      if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        // @ 后面不能有空格（用户还在输入用户名）
        if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n') && textAfterAt.length <= 20) {
          setMentionQuery(textAfterAt);
          setMentionStartPos(lastAtIndex);

          // 防抖搜索
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            searchUsers(textAfterAt);
          }, 300);
          return;
        }
      }
    }

    // 没有有效的 @ 提及
    setShowDropdown(false);
    setMentionQuery('');
    setMentionStartPos(-1);
  };

  // 选择用户
  const selectUser = (user: UserResult) => {
    if (mentionStartPos === -1) return;

    const beforeMention = value.substring(0, mentionStartPos);
    const afterMention = value.substring(
      (textareaRef.current?.selectionStart || mentionStartPos + mentionQuery.length + 1)
    );
    const newValue = `${beforeMention}@${user.name} ${afterMention}`;
    onChange(newValue);

    setShowDropdown(false);
    setMentionQuery('');
    setMentionStartPos(-1);

    // 聚焦 textarea 并设置光标位置
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStartPos + user.name.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        break;
      case 'Enter':
      case 'Tab':
        if (showDropdown && searchResults.length > 0) {
          e.preventDefault();
          selectUser(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        break;
    }
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={className}
      />

      {/* 用户搜索下拉框 */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full left-0 mb-1 w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
        >
          {loading ? (
            <div className="p-3 text-center text-sm text-gray-500">
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
              搜索中...
            </div>
          ) : (
            searchResults.map((user, index) => (
              <button
                key={user.id}
                type="button"
                onClick={() => selectUser(user)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-500">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium truncate">{user.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
