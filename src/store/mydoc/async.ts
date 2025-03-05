import { getMyDocList } from '@/request/api'
import myDocStore from './slice'



async function fetchMyDocument () {
 
 
	const res = await getMyDocList()
	if (!res.code) {
		myDocStore.getState().changeMyDocsList(res.data)
	  //chatStore.getState().addChat()
	  //const aa = JSON.stringify(res.data)
	  //window.sessionStorage.setItem("llm_history", aa);
  
	}
  
	
	return res
  }

 

export default {
	fetchMyDocument
}
