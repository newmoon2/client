import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

function ResultPage() {
  const navigate = useNavigate()
  return (
    <Result
      status="success"
      title="결제 성공!"
      subTitle=""
      extra={[
        <Button
          key="home"
          onClick={() => {
            navigate('/')
          }}
        >
          홈페이지로 돌아가기
        </Button>,
        <Button
          type="primary"
          key="shop"
          onClick={() => {
            navigate('/shop')
          }}
        >
          기록 보기
        </Button>
      ]}
    />
  )
}
export default ResultPage
