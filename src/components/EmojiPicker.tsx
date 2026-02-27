"use client";

import { useState, useRef, useEffect } from "react";
import { X, Search, Clock } from "lucide-react";

const CATEGORIES = [
  {
    id: "recent",
    label: "Recent",
    icon: "🕐",
    emojis: [] as string[], // populated from localStorage
  },
  {
    id: "smileys",
    label: "Smileys",
    icon: "😊",
    emojis: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃",
      "😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙",
      "🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🫢",
      "🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏",
      "😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷",
      "🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🤠",
      "🥳","🥸","😎","🤓","🧐","😕","🫤","😟","🙁","😮",
      "😯","😲","😳","🥺","🥹","😦","😧","😨","😰","😥",
      "😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱",
      "😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡",
      "👹","👺","👻","👽","👾","🤖","😺","😸","😹","😻",
      "😼","😽","🙀","😿","😾",
    ],
  },
  {
    id: "people",
    label: "People",
    icon: "👋",
    emojis: [
      "👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌",
      "🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉",
      "👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛",
      "🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","✍️","💅",
      "🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🧠",
      "🫀","🫁","🦷","🦴","👀","👁️","👅","👄","🫦","👶",
      "🧒","👦","👧","🧑","👱","👨","🧔","👩","🧓","👴",
      "👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇","🤦",
      "🤷","💆","💇","🚶","🧎","🏃","💃","🕺","🧖","🧗",
    ],
  },
  {
    id: "nature",
    label: "Nature",
    icon: "🌿",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨",
      "🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐒",
      "🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗",
      "🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪰",
      "🌸","💮","🏵️","🌹","🥀","🌺","🌻","🌼","🌷","🌱",
      "🪴","🌲","🌳","🌴","🌵","🌾","🌿","☘️","🍀","🍁",
      "🍂","🍃","🪹","🪺","🍄","🌍","🌎","🌏","🌕","🌙",
      "⭐","🌟","✨","⚡","🔥","🌈","☀️","🌤️","⛅","🌧️",
      "❄️","💧","🌊","🌪️","🌫️",
    ],
  },
  {
    id: "food",
    label: "Food",
    icon: "🍔",
    emojis: [
      "🍇","🍈","🍉","🍊","🍋","🍌","🍍","🥭","🍎","🍏",
      "🍐","🍑","🍒","🍓","🫐","🥝","🍅","🫒","🥥","🥑",
      "🍆","🥔","🥕","🌽","🌶️","🫑","🥒","🥬","🥦","🧄",
      "🧅","🥜","🫘","🌰","🍞","🥐","🥖","🫓","🥨","🥯",
      "🥞","🧇","🧀","🍖","🍗","🥩","🥓","🍔","🍟","🍕",
      "🌭","🥪","🌮","🌯","🫔","🥙","🧆","🥚","🍳","🥘",
      "🍲","🫕","🥣","🥗","🍿","🧈","🍱","🍘","🍙","🍚",
      "🍛","🍜","🍝","🍠","🍢","🍣","🍤","🍥","🥮","🍡",
      "🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍩","🍪","🍦",
      "☕","🍵","🧋","🥛","🍺","🍻","🥂","🍷","🍸","🍹",
    ],
  },
  {
    id: "activities",
    label: "Activities",
    icon: "⚽",
    emojis: [
      "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱",
      "🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳",
      "🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷",
      "⛸️","🥌","🎿","⛷️","🏂","🪂","🏋️","🤼","🤸","⛹️",
      "🤺","🏇","🧘","🏄","🏊","🤽","🚣","🧗","🚴","🏆",
      "🥇","🥈","🥉","🏅","🎖️","🎗️","🎪","🤹","🎭","🎨",
      "🎬","🎤","🎧","🎼","🎹","🥁","🪘","🎷","🎺","🎸",
      "🪕","🎻","🎲","♟️","🎯","🎳","🎮","🕹️","🧩","🪅",
    ],
  },
  {
    id: "travel",
    label: "Travel",
    icon: "✈️",
    emojis: [
      "🚗","🚕","🚌","🏎️","🚓","🚑","🚒","🚐","🛻","🚚",
      "🚂","🚆","🚇","🚈","🚝","🚄","✈️","🛩️","🚀","🛸",
      "🚁","⛵","🚤","🛳️","⛴️","🛥️","🏠","🏡","🏢","🏣",
      "🏥","🏦","🏨","🏩","🏪","🏫","🏬","🏭","🏯","🏰",
      "💒","🗼","🗽","⛪","🕌","🛕","🕍","⛩️","🕋","⛲",
      "⛺","🌁","🌃","🏙️","🌄","🌅","🌆","🌇","🌉","🗺️",
      "🧳","🎡","🎢","🎠","⛱️","🏖️","🏝️","🏜️","🌋","🗻",
    ],
  },
  {
    id: "objects",
    label: "Objects",
    icon: "💡",
    emojis: [
      "⌚","📱","💻","⌨️","🖥️","🖨️","🖱️","🖲️","🕹️","💾",
      "📀","📷","📹","🎥","📞","☎️","📺","📻","🎙️","🎚️",
      "⏰","🕰️","⌛","⏳","📡","🔋","🔌","💡","🔦","🕯️",
      "📔","📕","📖","📗","📘","📙","📚","📓","📒","📃",
      "📜","📄","📰","🗞️","📑","🔖","🏷️","✉️","📧","📩",
      "📦","📫","📪","📬","📭","📮","🗳️","✏️","✒️","🖋️",
      "🖊️","🖌️","🖍️","📝","💼","📁","📂","🗂️","📅","📆",
      "🔒","🔓","🔑","🗝️","🔨","🪓","⛏️","🪚","🔧","🔩",
      "💎","💰","💵","💸","🎁","🎀","🎈","🎊","🎉","🧸",
    ],
  },
  {
    id: "hearts",
    label: "Hearts",
    icon: "❤️",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
      "❤️‍🔥","❤️‍🩹","❣️","💕","💞","💓","💗","💖","💘","💝",
      "💟","♥️","🫶","💑","💏","👩‍❤️‍👨","👨‍❤️‍👨","👩‍❤️‍👩","💐","🌹",
      "🥀","💌","💋","👄",
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    icon: "✅",
    emojis: [
      "✅","❌","❓","❗","‼️","⁉️","💯","🔴","🟠","🟡",
      "🟢","🔵","🟣","⚫","⚪","🟤","🔺","🔻","🔸","🔹",
      "🔶","🔷","♾️","💠","🔘","🏁","🚩","🎌","🏴","🏳️",
      "🏳️‍🌈","🏳️‍⚧️","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎",
      "☯️","☦️","🛐","⛎","♈","♉","♊","♋","♌","♍",
      "♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️",
      "☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚",
      "🉐","㊙️","㊗️","🈴","🈵","🈹","🈲","🅰️","🅱️","🆎",
      "🆑","🅾️","🆘","⛔","📛","🚫","💢","♨️","🚷","🚯",
      "🚳","🚱","🔞","📵","🔇","🔕","🚭","❎","✳️","❇️",
    ],
  },
];

