export type Difficulty = 'متوسط' | 'تطبيقي' | 'صعب'

export interface Question {
  id: number
  section: string
  difficulty: Difficulty | string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  theory: string
}

export interface QuestionBank {
  title: string
  source: string
  questions: Question[]
}

export type SessionMode = 'exam' | 'study'

export interface Session {
  id: string
  mode: SessionMode
  title: string
  questionIds: number[]
  /** question id -> chosen option index */
  answers: Record<number, number>
  flagged: number[]
  /** study mode: ids whose answer has been revealed */
  revealed: number[]
  current: number
  startedAt: number
  timerEnabled: boolean
  timeLimitSeconds: number
  elapsedSeconds: number
}

export interface AttemptRecord {
  id: string
  title: string
  questionIds: number[]
  answers: Record<number, number>
  startedAt: number
  submittedAt: number
  durationSeconds: number
  timedOut: boolean
}

export interface TheoryStat {
  attempts: number
  wrong: number
}
