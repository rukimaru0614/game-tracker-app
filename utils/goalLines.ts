// Goal lines utility functions
export interface GoalLine {
  rp: number
  value: number // ← valueプロパティを追加
  color: string
  label: string
}

export const getGoalLines = (recordCount: number): GoalLine[] => {
  const lines: GoalLine[] = []
  
  // Add common rank thresholds as goal lines
  if (recordCount > 0) {
    lines.push(
      { rp: 4800, value: 4800, color: '#ef4444', label: 'プラチナ' },
      { rp: 12000, value: 12000, color: '#eab308', label: 'マスター' }
    )
  }
  
  return lines
}
