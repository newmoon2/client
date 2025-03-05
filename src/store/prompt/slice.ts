import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PromptInfo } from '@/types';
import promptszh from '@/assets/prompts-zh.json';

export interface PromptState {
  // 로컬 AI 프롬프트 지침
  localPrompt: Array<PromptInfo>;
  // AI 프롬프트 명령 추가
  addPrompts: (list: Array<PromptInfo>) => void;
  // AI 프롬프트 지침 모두 지우기
  clearPrompts: () => void;
  // 단일 AI 프롬프트 명령 삭제
  delPrompt: (info: PromptInfo) => void;
  // AI 프롬프트 명령 정보 편집
  editPrompt: (oldKey: string, info: PromptInfo) => void;
}

const promptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      localPrompt: [...promptszh],
      addPrompts: (list) =>
        set((state: PromptState) => {
          const resultMap = new Map();
          state.localPrompt.forEach((item) => resultMap.set(item.key, item));
          list.forEach((item) => resultMap.set(item.key, item));
          return {
            localPrompt: [...Array.from(resultMap.values())],
          };
        }),
      clearPrompts: () => set({ localPrompt: [] }),
      editPrompt: (oldKey, info) =>
        set((state: PromptState) => {
          const newList = state.localPrompt.map((item) => {
            if (oldKey === item.key) {
              return {
                ...info,
              };
            }
            return {
              ...item,
            };
          });
          return {
            localPrompt: [...newList],
          };
        }),
      delPrompt: (info) =>
        set((state: PromptState) => {
          const newList = state.localPrompt.filter(
            (item) => item.key !== info.key && item.value !== info.value
          );
          return {
            localPrompt: [...newList],
          };
        }),
    }),
    {
      name: 'prompt_storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used
    }
  )
);

export default promptStore;
