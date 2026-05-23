import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  recommendedTools?: RecommendedTool[];
}

interface RecommendedTool {
  name: string;
  slug: string;
  description: string;
  url: string;
}

interface ChatbotProps {
  locale?: "zh" | "en";
  toolsCount?: number;
  policiesCount?: number;
  paymentSolutionsCount?: number;
  promptsCount?: number;
}

const STORAGE_KEY = "ai-student-chatbot-messages";

const translations = {
  zh: {
    title: "AI助手",
    placeholder: "问我任何关于AI工具的问题...",
    welcome:
      "你好！我是AI助手，可以帮你找到合适的AI工具、了解支付方案、查询大学政策等。有什么可以帮你的？",
    suggestions: [
      "推荐一个写作AI工具",
      "哪个学校允许用ChatGPT？",
      "没有信用卡怎么订阅ChatGPT？",
    ],
    send: "发送",
    thinking: "思考中...",
    newChat: "新对话",
    chatHistory: "历史对话",
    clearHistory: "清空历史",
    recommendedTools: "推荐工具",
  },
  en: {
    title: "AI Assistant",
    placeholder: "Ask me anything about AI tools...",
    welcome:
      "Hello! I'm your AI assistant. I can help you find the right AI tools, understand payment solutions, and check university policies. How can I help you?",
    suggestions: [
      "Recommend a writing AI tool",
      "Which universities allow ChatGPT?",
      "How to subscribe to ChatGPT without credit card?",
    ],
    send: "Send",
    thinking: "Thinking...",
    newChat: "New Chat",
    chatHistory: "Chat History",
    clearHistory: "Clear History",
    recommendedTools: "Recommended Tools",
  },
};

// Contextual suggestions based on conversation state
const contextualSuggestions = {
  zh: {
    initial: [
      "推荐一个写作AI工具",
      "哪个学校允许用ChatGPT？",
      "没有信用卡怎么订阅ChatGPT？",
    ],
    afterToolRecommendation: ["这个工具贵吗？", "有免费版吗？", "怎么订阅？"],
    afterPolicyQuestion: ["其他学校呢？", "国内大学允许用吗？", "查询我的学校"],
    afterPaymentQuestion: ["虚拟卡安全吗？", "哪个最便宜？", "需要KYC吗？"],
  },
  en: {
    initial: [
      "Recommend a writing AI tool",
      "Which universities allow ChatGPT?",
      "How to subscribe to ChatGPT without credit card?",
    ],
    afterToolRecommendation: [
      "Is it expensive?",
      "Is there a free version?",
      "How to subscribe?",
    ],
    afterPolicyQuestion: [
      "What about other schools?",
      "Do Chinese universities allow it?",
      "Check my school",
    ],
    afterPaymentQuestion: [
      "Is virtual card safe?",
      "Which is cheapest?",
      "Need KYC?",
    ],
  },
};

// Detect conversation context from messages
function detectContext(messages: Message[], locale: "zh" | "en"): string {
  if (messages.length <= 1) return "initial";

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  if (!lastAssistantMessage) return "initial";

  const content = lastAssistantMessage.content.toLowerCase();

  if (locale === "zh") {
    if (content.includes("推荐") || content.includes("工具"))
      return "afterToolRecommendation";
    if (
      content.includes("学校") ||
      content.includes("大学") ||
      content.includes("政策")
    )
      return "afterPolicyQuestion";
    if (
      content.includes("支付") ||
      content.includes("信用卡") ||
      content.includes("订阅") ||
      content.includes("虚拟卡")
    )
      return "afterPaymentQuestion";
  } else {
    if (content.includes("recommend") || content.includes("tool"))
      return "afterToolRecommendation";
    if (
      content.includes("school") ||
      content.includes("university") ||
      content.includes("policy")
    )
      return "afterPolicyQuestion";
    if (
      content.includes("pay") ||
      content.includes("credit card") ||
      content.includes("subscribe") ||
      content.includes("virtual card")
    )
      return "afterPaymentQuestion";
  }

  return "initial";
}

