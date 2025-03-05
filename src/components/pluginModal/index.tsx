import { Button, Empty, Modal, Tabs } from 'antd'
import styles from './index.module.less'
import { pluginStore } from '@/store'
import { PluginInfo } from '@/types'
import AppCard from '../appCard'
import { CloseCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { putInstalledPlugin, putUninstallPlugin } from '@/request/api'
import { useMemo } from 'react'

type Props = {
  open: boolean
  onCancel: () => void
}

function PluginModal(props: Props) {
  const { plugins, changeIsInstalled } = pluginStore()

  const installPlugins = useMemo(() => {
    return plugins.filter(item => item.installed)
  }, [plugins])

  function PluginListCard({ data }: { data: Array<PluginInfo> }) {
    return (
      <div key={Date.now().toString()}>
        {
          data.length > 0 ? (
            <div className={styles.pluginList}>
              {data.map((item) => {
                return (
                  <AppCard
                    key={item.id}
                    title={item.name}
                    buttons={[
                      <>
                        {
                          item.installed ? (
                            <p key="anzhuang"
                              style={{
                                color: 'red'
                              }}
                              onClick={() => {
                                putUninstallPlugin(item.id).then(() => {
                                  changeIsInstalled({
                                    id: item.id,
                                    type: 'uninstall'
                                  })
                                })
                              }}
                            >
                              <CloseCircleOutlined /> 제거
                            </p>
                          ) : (
                            <p key="anzhuang" onClick={
                              () => {
                                putInstalledPlugin(item.id).then(() => {
                                  changeIsInstalled({
                                    id: item.id,
                                    type: 'install'
                                  })
                                })
                              }}
                            >
                              <PlusCircleOutlined /> 설치하다
                            </p>
                          )
                        }

                      </>
                    ]
                    }
                    message={item.update_time}
                    userInfo={item.user}
                    {...item}
                  />
                )
              })}
            </div>
          ) : (
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            >
              {data.length <= 0 && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="아직 데이터가 없습니다" />
              )}
            </div>
          )
        }

      </div>
    )
  }


  return (
    <Modal title="AI 스마트 플러그인" open={props.open} width={700} footer={null} onCancel={props.onCancel}>
      <Tabs
        // tabBarExtraContent={<Button>플러그인 생성</Button>}
        items={[
          {
            label: '시장',
            key: 'shichang',
            children: <PluginListCard key="shichang" data={plugins} />
          },
          {
            label: '설치됨',
            key: 'yianzhuang',
            children: <PluginListCard key="yianzhuang" data={installPlugins} />
          }
        ]}
      />
    </Modal>
  )
}

export default PluginModal
