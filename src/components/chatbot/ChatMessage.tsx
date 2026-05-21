import React from "react";

interface RecommendedTool {
  name: string;
  slug: string;
  description: string;
  url: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  recommendedTools?: RecommendedTool[];
}

interface ChatMessageProps {
  message: Message;
  locale?: "zh" | "en";
}

export function ChatMessage({ message, locale = "zh" }: ChatMessageProps) {
  const isUser = message.role === "user";
  const hasRecommendedTools =
    message.recommendedTools && message.recommendedTools.length > 0;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary-500 text-white rounded-br-md"
            : "bg-gray-100 text-gray-800 rounded-bl-md"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>

        {/* Recommended Tools */}
        {hasRecommendedTools && !isUser && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              {locale === "zh" ? "推荐工具" : "Recommended Tools"}
            </p>
            <div className="flex flex-wrap gap-2">
              {message.recommendedTools!.map((tool) => (
                <a
                  key={tool.slug}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors border border-gray-200 hover:border-primary-300 shadow-sm"
                >
                  <svg
                    className="w-3.5 h-3.5 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {tool.name}
                </a>
              ))}
            </div>
          </div>
        )}

        <div
          className={`text-xs mt-1 ${
            isUser ? "text-primary-100" : "text-gray-400"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
