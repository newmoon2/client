import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Form,
  Pagination,
  QRCode,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message
} from 'antd'
import Layout from '@/components/Layout'
import { getCode, getSigninList, postSignin } from '@/request/api'
import { userAsync } from '@/store/async'
import { configStore, userStore } from '@/store'
import styles from './index.module.less'
import { ConsumeRecordInfo, InvitationRecordInfo, SigninInfo, WithdrawalRecordInfo } from '@/types'
import { formatTime, transform } from '@/utils'
import UserInfoCard from '@/components/UserInfoCard'
import {
  ModalForm,
  ProFormCaptcha,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormText,
  ProFormTextArea
} from '@ant-design/pro-components'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { fetchUserPassword, fetchUserRecords, fetchUserWithdrawal } from '@/store/user/async'
import { useNavigate } from 'react-router-dom'
import { ColumnsType } from 'antd/es/table'

const monthAbbreviations = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
]

function UserPage() {
  const navigate = useNavigate()
  const { token, user_info, invitation_records, consume_records, withdrawal_records } = userStore()
  const { user_introduce, invite_introduce } = configStore()
  const [userAccountForm] = Form.useForm()
  const [signinLoading, setSigninLoading] = useState(false)
  const [signinList, setSigninList] = useState<Array<SigninInfo>>([])
  const [withdrawalForm] = Form.useForm()

  const [userAccountModal, setUserAccountModal] = useState({
    open: false,
    title: '정보 수정',
    type: ''
  })

  const [withdrawalInfoModal, setWithdrawalInfoModal] = useState({
    open: false
  })

  const [tableOptions, setTableOptions] = useState<{
    page: number
    page_size: number
    type: number | string
    loading: boolean
  }>({
    page: 1,
    page_size: 10,
    loading: false,
    type: 'invitation_records'
  })

  const invitationRecordColumns: ColumnsType<InvitationRecordInfo> = [
    {
      title: '등록자',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (_, data) => {
        return <Tag>{data.user.account}</Tag>
      }
    },
    // {
    //   title: '邀请码',
    //   dataIndex: 'invite_code',
    //   key: 'invite_code'
    // },
    {
      title: '상',
      dataIndex: 'reward',
      key: 'reward',
      render: (_, data) => {
        return <a>{data.reward}积分</a>
      }
    },
    {
      title: '주목',
      dataIndex: 'remark',
      key: 'remark'
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (_, data) => {
        if (data.status === 3) {
          return <Tag color="orange">검토중</Tag>
        }
        if (data.status) {
          return <Tag color="green">성공적으로 발급됨</Tag>
        }
        return <Tag color="red">특이한 초대</Tag>
      }
    },
    {
      title: '생성 시간',
      dataIndex: 'create_time',
      key: 'create_time'
    }
  ]

  const consumeRecordColumns: ColumnsType<ConsumeRecordInfo> = [
    {
      title: '소비자 사용자',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (_, data) => {
        return <Tag>{data.user.account}</Tag>
      }
    },
    {
      title: '결제금액',
      dataIndex: 'pay_amount',
      key: 'pay_amount',
      render: (_, data) => {
        return <a>{Number(data.pay_amount) / 100}元</a>
      }
    },
    {
      title: '수수료 비율',
      dataIndex: 'commission_rate',
      key: 'commission_rate',
      render: (_, data) => {
        return <a>{data.commission_rate}%</a>
      }
    },
    {
      title: '수수료 금액',
      dataIndex: 'commission_amount',
      key: 'commission_amount',
      render: (_, data) => {
        return <a>{Number(data.commission_amount) / 100}元</a>
      }
    },
    {
      title: '주목',
      dataIndex: 'remarks',
      key: 'remarks'
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (_, data) => {
        if (data.status === 3) {
          return <Tag color="orange">검토중</Tag>
        }
        if (data.status) {
          return <Tag color="green">성공적으로 발급됨</Tag>
        }
        return <Tag color="red">비정상적인 소비</Tag>
      }
    },
    {
      title: '생성 시간',
      dataIndex: 'create_time',
      key: 'create_time'
    }
  ]
  const withdrawalRecordColumns: ColumnsType<WithdrawalRecordInfo> = [
    // {
    // 제목: '이름',
 // 데이터인덱스: '이름',
 // 키: '이름'
 // },
 // {
 // 제목: '연락처 정보',
 // 데이터 인덱스: '연락처',
 // 키: '연락처'
    // },
    {
      title: '결제수단',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (_, data) => {
        switch (data.type) {
          case 'wxpay':
            return <Tag>위챗페이</Tag>
          case 'qqpay':
            return <Tag>QQ 결제</Tag>
          case 'alipay':
            return <Tag>알리페이</Tag>
          default:
            return '-'
        }
      }
    },
    {
      title: '결제계좌번호',
      dataIndex: 'account',
      key: 'account',
      width: 140
    },
    {
      title: '출금금액',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (_, data) => {
        return <Tag>{transform.centToYuan(data.amount)}元</Tag>
      }
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_, data) => {
        if (data.status === 3) {
          return <Tag color="orange">검토를 기다리는 중</Tag>
        }
        if (data.status === 1) {
          return <Tag color="green">결제 성공</Tag>
        }
        return <Tag color="red">비정상적인 금단</Tag>
      }
    },
    {
      title: '메모/답글',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 120,
      ellipsis: {
        showTitle: false
      },
      render: (_, data) => <Tooltip title={data.remarks}>{data.remarks}</Tooltip>
    },
    {
      title: '메시지',
      dataIndex: 'message',
      key: 'message',
      width: 120,
      ellipsis: {
        showTitle: false
      },
      render: (_, data) => <Tooltip title={data.message}>{data.message}</Tooltip>
    },
    {
      title: '생성 시간',
      dataIndex: 'create_time',
      key: 'create_time'
    }
  ]

  const getTableColumns: any = useMemo(() => {
    if (tableOptions.type === 'invitation_records') {
      return [...invitationRecordColumns]
    }

    if (tableOptions.type === 'consume_records') {
      return [...consumeRecordColumns]
    }

    if (tableOptions.type === 'withdrawal_records') {
      return [...withdrawalRecordColumns]
    }
    return []
  }, [tableOptions.type])

  const getTableData: { count: number; rows: Array<any> } = useMemo(() => {
    if (tableOptions.type === 'invitation_records') {
      return { ...invitation_records }
    }

    if (tableOptions.type === 'consume_records') {
      return { ...consume_records }
    }

    if (tableOptions.type === 'withdrawal_records') {
      return { ...withdrawal_records }
    }
    return { count: 0, rows: [] }
  }, [tableOptions.type, withdrawal_records, consume_records, invitation_records])

  function onFetchSigninList() {
    if (!token) return
    getSigninList().then((res) => {
      if (res.code) return
      setSigninList(res.data)
    })
  }

  const monthDays = useMemo(() => {
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    const daysInMonth = new Date(year, month, 0).getDate()
    const dateArray = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      return formatTime('yyyy-MM-dd', new Date(`${year}-${month}-${day}`))
    })
    return dateArray
  }, [])

  const userMonthDays = useMemo(() => {
    const dataList = signinList.map((item) => {
      return formatTime('yyyy-MM-dd', new Date(item.create_time))
    })
    return dataList
  }, [signinList])

  useEffect(() => {
    onUserRecords({ ...tableOptions })
    onFetchSigninList()
  }, [])

  function onUserRecords(params: { page: number; page_size: number; type: string | number }) {
    setTableOptions({
      type: params.type,
      page: params.page,
      page_size: params.page_size,
      loading: true
    })
    fetchUserRecords({
      ...params
    })
      .then((res) => {
        if (res.code) return
        setTableOptions((options) => ({ ...options, loading: false }))
      })
      .finally(() => {
        setTableOptions((options) => ({ ...options, loading: false }))
      })
  }

  return (
    <div className={styles.userPage}>
      <Layout>
        <div className={styles.userPage_container}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* 사용자 정보 */}
            <UserInfoCard info={user_info}>
              <div className={styles.userPage_operate}>
                {/* <Button block
                                    onClick={() => {
                                        setUserAccountModal({
                                            open: true,
                                            title: '계정 수정',
                                            type: 'account'
                                        })
                                        userAccountForm.setFieldsValue({
                                            account: user_info?.account
                                        })
                                    }}
                                >
                                    계정 수정
                                </Button> */}
                <Button
                  block
                  type="dashed"
                  danger
                  onClick={() => {
                    setUserAccountModal({
                      open: true,
                      title: '비밀번호 재설정',
                      type: 'password'
                    })
                    userAccountForm.setFieldsValue({
                      account: user_info?.account
                    })
                  }}
                >
                  비밀번호 재설정
                </Button>
              </div>
            </UserInfoCard>
            {user_introduce && (
              <div className={styles.userPage_card}>
                <h4>공고</h4>
                <div
                  dangerouslySetInnerHTML={{
                    __html: user_introduce
                  }}
                />
              </div>
            )}
            {/* 签到区域 */}
            <div className={styles.userPage_card}>
              <h4>로그인 캘린더({formatTime('yyyy年MM月', new Date(monthDays[0]))}）</h4>
              <Space direction="vertical">
                <div className={styles.userPage_signin}>
                  {monthDays.map((item) => {
                    const itemClassName = userMonthDays.includes(item)
                      ? `${styles.userPage_signin_item} ${styles.userPage_signin_selectTtem}`
                      : styles.userPage_signin_item
                    return (
                      <div key={item} className={itemClassName}>
                        <p>
                          {formatTime('dd', new Date(item)) === formatTime('dd')
                            ? '今'
                            : formatTime('dd', new Date(item))}
                        </p>
                        <p>{monthAbbreviations[Number(formatTime('MM', new Date(item))) - 1]}</p>
                      </div>
                    )
                  })}
                </div>
                <Button
                  loading={signinLoading}
                  type="primary"
                  block
                  disabled={!!user_info?.is_signin}
                  onClick={() => {
                    setSigninLoading(true)
                    postSignin()
                      .then((res) => {
                        if (res.code) return
                        userAsync.fetchUserInfo()
                        onFetchSigninList()
                        message.success(res.message)
                      })
                      .finally(() => {
                        setSigninLoading(false)
                      })
                  }}
                >
                  {user_info?.is_signin ? '오늘 로그인했습니다' : '지금 로그인하세요'}
                </Button>
              </Space>
            </div>
            <div className={styles.userPage_card}>
              <h4>초대링크/QR코드</h4>
              <div className={styles.userPage_invite}>
                <QRCode
                  size={160}
                  value={`${location.origin}/login?invite_code=${user_info?.invite_code}`}
                  color="#1877ff"
                />
                <div className={styles.userPage_invite_info}>
                  <p className={styles.userPage_invite_info_link}>
                    <Typography.Paragraph copyable style={{ marginBottom: 0, color: '#1877ff' }}>
                    초대 링크:{`${location.origin}/login?invite_code=${user_info?.invite_code}`}
                    </Typography.Paragraph>
                  </p>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: invite_introduce
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={styles.userPage_card}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <h4>커미션 데이터 초대</h4>
                  <Button
                    size="small"
                    onClick={() => {
                      withdrawalForm.resetFields()
                      setWithdrawalInfoModal({
                        open: true
                      })
                    }}
                  >
                    탈퇴 신청
                  </Button>
                </div>
                <div className={styles.userPage_invite_data}>
                  <div>
                    <p>오늘의 초대 수</p>
                    <span>{user_info?.today_invite_count}位</span>
                  </div>
                  <div>
                    <p>오늘의 소비량</p>
                    <span>{transform.centToYuan(user_info?.subordinate_today_pay_amount)}元</span>
                  </div>
                  <div>
                    <p>총 수익</p>
                    <span>{transform.centToYuan(user_info?.all_commission_amount)}元</span>
                  </div>
                  <div>
                    <p>균형</p>
                    <span>{transform.centToYuan(user_info?.current_amount)}元</span>
                  </div>
                </div>
                <Segmented
                  defaultValue={tableOptions.type}
                  value={tableOptions.type}
                  onChange={(e) => {
                    setTableOptions((options) => ({ ...options, page: 1, type: e, loading: true }))
                    onUserRecords({ ...tableOptions, page: 1, type: e })
                  }}
                  block
                  options={[
                    {
                      label: '초대기록',
                      value: 'invitation_records'
                    },
                    {
                      label: '소비기록',
                      value: 'consume_records'
                    },
                    {
                      label: '출금기록',
                      value: 'withdrawal_records'
                    }
                  ]}
                />
                <Table
                  scroll={{
                    x: 800
                  }}
                  bordered
                  loading={tableOptions.loading}
                  pagination={false}
                  rowKey="id"
                  dataSource={getTableData.rows}
                  columns={getTableColumns}
                />
                <div style={{ textAlign: 'right' }}>
                  <Pagination
                    size="small"
                    current={tableOptions.page}
                    defaultCurrent={tableOptions.page}
                    defaultPageSize={tableOptions.page_size}
                    total={getTableData.count}
                    onChange={(page: number, pageSize: number) => {
                      onUserRecords({ page, page_size: pageSize, type: tableOptions.type })
                    }}
                    hideOnSinglePage
                  />
                </div>
              </Space>
            </div>
          </Space>
        </div>
      </Layout>

      <ModalForm
        width={500}
        title={userAccountModal.title}
        open={userAccountModal.open}
        form={userAccountForm}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setUserAccountModal((ua) => ({ ...ua, open: false }))
          },
          okText: '제출하다'
        }}
        onFinish={(values) => {
          return fetchUserPassword(values)
            .then((res) => {
              if (res.code) return false
              message.success('재설정 성공')
              navigate('/login')
              return true
            })
            .catch(() => {
              return false
            })
        }}
      >
        <ProFormText
          fieldProps={{
            size: 'large',
            prefix: <UserOutlined />
          }}
          name="account"
          disabled
          rules={[
            {
              required: true,
            }
          ]}
        />
        <ProFormCaptcha
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />
          }}
          captchaProps={{
            size: 'large'
          }}
          placeholder="인증코드"
          captchaTextRender={(timing, count) => {
            if (timing) {
              return `${count} ${'인증 코드 받기'}`
            }
            return '인증 코드 받기'
          }}
          name="code"
          rules={[
            {
              required: true,
              message: '인증번호를 입력해주세요!'
            }
          ]}
          onGetCaptcha={async () => {
            const account = userAccountForm.getFieldValue('account')
            return new Promise((resolve, reject) =>
              getCode({ source: account })
                .then(() => resolve())
                .catch(reject)
            )
          }}
        />
        {userAccountModal.type === 'password' && (
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />
            }}
            placeholder="비밀번호를 입력해주세요"
            rules={[
              {
                required: true,
                message: '8자 이상의 영숫자',
                pattern: /^(?:[a-zA-Z]{8,}|\d{8,}|(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d]{8,})$/
              }
            ]}
          />
        )}

        {/*
                    {
                        userAccountModal.type === 'account' && (
                            <>
                                <ProFormText
                                    fieldProps={{
                                        size: 'large',
                                        prefix: <MailOutlined />
                                    }}
                                    name="new_account"
                                    placeholder="새 이메일"
                                    rules={[
                                        {
                                            required: true,
                                            message: '이메일 주소를 입력해주세요',
                                            pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
                                        }
                                    ]}
                                />
                                <ProFormCaptcha
                                    fieldProps={{
                                        size: 'large',
                                        prefix: <LockOutlined />
                                    }}
                                    captchaProps={{
                                        size: 'large'
                                    }}
                                    placeholder="인증코드"
                                    captchaTextRender={(timing, count) => {
                                        if (timing) {
                                            return `${count} ${'인증 코드 받기'}`
                                        }
                                        return '인증 코드 받기'
                                    }}
                                    name="new_code"
                                    rules={[
                                        {
                                            required: true,
                                            message: '인증번호를 입력해주세요!'
                                        }
                                    ]}
                                    onGetCaptcha={async () => {
                                        const new_account = userAccountForm.getFieldValue('new_account')
                                        if (!new_account || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(new_account)) {
                                            userAccountForm.setFields([
                                                {
                                                    name: 'new_account',
                                                    errors: ['유효한 이메일 주소를 입력하세요.']
                                                }
                                            ])
                                            return Promise.reject()
                                        }
                                        return new Promise((resolve, reject) =>
                                            getCode({ source: new_account })
                                                .then(() => resolve())
                                                .catch(reject)
                                        )
                                    }}
                                />
                            </>
                        )
                    }
                */}
      </ModalForm>

      <ModalForm<WithdrawalRecordInfo>
        title="탈퇴 신청"
        form={withdrawalForm}
        open={withdrawalInfoModal.open}
        initialValues={{
          status: 1,
          type: 'alipay'
        }}
        onOpenChange={(visible) => {
          setWithdrawalInfoModal({
            open: visible
          })
        }}
        onFinish={async (values) => {
          const res = await fetchUserWithdrawal({
            ...values
          })
          if (res.code) {
            message.error('탈퇴 신청에 실패했습니다.')
            return false
          }
          withdrawalForm.resetFields()
          message.success('출금신청이 성공하였습니다')
		  onUserRecords({
			...tableOptions
		  })
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
            name="name"
            label="실명"
            rules={[{ required: true, message: '지불인의 실명을 입력해주세요.' }]}
          />
          <ProFormText
            name="contact"
            label="연락처 정보"
            rules={[{ required: true, message: '연락처 정보를 입력해주세요' }]}
          />
          <ProFormText name="account" label="결제계좌번호" rules={[{ required: true }]} />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormRadio.Group
            name="type"
            label="결제수단"
            radioType="button"
            options={[
              {
                label: 'wxpay',
                value: 'wxpay'
              },
              {
                label: 'qqpay',
                value: 'qqpay'
              },
              {
                label: 'alipay',
                value: 'alipay'
              }
            ]}
            rules={[{ required: true }]}
          />
        </ProFormGroup>
        <ProFormTextArea
          fieldProps={{
            autoSize: {
              minRows: 2,
              maxRows: 2
            }
          }}
          name="message"
          label="관리자에게 메시지를 남겨주세요"
        />
      </ModalForm>
    </div>
  )
}

export default UserPage
