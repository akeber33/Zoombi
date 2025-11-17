"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Award, Bell, BookOpen, Calendar, CheckCircle2, Edit, Eye, GraduationCap, Home, Mail, Menu, PanelLeft, Plus, Save, Trash2, UserPlus, X, FileText } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  dashboardApi,
  studentApi,
  authApi,
  teachersApi,
  subjectsApi,
  notesApi,
  mapProfessorToTeacher,
  mapMateriaToSubject,
  type Teacher,
  type Subject,
  type Note,
  type Student,
  type DashboardStats,
  type Trabalho,
} from "@/lib/api"

const sidebarItems = [
  { title: "Painel", icon: <Home />, value: "painel" },
  { title: "Aulas", icon: <BookOpen />, value: "aulas" },
  { title: "Professores", icon: <UserPlus />, value: "professores" },
  { title: "Anotações", icon: <FileText />, value: "anotacoes" },
  { title: "Perfil", icon: <GraduationCap />, value: "perfil" },
]

const COLORS = [
  { label: "Azul", value: "bg-blue-500" },
  { label: "Verde", value: "bg-green-500" },
  { label: "Roxo", value: "bg-purple-500" },
  { label: "Rosa", value: "bg-pink-500" },
  { label: "Amarelo", value: "bg-yellow-500" },
  { label: "Vermelho", value: "bg-red-500" },
]

const NOTE_COLORS = [
  { label: "Azul Claro", value: "bg-blue-50" },
  { label: "Verde Claro", value: "bg-green-50" },
  { label: "Roxo Claro", value: "bg-purple-50" },
  { label: "Rosa Claro", value: "bg-pink-50" },
  { label: "Amarelo Claro", value: "bg-yellow-50" },
]

interface TrabalhoForm {
  id?: number
  titulo: string
  descricao: string
  dataEntrega: string
  concluido: boolean
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("painel")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [student, setStudent] = useState<Student | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modals
  const [teacherModal, setTeacherModal] = useState(false)
  const [subjectModal, setSubjectModal] = useState(false)
  const [noteModal, setNoteModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  // Form states
  const [teacherForm, setTeacherForm] = useState({ nome: "", email: "", disciplina: "" })
  const [subjectForm, setSubjectForm] = useState({
    nome: "",
    cor: "bg-blue-500",
    professorId: "",
    notaProva: ""
  })
  const [trabalhos, setTrabalhos] = useState<TrabalhoForm[]>([])
  const [noteForm, setNoteForm] = useState({ titulo: "", conteudo: "", materiaId: "", cor: "bg-blue-50" })
  const [profileForm, setProfileForm] = useState({ nome: "", email: "", telefone: "" })

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      window.location.href = '/login'
      return
    }
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [dashboardData, statsData] = await Promise.all([
        dashboardApi.getDashboard(),
        studentApi.getStats(),
      ])

      // Obter nome do usuário do token
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      let nomeUsuario = "Estudante"

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log("Claims do token:", payload)

          // Tentar diferentes claims de nome (ordem de prioridade)
          nomeUsuario = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
            payload.name ||
            payload.unique_name ||
            "Estudante"

          const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
            payload.nameid ||
            payload.sub ||
            ""

          const email = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
            payload.email ||
            ""

          setStudent({
            id: userId,
            name: nomeUsuario,
            email: email,
            phone: "",
            avatar: ""
          })

