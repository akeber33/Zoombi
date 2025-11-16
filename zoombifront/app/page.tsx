import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skull, Zap, Users, Shield } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skull className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Zoombi</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm hover:text-primary transition-colors">
              Recursos
            </a>
            <a href="#about" className="text-sm hover:text-primary transition-colors">
              Sobre
            </a>
            <a href="#contact" className="text-sm hover:text-primary transition-colors">
              Contato
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Login
            </Button>
            <Link href="/dashboard">
              <Button size="sm">Ir para Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            Novo e Revolucionário
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Bem-vindo ao <span className="text-primary">Zoombi</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
            Organize seus estudos, acompanhe seu progresso e alcance seus objetivos acadêmicos de forma eficiente.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Acessar Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Recursos Principais</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubra tudo o que o Zoombi tem a oferecer para você
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Rápido e Eficiente</h4>
              <p className="text-muted-foreground">
                Performance otimizada para uma experiência fluida e sem interrupções.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Comunidade Ativa</h4>
              <p className="text-muted-foreground">
                Junte-se a milhares de usuários que já fazem parte do Zoombi.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Seguro e Confiável</h4>
              <p className="text-muted-foreground">
                Seus dados protegidos com as melhores práticas de segurança.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto p-8 md:p-12 bg-primary text-primary-foreground">
          <div className="text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h3>
            <p className="text-lg mb-8 opacity-90">
              Junte-se ao Zoombi hoje e descubra todas as possibilidades.
            </p>
            <Button size="lg" variant="secondary">
              Criar Conta Grátis
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Skull className="w-6 h-6 text-primary" />
              <span className="font-semibold">Zoombi</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Zoombi. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Termos
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
