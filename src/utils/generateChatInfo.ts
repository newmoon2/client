import { ChatsInfo } from '@/types';
import { generateUUID } from './generateUUID';

export function generateChatInfo (value?: {
	persona_id?: string | number
	name?: string
}): ChatsInfo  {
    const uuid = generateUUID();
    return {
        path: uuid,
        id: uuid,
        name: value?.name ? value?.name : '새로운 대화',
		persona_id: value?.persona_id,
        data: []
    }
}