// Map face emojis back to mood names for the database
const emojiToMood: Record<string, string> = {
  "😀": "happy", "😃": "happy", "😄": "happy", "😁": "happy", "😆": "happy",
  "😊": "happy", "🙂": "happy", "😇": "happy",
  "🥰": "loved", "😍": "loved", "😘": "loved",
  "🤩": "excited", "🥳": "excited",
  "😌": "peaceful", "😴": "tired", "😪": "tired",
  "🙏": "grateful",
  "💪": "productive",
  "🎨": "creative",
  "😐": "neutral", "😑": "neutral", "😶": "neutral",
  "🤔": "reflective", "🧐": "reflective",
  "😢": "sad", "😭": "sad", "😥": "sad", "🥺": "sad", "😞": "sad",
  "😰": "anxious", "😨": "anxious", "😧": "anxious",
  "😫": "stressed", "😩": "stressed", "😓": "stressed", "😣": "stressed",
  "😤": "angry", "😡": "angry", "😠": "angry",
  "😎": "happy", "🤗": "happy",
  "😏": "reflective", "🫣": "anxious",
  "🌟": "hopeful", "✨": "hopeful",
  "🥱": "tired",
  "😷": "neutral", "🤒": "tired", "🤕": "tired",
  "😋": "happy", "😛": "happy", "😜": "happy",
};

const RECENT_KEY = "lifelog-recent-emojis";
const MAX_RECENT = 24;

function getRecentEmojis(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentEmoji(emoji: string) {
  const recent = getRecentEmojis().filter((e) => e !== emoji);
  recent.unshift(emoji);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState("smileys");
  const [search, setSearch] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentEmojis(getRecentEmojis());
  }, []);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleSelect = (emoji: string) => {
    saveRecentEmoji(emoji);
    setRecentEmojis(getRecentEmojis());
    onSelect(emoji);
  };

  // Filter emojis by search
  const allEmojis = CATEGORIES.flatMap((c) => c.id === "recent" ? [] : c.emojis);
  const filtered = search
    ? allEmojis.filter((e) => e.includes(search))
    : null;

  const categories = CATEGORIES.map((c) =>
    c.id === "recent" ? { ...c, emojis: recentEmojis } : c
  );

  const activeEmojis = filtered || categories.find((c) => c.id === activeCategory)?.emojis || [];

  return (
    <div
      ref={pickerRef}
      className="bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl w-[320px] sm:w-[360px] overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="relative flex-1 mr-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emojis..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
          />
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Category Tabs */}
      {!search && (
        <div className="flex px-2 pb-1 gap-0.5 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 p-1.5 rounded-lg text-base transition-colors ${
                activeCategory === cat.id
                  ? "bg-brand/10"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={cat.label}
            >
              {cat.id === "recent" ? (
                <Clock className={`w-4 h-4 ${activeCategory === "recent" ? "text-brand" : "text-gray-400"}`} />
              ) : (
                <span className="text-sm">{cat.icon}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="px-2 pb-2 h-[240px] overflow-y-auto">
        {!search && activeCategory === "recent" && recentEmojis.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Clock className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs">No recent emojis</p>
          </div>
        ) : activeEmojis.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-xs">No emojis found</p>
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-0.5">
            {activeEmojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => handleSelect(emoji)}
                className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Returns a mood name for a given emoji. Falls back to the emoji itself. */
export function getMoodFromEmoji(emoji: string): string {
  return emojiToMood[emoji] || emoji;
}

/** Returns the emoji for a given mood name. Falls back to the mood string itself if it's already an emoji. */
export function getEmojiForMood(mood: string): string {
  // If mood is already an emoji (starts with a non-ASCII char), return it
  if (mood && mood.charCodeAt(0) > 127) return mood;
  const moodMap: Record<string, string> = {
    happy: "😊", joyful: "😊", excited: "🤩", peaceful: "😌", calm: "😌",
    grateful: "🙏", loved: "🥰", productive: "💪", creative: "🎨",
    sad: "😢", anxious: "😰", stressed: "😫", angry: "😤",
    tired: "😴", neutral: "😐", reflective: "🤔", hopeful: "🌟",
  };
  return moodMap[mood.toLowerCase()] || "😊";
}
