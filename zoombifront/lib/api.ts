const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

console.log('[API] Base URL configurada:', API_BASE_URL)

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
    console.log('[API] Token salvo no localStorage')
  }
}

const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    console.log('[API] Token removido do localStorage')
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const url = `${API_BASE_URL}${endpoint}`
  
  console.log(`[API] ${options?.method || 'GET'} ${url}`)
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    })

    console.log(`[API] Response status: ${response.status}`)

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('[API] Não autorizado - redirecionando para login')
        removeAuthToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
      
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error('[API] ❌ Erro completo do servidor:', JSON.stringify(errorData, null, 2))
        
        // Tratamento específico para erros de validação do .NET
        if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n')
          errorMessage = `Erros de validação:\n${validationErrors}`
        } else if (errorData.title && errorData.title.includes('validation')) {
          errorMessage = 'Erro de validação. Verifique os campos obrigatórios.'
        } else {
          errorMessage = errorData.message || errorData.title || errorMessage
        }
        
        console.error('[API] Mensagem de erro:', errorMessage)
      } catch (e) {
        console.error('[API] Erro ao parsear resposta de erro:', e)
      }
      
      throw new Error(errorMessage)
    }

    // Para DELETE que retorna NoContent (204), não tente fazer parse do JSON
    if (response.status === 204) {
      return {} as T
    }

    const data = await response.json()
    console.log('[API] Resposta recebida com sucesso')
    return data
    
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[API] Erro de rede - backend pode estar offline')
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
    }
    throw error
  }
}

// ============= AUTH API =============
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      console.log('[AUTH] Tentando fazer login...')
      const response = await fetchApi<AuthResponse>('/Auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setAuthToken(response.token)
      console.log('[AUTH] Login bem-sucedido!')
      return response
    } catch (error) {
      console.error('[AUTH] Erro no login:', error)
      throw error
    }
  },
  
  register: async (nomeCompleto: string, email: string, password: string) => {
    try {
      console.log('[AUTH] Tentando registrar usuário...')
      const response = await fetchApi<AuthResponse>('/Auth/register', {
        method: 'POST',
        body: JSON.stringify({ nomeCompleto, email, password }),
      })
      
      if (!response.token) {
        console.error('[AUTH] Resposta sem token:', response)
        throw new Error('Usuário criado mas token não foi gerado. Tente fazer login.')
      }
      
      setAuthToken(response.token)
      console.log('[AUTH] Registro bem-sucedido!')
      return response
    } catch (error) {
      console.error('[AUTH] Erro no registro:', error)
      throw error
    }
  },
  
  logout: () => {
    removeAuthToken()
  },
  
  isAuthenticated: (): boolean => {
    return !!getAuthToken()
  }
}

// ============= DASHBOARD API =============
export const dashboardApi = {
  getDashboard: () => fetchApi<DashboardResponse>('/Dashboard'),
}

// ============= TEACHERS API =============
export const teachersApi = {
  getAll: () => fetchApi<Professor[]>('/Professores'),
  
  create: (professor: CreateProfessorDTO) =>
    fetchApi<Professor>('/Professores', {
      method: 'POST',
      body: JSON.stringify({
        nome: professor.nome,
        email: professor.email,
        disciplina: professor.disciplina || ''
      }),
    }),
  
  delete: (id: number) =>
    fetchApi<void>(`/Professores/${id}`, {
      method: 'DELETE',
    }),
}

