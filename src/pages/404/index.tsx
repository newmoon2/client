import styles from './index.module.less'

function Page404 (){
    return (
        <div className={styles.page404}>
            <img className={styles.page404_icon} src="https://u1.dl0.cn/images/l2963j.png" alt="" srcSet="" />
            <div className={styles.page404_text}>
                <h3>죄송합니다. 방문한 페이지가 존재하지 않습니다.!</h3>
                <p>링크 주소가 맞는지 확인 후 다시 시도해주세요</p>
            </div>
            <div className={styles.page404_button} onClick={()=>{
                location.href = '/'
            }}
            >
                홈페이지로 돌아가기
            </div>
        </div>
    )
}

export default Page404;
