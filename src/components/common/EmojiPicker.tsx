import React, { useState, useRef, useEffect } from "react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  position?: "top" | "bottom";
}

// Common emoji categories
const EMOJI_CATEGORIES = {
  recent: { icon: "🕐", label: "Recent" },
  smileys: { icon: "😀", label: "Smileys" },
  gestures: { icon: "👋", label: "Gestures" },
  hearts: { icon: "❤️", label: "Hearts" },
  objects: { icon: "📱", label: "Objects" },
  symbols: { icon: "✅", label: "Symbols" },
  travel: { icon: "✈️", label: "Travel" },
  food: { icon: "🍜", label: "Food" },
  activities: { icon: "🎮", label: "Activities" },
};

const EMOJIS: Record<keyof typeof EMOJI_CATEGORIES, string[]> = {
  recent: ["👍", "👏", "🙏", "❤️", "😊", "🎉", "🔥", "✨", "💪", "👏"],
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
    "😌",
    "😔",
    "😪",
    "🤤",
    "😴",
    "😷",
    "🤒",
    "🤕",
    "🤢",
    "🤮",
    "🤧",
    "🥵",
    "🥶",
    "🥴",
    "😵",
    "🤯",
    "🤠",
    "🥳",
    "😎",
    "🤓",
    "🧐",
  ],
  gestures: [
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👍",
    "👎",
    "✊",
    "👊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
    "✍️",
    "💅",
    "🤳",
    "💪",
    "🦾",
    "🦿",
    "🦵",
    "🦶",
    "👂",
    "🦻",
    "👃",
    "🧠",
    "🫀",
    "🫁",
    "🦷",
    "🦴",
    "👀",
    "👁️",
    "👅",
    "👄",
  ],
  hearts: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "♥️",
  ],
  objects: [
    "📱",
    "💻",
    "⌨️",
    "🖥️",
    "🖨️",
    "🖱️",
    "🖲️",
    "💽",
    "💾",
    "💿",
    "📀",
    "📼",
    "📷",
    "📸",
    "📹",
    "🎥",
    "📽️",
    "🎞️",
    "📞",
    "☎️",
    "📟",
    "📠",
    "📺",
    "📻",
    "🎙️",
    "🎚️",
    "🎛️",
    "🧭",
    "⏱️",
    "⏲️",
    "⏰",
    "🕰️",
    "⌛",
    "⏳",
    "📡",
    "🔋",
    "🔌",
    "💡",
    "🔦",
    "🕯️",
    "🪔",
    "🧯",
    "🛢️",
    "💸",
    "💵",
    "💴",
    "💶",
    "💷",
    "🪙",
    "💰",
    "💳",
    "💎",
  ],
  symbols: [
    "✅",
    "❌",
    "❓",
    "❗",
    "‼️",
    "⁉️",
    "🚸",
    "⛔",
    "📛",
    "🔞",
    "🔃",
    "🔄",
    "🔙",
    "🔚",
    "🔛",
    "🔝",
    "🆗",
    "🆙",
    "🆕",
    "🆓",
    "🆖",
    "🆔",
    "🅰️",
    "🅱️",
    "🅾️",
    "🅿️",
    "🈂️",
    "🈷️",
    "🈶",
    "🈯",
    "🉐",
    "🈹",
    "🈚",
    "🈲",
    "🈸",
    "🈴",
    "🈳",
    "🈺",
    "🈵",
    "🔴",
    "🟠",
    "🟡",
    "🟢",
    "🔵",
    "🟣",
    "⚫",
    "⚪",
    "🟤",
    "🔺",
    "🔻",
    "🔸",
    "🔹",
  ],
  travel: [
    "✈️",
    "🛫",
    "🛬",
    "🛩️",
    "🛤",
    "🛣",
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🛻",
    "🚚",
    "🚛",
    "🚜",
    "🏍️",
    "🛵",
    "🚲",
    "🛴",
    "🛺",
    "🚨",
    "🚔",
    "🚍",
    "🚘",
    "🚖",
    "🚡",
    "🚠",
    "🚟",
    "🚃",
    "🚋",
    "🚞",
    "🚝",
    "🚄",
    "🚅",
    "🚈",
    "🚂",
    "🚆",
    "🚇",
    "🚊",
    "🚉",
    "🛫",
    "🛬",
    "🛩️",
    "�abu",
    "🛫",
    "🏨",
    "🛎️",
    "🧳",
  ],
  food: [
    "🍜",
    "🍝",
    "🍕",
    "🍔",
    "🍟",
    "🌭",
    "🍿",
    "🍱",
    "🍘",
    "🍙",
    "🍚",
    "🍛",
    "🍜",
    "🍝",
    "🍞",
    "🍞",
    "🥖",
    "🥨",
    "🧀",
    "🥚",
    "🍳",
    "🧈",
    "🥞",
    "🧇",
    "🥓",
    "🥩",
    "🍗",
    "🍖",
    "🌮",
    "🌯",
    "🫔",
    "🥙",
    "🧆",
    "🥘",
    "🥣",
    "🍲",
    "🫕",
    "🍥",
    "🍣",
    "🍱",
    "🍤",
    "🍙",
    "🍚",
    "🍘",
    "🍢",
    "🍡",
    "🍧",
    "🍨",
    "🍦",
    "🥧",
    "🧁",
    "🍰",
    "🎂",
    "🍮",
    "🍭",
    "🍬",
    "🍫",
    "🍿",
    "🍩",
    "🍪",
  ],
  activities: [
    "🎮",
    "🕹️",
    "🎯",
    "🎳",
    "🎰",
    "🎲",
    "♟️",
    "🎭",
    "🎨",
    "🎬",
    "🎤",
    "🎧",
    "🎼",
    "🎹",
    "🥁",
    "🎷",
    "🎺",
    "🎸",
    "🪕",
    "🎻",
    "🎬",
    "🎤",
    "🎧",
    "🎼",
    "🎹",
    "🥁",
    "🎷",
    "🎺",
    "🎸",
    "🪕",
    "🎻",
    "🏆",
    "🥇",
    "🥈",
    "🥉",
    "🏅",
    "🎖️",
    "🎗️",
    "🎫",
    "🎟️",
    "🎪",
    "🤹",
    "🎭",
    "🩰",
    "🎡",
    "🎠",
    "🎢",
    "🎡",
    "🏄",
    "🏊",
    "🤽",
    "🏋️",
    "🚴",
    "🚵",
    "🎽",
    "🎿",
    "🛷",
    "🏂",
    "🪂",
  ],
};

export default function EmojiPicker({
  onEmojiSelect,
  position = "bottom",
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<keyof typeof EMOJI_CATEGORIES>("smileys");
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Insert emoji"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Emoji picker dropdown */}
      {isOpen && (
        <div
          className={`absolute z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-3 ${
            position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{ width: "320px" }}
        >
          {/* Category tabs */}
          <div className="flex flex-wrap gap-1 mb-3 pb-2 border-b border-gray-100">
            {(
              Object.keys(EMOJI_CATEGORIES) as Array<
                keyof typeof EMOJI_CATEGORIES
              >
            ).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`p-1.5 rounded-lg transition-colors ${
                  activeCategory === category
                    ? "bg-primary-100 text-primary-600"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
                title={EMOJI_CATEGORIES[category].label}
              >
                <span className="text-lg">
                  {EMOJI_CATEGORIES[category].icon}
                </span>
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
            {EMOJIS[activeCategory].map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={() => handleEmojiClick(emoji)}
                className="p-1.5 text-xl hover:bg-gray-100 rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
