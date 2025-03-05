export async function textToMdFile(text: string) {
  try {
    // 블롭 객체 생성
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
    // 다운로드 링크 생성
    const link = document.createElement('a')
    link.download = 'aiFile.md'
    link.href = URL.createObjectURL(blob)
    // 페이지에 링크를 추가하고 클릭 이벤트를 트리거합니다.
    document.body.appendChild(link)
    link.click()
    // URL 객체 해제
    URL.revokeObjectURL(link.href)
    Promise.resolve()
  } catch (error) {
    Promise.reject()
  }
}
