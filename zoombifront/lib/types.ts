// Tipos para integração com backend .NET

export interface Teacher {
  id: string
  name: string
  subject: string
  email: string
  avatar?: string
}

export interface Subject {
  id: string
  name: string
  teacher: string
  teacherId: string
  totalClasses: number
  attendedClasses: number
  assignments: number
  completedAssignments: number
  testGrade: number
  color: string
}

export interface Note {
  id: string
  title: string
  subject: string
  subjectId: string
  content: string
  date: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface Student {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface DashboardStats {
  totalSubjects: number
  totalTeachers: number
  totalNotes: number
  overallScore: number
  attendanceRate: number
  assignmentCompletionRate: number
}
