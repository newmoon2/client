import {
  CalculatorFilled,
  CommentOutlined,
  ContactsFilled,
  CrownFilled,
  DropboxCircleFilled,
  ExperimentFilled,
  FileImageFilled,
  FileTextFilled,
  GithubFilled,
  GithubOutlined,
  GitlabFilled,
  GoldenFilled,
  IdcardFilled,
  InsuranceFilled,
  LockFilled,
  MediumSquareFilled,
  MessageFilled,
  MoneyCollectFilled,
  NotificationFilled,
  PictureOutlined,
  RadarChartOutlined,
  ReconciliationFilled,
  RedEnvelopeFilled,
  RedditCircleFilled,
  ScheduleFilled,
  SettingFilled,
  ShopFilled,
  ShopOutlined,
  SmileFilled,
  UsergroupAddOutlined,
  WalletFilled
} from '@ant-design/icons'

const web = [
  {
    path: '/',
    name: '대화',
    icon: <CommentOutlined />,
    message: '지능형 AI로 소통하다'
  },
  {
    path: '/draw',
    name: '그림',
    icon: <PictureOutlined />,
    message: '지능형 AI를 사용하여 그림 그리기'
  },
  {
    path: '/mapping',
    name: '마인드맵',
    icon: <RadarChartOutlined />,
    message: '지능형 AI를 사용하여 마인드 맵 생성'
  },
  /*
  {
    path: '/shop',
    name: '쇼핑 센터',
    icon: <ShopOutlined />,
    message: '계정 잔액 및 충전 패키지 기록'
  },
  */
  {
    path: '/user',
    name: '사용자',
    icon: <UsergroupAddOutlined />,
    message: '계정 잔액 및 충전 패키지 기록'
  },
  /*
  {
    path: 'https://github.com/79E/ChatGpt-Web',
    name: '프로젝트 주소',
    icon: <GithubOutlined />,
    message: '무료 오픈소스 상용화 가능한 AiWeb 프로젝트'
  }
    */
]

const admin = {
  path: '/',
  routes: [
    {
      path: '/admin',
      name: '欢迎光临',
      icon: <SmileFilled />
    },
    {
      path: '/admin_base',
      name: '基础管理',
      icon: <ExperimentFilled />,
      access: 'canAdmin',
      component: './Admin',
      routes: [
        {
          path: '/admin/carmi',
          name: '卡密管理',
          icon: <LockFilled />
        },
        {
          path: '/admin/aikey',
          name: 'AI Key管理',
          icon: <InsuranceFilled />
        }
      ]
    },
    {
      path: '/admin_user',
      name: '사용자 관리',
      icon: <CrownFilled />,
      access: 'canAdmin',
      component: './Admin',
      routes: [
        {
          path: '/admin/user',
          name: '사용자 목록',
          icon: <IdcardFilled />
        },
        {
          path: '/admin/turnover',
          name: '소비기록',
          icon: <ReconciliationFilled />
        },
        {
          path: '/admin/signin',
          name: '로그인 기록',
          icon: <ScheduleFilled />
        },
        {
          path: '/admin/invite',
          name: '초대기록',
          icon: <ContactsFilled />
        },
        {
          path: '/admin/cashback',
          name: '커미션 커미션',
          icon: <CalculatorFilled />
        },
        {
          path: '/admin/withdrawal',
          name: '탈퇴 신청',
          icon: <RedEnvelopeFilled />
        },
        {
          path: '/admin/amounts',
          name: '잔액 세부정보',
          icon: <MediumSquareFilled />
        },
      ]
    },
    {
      name: '기능적 관리',
      icon: <MessageFilled />,
      path: '/admin_message',
      routes: [
        {
          path: '/admin/dialog',
          name: '내장된 대화',
          icon: <GitlabFilled />
        },
        {
          path: '/admin/persona',
          name: '역할 구성',
          icon: <RedditCircleFilled />
        },
        {
          path: '/admin/plugin',
          name: '플러그인 관리',
          icon: <DropboxCircleFilled />
        },
        {
          path: '/admin/messages',
          name: '메시지 목록',
          icon: <FileTextFilled />
        },
        {
          path: '/admin/draw',
          name: '그림 목록',
          icon: <FileImageFilled />
        },
      ]
    },
    {
      path: '/admin_orders',
      name: '제품 및 주문',
      icon: <GoldenFilled />,
      routes: [
        {
          path: '/admin/product',
          name: '제품 목록',
          icon: <ShopFilled />
        },
        {
          path: '/admin/payment',
          name: '결제 구성',
          icon: <MoneyCollectFilled />
        },
        {
          path: '/admin/order',
          name: '주문 지불',
          icon: <WalletFilled />
        }
      ]
    },
    {
      name: '알림 구성',
      path: '/admin/notification',
      icon: <NotificationFilled />
    },
    {
      path: '/admin/config',
      name: '시스템 구성',
      icon: <SettingFilled />
    },
    {
      path: 'https://github.com/79E/ChatGpt-Web',
      name: 'Github',
      icon: <GithubFilled />
    }
  ]
}

export default {
  web,
  admin
}
