import { AutoComplete, Button, Input, Modal, message } from 'antd'
import styles from './index.module.less'
import { ClearOutlined, CloudDownloadOutlined, SyncOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { promptStore } from '@/store'
import useDocumentResize from '@/hooks/useDocumentResize'
import { htmlToImage } from '@/utils'

type Props = {
  onSend: (value: string) => void
  disabled?: boolean
  clearMessage?: () => void
  onStopFetch?: () => void
}

function AllInput(props: Props) {
  const [prompt, setPrompt] = useState('')
  const { localPrompt } = promptStore()

  const bodyResize = useDocumentResize()

  const [downloadModal, setDownloadModal] = useState({
    open: false,
    loading: false
  })

  const searchOptions = useMemo(() => {
    if (prompt.startsWith('/')) {
      return localPrompt
        .filter((item: { key: string }) =>
          item.key.toLowerCase().includes(prompt.substring(1).toLowerCase())
        )
        .map((obj) => {
          return {
            label: obj.key,
            value: obj.value
          }
        })
    } else {
      return []
    }
  }, [prompt])

  // 채팅 기록을 사진에 저장
  async function downloadChatRecords() {
    setDownloadModal((d) => ({ ...d, loading: true }))
    htmlToImage('image-wrapper')
      .then(() => {
		message.success('채팅 기록을 성공적으로 다운로드했습니다.')
        setDownloadModal((d) => ({ ...d, loading: false }))
      })
      .catch(() => {
        message.error('채팅 기록을 다운로드하지 못했습니다.')
      })
  }

  return (
    <div className={styles.allInput}>
      {bodyResize.width > 800 && (
        <div
          className={styles.allInput_icon}
          onClick={() => {
            setDownloadModal((d) => ({ ...d, open: true }))
          }}
        >
          <CloudDownloadOutlined />
        </div>
      )}
      <div
        className={styles.allInput_icon}
        onClick={() => {
          if (!props.disabled) {
            props?.clearMessage?.()
          } else {
            message.warning('계속하기 전에 답변을 완료해 주세요.')
          }
        }}
      >
        <ClearOutlined />
      </div>
      <AutoComplete
        value={prompt}
        options={searchOptions}
        style={{
          width: '100%',
          maxWidth: 800
        }}
        onSelect={(value) => {
        //여기서 선택 후 바로 전송
 // props?.onSend?.(값)
 // 입력 상자를 지웁니다.
 //선택하여 입력 상자에 배치하도록 수정합니다.
          setPrompt(value)
        }}
      >
        <Input.TextArea
          value={prompt}
          // showCount
          size="large"
          placeholder="무엇이든 물어보세요..."
          // (Shift + Enter = 개행)
          autoSize={{
            maxRows: 4
          }}
          onPressEnter={(e) => {
            if (e.key === 'Enter' && e.keyCode === 13 && e.shiftKey) {
              // === 조치 없음 ===
            } else if (e.key === 'Enter' && e.keyCode === 13 && bodyResize.width > 800) {
              if (!props.disabled) {
                props?.onSend?.(prompt)
                setPrompt('')
              }
              e.preventDefault() //캐리지 리턴을 비활성화하는 기본 줄 바꿈
            }
          }}
          onChange={(e) => {
            setPrompt(e.target.value)
          }}
        />
      </AutoComplete>
      {props.disabled ? (
        <Button
          className={styles.allInput_button}
          type="primary"
          size="large"
          ghost
          danger
          disabled={!props.disabled}
          onClick={() => {
            props.onStopFetch?.()
          }}
        >
          <SyncOutlined spin /> 응답 중지 
        </Button>
      ) : (
        <Button
          className={styles.allInput_button}
          type="primary"
          size="large"
          disabled={!prompt || props.disabled}
          onClick={() => {
            
            console.log(prompt)
            props?.onSend?.(prompt)
            setPrompt('')
          }}

        >
          전송
        </Button>
      )}

      <Modal
        title="현재 대화 기록 저장"
        open={downloadModal.open}
        onOk={() => {
          downloadChatRecords()
        }}
        confirmLoading={downloadModal.loading}
        onCancel={() => {
          setDownloadModal({ open: false, loading: false })
        }}
      >
        <p>현재 대화 기록을 사진으로 저장하시겠습니까?</p>
      </Modal>
    </div>
  )
}

export default AllInput