export default function Chatbot({
  locale = "zh",
  toolsCount = 35,
  policiesCount = 44,
  paymentSolutionsCount = 6,
  promptsCount = 20,
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayedContent, setDisplayedContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[locale];
  const suggestions = contextualSuggestions[locale];

  const siteContext = `
网站包含：
- ${toolsCount} 个AI工具（写作、编程、设计、研究、通讯等分类）
- ${paymentSolutionsCount} 个支付解决方案（虚拟卡、礼品卡、地区定价、故障排除）
- ${policiesCount} 所大学的AI使用政策（美国、英国、加拿大、澳大利亚、新加坡、香港、日本、韩国、中国、德国、荷兰等）
- ${promptsCount} 个提示词模板（学术、邮件、编程、研究、日常等分类）

主要AI工具：ChatGPT、Claude、Midjourney、GitHub Copilot、Notion AI、Perplexity、Jasper、Grammarly、QuillBot、Tabnine、Cursor、Figma、DALL-E 3、文心一言、通义千问、讯飞星火、智谱清言、豆包等。

用户问题类型示例：
- "推荐一个编程工具" -> 推荐 GitHub Copilot、Cursor、Tabnine 等
- "哪个学校允许用ChatGPT" -> 列出允许使用ChatGPT的学校如 Harvard、Stanford、MIT 等
- "没有信用卡怎么订阅ChatGPT" -> 推荐 Depay、WildCard 等虚拟卡方案
`;

  // Load messages from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Convert stored timestamps back to Date objects
          const loadedMessages = parsed.map(
            (msg: Message & { timestamp: string }) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }),
          );
          setMessages(loadedMessages);
        } catch (e) {
          console.warn("Failed to load chat history:", e);
        }
      }
    }
  }, [isOpen]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Only store last 50 messages to avoid localStorage limits
        const messagesToStore = messages.slice(-50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToStore));
      } catch (e) {
        console.warn("Failed to save chat history:", e);
      }
    }
  }, [messages]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: t.welcome,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, t.welcome]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedContent]);

  // Cleanup streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  // Typewriter effect for streaming responses
  const streamContent = useCallback((fullContent: string) => {
    setIsStreaming(true);
    setDisplayedContent("");

    let index = 0;
    const charsPerInterval = 3; // Characters per interval for typing effect
    const intervalMs = 15; // Interval in ms

    streamingIntervalRef.current = setInterval(() => {
      if (index < fullContent.length) {
        setDisplayedContent(fullContent.slice(0, index + charsPerInterval));
        index += charsPerInterval;
      } else {
        setDisplayedContent(fullContent);
        if (streamingIntervalRef.current) {
          clearInterval(streamingIntervalRef.current);
          streamingIntervalRef.current = null;
        }
        setIsStreaming(false);
      }
    }, intervalMs);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setDisplayedContent("");

    // Build conversation history for context
    const conversationHistory = newMessages
      .slice(-10) // Last 10 messages for context
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          context: siteContext,
          locale,
          conversationHistory,
        }),
      });

      const data = await response.json();

      if (data.success && data.message) {
        // Start streaming effect
        streamContent(data.message);

        // Create the assistant message with recommended tools
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
          recommendedTools: data.recommendedTools || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error?.message || "Failed to get response");
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          locale === "zh"
            ? "抱歉，我现在无法回答。请稍后再试。"
            : "Sorry, I cannot answer right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const startNewChat = () => {
    clearHistory();
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: t.welcome,
        timestamp: new Date(),
      },
    ]);
  };

  // Get current suggestions based on conversation context
  const currentContext = detectContext(messages, locale);
  const currentSuggestions =
    suggestions[currentContext as keyof typeof suggestions] ||
    suggestions.initial;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 ${
          isOpen ? "rotate-45" : ""
        }`}
        aria-label={
          isOpen
            ? locale === "zh"
              ? "关闭聊天"
              : "Close Chat"
            : locale === "zh"
              ? "展开聊天"
              : "Expand Chat"
        }
      >
        <span className="text-white text-sm font-medium">
          {isOpen
            ? locale === "zh"
              ? "关闭"
              : "Close"
            : locale === "zh"
              ? "展开"
              : "Expand"}
        </span>
        {isOpen ? (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[560px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">{t.title}</h3>
                <p className="text-white/80 text-xs">
                  {locale === "zh" ? "在线" : "Online"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={startNewChat}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                title={t.newChat}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button
                onClick={clearHistory}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                title={t.clearHistory}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg, index) => {
              // For the last assistant message, show streaming content if streaming
              const isLastAssistant =
                msg.role === "assistant" && index === messages.length - 1;
              const showStreaming = isLastAssistant && isStreaming;

              return (
                <ChatMessage
                  key={msg.id}
                  message={{
                    ...msg,
                    content: showStreaming ? displayedContent : msg.content,
                  }}
                  locale={locale}
                />
              );
            })}
            {isLoading && !isStreaming && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{t.thinking}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Suggestions - show after first message and when not loading */}
          {messages.length > 1 && !isLoading && !isStreaming && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">
                {locale === "zh" ? "继续问：" : "Continue asking:"}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentSuggestions.slice(0, 3).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(s)}
                    className="text-xs bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full transition-colors border border-primary-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Initial Suggestions - show only on first message */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">
                {locale === "zh" ? "试试这样问：" : "Try asking:"}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(s)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.placeholder}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label={t.send}
                className="w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
