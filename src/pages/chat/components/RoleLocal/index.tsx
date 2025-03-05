import { useMemo, useState } from 'react'
import { promptStore } from '@/store'
import { paginate } from '@/utils'
import { Button, Empty, Form, Input, Pagination, Space, message } from 'antd'
import styles from './index.module.less'
import { PromptInfo } from '@/types'
import { DeleteOutlined, FormOutlined } from '@ant-design/icons'
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components'

function RoleLocal() {
  const { localPrompt, clearPrompts, addPrompts, delPrompt, editPrompt } = promptStore()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [keyword, setKeyword] = useState('')

  const [promptInfoform] = Form.useForm<PromptInfo>()
  const [promptInfoModal, setPromptInfoModal] = useState<
    PromptInfo & { open: boolean; oldKey: string }
  >({
    oldKey: '',
    open: false,
    key: '',
    value: ''
  })

  const [addPromptJson, setAddPromptJson] = useState(false)

  const filterListByKeyOrValue = (list: Array<PromptInfo>, keyword: string) => {
    if (!keyword) return list
    return list.filter((item) => item.key.includes(keyword) || item.value.includes(keyword))
  }

  function promptCard(info: PromptInfo) {
    return (
      <div key={info.key} className={styles.promptCard}>
        <div className={styles.promptCard_content}>
          <p>{info.key}</p>
          <span>{info.value}</span>
        </div>
        <div className={styles.promptCard_operate}>
          <DeleteOutlined
            onClick={() => {
              delPrompt(info)
              message.success('성공적으로 삭제되었습니다 👌')
            }}
          />
          <FormOutlined
            onClick={() => {
              promptInfoform.setFieldsValue({
                key: info.key,
                value: info.value
              })
              setPromptInfoModal((p) => {
                return {
                  key: info.key,
                  value: info.value,
                  open: true,
                  oldKey: info.key
                }
              })
            }}
          />
        </div>
      </div>
    )
  }

  const list = useMemo(() => {
    const newList = keyword ? [...filterListByKeyOrValue(localPrompt, keyword)] : [...localPrompt]
    return [...paginate(newList, page, pageSize)]
  }, [page, keyword, localPrompt])

  const paginationTotal = useMemo(() => {
    const list = keyword ? filterListByKeyOrValue(localPrompt, keyword) : localPrompt
    return list.length
  }, [keyword, localPrompt])

  const exportPromptTemplate = (data: Array<any>) => {
    if (data.length <= 0) {
      message.warning('아직 데이터가 없습니다! ')
      return
    }
    const jsonDataStr = JSON.stringify(data)
    const blob = new Blob([jsonDataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ChatGPTPromptTemplate.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.roleLocal}>
      <Space size="small" direction="vertical" style={{ width: '100%' }}>
        <div className={styles.roleLocal_operate}>
          <Space wrap>
            <Button
              danger
              type="dashed"
              onClick={() => {
                clearPrompts()
              }}
            >
              분명한
            </Button>
            <Button
              onClick={() => {
                exportPromptTemplate(localPrompt)
              }}
            >
              내보내다
            </Button>
            <Button
              onClick={() => {
                setAddPromptJson(true)
              }}
            >
              수입
            </Button>
            <Button
              type="primary"
              onClick={() => {
                promptInfoform.setFieldsValue({
                  key: '',
                  value: ''
                })
                setPromptInfoModal((p) => {
                  return {
                    key: '',
                    value: '',
                    open: true,
                    oldKey: ''
                  }
                })
              }}
            >
              다음에 추가
            </Button>
            <Input
              placeholder="키워드 검색"
              onChange={(e) => {
                setPage(1)
                setKeyword(e.target.value)
              }}
            />
          </Space>
        </div>
        {list.map((item) => {
          return promptCard({ ...item })
        })}
        {list.length <= 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="아직 데이터가 없습니다" />}
        <div className={styles.roleLocal}>
          <Pagination
            showSizeChanger={false}
            current={page}
            defaultPageSize={pageSize}
            total={paginationTotal}
            hideOnSinglePage
            onChange={(e) => {
              setPage(e)
            }}
            size="small"
          />
        </div>
      </Space>

      <ModalForm<PromptInfo>
        title="AI 프롬프트 명령 정보"
        open={promptInfoModal.open}
        form={promptInfoform}
        onOpenChange={(visible) => {
          setPromptInfoModal((p) => {
            return {
              ...p,
              open: visible
            }
          })
        }}
        onFinish={async (values) => {
          if (!(values.key && values.value)) {
            return false
          }
          if (promptInfoModal.oldKey) {
            // 修改
            editPrompt(promptInfoModal.oldKey, { ...values })
            message.success('수정 성공')
          } else {
            addPrompts([
              {
                key: values.key,
                value: values.value
              }
            ])
            message.success('성공적으로 추가되었습니다')
          }
          return true
        }}
        width={500}
        modalProps={{
          cancelText: '취소',
          okText: '확인',
          maskClosable: false
        }}
      >
        <ProFormText
          width="lg"
          name="key"
          label="제목"
          rules={[{ required: true, message: '제목을 입력하세요!' }]}
        />
        <ProFormTextArea
          width="lg"
          name="value"
          label="콘텐츠"
          rules={[{ required: true, message: '내용을 입력해주세요!' }]}
        />
      </ModalForm>

      {/* 导入数据 */}
      <ModalForm
        title="AI 프롬프트 지침을 일괄 추가했습니다."
        open={addPromptJson}
        onOpenChange={(visible) => {
          setAddPromptJson(visible)
        }}
        onFinish={async (values) => {
          try {
            const value = JSON.parse(values.value)
            if (Array.isArray(value)) {
              if ('key' in value[0] && 'value' in value[0]) {
                addPrompts([...value])
              } else if ('act' in value[0] && 'prompt' in value[0]) {
                const newJsonData = value.map((item: { act: string; prompt: string }) => {
                  return {
                    key: item.act,
                    value: item.prompt
                  }
                })
                addPrompts([...newJsonData])
              } else {
                throw Error('데이터 형식 오류 1')
              }
            } else {
              throw Error('데이터 형식 오류 2')
            }
          } catch (error) {
            console.log(error)
            message.error('데이터 형식 오류')
            return false
          }
          return true
        }}
        width={500}
        modalProps={{
          cancelText: '취소',
          okText: '확인',
          maskClosable: false,
          destroyOnClose: true
        }}
      >
        <ProFormTextArea
          width="lg"
          name="value"
          label="AI 프롬프트 지침"
          rules={[{ required: true, message: '내용을 입력해주세요!' }]}
          placeholder="가져올 JSON 형식을 입력하세요: [{key:'title',value:'content'}]"
          fieldProps={{
            autoSize: {
              minRows: 4,
              maxRows: 24
            }
          }}
        />
        <span>
        먼저 부탁드립니다{' '}
          <a href="https://www.json.cn/" target="_blank" rel="noreferrer">
            https://www.json.cn/
          </a>{' '}
          맞는지 확인 후 가져오세요.
        </span>
      </ModalForm>
    </div>
  )
}

export default RoleLocal
