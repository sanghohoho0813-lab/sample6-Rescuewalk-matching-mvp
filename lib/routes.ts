/**
 * 집중 화면 — 강아지 상세(사진이 화면 위까지 차고 하단에 신청 버튼 고정)와 신청 3단계(하단 진행 버튼 고정).
 * 모바일에서는 이 화면들이 자체 뒤로가기·제목을 가지므로 공용 헤더와 하단 내비를 빼서
 * 고정 바가 두 겹으로 쌓이지 않고 사진·입력에 화면을 온전히 쓰게 합니다.
 */
const FOCUS_ROUTES = [/^\/dogs\/[^/]+\/?$/, /^\/dogs\/[^/]+\/apply\/?$/];

export const isFocusRoute = (pathname: string) => FOCUS_ROUTES.some((re) => re.test(pathname));
