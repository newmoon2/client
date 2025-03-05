import { CommentOutlined, DeleteOutlined, RedditCircleFilled } from '@ant-design/icons';
//import styles from './index.module.less';
import { useMemo } from 'react';
import { Popconfirm } from 'antd';

type Props = {
    isPersona: boolean,
    isSelect: boolean,
    name?: string,
    onConfirm?: () => void
    onCancel?: () => void
}

function TestButton(props: Props) {
    const className = useMemo(() => {
        
    }, [props.isSelect])


    return (
       
             
            <div >
                <input value="test" type="button"
                    title="세션 삭제"
                    onClick={props.onConfirm}
                  
                />
                    
            </div>
         
    )
}

export default TestButton;