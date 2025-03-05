import styles from './index.module.less'
import {
  Button,
  Empty,
  Input,
  Image,
  Radio,
  Slider,
  Space,
  Popconfirm,
  notification,
  message,
  Segmented,
  Select,
  Upload
} from 'antd'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { drawStore, userStore } from '@/store'
import { drawAsync } from '@/store/async'
import OpenAiLogo from '@/components/OpenAiLogo'
import { postChatCompletion, postImagesGenerations } from '@/request/api'
import {
  CaretDownOutlined,
  CaretUpOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  ClearOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  CloseOutlined,
  LoadingOutlined,
  SyncOutlined
} from '@ant-design/icons'
import { formatTime, generateUUID, handleChatData } from '@/utils'
import { ResponseData } from '@/request'
import Layout from '@/components/Layout'
import { DrawRecord } from '@/types'
import ImageCard from './ImageCard'

const drawSize = [
  {
    label: '256px',
    value: 256
  },
  {
    label: '320px',
    value: 320
  },
  {
    label: '356px',
    value: 356
  },
  {
    label: '468px',
    value: 468
  },
  {
    label: '512px',
    value: 512
  },
  {
    label: '640px',
    value: 640
  },
  {
    label: '704px',
    value: 704
  },
  {
    label: '768px',
    value: 768
  },
  {
    label: '832px',
    value: 832
  },
  {
    label: '896px',
    value: 896
  },
  {
    label: '960px',
    value: 960
  },
  {
    label: '1024px',
    value: 1024
  }
]

const stylePresets = [
  { label: '스타일 없음', value: '' },
  { label: '3D 모델', value: '3d-model' },
  { label: '아날로그 필름', value: 'analog-film' },
  { label: '만화', value: 'anime' },
  { label: '영화', value: 'cinematic' },
  { label: '만화', value: 'comic-book' },
  { label: '디지털 아트', value: 'digital-art' },
  { label: '증강현실', value: 'enhance' },
  { label: '판타지 아트', value: 'fantasy-art' },
  { label: '등각 투영', value: 'isometric' },
  { label: '라인 아트', value: 'line-art' },
  { label: '낮은 다각형', value: 'low-poly' },
  { label: '점토 모델링', value: 'modeling-compound' },
  { label: '네온 펑크', value: 'neon-punk' },
  { label: '종이접기 예술', value: 'origami' },
  { label: '사진술', value: 'photographic' },
  { label: '픽셀 아트', value: 'pixel-art' },
  { label: '타일 ​​텍스처', value: 'tile-texture' }
]

