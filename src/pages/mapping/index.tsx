import React, { useState, useRef, useEffect } from 'react'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import Layout from '@/components/Layout'
import styles from './index.module.less'
import { Button, Input, Space, message } from 'antd'
import { postChatCompletion } from '@/request/api'
import { handleChatData, htmlToImage, textToMdFile } from '@/utils'
import { FileImageOutlined, FileMarkdownOutlined } from '@ant-design/icons'

const initValue = `# ChatGptWeb 
## 기본 기능
- AI 채팅 지원
-GPT4 지원
- DLLAE2 지원
- 중간 여정 지원
- 마인드맵 생성 지원
- 더 많은 기능이 여러분의 탐험을 기다리고 있습니다...

## 더 많은 콘텐츠
- 위에서 생성하려는 내용을 입력하세요.
- 생성하려면 클릭하세요.
`

function MappingPage() {
  const transformer = new Transformer()
  const [value, setValue] = useState(initValue)
  const refSvg = useRef<SVGSVGElement>(null)
  const refMm = useRef<Markmap>()

  const [inputOptions, setInputOptions] = useState({
    value: '',
    loading: false
  })

  useEffect(() => {
    if (refSvg && refSvg.current && !refMm.current) {
      const mm = Markmap.create(refSvg.current)
      refMm.current = mm
    }
  }, [refSvg.current])

  useEffect(() => {
    // Update data for markmap once value is changed
    const mm = refMm.current
    if (mm) {
      const { root } = transformer.transform(value)
      mm.setData(root)
      mm.fit()
    }
  }, [refMm.current, value])

  async function onFetchChat() {
    setInputOptions((i) => ({ ...i, loading: true }))
    const response = await postChatCompletion({
      prompt: inputOptions.value,
      type: 'mapping'
    })
      .then((res) => {
        return res
      })
      .catch((error) => {
        setInputOptions((i) => ({ ...i, loading: false }))
        return error
      })

    const reader = response.body?.getReader?.()
    let allContent = ''
    while (true) {
      const { done = true, value } = (await reader?.read()) || {}
      if (done) {
        setInputOptions((i) => ({ ...i, loading: false }))
        break
      }
      // 획득한 데이터 조각을 화면에 표시
      const text = new TextDecoder('utf-8').decode(value)
      console.log(text)
      const texts = handleChatData(text)
      for (let i = 0; i < texts.length; i++) {
        const { content, segment } = texts[i]
        allContent += content ? content : ''
        if (segment === 'stop') {
          setInputOptions((i) => ({ ...i, loading: false }))
          break
        }

        if (segment === 'start') {
          setValue(allContent)
        }
        if (segment === 'text') {
          setValue(allContent)
        }
      }
    }
  }

  function onExportImage() {
    htmlToImage('mind-mapping-wrapper')
      .then(() => {
        message.success('다운로드 성공')
      })
      .catch(() => {
        message.error('다운로드 실패')
      })
  }

  function onExportMd() {
    if (!value) {
      message.warning('아직 데이터 내보내기가 없습니다.')
      return
    }
    textToMdFile(value)
      .then(() => {
        message.success('다운로드 성공')
      })
      .catch(() => {
        message.error('다운로드 실패')
      })
  }

  return (
    <div className={styles.mapping}>
      <Layout>
        <div className={styles.mapping_content}>
          <div id="mind-mapping-wrapper">
            <svg className={styles.mapping_svg} ref={refSvg} />
          </div>
          <div className={styles.mapping_input}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Input.TextArea
                autoSize={{
                  minRows: 6,
                  maxRows: 6
                }}
                placeholder="생성하고 싶은 콘텐츠에 대한 설명을 입력하시면 AI가 마인드맵을 생성해 드립니다!"
                onChange={(e) => {
                  setInputOptions((i) => ({ ...i, value: e.target.value }))
                }}
              />

              <div className={styles.mapping_exports}>
                <div onClick={onExportMd}>
                  <FileMarkdownOutlined /> MD 수출
                </div>
                <div onClick={onExportImage}>
                  <FileImageOutlined /> 사진 내보내기
                </div>
                <Button
                  block
                  type="primary"
                  size="large"
                  disabled={!inputOptions.value}
                  loading={inputOptions.loading}
                  onClick={onFetchChat}
                >
                  지능적인 마인드맵 생성
                </Button>
              </div>
            </Space>
          </div>
        </div>
      </Layout>
    </div>
  )
}

export default MappingPage
