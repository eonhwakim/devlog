export function buildPersona(stats: {
  commits: number;
  prs: number;
  reviews: number;
  issues: number;
  reposTouched: number;
}) {
  const reviewWeight = stats.reviews * 2;
  const issueWeight = stats.issues * 2 + stats.prs;
  const refactorWeight = stats.commits + stats.reposTouched;

  if (reviewWeight >= issueWeight && reviewWeight >= refactorWeight) {
    return {
      title: "Review-Driven",
      headline: "코드 작성보다 리뷰와 피드백에서 존재감이 더 크게 드러나는 흐름입니다.",
      aura: "mint",
      stats: [
        { label: "Clarity", value: `${Math.min(99, 52 + stats.reviews * 4)}` },
        { label: "Care", value: `${Math.min(99, 46 + stats.reviews * 5)}` },
        { label: "Taste", value: `${Math.min(99, 38 + stats.prs * 3)}` },
      ],
      toastCopy:
        "이번 기간에는 직접 구현한 양보다 리뷰와 의견 정리에서 더 강한 기여가 보입니다. 팀이 판단을 빠르게 내리도록 돕는 역할에 가까웠습니다.",
      roastCopy:
        "리뷰의 기준은 분명한 편이라, 이제 그 밀도를 본인 작업 기록에도 그대로 남기면 더 설득력이 커질 것 같습니다.",
    };
  }

  if (issueWeight >= refactorWeight) {
    return {
      title: "Issue Resolver",
      headline:
        "이슈를 빠르게 받아 정리하고, 실제 작업으로 연결하는 대응형 패턴이 강하게 보입니다.",
      aura: "sunset",
      stats: [
        { label: "Speed", value: `${Math.min(99, 50 + stats.issues * 6)}` },
        { label: "Impact", value: `${Math.min(99, 44 + stats.prs * 5)}` },
        { label: "Nerve", value: `${Math.min(99, 58 + stats.issues * 4)}` },
      ],
      toastCopy:
        "중요한 이슈가 생겼을 때 빠르게 반응하고 작업을 닫는 쪽에서 강점이 보입니다. 운영이나 안정화 국면에서 특히 믿고 맡기기 쉬운 흐름입니다.",
      roastCopy:
        "대응 속도는 강점이지만, 비슷한 유형의 일이 반복된다면 해결 자체보다 원인 정리까지 함께 가져가는 편이 더 좋습니다.",
    };
  }

  return {
    title: "System Builder",
    headline:
      "작업량 자체보다 구조를 다듬고 전체 흐름을 정리하는 쪽의 강점이 더 선명하게 보입니다.",
    aura: "ocean",
    stats: [
      { label: "Flow", value: `${Math.min(99, 48 + stats.commits * 2)}` },
      { label: "Depth", value: `${Math.min(99, 40 + stats.reposTouched * 8)}` },
      { label: "Polish", value: `${Math.min(99, 44 + stats.prs * 4)}` },
    ],
    toastCopy:
      "이번 기간의 기록은 단순히 많이 처리한 사람이라기보다, 나중에 유지보수하기 좋은 상태로 정리한 사람에 가깝습니다.",
    roastCopy:
      "정리와 구조화는 강점이지만, 바깥에서 보이는 성과로 연결되도록 대표 작업을 조금 더 선명하게 남기면 좋겠습니다.",
  };
}
