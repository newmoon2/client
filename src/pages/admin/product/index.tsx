import {
  getAdminProducts,
  delAdminProduct,
  postAdminProduct,
  putAdminProduct
} from '@/request/adminApi'
import { ProductInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Button, Form, Tag, Tooltip, message } from 'antd'
import { useRef, useState } from 'react'

function ProductPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<ProductInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: ProductInfo | undefined
  }>({
    open: false,
    info: undefined
  })
  const columns: ProColumns<ProductInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: '제목',
      dataIndex: 'title'
    },
    {
      title: '가격',
      dataIndex: 'price',
      render: (_, data) => {
        return <a>{data.price}分</a>
      }
    },
    {
      title: '원 가격',
      dataIndex: 'original_price',
      render: (_, data) => {
        return <a>{data.original_price}分</a>
      }
    },
    {
      title: '포인트/일',
      dataIndex: 'value',
      render: (_, data) => {
        return <a>{data.type === 'integral' ? data.value + '완전한' : data.value + '일'}</a>
      }
    },
    {
      title: '레벨ㄴ',
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
      title: '상품 설명',
      dataIndex: 'describe',
      ellipsis: {
        showTitle: false
      },
      render: (_, data) => <Tooltip title={data.describe}>{data.describe}</Tooltip>
    },
    {
      title: '상태 값',
      dataIndex: 'status',
      render: (_, data) => (
        <Tag color={data.status ? 'green' : 'red'}>{data.status ? '온라인' : '오프라인'}</Tag>
      )
    },
    {
      title: '정렬',
      dataIndex: 'sort',
      tooltip: '숫자가 클수록 뒤로 갈수록'
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
      width: 160,
      valueType: 'option',
      fixed: 'right',
      render: (_, data) => [
        <Button
          key="edit"
          type="link"
          onClick={() => {
            setEditInfoModal(() => {
              form?.setFieldsValue({
                ...data
              })
              return {
                open: true,
                info: data
              }
            })
          }}
        >
          편집
        </Button>,
        <Button
          key="del"
          type="text"
          danger
          onClick={() => {
            delAdminProduct({
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
        scroll={{
          x: 1200
        }}
        request={async (params, sorter, filter) => {
          // 양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.
          const res = await getAdminProducts({
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
              key="primary"
              type="primary"
              size="small"
              onClick={() => {
                setEditInfoModal(() => {
                  return {
                    open: true,
                    info: undefined
                  }
                })
              }}
            >
              새 제품 추가
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<ProductInfo>
        title="제품정보"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          level: 1,
          sort: 1
        }}
        onOpenChange={(visible) => {
          if (!visible) {
            form.resetFields()
          }
          setEditInfoModal((info) => {
            return {
              ...info,
              open: visible
            }
          })
        }}
        onFinish={async (values) => {
          const data = { ...values }
          if (edidInfoModal.info?.id) {
            console.log('편집 입력')
            const res = await putAdminProduct({
              ...data,
              id: edidInfoModal.info?.id
            })
            if (res.code) {
              message.error('수정 실패')
              return false
            }
            tableActionRef.current?.reload?.()
          } else {
            const res = await postAdminProduct(data)
            if (res.code) {
              message.error('추가하지 못했습니다.')
              return false
            }
            tableActionRef.current?.reloadAndRest?.()
            message.success('제출 성공')
          }
          return true
        }}
        size="large"
        modalProps={{
          cancelText: '취소',
          okText: '확인'
        }}
      >
        <ProFormGroup>
          <ProFormText
            width="md"
            name="title"
            label="제목"
            placeholder="제목"
            rules={[{ required: true, message: '제품명을 입력해주세요' }]}
          />
          <ProFormText
            width="xs"
            name="badge"
            label="뱃지"
            placeholder="뱃지"
            rules={[{ required: true, message: '뱃지를 입력해주세요' }]}
          />
          <ProFormDigit
            width="xs"
            name="sort"
            label="정렬"
			tooltip="숫자가 클수록 뒤로 갈수록"
            min={1}
            max={999999}
            placeholder="종류"
            rules={[{ required: true }]}
          />
        </ProFormGroup>
        <ProFormText name="describe" label="설명" placeholder="상품 설명" />
        <ProFormGroup>
          <ProFormDigit
            label="가격"
            name="price"
            min={1}
            max={1000000}
            rules={[{ required: true, message: '제품 가격을 센트 단위로 입력하세요.' }]}
          />
          <ProFormDigit label="원래 가격" name="original_price" min={0} max={1000000} />
          <ProFormRadio.Group
            name="status"
            label="상태"
            radioType="button"
            options={[
              {
                label: '오프라인',
                value: 0
              },
              {
                label: '온라인',
                value: 1
              }
            ]}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormRadio.Group
            name="type"
            label="보상 유형"
            radioType="button"
            options={[
              {
                label: '완전한',
                value: 'integral'
              },
              {
                label: '날',
                value: 'day'
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            width="sm"
            label="포인트/일"
            name="value"
            min={0}
            max={1000000}
            rules={[{ required: true }]}
          />
          <ProFormRadio.Group
            name="level"
            label="제품 수준"
            radioType="button"
            options={[
              {
                label: '일반 회원',
                value: 1
              },
              {
                label: '슈퍼멤버',
                value: 2
              }
            ]}
          />
        </ProFormGroup>
      </ModalForm>
    </div>
  )
}

export default ProductPage
