export function getEmailPre(str?: string) {
  if (!str) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // 이메일 정규식
  if (emailRegex.test(str)) {
    // 이메일 주소인 경우 @ 앞의 문자열을 반환합니다.
    return str.split('@')[0]
  } else {
    // 사서함이 아닌 경우 전체 문자열이 반환됩니다.
    return str
  }
}
