import { PayTypeInfo, ProductInfo } from '@/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface shopState {
  // pay 결제수단
  payTypes: Array<PayTypeInfo>
  // 제품 목록
  goodsList: Array<ProductInfo>
  // 제품 목록 수정
  changeGoodsList: (list: Array<ProductInfo>) => void
  // 결제 수단 수정
  changePayTypes: (list: Array<PayTypeInfo>) => void
}

const shopStore = create<shopState>()(
  persist(
    (set, get) => ({
      payTypes: [],
      changePayTypes: (list) => set({ payTypes: list }),
      goodsList: [],
      changeGoodsList: (list) => set({ goodsList: list })
    }),
    {
      name: 'shop_storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage) // (optional) by default the 'localStorage' is used
    }
  )
)

export default shopStore