function DrawPage() {
  const { token, setLoginModal } = userStore()
  const { galleryDrawImages, historyDrawImages, clearhistoryDrawImages, addDrawImage } = drawStore()

  const containerOneRef = useRef<HTMLDivElement>(null)
  const containerTwoRef = useRef<HTMLDivElement>(null)
  const [bottom, setBottom] = useState(0)

  const [collapse, setCollapse] = useState(true)
  const [gptLoading, setGptLoading] = useState(false)

  const [drawRecordData, setDrawRecordData] = useState({
    isAll: false,
    loading: false,
    page: 1,
    page_size: 20,
    type: 'me'
  })

  async function getDrawListData({ page = 1, type = 'me' }: { page?: number, type?: string }) {
    setDrawRecordData(data => ({ ...data, type, loading: true }))
    const result = await drawAsync.fetchDrawImages({ ...drawRecordData, page, type })
    if (result.code) {
      setDrawRecordData(data => ({ ...data, type, loading: false }))
      return
    }
    let isAll = false
    if (result.data.rows.length <= 0) {
      isAll = true
    }
    setDrawRecordData(data => ({ ...data, page, type, loading: false, isAll }))
  }

  useEffect(() => {
    if (token) {
      getDrawListData({ ...drawRecordData })
    } else {
      handleScroll()
      getDrawListData({ ...drawRecordData, type: 'gallery' })
    }
  }, [token])

  const [drawConfig, setDrawConfig] = useState<{
    prompt: string
    quantity: number
    width: number
    height: number
    quality?: number
    steps?: number
    style?: string
    image?: File | string
  }>({
    prompt: '',
    quantity: 1,
    width: 512,
    height: 512,
    quality: 7,
    steps: 50,
    style: '',
    image: ''
  })

  const [showImage, setShowImage] = useState<string | ArrayBuffer | null>('')
  const [drawType, setDrawType] = useState('openai')
  const [drawResultData, setDrawResultData] = useState<{
    loading: boolean
    list: Array<DrawRecord>
  }>({
    loading: false,
    list: []
  })
  const handleDraw = (res: ResponseData<Array<DrawRecord>>) => {
    if (res.code || res.data.length <= 0) {
      message.error('요청 오류')
      return
    }
    setDrawResultData({
      loading: false,
      list: res.data
    })
    const addImagesData = res.data.map((item) => {
      return {
        ...item,
        ...drawConfig,
        draw_type: drawType,
        id: generateUUID(),
        dateTime: formatTime()
      }
    })
    addDrawImage(addImagesData)
  }

  const onStartDraw = async () => {
    if (gptLoading) {
      message.warning('프롬프트 단어 최적화가 완료될 때까지 기다려 주십시오.')
      return
    }
    if (!drawConfig.prompt) {
      message.warning('프롬프트 단어를 입력하세요')
      return
    }
    if (!token) {
      setLoginModal(true)
      return
    }
    setDrawResultData({
      loading: true,
      list: []
    })

    await postImagesGenerations(
      {
        ...drawConfig,
        draw_type: drawType
      },
      {},
      { timeout: 0 }
    )
      .then(handleDraw)
      .finally(() => {
        setDrawResultData((dr) => ({ ...dr, loading: false }))
      })
  }

  async function optimizePrompt() {
    setGptLoading(true)
    const response = await postChatCompletion({
      prompt: drawConfig.prompt,
      type: 'draw'
    })
      .then((res) => {
        return res
      })
      .catch((error) => {
        setGptLoading(false)
        return error
      })

    const reader = response.body?.getReader?.()
    let allContent = ''
    while (true) {
      const { done = true, value } = (await reader?.read()) || {}
      if (done) {
        setGptLoading(false)
        break
      }
      // 획득한 데이터 조각을 화면에 표시
      const text = new TextDecoder('utf-8').decode(value)
      const texts = handleChatData(text)
      for (let i = 0; i < texts.length; i++) {
        const { content, segment } = texts[i]
        allContent += content ? content : ''
        if (segment === 'stop') {
          setGptLoading(false)
          break
        }

        if (segment === 'start') {
          setDrawConfig((config) => ({ ...config, prompt: allContent }))
        }
        if (segment === 'text') {
          setDrawConfig((config) => ({ ...config, prompt: allContent }))
        }
      }
    }
  }

  const handleScroll = () => {
    const twoClientHeight = containerTwoRef.current?.clientHeight || 0
    const oneScrollTop = containerOneRef.current?.scrollTop || 0
    const clientHeight = containerOneRef.current?.clientHeight || 0
    const scrollHeight = containerOneRef.current?.scrollHeight || 0
    if (!drawRecordData.loading && !drawRecordData.isAll && (oneScrollTop + clientHeight + 40) >= scrollHeight) {
      getDrawListData({
        page: drawRecordData.page + 1,
        type: drawRecordData.type
      })
    }

    if (drawRecordData.type === 'gallery') {
      setBottom(-(twoClientHeight + 100))
      return
    }

    if (oneScrollTop > 100) {
      setBottom(-(twoClientHeight + 100))
    } else {
      setBottom(0)
    }
  }

  useLayoutEffect(() => {
    containerOneRef.current?.addEventListener('scroll', handleScroll)
    return () => {
      containerOneRef.current?.removeEventListener('scroll', handleScroll)
    }
  }, [drawRecordData])

  function SegmentedLabel({ icon, title }: { icon: string; title: string }) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img style={{ width: 24, marginRight: 4 }} src={icon} alt={title} />
        <span style={{ fontWeight: 500 }}>{title}</span>
      </div>
    )
  }

  const showFile = async (file: any) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setShowImage(reader.result)
    }
  }

  function DrawPageHeader(props: { type: string }) {
    return (
      <div className={styles.drawPage_mydraw_header}>
        <div>
          <h4>{props.type === 'me' ? '내 그림' : '그림 광장'}</h4>
          <p>{props.type === 'me' ? '제때에 그림 사진을 저장하세요. 링크가 유효하지 않을 수 있습니다.' : '모든 사람이 사용할 수 있도록 좋은 작품을 제출할 수 있습니다.'}</p>
        </div>
        {
          props.type === 'me' && (
            <Popconfirm
              title="명확한 역사 그림"
              description="모든 그림 데이터를 삭제하시겠습니까?"
              onConfirm={() => {
                drawAsync.fetchSetDrawImages({ status: 0 })
              }}
              okText="Yes"
              cancelText="No"
            >
              <ClearOutlined className={styles.drawPage_mydraw_header_icon} />
            </Popconfirm>
          )
        }
      </div>
    )
  }

  function DrawEmpty({ isShow }: { isShow: boolean }) {
    if (!isShow) return
    return <Empty style={{ paddingTop: 100 }} image={Empty.PRESENTED_IMAGE_SIMPLE} description="아직 그림 기록이 없습니다" />
  }

  const drawImagesList = useMemo(() => {
    if (drawRecordData.type === 'me') {
      return [...historyDrawImages]
    }
    return [...galleryDrawImages]
  }, [drawRecordData, historyDrawImages, galleryDrawImages])

  return (
    <div className={styles.drawPage}>
      <Layout>
        <div className={styles.drawPage_container}>
          <div className={styles.drawPage_container_one} ref={containerOneRef}>
            <div className={styles.drawPage_header}>
              <img src="https://u1.dl0.cn/icon/Midjourneybf2f31b4a2ac2dc9.png" alt="Midjourney" />
              <h2>AI를 사용하여 멋진 그림을 만드세요</h2>
              <h4>당신의 말을 그림으로 바꾸는 단 한 문장</h4>
            </div>
            <div
              className={styles.drawPage_create}
              style={{
                minHeight: drawResultData.loading || drawResultData.list.length > 0 ? '' : 0
              }}
            >
              {drawResultData.loading && <OpenAiLogo rotate width="3em" height="3em" />}
              <Image.PreviewGroup>
                {drawResultData.list.map((item) => {
                  return (
                    <Image
                      className={styles.drawPage_image}
                      key={item.images?.[0]}
                      width={220}
                      src={item.images?.[0]}
                    />
                  )
                })}
              </Image.PreviewGroup>
            </div>
            <div className={styles.drawPage_selectTab}>
              <Segmented
                defaultValue="me"
                value={drawRecordData.type}
                onChange={(value: any) => {
                  if (value === 'me' && !token) {
                    setLoginModal(true)
                    return
                  }
                  handleScroll()
                  setDrawRecordData(data => ({ ...data, type: value, page: 1, isAll: false }))
                  getDrawListData({ page: 1, type: value })
                }}
                options={[
                  {
                    value: 'me',
                    label: '내 그림'
                  },
                  {
                    value: 'gallery',
                    label: '그림 광장'
                  }
                ]}
              />
            </div>
            <div className={styles.drawPage_mydraw}>
              <DrawPageHeader type={drawRecordData.type} />
              <DrawEmpty isShow={
                drawRecordData.type === 'me' && historyDrawImages.length <= 0
                ||
                drawRecordData.type === 'gallery' && galleryDrawImages.length <= 0
              }
              />

              <Image.PreviewGroup>
                <div className={styles.drawPage_mydraw_list}>
                  {
                    drawImagesList.map((item) => {
                      return (
                        <ImageCard
                          key={item.id}
                          {...item}
                          type={drawRecordData.type}
                          onClickOperate={(id, status) => {
                            drawAsync.fetchSetDrawImages({ id, status }).then((res) => {
                              if (!res.code) {
                                message.success('작업 성공')
                              } else {
                                message.error('작업 실패')
                              }
                            })
                          }}
                        />
                      )
                    })
                  }
                </div>
              </Image.PreviewGroup>
              <div className={styles.drawPage_container_footer}>
                {
                  drawRecordData.loading ? <span><SyncOutlined spin /> 로드 중...</span> :
                    drawRecordData.isAll ? <span>- 나에게도 결론이 있다 -</span> :
                      <span />
                }
              </div>
            </div>
          </div>
          <div
            className={styles.drawPage_container_two}
            style={{
              bottom: bottom
            }}
            ref={containerTwoRef}
          >
            <div className={styles.drawPage_config}>
              <div
                style={{
                  paddingLeft: 20,
                  paddingRight: 20
                }}
              >
                <div
                  className={styles.drawPage_config_collapse}
                  onClick={() => {
                    setCollapse((c) => {
                      return !c
                    })
                  }}
                >
                  {' '}
                  {collapse ? (
                    <p>
                      <CaretUpOutlined /> <span style={{ fontSize: 12 }}>구성 확장</span>
                    </p>
                  ) : (
                    <p>
                      <CaretDownOutlined /> <span style={{ fontSize: 12 }}>축소 구성</span>
                    </p>
                  )}{' '}
                </div>
                <Segmented
                  block
                  value={drawType}
                  style={{
                    backgroundImage: 'linear-gradient(120deg, #a6c0fe 0%, #f68084 100%)'
                  }}
                  onChange={(e) => {
                    setDrawType(e.toString())
                  }}
                  options={[
                    {
                      label: useMemo(
                        () => (
                          <SegmentedLabel
                            icon="https://u1.dl0.cn/icon/openai_draw_icon.png"
                            title="OpenAI"
                          />
                        ),
                        []
                      ),
                      value: 'openai'
                    },
                    {
                      label: useMemo(
                        () => (
                          <SegmentedLabel
                            icon="https://u1.dl0.cn/icon/sd_draw_icon.png"
                            title="StableDiffusion"
                          />
                        ),
                        []
                      ),
                      value: 'stablediffusion'
                    }
                  ]}
                />
                <div
                  className={styles.drawPage_config_options}
                  style={{
                    maxHeight: collapse ? 0 : '300px'
                  }}
                >
                  <div className={styles.drawPage_config_group}>
                    <div className={styles.drawPage_config_item}>
                      <p>이미지 너비:</p>
                      <Select
                        defaultValue={drawConfig.width}
                        value={drawConfig.width}
                        options={drawSize}
                        onChange={(e) => {
                          setDrawConfig((c) => ({ ...c, width: e }))
                        }}
                      />
                    </div>
                    <div className={styles.drawPage_config_item}>
                      <p>이미지 높이:</p>
                      <Select
                        defaultValue={drawConfig.height}
                        value={drawConfig.height}
                        options={drawSize}
                        onChange={(e) => {
                          setDrawConfig((c) => ({ ...c, height: e }))
                        }}
                      />
                    </div>
                    {/* <div className={styles.drawPage_config_item}>
                      <p>수량 생성({drawConfig.quantity}张)：</p>
                      <Slider
                        defaultValue={drawConfig.quantity}
                        value={drawConfig.quantity}
                        min={1}
                        max={10}
                        onChange={(e) => {
                          setDrawConfig((c) => ({ ...c, quantity: e }))
                        }}
                      />
                    </div> */}
                  </div>
                  {drawType === 'stablediffusion' && (
                    <div className={styles.drawPage_config_group}>
                      <div className={styles.drawPage_config_item}>
                        <p>최적화 시간({drawConfig.steps})：</p>
                        <Slider
                          defaultValue={drawConfig.steps}
                          value={drawConfig.steps}
                          min={10}
                          max={150}
                          onChange={(e) => {
                            setDrawConfig((c) => ({ ...c, steps: e }))
                          }}
                        />
                      </div>
                      <div className={styles.drawPage_config_item}>
                        <p>이미지 품질({drawConfig.quality})：</p>
                        <Slider
                          defaultValue={drawConfig.quality}
                          value={drawConfig.quality}
                          min={1}
                          max={37}
                          onChange={(e) => {
                            setDrawConfig((c) => ({ ...c, quality: e }))
                          }}
                        />
                      </div>
                      <div className={styles.drawPage_config_item}>
                        <p>이미지 스타일:</p>
                        <Select
                          defaultValue={drawConfig.style}
                          value={drawConfig.style}
                          options={stylePresets}
                          clearIcon
                          onChange={(e) => {
                            setDrawConfig((c) => ({ ...c, style: e }))
                          }}
                        />
                        {/* <Radio.Group onChange={(e) => {
                      const { value } = e.target;
                      if (value === drawConfig.style) {
                        setDrawConfig((c) => ({ ...c, style: '' }))
                        return
                      }
                      setDrawConfig((c) => ({ ...c, style: value }))
                    }} defaultValue={drawConfig.style} value={drawConfig.style}
                    >
                      <div className={styles.drawPage_config_stylePresets}>
                        {stylePresets.map((item) => {
                          const stylePresetsClassName = drawConfig.style === item.value ?
                            `${styles.drawPage_config_stylePresets_item} ${styles.drawPage_config_stylePresets_select}` : styles.drawPage_config_stylePresets_item
                          return (
                            <div className={stylePresetsClassName} key={item.value}>
                              <Radio value={item.value}><span className={styles.drawPage_config_stylePresets_item_text}>{item.label}</span></Radio>
                            </div>
                          )
                        })}
                      </div>
                    </Radio.Group> */}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.drawPage_config_input}>
                <Upload
                  maxCount={1}
                  accept="image/*"
                  disabled={drawType === 'openai'}
                  showUploadList={false}
                  customRequest={(options) => {
                    showFile(options.file)
                    setDrawConfig((config) => ({ ...config, image: options.file as File }))
                  }}
                >
                  <div
                    className={styles.drawPage_config_input_image}
                    style={{
                      opacity: drawType === 'stablediffusion' ? 1 : 0.6,
                      cursor: drawType === 'stablediffusion' ? 'pointer' : 'not-allowed',
                      backgroundImage: drawConfig.image && showImage ? `url(${showImage})` : ''
                    }}
                  >
                    사진 업로드
                    {drawConfig.image && (
                      <div
                        className={styles.drawPage_config_input_image_close}
                        onClick={(e) => {
                          setDrawConfig((config) => ({ ...config, image: '' }))
                          setShowImage('')
                          e.stopPropagation()
                        }}
                      >
                        <CloseCircleOutlined />
                      </div>
                    )}
                  </div>
                </Upload>
                <Input.TextArea
                  autoSize={{
                    minRows: 3,
                    maxRows: 3
                  }}
                  defaultValue={drawConfig.prompt}
                  value={drawConfig.prompt}
                  onChange={(e) => {
                    setDrawConfig((config) => ({ ...config, prompt: e.target.value }))
                  }}
                  style={{
                    borderRadius: 0
                  }}
                  placeholder="더 나은 결과를 위해 프롬프트 단어를 최적화하려면 최적화 복사 기능을 확인하세요!"
                />
                <div className={styles.drawPage_config_input_buttons}>
                  <div onClick={optimizePrompt}>{gptLoading && <LoadingOutlined />} 카피라이팅 최적화</div>
                  <div onClick={onStartDraw}>
                    {drawResultData.loading && <LoadingOutlined />} 이미지 생성
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}

export default DrawPage
