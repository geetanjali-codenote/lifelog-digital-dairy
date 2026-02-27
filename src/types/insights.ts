export interface MoodAnalysis {
  summary: string
  dominantMood: string
  moodTrend: "improving" | "stable" | "declining"
  patterns: string[]
  suggestion: string
}

export interface ActivityInsights {
  summary: string
  journalingConsistency: string
  streakComment: string
  patterns: string[]
  suggestion: string
}

export interface SpendingAnalysis {
  summary: string
  totalSpent: number
  totalIncome: number
  topCategory: string
  patterns: string[]
  suggestion: string
}

export interface HabitInsights {
  summary: string
  bestHabit: string | null
  completionRate: string
  patterns: string[]
  suggestion: string
}

export interface InsightsResponse {
  generatedAt: string
  periodLabel: string
  dataPoints: {
    totalEntries: number
    totalTransactions: number
    totalHabitsTracked: number
    daysWithEntries: number
  }
  moodAnalysis: MoodAnalysis
  activityInsights: ActivityInsights
  spendingAnalysis: SpendingAnalysis
  habitInsights: HabitInsights
  overallRecommendations: string[]
  motivationalNote: string
}

export interface InsightsApiResponse {
  insights: InsightsResponse | null
  cached: boolean
  error?: string
  insufficientData?: boolean
}
