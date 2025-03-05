
type ScrollElement = HTMLDivElement | null

interface ScrollReturn {
  scrollElement: ScrollElement
  scrollToBottom: () => Promise<void>
  scrollToTop: () => Promise<void>
  scrollToBottomIfAtBottom: () => Promise<void>
}

export function useScroll(scrollElement: ScrollElement): ScrollReturn {

  const scrollToBottom = async () => {
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }

  const scrollToTop = async () => {
    if (scrollElement){
      scrollElement.scrollTop = 0
    }
  }

  const scrollToBottomIfAtBottom = async () => {
    if (scrollElement) {
      const threshold = 100 // 스크롤 막대에서 아래쪽까지의 거리 임계값을 나타내는 임계값
      const distanceToBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;
      if (distanceToBottom <= threshold){
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }

  return {
    scrollElement,
    scrollToBottom,
    scrollToTop,
    scrollToBottomIfAtBottom,
  }
}
