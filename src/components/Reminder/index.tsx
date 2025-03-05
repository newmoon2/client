import { chatStore, configStore } from '@/store'
import styles from './index.module.less'
import { Avatar } from 'antd'

function Reminder() {
  const { random_personas, website_logo } = configStore()
  const { addChat } = chatStore()

  return (
    <div className={styles.reminder}>
      {website_logo && <img src={website_logo} className={styles.reminder_logo} />}
      <h2 className={styles.reminder_title}>{document.title} 에 오신 것을 환영합니다 </h2>
      <p className={styles.reminder_message}>
        
      AI와 지능적으로 채팅하고 무한한 가능성을 상상해보세요! 첨단 AI 엔진을 기반으로 귀하의 커뮤니케이션이 더욱 지능적이고 효율적이며 편리해집니다!

      </p>
      <p className={styles.reminder_message}>
        <span>Shift</span> + <span>Enter</span> 줄 바꿈. 처음에 입력하세요. <span>/</span> 부르다 Prompt
        AI 프롬프트 명령 사전 설정.
      </p>
      <div className={styles.reminder_question}>
        {random_personas.map((item) => {
          return (
            <div
              key={item.id}
              className={styles.reminder_question_item}
              onClick={() => {
                addChat({
                  persona_id: item.id,
                  name: item?.title
                })
              }}
            >
              {item.avatar && <Avatar shape="square" size={24} src={item.avatar} />}
              <h3>{item.title}</h3>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Reminder
