<template>
  <div class="emoji-reaction-container">
    <!-- Reaction Picker (shows on hover) -->
    <div 
      v-if="showPicker"
      class="emoji-picker"
      :class="{ 'emoji-picker-expanded': expandedPicker }"
      @mouseleave="handlePickerMouseLeave"
    >
      <div class="emoji-picker-scroll">
        <button 
          v-for="emoji in allEmojis"
          :key="emoji.id"
          class="emoji-btn"
          :class="{ 'emoji-btn-active': myReactions.has(emoji.id) }"
          :title="emoji.label"
          @click="toggleReaction(emoji.id)"
        >
          {{ emoji.icon }}
        </button>
      </div>
      <button 
        class="emoji-expand-btn"
        :class="{ 'emoji-expand-btn-active': expandedPicker }"
        @click.stop="expandedPicker = !expandedPicker"
      >
        <ChevronDown class="w-4 h-4" />
      </button>
    </div>

    <!-- Reaction Display -->
    <div v-if="hasReactions" class="reactions-display">
      <div 
        v-for="(count, emojiId) in reactionCounts"
        :key="emojiId"
        class="reaction-item"
        :class="{ 'reaction-item-mine': myReactions.has(emojiId) }"
        @click="toggleReaction(emojiId)"
        @mouseenter="showPicker = true"
      >
        <span class="reaction-emoji">{{ getEmojiIcon(emojiId) }}</span>
        <span class="reaction-count-small">{{ count }}</span>
      </div>
    </div>

    <!-- Hover Trigger Area -->
    <button 
      v-if="!hasReactions"
      class="add-reaction-btn"
      @mouseenter="showPicker = true"
      :title="addReactionTooltip"
    >
      <Smile class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Smile, ChevronDown } from 'lucide-vue-next'

interface Emoji {
  id: string
  icon: string
  label: string
}

const emojis: Emoji[] = [
  { id: 'like', icon: '👍', label: '赞' },
  { id: 'love', icon: '❤️', label: '喜欢' },
  { id: 'laugh', icon: '😂', label: '哈哈' },
  { id: 'wow', icon: '😮', label: '哇' },
  { id: 'sad', icon: '😢', label: '难过' },
  { id: 'angry', icon: '😠', label: '生气' }
]

const moreEmojis: Emoji[] = [
  { id: 'fire', icon: '🔥', label: '火' },
  { id: 'star', icon: '⭐', label: '星星' },
  { id: 'thinking', icon: '🤔', label: '思考' },
  { id: 'clap', icon: '👏', label: '鼓掌' },
  { id: 'pray', icon: '🙏', label: '感谢' },
  { id: 'party', icon: '🎉', label: '派对' },
  { id: 'cool', icon: '😎', label: '酷' },
  { id: 'sweat', icon: '😅', label: '冷汗' },
  { id: 'kiss', icon: '😘', label: '亲一下' },
  { id: 'tease', icon: '😜', label: '淘气' },
  { id: 'sweet', icon: '😍', label: '迷恋' },
  { id: 'sick', icon: '🤢', label: '不舒服' }
]

const props = defineProps({
  messageId: {
    type: [String, Number],
    required: true
  }
})

const showPicker = ref(false)
const expandedPicker = ref(false)
const reactionCounts = ref<Record<string, number>>({})
const myReactions = ref<Set<string>>(new Set())

const allEmojis = computed(() => {
  return expandedPicker.value ? [...emojis, ...moreEmojis] : emojis
})

const handlePickerMouseLeave = () => {
  showPicker.value = false
  expandedPicker.value = false
}

const hasReactions = computed(() => Object.keys(reactionCounts.value).length > 0)
const totalReactions = computed(() => {
  return Object.values(reactionCounts.value).reduce((sum, count) => sum + count, 0)
})

const addReactionTooltip = '点击或移入显示表情'
const triggerTooltip = computed(() => {
  const reactions = Object.entries(reactionCounts.value)
    .map(([emojiId, count]) => `${getEmojiIcon(emojiId)} ${count}`)
    .join(' ')
  return reactions
})

