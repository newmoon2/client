import recommend from '@/assets/recommend.json'
import styles from './index.module.less'
import { is } from '@/utils'
import { FolderAddOutlined, LinkOutlined } from '@ant-design/icons'
import { Input, message } from 'antd'
import { useState } from 'react'
import { promptStore } from '@/store'

function RoleNetwork() {
  const { addPrompts } = promptStore()

  //   const emoji = () => {
  // return Object.keys(emojis)[Math.floor(Math.random() * Object.keys(emojis).length)];
  //   }

  const [downloadUrl, setDownloadUrl] = useState('')
  const downloadJson = async (url: string) => {
    if (!is.isValidUrl(url)) {
      message.error('올바른 URL을 입력하세요. ')
      return
    }
    const response = await fetch(url)
    const jsonData = await response.json()
    if (!Array.isArray(jsonData) || jsonData.length <= 0) {
      message.error('데이터 형식이 잘못되었습니다.')
      return
    }
    if ('key' in jsonData[0] && 'value' in jsonData[0]) {
      addPrompts([...jsonData])
    } else if ('act' in jsonData[0] && 'prompt' in jsonData[0]) {
      const newJsonData = jsonData.map((item: { act: string; prompt: string }) => {
        return {
          key: item.act,
          value: item.prompt
        }
      })
      addPrompts([...newJsonData])
    } else {
      message.error('데이터 형식이 잘못되었습니다.')
      return
    }
    message.success('성공적으로 추가되었습니다')
    setDownloadUrl('')
  }

  return (
    <div className={styles.roleNetwork}>
      <Input.Search
        placeholder="JSON 데이터 형식 링크를 입력하세요."
        allowClear
        enterButton="다운로드"
        size="large"
        value={downloadUrl}
        onChange={(e) => {
          setDownloadUrl(e.target.value)
        }}
        onSearch={(e) => {
          if (!e) return
          downloadJson(e)
        }}
        style={{
          marginBottom: 20
        }}
      />
      {recommend.map((item) => {
        return (
          <div className={styles.roleNetwork_item} key={item.key}>
            <p>{item.desc}</p>
            <div className={styles.roleNetwork_item_operate}>
              <LinkOutlined
                onClick={() => {
                  window.open(item.url, '_blank')
                }}
              />
              <FolderAddOutlined
                onClick={() => {
                  setDownloadUrl(item.downloadUrl)
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RoleNetwork
