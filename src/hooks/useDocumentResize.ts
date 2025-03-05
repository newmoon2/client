import { useState, useEffect } from 'react';

function useDocumentResize(target: HTMLElement = document.body) {
  const [rect, setRect] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const handleResize = () => {
      if (target) {
        setRect({
          width: target.offsetWidth,
          height: target.offsetHeight
        });
      }
    };

    // 크기 조정 이벤트 리스너 추가
    window.addEventListener('resize', handleResize);

    // 초기 너비 얻기
    if (target) {
      setRect({
        width: target.offsetWidth,
        height: target.offsetHeight
      });
    }

    //구성 요소가 언로드될 때 리스너 제거

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [target]);

  return rect;
}

export default useDocumentResize;