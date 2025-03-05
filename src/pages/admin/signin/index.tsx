import { getAdminSignin } from '@/request/adminApi';
import { SigninInfo } from '@/types/admin';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { useRef} from 'react';

function SigninPage() {

    const tableActionRef = useRef<ActionType>();
    const columns: ProColumns<SigninInfo>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 180,
        },
        {
            title: '사용자 계정',
            width: 180,
            dataIndex: 'user_id',
            render: (_, data) => {
                if (!data.user_id) return '-'
                return (
                    <p>{data.user?.account}</p>
                )
            }
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            render: (_, data)=><Tag>{data.ip}</Tag>
        },
        {
            title: '상태 값',
            dataIndex: 'status',
            render: (_, data) => <Tag color={data.status ? 'green' : 'red'}>{data.status ? '로그인이 완료되었습니다.' : '로그인 실패'}</Tag>
        },
        {
            title: '생성 시간',
            dataIndex: 'create_time',
        },
        {
            title: '수정 시간',
            dataIndex: 'update_time',
        },
    ];

    return (
        <div>
            <ProTable
                actionRef={tableActionRef}
                columns={columns}
                scroll={{
                    x: 1200
                }}
                request={async (params, sorter, filter) => {
                    //양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.
                    const res = await getAdminSignin({
                        page: params.current || 1,
                        page_size: params.pageSize || 10,
                    });
                    return Promise.resolve({
                        data: res.data.rows,
                        total: res.data.count,
                        success: true,
                    });
                }}
                toolbar={{
                    actions: [],
                }}
                rowKey="id"
                search={false}
                bordered
            />
        </div>
    )
}

export default SigninPage;