const toggleReaction = (emojiId: string) => {
  if (myReactions.value.has(emojiId)) {
    // 取消表态
    myReactions.value.delete(emojiId)
    reactionCounts.value[emojiId]--
    if (reactionCounts.value[emojiId] <= 0) {
      delete reactionCounts.value[emojiId]
    }
  } else {
    // 添加表态
    myReactions.value.add(emojiId)
    if (reactionCounts.value[emojiId]) {
      reactionCounts.value[emojiId]++
    } else {
      reactionCounts.value[emojiId] = 1
    }
  }
  showPicker.value = false
}

const getEmojiIcon = (emojiId: string): string => {
  const emoji = emojis.find(e => e.id === emojiId) || moreEmojis.find(e => e.id === emojiId)
  return emoji ? emoji.icon : ''
}
</script>

<style scoped>
.emoji-reaction-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.emoji-picker-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9;
  background: transparent;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  animation: slideUp 0.2s ease;
  flex-wrap: nowrap;
}

.emoji-picker-expanded {
  flex-wrap: wrap;
  width: 240px;
  max-height: 200px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .emoji-picker {
    position: absolute;
    bottom: 100%;
    left: 0;
    margin-bottom: 8px;
  }
  
  .emoji-picker-expanded {
    width: 280px;
    max-height: 250px;
  }
}

.dark .emoji-picker {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.emoji-picker-scroll {
  display: flex;
  gap: 4px;
  width: auto;
}

.emoji-picker-expanded .emoji-picker-scroll {
  width: 100%;
  flex-wrap: wrap;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.emoji-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .emoji-btn {
  background: #374151;
}

.emoji-btn:hover {
  background: #e5e7eb;
  transform: scale(1.2);
}

.dark .emoji-btn:hover {
  background: #4b5563;
}

.emoji-btn-active {
  background: #bfdbfe;
  color: #0284c7;
}

.dark .emoji-btn-active {
  background: #0e4a8b;
  color: #38bdf8;
}

.emoji-expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.dark .emoji-expand-btn {
  background: #374151;
  color: #d1d5db;
}

.emoji-expand-btn:hover {
  background: #e5e7eb;
}

.dark .emoji-expand-btn:hover {
  background: #4b5563;
}

.emoji-expand-btn-active {
  transform: rotate(180deg);
}

.reactions-display {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.reaction-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #0284c7;
  transition: all 0.2s ease;
}

.dark .reaction-trigger {
  background: #082f49;
  border-color: #0e4a8b;
}

.reaction-trigger:hover {
  background: #bfdbfe;
  color: #0c4a6e;
}

.dark .reaction-trigger:hover {
  background: #0e4a8b;
}

.reaction-icon {
  font-size: 14px;
}

.reaction-count {
  min-width: 14px;
  text-align: center;
}

.reactions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.reaction-item {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.dark .reaction-item {
  background: #111827;
  border-color: #374151;
}

.reaction-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.dark .reaction-item:hover {
  background: #1f2937;
  border-color: #4b5563;
}

.reaction-item-mine {
  background: #bfdbfe;
  border-color: #3b82f6;
}

.dark .reaction-item-mine {
  background: #0e4a8b;
  border-color: #60a5fa;
}

.reaction-item-mine:hover {
  background: #bfdbfe;
  border-color: #3b82f6;
}

.dark .reaction-item-mine:hover {
  background: #0e4a8b;
  border-color: #60a5fa;
}

.reaction-emoji {
  font-size: 14px;
}

.reaction-count-small {
  min-width: 12px;
  text-align: center;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.dark .reaction-count-small {
  color: #9ca3af;
}

.add-reaction-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  padding: 0;
  touch-action: manipulation;
}

@media (max-width: 768px) {
  .add-reaction-btn {
    width: 32px;
    height: 32px;
  }
}

.dark .add-reaction-btn {
  border-color: #4b5563;
  color: #9ca3af;
}

.add-reaction-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.dark .add-reaction-btn:hover {
  background: #374151;
  border-color: #6b7280;
  color: #d1d5db;
}
</style>
