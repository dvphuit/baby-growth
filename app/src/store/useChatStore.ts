import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { indexedDbStorage } from '@/services/localDb';
import type { ChatMessage } from '@/types';
import { currentTimeStr } from '@/utils/date';
import { generateId } from '@/utils/format';

interface ChatStoreState {
  chatMessages: ChatMessage[];
  addChatMessage: (sender: 'ai' | 'user', text: string) => void;
  clearChat: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm_init_1',
    sender: 'ai',
    text: 'Xin chào Mẹ Thảo! Tôi là Trợ lý Freud AI về chăm sóc Bé & Mẹ. Hôm nay Bé Bơ ăn ngủ thế nào? Tôi có thể cung cấp thông tin tham khảo gì cho gia đình mình?',
    time: '09:00',
  },
];

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set) => ({
      chatMessages: INITIAL_MESSAGES,
      addChatMessage: (sender, text) => {
        const nowTime = currentTimeStr();
        const newMsg: ChatMessage = {
          id: generateId('msg'),
          sender,
          text,
          time: nowTime,
        };
        set((state) => ({ chatMessages: [...state.chatMessages, newMsg] }));
      },
      clearChat: () => set({ chatMessages: INITIAL_MESSAGES }),
    }),
    {
      name: 'babygrowth_v2_chat',
      storage: createJSONStorage(() => indexedDbStorage),
    }
  )
);
