/**
 * 화면을 옮길 때마다 본문이 짧게(0.24초) 나타나도록 — 화면이 '툭' 바뀌지 않고 이어지는 느낌.
 * 투명도만 바꾸고 채우기(fill)를 남기지 않아, 끝난 뒤에는 고정·스티키 요소의 겹침 순서에 영향을 주지 않습니다.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in motion-reduce:animate-none">{children}</div>;
}
