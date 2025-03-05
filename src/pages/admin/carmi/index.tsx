import { ActionType, ProColumns } from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import {
  Tag,
  message,
  Button,
  Modal,
  Radio,
  DatePicker,
  InputNumber,
  Space,
  Spin,
  Input
} from 'antd'
import { useRef, useState } from 'react'
import {
  delAdminCarmi,
  getAdminCarmi,
  addAdminCarmis,
  getAdminCarmiCheck
} from '@/request/adminApi'
import { CarmiInfo } from '@/types/admin'
import { formatTime } from '@/utils'
import styles from './index.module.less'
import FormCard from '../components/FormCard'

function CarmiPage() {
  const tableActionRef = useRef<ActionType>()

  const [generateModal, setGenerateModal] = useState({
    open: false,
    type: 'integral',
    end_time: '',
    quantity: 1,
    reward: 10,
    loading: false,
    level: 1,
    result: ''
  })

  const columns: ProColumns<CarmiInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: 'Key',
      dataIndex: 'key'
    },
    {
      title: 'Value',
      dataIndex: 'value',
      render: (_, data) => {
        return (
          <a>
            {data.value}
            {data.type === 'integral' ? '완전한' : '天'}
          </a>
        )
      }
    },
    {
      title: '상태',
      dataIndex: 'status',
      render: (_, data) => {
        const color = data.status === 1 ? 'red' : data.status === 2 ? 'orange' : 'green'
        return (
          <Tag color={color}>
            {data.status === 1 ? '이미 사용됨' : data.status === 2 ? '만료됨' : '사용되지 않음'}
          </Tag>
        )
      }
    },
    {
      title: '수준',
      dataIndex: 'level',
      render: (_, data) => {
        if (data.level === 1) {
          return <Tag color="#f50">일반 회원</Tag>
        }
        if (data.level === 2) {
          return <Tag color="#ce9e4f">슈퍼멤버</Tag>
        }
        return <Tag>아직 레벨이 없습니다</Tag>
      }
    },
    {
      title: '유효기간',
      dataIndex: 'end_time'
    },
    {
      title: '사용자 계정',
      dataIndex: 'user_id',
      width: 200,
      render: (_, data) => {
        if (!data.user_id) return '-'
        return <p>{data.user?.account}</p>
      }
    },
    {
      title: 'IP',
      dataIndex: 'ip'
    },
    {
      title: '생성 시간',
      dataIndex: 'create_time'
    },
    {
      title: '수정 시간',
      dataIndex: 'update_time'
    },
    {
      title: '작동하다',
      width: 100,
      valueType: 'option',
      fixed: 'right',
      render: (_, data) => [
        <Button
          key="del"
          type="text"
          danger
          onClick={() => {
            delAdminCarmi({
              id: data.id
            }).then((res) => {
              if (res.code) return
              message.success('성공적으로 삭제되었습니다')
              tableActionRef.current?.reload()
            })
          }}
        >
          삭제
        </Button>
      ]
    }
  ]

  return (
    <div>
      <ProTable
        actionRef={tableActionRef}
        columns={columns}
        params={{}}
        pagination={{}}
        scroll={{
          x: 1800
        }}
        request={async (params, sorter, filter) => {
          const res = await getAdminCarmi({
            page: params.current || 1,
            page_size: params.pageSize || 10
          })
          return Promise.resolve({
            data: res.data.rows,
            total: res.data.count,
            success: true
          })
        }}
        toolbar={{
          actions: [
            <Button
              key="check"
              type="primary"
              size="small"
              onClick={() => {
                getAdminCarmiCheck().then(() => {
                  message.success('제출이 완료되었습니다. 나중에 확인하세요.')
                })
              }}
            >
              비동기적으로 카드 비밀번호 확인
            </Button>,
            <Button
              key="produce"
              type="primary"
              size="small"
              onClick={() => {
                setGenerateModal((g) => ({ ...g, open: true }))
              }}
            >
              일괄 생성

            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />

      <Modal
        title="카드 비밀 생성"
        open={generateModal.open}
        footer={null}
        onCancel={() => {
          setGenerateModal({
            open: false,
            type: 'integral',
            end_time: '',
            quantity: 1,
            loading: false,
            reward: 10,
            level: 1,
            result: ''
          })
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space size="large" wrap>
            <FormCard title="보상 유형">
              <Radio.Group
                size="large"
                onChange={(e) => {
                  setGenerateModal((g) => ({ ...g, type: e.target.value }))
                }}
                defaultValue={generateModal.type}
                value={generateModal.type}
              >
                <Radio.Button value="integral">완전한</Radio.Button>
                <Radio.Button value="day">지속 일</Radio.Button>
              </Radio.Group>
            </FormCard>
            <FormCard title="보상 수">
              <InputNumber
                size="large"
                min={1}
                max={99999}
                onChange={(e) => {
                  if (e) {
                    setGenerateModal((g) => ({ ...g, reward: e }))
                  }
                }}
                value={generateModal.reward}
              />
            </FormCard>
            <FormCard title="유효기간 만료일">
              <DatePicker
                size="large"
                format="YYYY-MM-DD"
                disabledDate={(current) => {
                  const date = new Date()
                  date.setHours(0, 0, 0, 0)
                  return current && current.toDate().getTime() < date.getTime()
                }}
                onChange={(e) => {
                  if (e) {
                    const dateString = formatTime('yyyy-MM-dd', e?.toDate())
                    setGenerateModal((g) => ({ ...g, end_time: dateString }))
                  } else {
                    setGenerateModal((g) => ({ ...g, end_time: '' }))
                  }
                }}
              />
            </FormCard>
          </Space>
          <Space size="large">
            <FormCard title="카드회원등급">
              <Radio.Group
                size="large"
                onChange={(e) => {
                  setGenerateModal((g) => ({ ...g, level: e.target.value }))
                }}
                defaultValue={generateModal.level}
                value={generateModal.level}
              >
                <Radio.Button value={1}>일반 회원</Radio.Button>
                <Radio.Button value={2}>슈퍼멤버</Radio.Button>
              </Radio.Group>
            </FormCard>
            <FormCard title="수량 생성">
              <InputNumber
                style={{ width: '100%' }}
                size="large"
                min={1}
                max={50}
                onChange={(e) => {
                  if (e) {
                    setGenerateModal((g) => ({ ...g, quantity: e }))
                  }
                }}
                value={generateModal.quantity}
              />
            </FormCard>
          </Space>
          <div
            className={styles.generate}
            style={{
              height: generateModal.result || generateModal.loading ? 120 : 0
            }}
          >
            {generateModal.result && !generateModal.loading && (
              <Input.TextArea
                value={generateModal.result}
                disabled
                placeholder="Controlled autosize"
                autoSize={{
                  minRows: 5,
                  maxRows: 5
                }}
              />
            )}
            {generateModal.loading && <Spin />}
          </div>

          <Button
            loading={generateModal.loading}
            onClick={() => {
              setGenerateModal((g) => ({ ...g, loading: true }))
              addAdminCarmis({
                type: generateModal.type,
                end_time: generateModal.end_time,
                quantity: generateModal.quantity,
                reward: generateModal.reward,
                level: generateModal.level
              })
                .then((res) => {
                  if (res.code) return
                  const keys = res.data.map((info) => `${info.key}`).join('\n')
                  setGenerateModal((g) => ({ ...g, loading: false, result: keys }))
                  tableActionRef.current?.reloadAndRest?.()
                })
                .finally(() => {
                  setGenerateModal((g) => ({ ...g, loading: false }))
                })
            }}
            type="primary"
            block
            size="large"
          >
            즉시 생성
          </Button>
        </Space>
      </Modal>
    </div>
  )
}

export default CarmiPage
