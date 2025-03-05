import { getProduct } from '@/request/api'
import shopStore from './slice'

async function fetchProduct() {
  const res = await getProduct()
  if (!res.code) {
    shopStore.getState().changeGoodsList([...res.data.products])
	const payTyps = res.data.pay_types.map((type) => {
		const types: {[key: string]: any} = {
			wxpay: {
				icon: 'https://u1.dl0.cn/icon/wxpay_icon.png',
				title: '위챗페이',
				key: 'wxpay'
			},
			alipay: {
				icon: 'https://u1.dl0.cn/icon/alipay_icon.png',
				title: 'alipay',
				key: 'alipay'
			},
			qqpay: {
				icon: 'https://u1.dl0.cn/icon/qqpay_icon.png',
				title: 'qqpay',
				key: 'qqpay'
			},
		}
		return types[type]
	})
	await shopStore.getState().changePayTypes([...payTyps])
  }
  return res
}

export default {
  fetchProduct
}
