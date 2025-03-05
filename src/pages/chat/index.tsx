import {
  CommentOutlined,
  DeleteOutlined,
  GitlabFilled,
  RedditCircleFilled,
  RedditSquareFilled
} from '@ant-design/icons'
import { Button, Modal, Popconfirm, Space, Tabs, Select, message, Badge } from 'antd'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import styles from './index.module.less'
import { chatStore, configStore, userStore } from '@/store'
import { chatAsync, pluginAsync } from '@/store/async'
import RoleNetwork from './components/RoleNetwork'
import RoleLocal from './components/RoleLocal'
import AllInput from './components/AllInput'
import ChatMessage from './components/ChatMessage'
import { ChatGpt, RequestChatOptions } from '@/types'
import { postChatCompletions } from '@/request/api'
import Reminder from '@/components/Reminder'
import { filterObjectNull, formatTime, generateUUID, handleChatData } from '@/utils'
import { useScroll } from '@/hooks/useScroll'
import useDocumentResize from '@/hooks/useDocumentResize'
import Layout from '@/components/Layout'
import useMobile from '@/hooks/useMobile'
import PersonaModal from '@/components/PersonaModal'
import PluginModal from '@/components/pluginModal'
import MessageItem from './components/MessageItem'

function ChatPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollToBottomIfAtBottom, scrollToBottom } = useScroll(scrollRef.current)
  const { token, setLoginModal } = userStore()
  const { config, models, changeConfig, setConfigModal } = configStore()
  const {
    chats,
    addChat,
    delChat,
    clearChats,
    selectChatId,
    changeSelectChatId,
    setChatInfo,
    setChatDataInfo,
    clearChatMessage,
    delChatMessage
  } = chatStore()

  const bodyResize = useDocumentResize()

  const isMobile = useMobile()

  // 프롬프트 명령 기본값
  const [roleConfigModal, setRoleConfigModal] = useState({
    open: false
  })

  // ai角色
  const [personaModal, setPersonaModal] = useState({
    open: false
  })

  const [pluginModal, setPluginModal] = useState({
    open: false
  })

  useLayoutEffect(() => {
    if (scrollRef) {
      scrollToBottom()
    }
  }, [scrollRef.current, selectChatId, chats])

  useEffect(() => {
    if (token) {
      chatAsync.fetchChatMessages()
      pluginAsync.fetchGetPlugin()
    }
  }, [token])

  // 현재 채팅 기록
  const chatMessages = useMemo(() => {
    const chatList = chats.filter((c) => c.id === selectChatId)
    if (chatList.length <= 0) {
      return []
    }
    return chatList[0].data
  }, [selectChatId, chats])

  // 대화 만들기 버튼
  const CreateChat = () => {
    return (
      <Button
        block
        type="dashed"
        style={{
          marginBottom: 6,
          marginLeft: 0,
          marginRight: 0
        }}
        onClick={() => {
          // if (!token) {
          //   setLoginOptions({
          //     open: true
          //   })
          //   return
          // }
          addChat()
        }}
      >
        새로운 대화
      </Button>
    )
  }

  // 서버 방법에 연결
  async function serverChatCompletions({
    requestOptions,
    signal,
    userMessageId,
    assistantMessageId
  }: {
    userMessageId?: string
    signal: AbortSignal
    requestOptions: RequestChatOptions
    assistantMessageId: string
  }) {
    const response = await postChatCompletions(requestOptions, {
      options: {
        signal
      }
    })
      .then((res) => {
        return res
      })
      .catch((error) => {
        // 종료: AbortError
        console.log(error.name)
      })

    if (!(response instanceof Response)) {
      // 여기 반품은 오류입니다 ...
      if (userMessageId) {
        setChatDataInfo(selectChatId, userMessageId, {
          status: 'error'
        })
      }

      setChatDataInfo(selectChatId, assistantMessageId, {
        status: 'error',
        text: `${response?.message || '❌ 예외를 요청하세요. 나중에 다시 시도해 주세요.'} \n \`\`\` ${JSON.stringify(response, null, 2)}   `
      })
      fetchController?.abort()
      setFetchController(null)
      message.error('요청 실패')
      return
    }
    const reader = response.body?.getReader?.()
    let allContent = ''
    while (true) {
      const { done, value } = (await reader?.read()) || {}
      if (done) {
        fetchController?.abort()
        setFetchController(null)
        break
      }
      // 획득한 데이터 조각을 화면에 표시
      const text = new TextDecoder('utf-8').decode(value)
      const texts = handleChatData(text)
      for (let i = 0; i < texts.length; i++) {
        const { dateTime, role, content, segment, pluginInfo } = texts[i]
        allContent += content ? content : ''
        if (segment === 'stop') {
          setFetchController(null)
          if (userMessageId) {
            setChatDataInfo(selectChatId, userMessageId, {
              status: 'pass'
            })
          }
          setChatDataInfo(selectChatId, assistantMessageId, {
            text: allContent,
            dateTime,
            status: 'pass'
          })
          break
        }

        if (segment === 'start') {
          if (userMessageId) {
            setChatDataInfo(selectChatId, userMessageId, {
              status: 'pass'
            })
          }
          setChatDataInfo(selectChatId, assistantMessageId, {
            text: allContent,
            dateTime,
            status: 'loading',
            role,
            requestOptions,
            plugin_info: pluginInfo || undefined
          })
        }
        if (segment === 'text') {
          setChatDataInfo(selectChatId, assistantMessageId, {
            text: allContent,
            dateTime,
            status: 'pass'
          })
        }
      }
      scrollToBottomIfAtBottom()
    }
  }

  const [fetchController, setFetchController] = useState<AbortController | null>(null)

  // 대화
  async function sendChatCompletions(vaule: string, refurbishOptions?: ChatGpt) {

    //3softplus
    if (false && !token) {
      setLoginModal(true)
      return
    }
    const selectChat = chats.filter((c) => c.id === selectChatId)[0]
    const parentMessageId = refurbishOptions?.requestOptions.parentMessageId || selectChat.id
    let userMessageId = generateUUID()
    const requestOptions = {
      prompt: vaule,
      parentMessageId,
      persona_id: selectChat?.persona_id || refurbishOptions?.persona_id || '',
      options: filterObjectNull({
        ...config,
        ...refurbishOptions?.requestOptions.options
      })
    }
    const assistantMessageId = refurbishOptions?.id || generateUUID()
    if (refurbishOptions?.requestOptions.parentMessageId && refurbishOptions?.id) {
      userMessageId = ''
      setChatDataInfo(selectChatId, assistantMessageId, {
        status: 'loading',
        role: 'assistant',
        text: '',
        dateTime: formatTime(),
        requestOptions
      })
    } else {
      setChatInfo(selectChatId, {
        id: userMessageId,
        text: vaule,
        dateTime: formatTime(),
        status: 'pass',
        role: 'user',
        requestOptions
      })
      setChatInfo(selectChatId, {
        id: assistantMessageId,
        text: '',
        dateTime: formatTime(),
        status: 'loading',
        role: 'assistant',
        requestOptions
      })
    }

    const controller = new AbortController()
    const signal = controller.signal
    setFetchController(controller)
    serverChatCompletions({
      requestOptions,
      signal,
      userMessageId,
      assistantMessageId
    })
  }

  return (
    <div className={styles.chatPage}>
      <Layout
        menuExtraRender={() => <CreateChat />}
        route={{
          path: '/',
          routes: chats
        }}
        menuDataRender={(item) => {
          return item
        }}
        menuItemRender={(item, dom) => (
          <MessageItem
            isSelect={item.id === selectChatId}
            isPersona={!!item.persona_id}
            name={item.name}
            onConfirm={() => {
              chatAsync.fetchDelUserMessages({ id: item.id, type: 'del' })
            }}
          />
        )}
        menuFooterRender={(props) => {
          //   if (props?.collapsed) return undefined;
          return (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                size="middle"
                style={{ width: '100%' }}
                defaultValue={config.model}
                value={config.model}
                options={models.map((m) => ({ ...m, label: 'AI 모델: ' + m.label }))}
                onChange={(e) => {
                  changeConfig({
                    ...config,
                    model: e.toString()
                  })
                }}
              />
              <Space className={styles.space}>
                <Button
                  block
                  onClick={() => {
                    setRoleConfigModal({ open: true })
                  }}
                >
                  AI 프롬프트 지침
                </Button>
                <Button
                  block
                  onClick={() => {
                    setPersonaModal({
                      open: true
                    })
                  }}
                >
                  AI 역할
                </Button>
              </Space>

               
             
             


              <Button
                block
                onClick={() => {
                  setConfigModal(true)
                  // chatGptConfigform.setFieldsValue({
                  //   ...config
                  // })
                  // setChatConfigModal({ open: true })
                }}
              >
                세션 구성
              </Button>
              <Popconfirm
                title="모든 대화 삭제"
                description="모든 대화를 삭제하시겠습니까? "
                onConfirm={() => {
                  if (token) {
                    chatAsync.fetchDelUserMessages({ type: 'delAll' })
                  } else {
                    clearChats()
                  }
                }}
                onCancel={() => {
                  // ==== 조치 없음 ====
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button block danger type="dashed" ghost>
                모든 대화 지우기
                </Button>
              </Popconfirm>
            </Space>
          )
        }}
        menuProps={{
          onClick: (r) => {
            const id = r.key.replace('/', '')
            if (selectChatId !== id) {
              changeSelectChatId(id)
            }
          }
        }}
      >
        <div className={styles.chatPage_container}>
          {/* {
            chatMessages[0]?.persona_id && <div className={styles.chatPage_container_persona}>当前为预置角色对话</div>
          } */}
          <div ref={scrollRef} className={styles.chatPage_container_one}>
            <div id="image-wrapper">
              {chatMessages.map((item) => {
                return (
                  <ChatMessage
                    key={item.dateTime + item.role + item.text}
                    position={item.role === 'user' ? 'right' : 'left'}
                    status={item.status}
                    content={item.text}
                    time={item.dateTime}
                    model={item.requestOptions.options?.model}
                    onDelChatMessage={() => {
                      delChatMessage(selectChatId, item.id)
                    }}
                    onRefurbishChatMessage={() => {
                      console.log(item)
                      sendChatCompletions(item.requestOptions.prompt, item)
                    }}
                    pluginInfo={item.plugin_info}
                  />
                )
              })}
              {chatMessages.length <= 0 && <Reminder />}
              <div style={{ height: 80 }} />
            </div>
          </div>
          <div
            className={styles.chatPage_container_two}
            style={{
              position: isMobile ? 'fixed' : 'absolute'
            }}
          >
            <AllInput
              disabled={!!fetchController}
              onSend={(value) => {

                
                if (value.startsWith('/')) return
                 
                sendChatCompletions(value)
                 
                scrollToBottomIfAtBottom()
              }}
              clearMessage={() => {
                if (token) {
                  chatAsync.fetchDelUserMessages({ id: selectChatId, type: 'clear' })
                } else {
                  setLoginModal(true)
                }
              }}
              onStopFetch={() => {
                // 마치다
                setFetchController((c) => {
                  c?.abort()
                  return null
                })
              }}
            />
          </div>
        </div>
      </Layout>

      {/* AI 프롬프트 명령 사전 설정 */}
      <Modal
        title="AI 프롬프트 명령 사전 설정"
        open={roleConfigModal.open}
        footer={null}
        destroyOnClose
        onCancel={() => setRoleConfigModal({ open: false })}
        width={800}
        style={{
          top: 50
        }}
      >
        <Tabs
          tabPosition={bodyResize.width <= 600 ? 'top' : 'left'}
          items={[
            {
              key: 'roleLocal',
              label: '로컬 데이터',
              children: <RoleLocal />
            },
            {
              key: 'roleNetwork',
              label: '네트워크 데이터',
              children: <RoleNetwork />
            }
          ]}
        />
      </Modal>

      <PersonaModal
        {...personaModal}
        onCreateChat={(info) => {
          addChat({
            persona_id: info.id,
            name: info.title
          })
          setPersonaModal({
            open: false
          })
        }}
        onCancel={() => {
          setPersonaModal({
            open: false
          })
        }}
      />

      <PluginModal
        {...pluginModal}
        onCancel={() => {
          setPluginModal({
            open: false
          })
        }}
      />
    </div>
  )
}
export default ChatPage
