import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ChatGptConfig, PersonaInfo } from '@/types'
import { NotificationInfo } from '@/types/admin'

export interface ConfigState {
  // 구성 정보
  config: ChatGptConfig
  // 모델
  models: Array<{
    label: string
    value: string
  }>
  // 팝업 창 스위치 구성
  configModal: boolean
  // 구성 팝업 창 수정
  setConfigModal: (value: boolean) => void
  // 구성 수정
  changeConfig: (config: ChatGptConfig) => void
  notifications: Array<NotificationInfo>
  shop_introduce: string
  user_introduce: string
  replaceData: (config: { [key: string]: any }) => void
  website_title: string
  website_description: string
  website_keywords: string
  website_logo: string
  website_footer: string
  invite_introduce: string,
  random_personas: Array<PersonaInfo>
}

const configStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      configModal: false,
      notifications: [],
      shop_introduce: '',
      user_introduce: '',
      website_title: '',
      website_description: '',
      website_keywords: '',
      website_logo: '',
      website_footer: '',
      invite_introduce: '',
	  random_personas: [],
      models: [
        {
          label: 'GPT-3.5',
          value: 'gpt-3.5-turbo'
        },
		{
			label: 'GPT-3.5-16k',
			value: 'gpt-3.5-turbo-16k'
		},
        {
          label: 'GPT-4',
          value: 'gpt-4'
        }
      ],
      config: {
        model: 'gpt-3.5-turbo-16k',
        temperature: 0.8,
        presence_penalty: 0,
        frequency_penalty: 0,
        max_tokens: 1888
      },
      setConfigModal: (value) => set({ configModal: value }),
      changeConfig: (config) =>
        set((state: ConfigState) => ({
          config: { ...state.config, ...config }
        })),
      replaceData: (data) => set((state: ConfigState) => ({ ...state, ...data }))
    }),
    {
      name: 'config_storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage) // (optional) by default the 'localStorage' is used
    }
  )
)

export default configStore