// ============= SUBJECTS API =============
export const subjectsApi = {
  getAll: () => fetchApi<Materia[]>('/Materias'),
  
  getById: (id: number) => fetchApi<Materia>(`/Materias/${id}`),
  
  create: (materia: CreateMateriaDTO) =>
    fetchApi<Materia>('/Materias', {
      method: 'POST',
      body: JSON.stringify({
        nome: materia.nome,
        cor: materia.cor,
        professorId: materia.professorId
      }),
    }),
  
  update: (id: number, materia: UpdateMateriaDTO) =>
    fetchApi<void>(`/Materias/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: id,
        nome: materia.nome,
        cor: materia.cor,
        professorId: materia.professorId
      }),
    }),
  
  delete: (id: number) =>
    fetchApi<void>(`/Materias/${id}`, {
      method: 'DELETE',
    }),
  
  registerAttendance: async (id: number): Promise<Materia> => {
    return fetchApi<Materia>(`/Materias/${id}/presenca`, {
      method: 'POST',
    })
  },
}

// ============= NOTES API =============
export const notesApi = {
  getAll: () => fetchApi<Anotacao[]>('/Anotacoes'),
  
  getById: (id: number) => fetchApi<Anotacao>(`/Anotacoes/${id}`),
  
  create: (note: CreateNoteDTO) =>
    fetchApi<Anotacao>('/Anotacoes', {
      method: 'POST',
      body: JSON.stringify({
        titulo: note.titulo,
        conteudo: note.conteudo,
        materiaId: note.materiaId || null
      }),
    }),
  
  update: (id: number, note: UpdateNoteDTO) =>
    fetchApi<void>(`/Anotacoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: id,
        titulo: note.titulo,
        conteudo: note.conteudo,
        materiaId: note.materiaId || null
      }),
    }),
  
  delete: (id: number) =>
    fetchApi<void>(`/Anotacoes/${id}`, {
      method: 'DELETE',
    }),
}

// ============= ASSIGNMENTS API (Trabalhos) =============
export const assignmentsApi = {
  // Obter todos os trabalhos de UMA matéria
  getAllBySubject: (materiaId: number) =>
    fetchApi<Trabalho[]>(`/Materias/${materiaId}/Trabalhos`),

  // Obter um trabalho específico pelo ID
  getById: (trabalhoId: number) =>
    fetchApi<Trabalho>(`/Trabalhos/${trabalhoId}`),

  // Criar um novo trabalho
  create: (trabalho: CreateTrabalhoDTO) =>
    fetchApi<Trabalho>('/Trabalhos', {
      method: 'POST',
      body: JSON.stringify(trabalho),
    }),

  // Atualizar um trabalho
  update: (trabalhoId: number, trabalho: UpdateTrabalhoDTO) =>
    fetchApi<void>(`/Trabalhos/${trabalhoId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...trabalho, id: trabalhoId }),
    }),

  // Marcar um trabalho como concluído/não concluído
  toggleCompleted: (trabalhoId: number, concluido: boolean) =>
    fetchApi<void>(`/Trabalhos/${trabalhoId}/concluir`, {
      method: 'PUT',
      body: JSON.stringify({ concluido }),
    }),

  // Deletar um trabalho
  delete: (trabalhoId: number) =>
    fetchApi<void>(`/Trabalhos/${trabalhoId}`, {
      method: 'DELETE',
    }),
}

// ============= CLASSES API (Aulas/Presença) =============
export const classesApi = {
  // Obter todas as aulas de UMA matéria
  getAllBySubject: (materiaId: number) =>
    fetchApi<Aula[]>(`/Materias/${materiaId}/Aulas`),

  // Obter uma aula específica
  getById: (aulaId: number) => fetchApi<Aula>(`/Aulas/${aulaId}`),

  // Criar um novo registro de aula (ex: registrar aula de hoje)
  create: (aula: CreateAulaDTO) =>
    fetchApi<Aula>('/Aulas', {
      method: 'POST',
      body: JSON.stringify(aula),
    }),

  // Atualizar uma aula (ex: mudar data, observações)
  update: (aulaId: number, aula: UpdateAulaDTO) =>
    fetchApi<void>(`/Aulas/${aulaId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...aula, id: aulaId }),
    }),

  // Marcar presença em uma aula específica
  updateAttendance: (aulaId: number, presente: boolean) =>
    fetchApi<void>(`/Aulas/${aulaId}/presenca`, {
      method: 'PUT',
      body: JSON.stringify({ presente }),
    }),

  // Deletar um registro de aula
  delete: (aulaId: number) =>
    fetchApi<void>(`/Aulas/${aulaId}`, {
      method: 'DELETE',
    }),
}

