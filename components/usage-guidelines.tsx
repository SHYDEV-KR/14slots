import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function UsageGuidelines() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">사용 지침 보기</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle>14 슬롯 시간 관리 지침</DialogTitle>
          <DialogDescription>효과적인 시간 관리를 위한 권장 사항</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>
            <strong>개인 충전 (2슬롯):</strong> 운동, 독서, 아이디어 충전 등 개인의 회복과 성장을 위한 시간
          </p>
          <p>
            <strong>가족/친구 (1-2슬롯):</strong> 개인적 행복과 관계 유지를 위한 필수 시간
          </p>
          <p>
            <strong>팀원 관리 (1슬롯):</strong> 1:1 면담, 팀원 성장 고민, 피드백 제공 등
          </p>
          <p>
            <strong>조직 문화/시스템 (1슬롯):</strong> 업무 프로세스, 커뮤니케이션 방식 등 조직 개선을 위한 시간
          </p>
          <p>
            <strong>전략/방향 (1슬롯):</strong> 데이터 분석, 사업 방향 고민 등 큰 그림을 그리는 시간
          </p>
          <p>
            <strong>비즈니스 개발 (나머지 슬롯):</strong> 고객/서비스 개발, 영업, 마케팅 등 핵심 비즈니스 활동
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

