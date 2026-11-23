export interface Question {
  id: number
  section: string
  difficulty: string
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

/** question id -> display order: optionOrder[qid][displayIndex] = original option index */
export type OptionOrder = Record<number, number[]>

export interface Session {
  id: string
  title: string
  /** randomized question order */
  questionIds: number[]
  optionOrder: OptionOrder
  /** question id -> chosen ORIGINAL option index */
  answers: Record<number, number>
  flagged: number[]
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
  optionOrder?: OptionOrder
  answers: Record<number, number>
  startedAt: number
  submittedAt: number
  durationSeconds: number
  timedOut: boolean
}
