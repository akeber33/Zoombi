"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authApi } from "@/lib/api"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError(null)
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Por favor, preencha todos os campos obrigatórios")
      return false
    }

    if (!isLogin) {
      if (!formData.nomeCompleto) {
        setError("Por favor, informe seu nome completo")
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem")
        return false
      }
      if (formData.password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      console.log('[LOGIN] Iniciando', isLogin ? 'login' : 'registro')

      if (isLogin) {
        await authApi.login(formData.email, formData.password)
        window.location.href = "/dashboard"
      } else {
        await authApi.register(formData.nomeCompleto, formData.email, formData.password)
        window.location.href = "/dashboard"
      }
    } catch (err) {
      console.error('[LOGIN] Erro:', err)
      const errorMessage = err instanceof Error ? err.message : "Erro ao processar sua solicitação"
      setError(errorMessage)

      if (errorMessage.includes('Faça login')) {
        setTimeout(() => {
          setIsLogin(true)
          setError('Conta criada! Agora faça login com suas credenciais.')
        }, 1000)
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError(null)
    setFormData({
      nomeCompleto: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">

      {/* === 1. IMAGEM DE FUNDO === */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/fundo.png')" }}
      />

      {/* === 2. OVERLAY — agora sem bloquear clique === */}
      <div className="absolute inset-0 -z-10 bg-black/40 backdrop-blur-sm pointer-events-none"></div>

      {/* === 3. BACKGROUND ANIMADO — agora sem bloquear clique === */}
      <motion.div
        className="absolute inset-0 -z-0 opacity-30 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-3xl border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-[#251a32]">
              {isLogin ? "Entrar na sua conta" : "Criar nova conta"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Entre com suas credenciais para acessar o dashboard"
                : "Preencha os dados abaixo para se juntar à horda"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive" className="rounded-2xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto">Nome Completo</Label>
                  <Input
                    id="nomeCompleto"
                    name="nomeCompleto"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.nomeCompleto}
                    onChange={handleInputChange}
                    className="rounded-2xl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="rounded-2xl pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="rounded-2xl pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 rounded-xl"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="rounded-2xl pl-10"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                className="w-full rounded-2xl h-11 bg-[#251a32]"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <GraduationCap className="h-5 w-5" />
                  </motion.div>
                ) : isLogin ? "Entrar" : "Criar Conta"}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              {isLogin ? (
                <p className="text-muted-foreground">
                  Ainda não é Zoombi?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-[#251a32] font-medium hover:underline"
                  >
                    Criar conta
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Já é Zoombi?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-[#251a32] font-medium hover:underline"
                  >
                    Fazer login
                  </button>
                </p>
              )}
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
        </p>
      </motion.div>
    </div>
  )
}