          setProfileForm({
            nome: nomeUsuario,
            email: email,
            telefone: ""
          })
        } catch (err) {
          console.error("Erro ao decodificar token:", err)
        }
      }

      const mappedTeachers = dashboardData.professores.map(mapProfessorToTeacher)
      const mappedSubjects = dashboardData.materiasResumidas.map(mapMateriaToSubject)

      setTeachers(mappedTeachers)
      setSubjects(mappedSubjects)
      setStats(statsData)

      try {
        const notesData = await notesApi.getAll()
        setNotes(notesData.map((n: any) => ({
          id: n.id.toString(),
          title: n.titulo,
          subject: dashboardData.materiasResumidas.find((m: any) => m.id === n.materiaId)?.nome || "Geral",
          subjectId: n.materiaId?.toString() || "",
          content: n.conteudo,
          date: new Date(n.dataCriacao).toLocaleDateString('pt-BR'),
          color: "bg-blue-50",
          createdAt: n.dataCriacao,
          updatedAt: n.dataAtualizacao,
        })))
      } catch (noteError) {
        console.error("Erro ao carregar anotações:", noteError)
        setNotes([])
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      setError(error instanceof Error ? error.message : "Erro ao carregar dados")

      if (error instanceof Error && error.message.includes('401')) {
        authApi.logout()
        window.location.href = '/login'
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateScore = () => {
    if (stats) return Math.round(stats.overallScore)

    const totalClasses = subjects.reduce((acc, s) => acc + s.totalClasses, 0)
    const attendedClasses = subjects.reduce((acc, s) => acc + s.attendedClasses, 0)
    const attendanceRate = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0

    const totalAssignments = subjects.reduce((acc, s) => acc + s.assignments, 0)
    const completedAssignments = subjects.reduce((acc, s) => acc + s.completedAssignments, 0)
    const assignmentRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0

    return Math.round((attendanceRate + assignmentRate) / 2)
  }

  // Teacher CRUD
  const openTeacherModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher)
      setTeacherForm({ nome: teacher.name, email: teacher.email, disciplina: teacher.subject })
    } else {
      setEditingTeacher(null)
      setTeacherForm({ nome: "", email: "", disciplina: "" })
    }
    setTeacherModal(true)
  }

  const saveTeacher = async () => {
    try {
      if (!teacherForm.nome || !teacherForm.email) {
        alert("Nome e email são obrigatórios")
        return
      }

      const dto = {
        nome: teacherForm.nome,
        email: teacherForm.email,
        disciplina: teacherForm.disciplina || "",
      }

      if (editingTeacher) {
        await teachersApi.update(parseInt(editingTeacher.id), dto)
      } else {
        await teachersApi.create(dto)
      }

      await loadDashboardData()
      setTeacherModal(false)
      setTeacherForm({ nome: "", email: "", disciplina: "" })
      setEditingTeacher(null)
    } catch (error) {
      console.error("Erro ao salvar professor:", error)
      alert("Erro ao salvar professor: " + (error instanceof Error ? error.message : "Erro desconhecido"))
    }
  }

  const deleteTeacher = async (id: string) => {
    if (!confirm("Deseja realmente excluir este professor?")) return

    try {
      await teachersApi.delete(parseInt(id))
      await loadDashboardData()
    } catch (error) {
      console.error("Erro ao deletar professor:", error)
      alert("Erro ao deletar professor")
    }
  }

  // Subject CRUD
  const openSubjectModal = async (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject)

      // Carregar dados completos da matéria incluindo trabalhos
      try {
        const materiaCompleta = await subjectsApi.getById(parseInt(subject.id))

        setSubjectForm({
          nome: materiaCompleta.nome,
          cor: materiaCompleta.cor,
          professorId: materiaCompleta.professorId.toString(),
          notaProva: materiaCompleta.notaProva > 0 ? materiaCompleta.notaProva.toString() : ""
        })

        // Mapear trabalhos
        setTrabalhos(materiaCompleta.trabalhos?.map(t => ({
          id: t.id,
          titulo: t.titulo,
          descricao: t.descricao || "",
          dataEntrega: new Date(t.dataEntrega).toISOString().split('T')[0],
          concluido: t.concluido
        })) || [])

        console.log("Matéria carregada:", materiaCompleta)
        console.log("Trabalhos carregados:", materiaCompleta.trabalhos?.length || 0)
      } catch (error) {
        console.error("Erro ao carregar matéria completa:", error)
        alert("Erro ao carregar dados da matéria")
      }
    } else {
      setEditingSubject(null)
      setSubjectForm({ nome: "", cor: "bg-blue-500", professorId: "", notaProva: "" })
      setTrabalhos([])
    }
    setSubjectModal(true)
  }

  const adicionarTrabalho = () => {
    const hoje = new Date().toISOString().split('T')[0]
    setTrabalhos([...trabalhos, {
      titulo: "",
      descricao: "",
      dataEntrega: hoje,
      concluido: false
    }])
  }

  const removerTrabalho = async (index: number) => {
    const trabalho = trabalhos[index]

    // Se o trabalho tem ID, deletar no backend
    if (trabalho.id && editingSubject) {
      if (!confirm("Deseja realmente excluir este trabalho?")) return

      try {
        await subjectsApi.deleteTrabalho(parseInt(editingSubject.id), trabalho.id)
        setTrabalhos(trabalhos.filter((_, i) => i !== index))
        console.log("Trabalho excluído com sucesso!")
      } catch (error) {
        console.error("Erro ao deletar trabalho:", error)
        alert("Erro ao deletar trabalho: " + (error instanceof Error ? error.message : "Erro desconhecido"))
      }
    } else {
      // Se não tem ID, apenas remove da lista local
      setTrabalhos(trabalhos.filter((_, i) => i !== index))
    }
  }

  const atualizarTrabalho = (index: number, campo: keyof TrabalhoForm, valor: any) => {
    const novosTrabalhos = [...trabalhos]
    novosTrabalhos[index] = { ...novosTrabalhos[index], [campo]: valor }
    setTrabalhos(novosTrabalhos)
  }

  const saveSubject = async () => {
    try {
      if (!subjectForm.nome || !subjectForm.professorId) {
        alert("Nome da matéria e professor são obrigatórios")
        return
      }

      // Preparar DTO base
      const materiaDto: any = {
        nome: subjectForm.nome,
        cor: subjectForm.cor,
        professorId: parseInt(subjectForm.professorId)
      }

      // IMPORTANTE: Só adiciona notaProva se o campo foi preenchido
      // Se estiver vazio, não envia nada (mantém o valor existente no backend)
      if (subjectForm.notaProva && subjectForm.notaProva.trim() !== "") {
        const nota = parseFloat(subjectForm.notaProva)
        if (!isNaN(nota) && nota >= 0 && nota <= 10) {
          materiaDto.notaProva = nota
        }
      }

      console.log("Salvando matéria:", materiaDto)
      console.log("Trabalhos a processar:", trabalhos.length)

      let materiaId: number

      if (editingSubject) {
        // Atualizar matéria existente
        await subjectsApi.update(parseInt(editingSubject.id), materiaDto)
        materiaId = parseInt(editingSubject.id)

        console.log("Matéria atualizada, processando trabalhos...")

        // Processar trabalhos
        for (const trabalho of trabalhos) {
          // Validar se tem título
          if (!trabalho.titulo.trim()) {
            console.log("Ignorando trabalho sem título")
            continue
          }

          const trabalhoDto = {
            titulo: trabalho.titulo,
            descricao: trabalho.descricao || "",
            dataEntrega: new Date(trabalho.dataEntrega).toISOString(),
            concluido: trabalho.concluido
          }

          if (trabalho.id) {
            // Atualizar trabalho existente
            console.log("Atualizando trabalho:", trabalho.id)
            await subjectsApi.updateTrabalho(materiaId, trabalho.id, trabalhoDto)
          } else {
            // Criar novo trabalho
            console.log("Criando novo trabalho:", trabalhoDto)
            await subjectsApi.addTrabalho(materiaId, trabalhoDto)
          }
        }
      } else {
        // Criar nova matéria
        const materiaResponse = await subjectsApi.create(materiaDto)
        materiaId = materiaResponse.id

        console.log("Nova matéria criada:", materiaId)

        // Adicionar trabalhos para nova matéria
        for (const trabalho of trabalhos) {
          if (!trabalho.titulo.trim()) continue

          const trabalhoDto = {
            titulo: trabalho.titulo,
            descricao: trabalho.descricao || "",
            dataEntrega: new Date(trabalho.dataEntrega).toISOString(),
            concluido: trabalho.concluido
          }

          console.log("Criando trabalho:", trabalhoDto)
          await subjectsApi.addTrabalho(materiaId, trabalhoDto)
        }
      }

      console.log("Matéria e trabalhos salvos com sucesso!")
      await loadDashboardData()
      setSubjectModal(false)
      setSubjectForm({ nome: "", cor: "bg-blue-500", professorId: "", notaProva: "" })
      setTrabalhos([])
      setEditingSubject(null)
    } catch (error) {
      console.error("Erro ao salvar matéria:", error)
      alert("Erro ao salvar matéria: " + (error instanceof Error ? error.message : "Erro desconhecido"))
    }
  }

  const deleteSubject = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta matéria?")) return

    try {
      await subjectsApi.delete(parseInt(id))
      await loadDashboardData()
    } catch (error) {
      console.error("Erro ao deletar matéria:", error)
      alert("Erro ao deletar matéria")
    }
  }

  const registerAttendance = async (id: string) => {
    try {
      await subjectsApi.registerAttendance(parseInt(id))
      await loadDashboardData()
    } catch (error) {
      console.error("Erro ao registrar presença:", error)
    }
  }

  // Note CRUD
  const openNoteModal = (note?: Note) => {
    if (note) {
      setEditingNote(note)
      setNoteForm({ titulo: note.title, conteudo: note.content, materiaId: note.subjectId || "none", cor: note.color })
    } else {
      setEditingNote(null)
      setNoteForm({ titulo: "", conteudo: "", materiaId: "none", cor: "bg-blue-50" })
    }
    setNoteModal(true)
  }

  const saveNote = async () => {
    try {
      if (!noteForm.titulo || !noteForm.conteudo) {
        alert("Título e conteúdo são obrigatórios")
        return
      }

      const materiaId = noteForm.materiaId === "none" ? undefined : parseInt(noteForm.materiaId)

      if (editingNote) {
        await notesApi.update(parseInt(editingNote.id), {
          titulo: noteForm.titulo,
          conteudo: noteForm.conteudo,
          materiaId: materiaId
        })
      } else {
        await notesApi.create({
          titulo: noteForm.titulo,
          conteudo: noteForm.conteudo,
          materiaId: materiaId
        })
      }
      await loadDashboardData()
      setNoteModal(false)
      setNoteForm({ titulo: "", conteudo: "", materiaId: "none", cor: "bg-blue-50" })
    } catch (error) {
      console.error("Erro ao salvar anotação:", error)
      alert("Erro ao salvar anotação: " + (error instanceof Error ? error.message : "Erro desconhecido"))
    }
  }

  const deleteNote = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta anotação?")) return

    try {
      await notesApi.delete(parseInt(id))
      await loadDashboardData()
    } catch (error) {
      console.error("Erro ao deletar anotação:", error)
      alert("Erro ao deletar anotação")
    }
  }

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/fundo.png')" }}
      >
        <div className="text-center space-y-4">
          <img
            src="/zoombi.gif"
            alt="Loading animation"
            className="h-24 w-24 mx-auto"
          />

          <p className="text-lg text-white font-medium">Cééééééééérebros......</p>
        </div>
      </div>
    )
  }


  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-16 w-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold">Erro ao carregar dados</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={loadDashboardData}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (

    <div className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: "url('/fundo2.png')",
            filter: "blur(2px)",     // <<< leve, mas visível
            transform: "scale(1.05)" // evita bordas pretas do blur
          }}
        />

        {/* Overlay clicável no mobile */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* SIDEBAR MOBILE */}

        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 transform bg-[#1a0e1f] text-white transition-transform duration-300 ease-in-out md:hidden border-r border-[#120912]",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-2xl overflow-hidden">
                <img
                  src="/zoombi.png"
                  alt="Logo Zoombi"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-semibold">Zoombi</h2>
                <p className="text-xs text-purple-300">Organize seus estudos</p>
              </div>
            </div>


            <ScrollArea className="flex-1 px-3 py-2">
              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setActiveTab(item.value);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-white transition",
                      activeTab === item.value
                        ? "bg-[#341b39]"
                        : "hover:bg-[#2a1530]"
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-[#120912] p-3">
              <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-[#2a1530] text-white">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{student?.name?.charAt(0) || "E"}</AvatarFallback>
                </Avatar>
                <span>{student?.name || "Estudante"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR DESKTOP */}

        <div
          className={cn(
            "fixed inset-y-0 left-0 z-30 hidden w-64 transform border-r border-[#120912] bg-[#1a0e1f] text-white transition-transform duration-300 ease-in-out md:block",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-10 items-center justify-center rounded-2xl overflow-hidden">
                  <img
                    src="/zoombi.png"
                    alt="Logo Zoombi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-semibold">Zoombi</h2>
                  <p className="text-xs text-purple-300">Organize seus estudos</p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 px-3 py-2">
              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setActiveTab(item.value)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-white transition",
                      activeTab === item.value
                        ? "bg-[#341b39]"
                        : "hover:bg-[#2a1530]"
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div
          className={cn(
            "min-h-screen transition-all duration-300 ease-in-out",
            sidebarOpen ? "md:pl-64" : "md:pl-0",
          )}
        >
          <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-[#120912] bg-[#1a0e1f] px-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5 text-white" />
            </Button>

            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <PanelLeft className="h-5 w-5 text-white" />
            </Button>

            <div className="flex flex-1 items-center justify-between text-white">
              <h1 className="text-xl font-semibold">Olá, {student?.name || "Estudante"}!</h1>

              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-[#5a2d82]">
                  <AvatarFallback>{student?.name?.charAt(0) || "E"}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>


          <main className="flex-1 p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-8">
                <TabsList className="grid w-full max-w-[600px] grid-cols-5 rounded-2xl p-1">
                  <TabsTrigger value="painel" className="rounded-xl">Painel</TabsTrigger>
                  <TabsTrigger value="aulas" className="rounded-xl">Aulas</TabsTrigger>
                  <TabsTrigger value="professores" className="rounded-xl">Professores</TabsTrigger>
                  <TabsTrigger value="anotacoes" className="rounded-xl">Anotações</TabsTrigger>
                  <TabsTrigger value="perfil" className="rounded-xl">Perfil</TabsTrigger>
                </TabsList>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="painel" className="space-y-8 mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white"
                    >
                      <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl mb-4">Seu Progresso</Badge>
                      <h2 className="text-3xl font-bold">Continue assim!</h2>
                      <p className="max-w-[600px] text-white/80 mt-2">
                        Você está no caminho certo. Continue dedicado aos seus estudos e alcance seus objetivos.
                      </p>
                    </motion.div>

                    <section className="space-y-4">
                      <h2 className="text-2xl font-semibold">Métricas de Progresso</h2>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="overflow-hidden rounded-3xl border-2">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">Frequência</CardTitle>
                              <Calendar className="h-5 w-5 text-blue-500" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">
                                  {Math.round(
                                    (subjects.reduce((acc, s) => acc + s.attendedClasses, 0) /
                                      Math.max(subjects.reduce((acc, s) => acc + s.totalClasses, 0), 1)) *
                                    100,
                                  )}%
                                </span>
                                <span className="text-sm text-muted-foreground">de presença</span>
                              </div>
                              <Progress
                                value={
                                  (subjects.reduce((acc, s) => acc + s.attendedClasses, 0) /
                                    Math.max(subjects.reduce((acc, s) => acc + s.totalClasses, 0), 1)) *
                                  100
                                }
                                className="h-2 rounded-xl"
                              />
                              <p className="text-sm text-muted-foreground">
                                {subjects.reduce((acc, s) => acc + s.attendedClasses, 0)} de{" "}
                                {subjects.reduce((acc, s) => acc + s.totalClasses, 0)} aulas
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="overflow-hidden rounded-3xl border-2">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">Trabalhos</CardTitle>
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">
                                  {Math.round(
                                    (subjects.reduce((acc, s) => acc + s.completedAssignments, 0) /
                                      Math.max(subjects.reduce((acc, s) => acc + s.assignments, 0), 1)) *
                                    100,
                                  )}%
                                </span>
                                <span className="text-sm text-muted-foreground">concluídos</span>
                              </div>
                              <Progress
                                value={
                                  (subjects.reduce((acc, s) => acc + s.completedAssignments, 0) /
                                    Math.max(subjects.reduce((acc, s) => acc + s.assignments, 0), 1)) *
                                  100
                                }
                                className="h-2 rounded-xl"
                              />
                              <p className="text-sm text-muted-foreground">
                                {subjects.reduce((acc, s) => acc + s.completedAssignments, 0)} de{" "}
                                {subjects.reduce((acc, s) => acc + s.assignments, 0)} trabalhos
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="overflow-hidden rounded-3xl border-2 bg-gradient-to-br from-primary/10 to-purple-500/10">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">Pontuação Geral</CardTitle>
                              <Award className="h-5 w-5 text-amber-500" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">{calculateScore()}</span>
                                <span className="text-sm text-muted-foreground">/ 100 pontos</span>
                              </div>
                              <Progress value={calculateScore()} className="h-2 rounded-xl" />
                              <p className="text-sm text-muted-foreground">Baseado em frequência e trabalhos</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Resumo das Matérias</h2>
                        <Button variant="ghost" className="rounded-2xl" onClick={() => setActiveTab("aulas")}>
                          Ver Todas
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {subjects.slice(0, 4).map((subject) => (
                          <Card key={subject.id} className="overflow-hidden rounded-3xl">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={cn("h-3 w-3 rounded-full", subject.color)} />
                                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                                </div>
                                <Badge variant="outline" className="rounded-xl">
                                  Nota: {subject.testGrade}
                                </Badge>
                              </div>
                              <CardDescription>{subject.teacher}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Frequência:</span>
                                  <span className="font-medium">
                                    {subject.attendedClasses}/{subject.totalClasses}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Trabalhos:</span>
                                  <span className="font-medium">
                                    {subject.completedAssignments}/{subject.assignments}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  </TabsContent>

                  <TabsContent value="aulas" className="space-y-8 mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Minhas Aulas</h2>
                          <p className="max-w-[600px] text-white/80">
                            Acompanhe suas matérias, presenças, trabalhos e notas em um só lugar.
                          </p>
                        </div>
                        <Button className="w-fit rounded-2xl bg-white text-emerald-700 hover:bg-white/90" onClick={() => openSubjectModal()}>
                          <Plus className="mr-2 h-4 w-4" />
                          Nova Matéria
                        </Button>
                      </div>
                    </motion.div>

                    <section className="space-y-4">
                      <h2 className="text-2xl font-semibold">Todas as Matérias</h2>
                      {subjects.length === 0 ? (
                        <Card className="rounded-3xl p-12">
                          <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold">Nenhuma matéria cadastrada</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                              Comece adicionando suas matérias para acompanhar seu progresso acadêmico
                            </p>
                            <Button className="rounded-2xl" onClick={() => openSubjectModal()}>
                              <Plus className="mr-2 h-4 w-4" />
                              Adicionar Primeira Matéria
                            </Button>
                          </div>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {subjects.map((subject) => (
                            <Card key={subject.id} className="overflow-hidden rounded-3xl border-2">
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white", subject.color)}>
                                      <BookOpen className="h-6 w-6" />
                                    </div>
                                    <div>
                                      <CardTitle className="text-xl">{subject.name}</CardTitle>
                                      <CardDescription>{subject.teacher}</CardDescription>
                                    </div>
                                  </div>
                                  <Badge className="rounded-xl text-lg px-3 py-1">Nota: {subject.testGrade}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="font-medium">Frequência</span>
                                      <span>{Math.round((subject.attendedClasses / Math.max(subject.totalClasses, 1)) * 100)}%</span>
                                    </div>
                                    <Progress value={(subject.attendedClasses / Math.max(subject.totalClasses, 1)) * 100} className="h-2 rounded-xl" />
                                    <p className="text-xs text-muted-foreground">
                                      {subject.attendedClasses} de {subject.totalClasses} aulas
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="font-medium">Trabalhos</span>
                                      <span>{Math.round((subject.completedAssignments / Math.max(subject.assignments, 1)) * 100)}%</span>
                                    </div>
                                    <Progress value={(subject.completedAssignments / Math.max(subject.assignments, 1)) * 100} className="h-2 rounded-xl" />
                                    <p className="text-xs text-muted-foreground">
                                      {subject.completedAssignments} de {subject.assignments} concluídos
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="font-medium">Desempenho</span>
                                      <span>{subject.testGrade}/10</span>
                                    </div>
                                    <Progress value={subject.testGrade * 10} className="h-2 rounded-xl" />
                                    <p className="text-xs text-muted-foreground">Média das provas</p>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="flex gap-2">
                                <Button variant="secondary" className="flex-1 rounded-2xl">
                                  Ver Detalhes
                                </Button>
                                <Button variant="outline" className="rounded-2xl bg-transparent" onClick={() => registerAttendance(subject.id)}>
                                  Registrar Presença
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-2xl bg-transparent" onClick={() => openSubjectModal(subject)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-2xl bg-transparent text-red-500" onClick={() => deleteSubject(subject.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </section>
                  </TabsContent>

                  <TabsContent value="professores" className="space-y-8 mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Meus Professores</h2>
                          <p className="max-w-[600px] text-white/80">
                            Gerencie os contatos e informações dos seus professores.
                          </p>
                        </div>
                        <Button className="w-fit rounded-2xl bg-white text-purple-700 hover:bg-white/90" onClick={() => openTeacherModal()}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Adicionar Professor
                        </Button>
                      </div>
                    </motion.div>

                    <section className="space-y-4">
                      <h2 className="text-2xl font-semibold">Todos os Professores</h2>
                      {teachers.length === 0 ? (
                        <Card className="rounded-3xl p-12">
                          <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                              <UserPlus className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold">Nenhum professor cadastrado</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                              Adicione professores para poder criar matérias e organizar seus estudos
                            </p>
                            <Button className="rounded-2xl" onClick={() => openTeacherModal()}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Adicionar Primeiro Professor
                            </Button>
                          </div>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {teachers.map((teacher) => (
                            <Card key={teacher.id} className="overflow-hidden rounded-3xl border-2">
                              <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12">
                                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <CardTitle className="text-lg">{teacher.name}</CardTitle>
                                    <CardDescription>{teacher.subject}</CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-4 w-4" />
                                  <span>{teacher.email}</span>
                                </div>
                              </CardContent>
                              <CardFooter className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1 rounded-2xl bg-transparent">
                                  <Mail className="mr-2 h-4 w-4" />
                                  Contatar
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-2xl" onClick={() => openTeacherModal(teacher)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-2xl text-red-500" onClick={() => deleteTeacher(teacher.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </section>
                  </TabsContent>

                  <TabsContent value="anotacoes" className="space-y-8 mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Minhas Anotações</h2>
                          <p className="max-w-[600px] text-white/80">
                            Organize e guarde todas as suas anotações de estudo em um só lugar.
                          </p>
                        </div>
                        <Button className="w-fit rounded-2xl bg-white text-orange-700 hover:bg-white/90" onClick={() => openNoteModal()}>
                          <Plus className="mr-2 h-4 w-4" />
                          Nova Anotação
                        </Button>
                      </div>
                    </motion.div>

                    <section className="space-y-4">
                      <h2 className="text-2xl font-semibold">Todas as Anotações</h2>
                      {notes.length === 0 ? (
                        <Card className="rounded-3xl p-12">
                          <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                              <FileText className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold">Nenhuma anotação ainda</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                              Comece criando sua primeira anotação para organizar seus estudos
                            </p>
                            <Button className="rounded-2xl" onClick={() => openNoteModal()}>
                              <Plus className="mr-2 h-4 w-4" />
                              Criar Primeira Anotação
                            </Button>
                          </div>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {notes.map((note) => (
                            <Card key={note.id} className={cn("overflow-hidden rounded-3xl border-2", note.color)}>
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="rounded-xl">
                                    {note.subject}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{note.date}</span>
                                </div>
                                <CardTitle className="text-lg">{note.title}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                              </CardContent>
                              <CardFooter className="flex gap-2">
                                <Button variant="ghost" size="sm" className="flex-1 rounded-2xl">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-2xl" onClick={() => openNoteModal(note)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-2xl text-red-500" onClick={() => deleteNote(note.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </section>
                  </TabsContent>

                  <TabsContent value="perfil" className="space-y-8 mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-6">
                          <Avatar className="h-24 w-24 border-4 border-white/20">
                            <AvatarFallback className="text-2xl">{student?.name?.charAt(0) || "E"}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-2">
                            <h2 className="text-3xl font-bold">{student?.name || "Estudante"}</h2>
                            <p className="text-white/80">{student?.email}</p>
                            <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Conta Ativa</Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <Card className="rounded-3xl">
                        <CardHeader>
                          <CardTitle>Informações Pessoais</CardTitle>
                          <CardDescription>Gerencie suas informações pessoais</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="nome">Nome Completo</Label>
                            <Input id="nome" value={profileForm.nome} onChange={(e) => setProfileForm({ ...profileForm, nome: e.target.value })} className="rounded-2xl" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="rounded-2xl" disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input id="telefone" value={profileForm.telefone} onChange={(e) => setProfileForm({ ...profileForm, telefone: e.target.value })} className="rounded-2xl" placeholder="(11) 99999-9999" />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full rounded-2xl">
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Alterações
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card className="rounded-3xl">
                        <CardHeader>
                          <CardTitle>Estatísticas</CardTitle>
                          <CardDescription>Seu desempenho geral</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total de Matérias</span>
                            <span className="font-bold text-lg">{subjects.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total de Professores</span>
                            <span className="font-bold text-lg">{teachers.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total de Anotações</span>
                            <span className="font-bold text-lg">{notes.length}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Pontuação Geral</span>
                              <span className="font-bold text-lg">{calculateScore()}/100</span>
                            </div>
                            <Progress value={calculateScore()} className="h-2 rounded-xl" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="rounded-3xl">
                      <CardHeader>
                        <CardTitle>Configurações da Conta</CardTitle>
                        <CardDescription>Gerencie sua conta e preferências</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="destructive" className="w-full rounded-2xl" onClick={() => { authApi.logout(); window.location.href = '/login' }}>
                          Sair da Conta
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </main>
        </div>

        {/* Modal Professor */}
        <Dialog open={teacherModal} onOpenChange={setTeacherModal}>
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingTeacher ? "Editar Professor" : "Adicionar Professor"}</DialogTitle>
              <DialogDescription>
                {editingTeacher ? "Atualize as informações do professor" : "Adicione um novo professor ao sistema"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-name">Nome *</Label>
                <Input id="teacher-name" placeholder="Nome do professor" value={teacherForm.nome} onChange={(e) => setTeacherForm({ ...teacherForm, nome: e.target.value })} className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-subject">Disciplina</Label>
                <Input id="teacher-subject" placeholder="Matéria que leciona" value={teacherForm.disciplina} onChange={(e) => setTeacherForm({ ...teacherForm, disciplina: e.target.value })} className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-email">Email *</Label>
                <Input id="teacher-email" type="email" placeholder="email@exemplo.com" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} className="rounded-2xl" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setTeacherModal(false)}>Cancelar</Button>
              <Button className="flex-1 rounded-2xl" onClick={saveTeacher}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Matéria */}
        <Dialog open={subjectModal} onOpenChange={setSubjectModal}>
          <DialogContent className="sm:max-w-[700px] rounded-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSubject ? "Editar Matéria" : "Adicionar Matéria"}</DialogTitle>
              <DialogDescription>
                Preencha as informações da matéria, incluindo nota e trabalhos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Informações Básicas</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject-name">Nome da Matéria *</Label>
                    <Input
                      id="subject-name"
                      placeholder="Ex: História"
                      value={subjectForm.nome}
                      onChange={(e) => setSubjectForm({ ...subjectForm, nome: e.target.value })}
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject-professor">Professor *</Label>
                    <Select value={subjectForm.professorId} onValueChange={(value) => setSubjectForm({ ...subjectForm, professorId: value })}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Selecione o professor" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject-color">Cor da Matéria</Label>
                    <Select value={subjectForm.cor} onValueChange={(value) => setSubjectForm({ ...subjectForm, cor: value })}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Cor" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-4 h-4 rounded-full", color.value)} />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject-nota">Nota da Prova</Label>
                    <Input
                      id="subject-nota"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      placeholder="Digite a nota (0-10)"
                      value={subjectForm.notaProva}
                      onChange={(e) => setSubjectForm({ ...subjectForm, notaProva: e.target.value })}
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Trabalhos */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Trabalhos</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-2xl"
                    onClick={adicionarTrabalho}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Trabalho
                  </Button>
                </div>

                {trabalhos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum trabalho adicionado
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {trabalhos.map((trabalho, index) => (
                      <Card key={index} className="p-4 rounded-2xl">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-3">
                              <Input
                                placeholder="Título do trabalho"
                                value={trabalho.titulo}
                                onChange={(e) => atualizarTrabalho(index, 'titulo', e.target.value)}
                                className="rounded-xl"
                              />

                              <Textarea
                                placeholder="Descrição (opcional)"
                                value={trabalho.descricao}
                                onChange={(e) => atualizarTrabalho(index, 'descricao', e.target.value)}
                                className="rounded-xl resize-none"
                                rows={2}
                              />

                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <Input
                                    type="date"
                                    value={trabalho.dataEntrega}
                                    onChange={(e) => atualizarTrabalho(index, 'dataEntrega', e.target.value)}
                                    className="rounded-xl"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`trabalho-${index}`}
                                    checked={trabalho.concluido}
                                    onCheckedChange={(checked) => atualizarTrabalho(index, 'concluido', checked)}
                                  />
                                  <Label htmlFor={`trabalho-${index}`} className="text-sm cursor-pointer">
                                    Concluído
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => removerTrabalho(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 border-t pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl"
                onClick={() => {
                  setSubjectModal(false)
                  setSubjectForm({ nome: "", cor: "bg-blue-500", professorId: "", notaProva: "" })
                  setTrabalhos([])
                  setEditingSubject(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 rounded-2xl"
                onClick={saveSubject}
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar Matéria
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Anotação */}
        <Dialog open={noteModal} onOpenChange={setNoteModal}>
          <DialogContent className="sm:max-w-[600px] rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingNote ? "Editar Anotação" : "Nova Anotação"}</DialogTitle>
              <DialogDescription>
                {editingNote ? "Atualize sua anotação de estudo" : "Crie uma nova anotação de estudo"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="note-title">Título *</Label>
                <Input id="note-title" placeholder="Título da anotação" value={noteForm.titulo} onChange={(e) => setNoteForm({ ...noteForm, titulo: e.target.value })} className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-subject">Matéria</Label>
                <Select value={noteForm.materiaId} onValueChange={(value) => setNoteForm({ ...noteForm, materiaId: value })}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Selecione a matéria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem matéria</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-content">Conteúdo *</Label>
                <Textarea id="note-content" placeholder="Escreva sua anotação aqui..." rows={6} value={noteForm.conteudo} onChange={(e) => setNoteForm({ ...noteForm, conteudo: e.target.value })} className="rounded-2xl" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setNoteModal(false)}>Cancelar</Button>
              <Button className="flex-1 rounded-2xl" onClick={saveNote}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      )
}