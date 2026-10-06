/**
 * 브라우저 저장소 키를 한 곳에서 관리합니다.
 * - localStorage: 데모 사용자 데이터(신청·찜·기록·관심 지역). 버전이 바뀌면 키를 올립니다.
 * - sessionStorage: 탭 단위로만 의미 있는 화면 상태(목록 조건, 작성 중인 신청서)
 */
export const STORE_KEY = "rescuewalk-store-v2";
export const DOGS_LIST_HREF_KEY = "rw:dogsHref";
export const applyDraftKey = (dogId: string) => `rw:apply:${dogId}`;
/** 신청을 마친 뒤 브라우저 뒤로가기로 신청 화면에 돌아온 경우를 알아채기 위한 표시 */
export const appliedMarkerKey = (dogId: string) => `rw:applied:${dogId}`;

/** 저장소가 막힌 환경(시크릿 모드·권한 차단)에서도 화면이 멈추지 않도록 감싼 접근자 */
export const safeSession = {
  get(key: string): string | null {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      /* 저장하지 못해도 기능은 계속 동작 */
    }
  },
  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      /* 무시 */
    }
  },
};
