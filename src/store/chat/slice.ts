import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ChatGpt, ChatsInfo } from '@/types'
import { formatTime, generateChatInfo } from '@/utils'

export interface ChatState {
  // 채팅 대화
  chats: Array<ChatsInfo>
  // 현재 선택된 세션 ID
  selectChatId: string | number
  // 새 대화 추가
  addChat: (value?: {
	persona_id?: number | string,
	name?: string
  }) => void
  // 대화 삭제
  delChat: (id: string | number) => void
  // 모든 대화 지우기
  clearChats: () => void
  // 선택 세션 ID 변경
  changeSelectChatId: (id: string | number) => void
  // 대화에 데이터 추가
  setChatInfo: (
    id: string | number,
    data?: ChatGpt,
    info?: ChatsInfo | { [key: string]: any }
  ) => void
  // 대화 데이터 수정
  setChatDataInfo: (
    id: string | number,
    messageId: string | number,
    info?: ChatGpt | { [key: string]: any }
  ) => void
  // 현재 세션 지우기
  clearChatMessage: (id: string | number) => void
  // 메시지 삭제
  delChatMessage: (id: string | number, messageId: string | number) => void,
  // 다시 놓기
  changeChatMessage: (data: Array<ChatsInfo>) => void
}

const chatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      selectChatId: '',
      addChat: (value) =>
        set((state: ChatState) => {
          const info = generateChatInfo(value)
          const newChats = [...state.chats]
          newChats.unshift({ ...info })
          return {
            chats: [...newChats],
            selectChatId: info.id
          }
        }),
      delChat: (id) =>
        set((state: ChatState) => {
          const newChats = state.chats.filter((c) => c.id !== id)
          if (state.chats.length <= 1) {
            const info = generateChatInfo()
            return {
              chats: [{ ...info }],
              selectChatId: info.id
            }
          }
          return {
            selectChatId: state.chats[1].id,
            chats: [...newChats]
          }
        }),
      clearChats: () =>
        set(() => {
          const info = generateChatInfo()
          return {
            chats: [{ ...info }],
            selectChatId: info.id
          }
        }),
      changeSelectChatId: (id) =>
        set(() => ({
          selectChatId: id
        })),
		changeChatMessage: (data) => set({chats: data}),
      delChatMessage: (id, messageId) =>
        set((state: ChatState) => {
          const newChats = state.chats.map((c) => {
            if (c.id === id) {
              const newData = c.data.filter((d) => d.id !== messageId)
              return {
                ...c,
                data: newData
              }
            }
            return c
          })
          return {
            chats: newChats
          }
        }),
      clearChatMessage: (id) =>
        set((state: ChatState) => {
          const newChats = state.chats.map((c) => {
            if (c.id === id) {
              return {
                ...c,
                parentMessageId: '',
                data: [],
                text: '',
                dateTime: formatTime()
              }
            }
            return c
          })
          return {
            chats: newChats
          }
        }),
      setChatInfo: (id, data, info) =>
        set((state: ChatState) => {
          const newChats = state.chats.map((item) => {
            if (item.id === id) {
              const name = item.data.length <= 0 && data?.text ? data.text : item.name
              return {
                ...item,
                name,
                ...info,
                data: data ? item.data.concat({ ...data }) : item.data
              }
            }
            return item
          })
          return {
            chats: newChats
          }
        }),
      setChatDataInfo: (id, messageId, info) =>
        set((state: ChatState) => {
          const newChats = state.chats.map((item) => {
            if (item.id === id) {
              const newData = item.data.map((m) => {
                if (m.id === messageId) {
                  return {
                    ...m,
                    ...info
                  }
                }
                return m
              })

              const dataFilter = newData.filter((d) => d.id === messageId)
              const chatData = { id: messageId, ...info } as ChatGpt
              return {
                ...item,
                data: dataFilter.length <= 0 ? [...newData, { ...chatData }] : [...newData]
              }
            }
            return item
          })

          return {
            chats: newChats
          }
        })
    }),
    {
      name: 'chat_storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage) // (optional) by default the 'localStorage' is used
    }
  )
)

export default chatStore
