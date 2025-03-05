import { getCode } from '@/request/api'
import { userAsync } from '@/store/async'
import { RequestLoginParams } from '@/types'
import {
  HeartFilled,
  LockOutlined,
  UserOutlined,
  RedditCircleFilled,
  SlackCircleFilled,
  TwitterCircleFilled
} from '@ant-design/icons'
import { LoginForm, ProFormCaptcha, ProFormText } from '@ant-design/pro-form'
import { Button, Form, FormInstance, Modal, Space, Tabs } from 'antd'
import { useState } from 'react'
import { useNavigation, useLocation } from 'react-router-dom'

type Props = {
  open: boolean
  onCancel: () => void
}

type LoginType = 'code' | 'password' | 'register' | string;

export function LoginCard(props: {
  form: FormInstance<RequestLoginParams>
  onSuccess: () => void,
  type?: LoginType
}) {

  const location = useLocation();

  function getQueryParam(key: string) {
    const queryString = location.search || window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(key) || '';
  }

  const { type = 'password' } = props;

  const [loginTabsValue, setLoginTabsValue] = useState<LoginType>('login');
  const [loginType, setLoginType] = useState<LoginType>(type);

  return (
    <LoginForm<RequestLoginParams>
      form={props.form}
      logo="https://u1.dl0.cn/icon/openailogo.svg"
      title=""
      subTitle="대규모 언어 모델 기반의 AI 대화 제품"
      actions={(
        <div
          style={{
            textAlign: 'center',
            fontSize: 14
          }}
        >
          <p>로그인하시면 동의하신 것으로 간주됩니다   </p>
        </div>
      )}
      contentStyle={{
        width: '100%',
        maxWidth: '340px',
        minWidth: '100px'
      }}
      submitter={{
        searchConfig: {
          submitText: loginType === 'register' ? '등록 및 로그인' : '로그인',
        }
      }}
      onFinish={async (e) => {
        return new Promise((resolve, reject) => {
          userAsync
            .fetchLogin({ ...e, invite_code: getQueryParam('invite_code') })
            .then((res) => {
              if (res.code) {
                reject(false)
                return
              }
              props.onSuccess?.()
              resolve(true)
            })
            .catch(() => {
              reject(false)
            })
        })
      }}
    >
      <Tabs
        centered
        activeKey={loginTabsValue}
        onChange={(activeKey) => {
          props.form.resetFields()
          const type = activeKey === 'login' ? 'password' : activeKey
          setLoginType(type)
          setLoginTabsValue(activeKey)
        }}
        items={[
          {
            key: 'login',
            label: '계정 로그인',
          },
          {
            key: 'register',
            label: '계정 등록',
          },
        ]}
      />
      <ProFormText
        fieldProps={{
          size: 'large',
          prefix: <UserOutlined />
        }}
        name="account"
        placeholder="이메일/휴대폰번호 "
        rules={[
          {
            required: true,
          }
        ]}
      />
      {
        loginType !== 'password' && (
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
              const account = props.form.getFieldValue('account')
              return new Promise((resolve, reject) =>
                getCode({ source: account })
                  .then(() => resolve())
                  .catch(reject)
              )
            }}
          />
        )
      }
      {
        loginType !== 'code' && (
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            placeholder="비밀번호를 입력해주세요"
            rules={[
              {
                required: true,
                message: '8자 이상의 영숫자',
                pattern: /^(?:[a-zA-Z]{8,}|\d{8,}|(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d]{8,})$/
              },
            ]}
          />
        )
      }
      <div style={{ textAlign: 'right' }}>
        {
          (loginTabsValue === 'login' && loginType === 'code') && (
            <Button type="link" onClick={() => {
              props.form.resetFields()
              setLoginType('password')
            }}
            >
              비밀번호 로그인
            </Button>
          )
        }
        {
          (loginTabsValue === 'login' && loginType === 'password') && (
            <Button type="link" onClick={() => {
              props.form.resetFields()
              setLoginType('code')
            }}
            >
              인증번호 로그인
            </Button>
          )
        }
      </div>
      <div
        style={{
          marginBlockEnd: 24
        }}
      />
    </LoginForm>
  )
}

// 登录注册弹窗
function LoginModal(props: Props) {
  const [loginForm] = Form.useForm()

  const onCancel = () => {
    props.onCancel()
    loginForm.resetFields()
  }

  return (
    <Modal open={props.open} footer={null} destroyOnClose onCancel={onCancel}>
      <LoginCard form={loginForm} onSuccess={onCancel} />
    </Modal>
  )
}

export default LoginModal
