export function describeActivityDensity(activeDays: number, longestStreak: number) {
  if (activeDays >= 220) {
    return `현재까지 ${activeDays}일 활동했고 최장 ${longestStreak}일 연속 흐름이 있어, 짧은 스퍼트보다 꾸준히 누적하는 패턴에 가깝습니다.`;
  }
  if (activeDays >= 140) {
    return `현재까지 ${activeDays}일 활동했고 최장 ${longestStreak}일 연속 구간이 보여, 특정 시점에 몰아치기보다 주기적으로 흔적을 남기는 편으로 읽힙니다.`;
  }
  return `현재까지 ${activeDays}일 활동했고 최장 ${longestStreak}일 연속 구간이 보여, 강한 집중 구간이 있을 때 밀도를 높이는 타입에 더 가깝습니다.`;
}

export function describePrSize(averagePRSize: number) {
  if (averagePRSize === 0) {
    return "최근 대표 PR 데이터가 많지 않아 PR 크기 패턴은 아직 뚜렷하게 읽히지 않습니다.";
  }
  if (averagePRSize < 120) {
    return `평균 PR 규모는 ${averagePRSize.toLocaleString()} lines로, 작은 단위로 자주 나누며 리뷰 친화적으로 가져가는 경향이 보입니다.`;
  }
  if (averagePRSize < 320) {
    return `평균 PR 규모는 ${averagePRSize.toLocaleString()} lines로, 과하게 잘게 쪼개지도 한 번에 너무 크게 묶지도 않는 균형형 패턴에 가깝습니다.`;
  }
  return `평균 PR 규모는 ${averagePRSize.toLocaleString()} lines로, 한 번에 다루는 변경 범위를 비교적 크게 가져가며 맥락 단위로 정리하는 흐름이 보입니다.`;
}

export function describeRepoSpread(
  repoCount: number,
  topLanguage: string | null,
  recentPrCount: number,
) {
  if (repoCount >= 8) {
    return `${repoCount}개 레포를 오가며 ${topLanguage ?? "여러 기술"} 중심의 작업축을 유지해, 한 영역에만 머물기보다 맥락 전환이 잦은 편으로 보입니다. PR 해석은 최근 대표 ${recentPrCount}건 기준입니다.`;
  }
  if (repoCount >= 4) {
    return `${repoCount}개 레포를 다루며 ${topLanguage ?? "주요 기술축"} 중심의 작업을 이어가, 깊이와 확장을 함께 가져가는 중간 폭의 패턴으로 읽힙니다. PR 해석은 최근 대표 ${recentPrCount}건 기준입니다.`;
  }
  return `${repoCount}개 레포에 비교적 집중하며 ${topLanguage ?? "현재 작업축"} 위에서 맥락을 깊게 파고드는 흐름이 보입니다. PR 해석은 최근 대표 ${recentPrCount}건 기준입니다.`;
}

export function describeDelivery(
  totalContributions: number,
  mergedCount: number,
  recentPrCount: number,
) {
  if (recentPrCount === 0) {
    return `총 ${totalContributions.toLocaleString()}회의 기여가 쌓였고, 최근 대표 PR 표본이 적어 머지 패턴은 조금 더 데이터가 모이면 선명해질 것 같습니다.`;
  }

  const mergeRate = Math.round((mergedCount / recentPrCount) * 100);
  const deliveryTone =
    mergeRate >= 80
      ? "열린 작업보다 실제로 닫힌 작업 비중이 높은 편입니다."
      : mergeRate >= 50
        ? "탐색과 완료가 함께 섞인 균형형 흐름으로 볼 수 있습니다."
        : "진행 중이거나 검토 중인 작업의 비중이 비교적 높은 편입니다.";

  return `총 ${totalContributions.toLocaleString()}회의 기여와 최근 대표 PR ${recentPrCount}건 기준 머지율 ${mergeRate}%를 보면, ${deliveryTone}`;
}