// ============= STUDENT API =============
export const studentApi = {
  getProfile: async (): Promise<Student> => {
    const token = getAuthToken()
    if (!token) throw new Error('Not authenticated')
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      return {
        id: payload.nameid || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
        name: payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Estudante',
        email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
        phone: '',
        avatar: '',
      }
    } catch (error) {
      console.error('[STUDENT] Erro ao decodificar token:', error)
      throw new Error('Token inválido')
    }
  },
  
  getStats: async (): Promise<DashboardStats> => {
    const dashboard = await dashboardApi.getDashboard()
    return {
      totalSubjects: dashboard.materiasResumidas.length,
      totalTeachers: dashboard.professores.length,
      totalNotes: 0,
      overallScore: dashboard.metricasProgresso.pontuacaoGeral,
      attendanceRate: dashboard.metricasProgresso.frequenciaGeral,
      assignmentCompletionRate: dashboard.metricasProgresso.percentualTrabalhos,
    }
  },
}

// ============= INTERFACES =============
export interface AuthResponse {
  token: string
  email: string
  nomeCompleto: string
  userId: number
}

export interface DashboardResponse {
  metricasProgresso: MetricasProgresso
  materiasResumidas: MateriaResumida[]
  professores: ProfessorDTO[]
}

export interface MetricasProgresso {
  frequenciaGeral: number
  aulasPresentes: number
  totalAulas: number
  percentualTrabalhos: number
  trabalhosConcluidos: number
  totalTrabalhos: number
  pontuacaoGeral: number
}

export interface MateriaResumida {
  id: number
  nome: string
  cor: string
  nomeProfessor: string
  nota: number
  frequenciaPresente: number
  frequenciaTotal: number
  trabalhosConcluidos: number
  trabalhosTotal: number
}

export interface ProfessorDTO {
  id: number
  nome: string
  email: string
  disciplina: string
}

export interface Professor {
  id: number
  nome: string
  email: string
  disciplina?: string
  usuarioId?: string
}

export interface Materia {
  id: number
  nome: string
  cor: string
  professorId: number
  usuarioId?: string
  professor?: Professor
  aulas?: Aula[]
  trabalhos?: Trabalho[]
}

export interface Aula {
  id: number
  materiaId: number
  dataAula: string
  presente: boolean
  observacoes?: string
}

export interface Trabalho {
  id: number
  titulo: string
  descricao?: string
  dataEntrega: string
  concluido: boolean
  materiaId: number
}

export interface Anotacao {
  id: number
  titulo: string
  conteudo: string
  materiaId?: number
  usuarioId: string
  dataCriacao: string
  dataAtualizacao: string
  materia?: Materia
}

export interface CreateProfessorDTO {
  nome: string
  email: string
  disciplina?: string
}

export interface CreateMateriaDTO {
  nome: string
  cor: string
  professorId: number
}

export interface UpdateMateriaDTO {
  nome: string
  cor: string
  professorId: number
}

export interface CreateNoteDTO {
  titulo: string
  conteudo: string
  materiaId?: number
}

export interface UpdateNoteDTO {
  titulo: string
  conteudo: string
  materiaId?: number
}

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

export interface DashboardStats {
  totalSubjects: number
  totalTeachers: number
  totalNotes: number
  overallScore: number
  attendanceRate: number
  assignmentCompletionRate: number
}

// ============= MAPPERS =============
export const mapProfessorToTeacher = (professor: ProfessorDTO): Teacher => ({
  id: professor.id.toString(),
  name: professor.nome,
  subject: professor.disciplina,
  email: professor.email,
  avatar: undefined,
})

export const mapMateriaToSubject = (materia: MateriaResumida): Subject => ({
  id: materia.id.toString(),
  name: materia.nome,
  teacher: materia.nomeProfessor,
  teacherId: '',
  totalClasses: materia.frequenciaTotal,
  attendedClasses: materia.frequenciaPresente,
  assignments: materia.trabalhosTotal,
  completedAssignments: materia.trabalhosConcluidos,
  testGrade: materia.nota,
  color: materia.cor,
})

export const mapAnotacaoToNote = (anotacao: Anotacao, materiaNome?: string): Note => ({
  id: anotacao.id.toString(),
  title: anotacao.titulo,
  subject: materiaNome || anotacao.materia?.nome || 'Geral',
  subjectId: anotacao.materiaId?.toString() || '',
  content: anotacao.conteudo,
  date: new Date(anotacao.dataCriacao).toLocaleDateString('pt-BR'),
  color: 'bg-blue-50',
  createdAt: anotacao.dataCriacao,
  updatedAt: anotacao.dataAtualizacao,
})