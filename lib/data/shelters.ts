import type { Shelter } from "@/lib/types";

export const shelters: Shelter[] = [
  {
    id: "sh-happy",
    name: "행복한 쉼터",
    region: "서울",
    address: "서울 강서구 곰달래로 123",
    hours: "매일 10:00 – 17:00 (월요일 휴무)",
    phone: "02-1234-5678",
    intro: "서울 서부권에서 가장 오래된 유기견 보호소예요.",
    description:
      "2011년부터 유기견 구조와 보호를 이어온 보호소입니다. 넓은 야외 운동장이 있어 산책 봉사자와 아이들이 함께 뛰어놀기 좋아요. 초보 봉사자를 위한 오리엔테이션을 매주 토요일 오전에 진행합니다.",
    image: null,
    themeColor: "#F49E42",
  },
  {
    id: "sh-love",
    name: "사랑의 쉼터",
    region: "서울",
    address: "서울 양천구 목동중앙로 45",
    hours: "화–일 10:00 – 16:30",
    phone: "02-2345-6789",
    intro: "소형견 위주의 아늑한 도심 속 보호소예요.",
    description:
      "도심 속 작은 보호소로, 소형견과 노령견을 주로 보호하고 있어요. 안양천 산책로가 바로 옆에 있어 산책 코스가 아름답습니다. 처음 오시는 분께는 담당 매니저가 아이의 성격을 자세히 안내해드려요.",
    image: null,
    themeColor: "#8FB06F",
  },
  {
    id: "sh-together",
    name: "함께하는 쉼터",
    region: "인천",
    address: "인천 서구 가정로 135",
    hours: "매일 09:30 – 17:30",
    phone: "032-345-6789",
    intro: "구조부터 입양까지, 아이들의 새 출발을 함께해요.",
    description:
      "인천 지역 구조 단체와 연계해 운영되는 보호소입니다. 중대형견 비중이 높아 활동량 많은 산책 봉사자를 항상 기다리고 있어요. 산책 후 아이들과 교감할 수 있는 실내 놀이 공간도 마련되어 있습니다.",
    image: null,
    themeColor: "#729653",
  },
  {
    id: "sh-haneul",
    name: "하늘바라기 쉼터",
    region: "경기",
    address: "경기 고양시 덕양구 호수로 88",
    hours: "매일 10:00 – 17:00",
    phone: "031-456-7890",
    intro: "호수공원 옆, 산책하기 가장 좋은 보호소예요.",
    description:
      "고양 호수공원 인근에 위치해 산책 환경이 훌륭한 보호소입니다. 자원봉사 시스템이 잘 갖춰져 있어 가족 단위 봉사자도 많이 방문해요. 주말에는 산책 슬롯이 빨리 마감되니 미리 신청해주세요.",
    image: null,
    themeColor: "#F7B96F",
  },
  {
    id: "sh-hanbat",
    name: "한밭 보금자리",
    region: "대전",
    address: "대전 유성구 대학로 291",
    hours: "수–일 10:00 – 16:00",
    phone: "042-567-8901",
    intro: "대전 시민들과 함께 크는 지역 밀착 보호소예요.",
    description:
      "대전 지역 대학생 봉사 동아리와 함께 운영되는 활기찬 보호소입니다. 갑천 산책 코스를 따라 아이들과 걷다 보면 한 시간이 금방 지나가요. 산책 교육을 이수한 매니저가 항상 동행 가능합니다.",
    image: null,
    themeColor: "#AEC994",
  },
  {
    id: "sh-badasori",
    name: "바다소리 쉼터",
    region: "부산",
    address: "부산 해운대구 좌동순환로 433",
    hours: "매일 09:00 – 17:00",
    phone: "051-678-9012",
    intro: "바닷바람 맞으며 걷는 특별한 산책을 만나보세요.",
    description:
      "해운대 장산 자락에 자리한 보호소로, 숲길과 바닷가 산책 코스를 모두 즐길 수 있어요. 구조된 아이들의 재활 프로그램에 산책 봉사가 큰 역할을 하고 있습니다. 주차 공간이 넉넉해 방문이 편리해요.",
    image: null,
    themeColor: "#F49E42",
  },
];

export function getShelter(id: string): Shelter | undefined {
  return shelters.find((s) => s.id === id);
}
