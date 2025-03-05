export function paginate(list: Array<any>, page: number, page_size = 10) {
    // 시작 인덱스 계산
    const start_index = (page - 1) * page_size;
    // 슬라이스 메소드를 사용하여 현재 페이지 데이터 가져오기
    const paginated_list = list.slice(start_index, start_index + page_size);
    return paginated_list;
}
