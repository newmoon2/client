import { PayTypeInfo, ProductInfo, MyDocInfo } from '@/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface myDocInfo {
  // pay 결제수단
   // 제품 목록
   myDocs: Array<MyDocInfo>
   changeMyDocsList: (list: Array<ProductInfo>) => void
}

const myDocStore = create<myDocInfo>()(
  persist(
    (set, get) => ({
      myDocs: [],
      changeMyDocsList: (list) => set({ myDocs: list })
      }),
    {
      name: 'mydoc_storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage) // (optional) by default the 'localStorage' is used
    }
  )
)

export default myDocStore
