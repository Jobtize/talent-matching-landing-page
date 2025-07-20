import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Brain, Key, Shield, Star, ArrowRight, CheckCircle, Users, Building, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

'use client';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentRole: string;
  experience: string;
  location: string;
  interests: string;
}

export default function Landing() {
  const formRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentRole: '',
    experience: '',
    location: '',
    interests: ''
  });

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // SEO is handled by Next.js layout

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">TalentMatch</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#como-funciona" className="text-slate-600 hover:text-indigo-600 transition-colors">Como Funciona</a>
              <a href="#depoimentos" className="text-slate-600 hover:text-indigo-600 transition-colors">Casos de Sucesso</a>
              <Button variant="outline" size="sm">Para Empresas</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight">
                Encontre Vagas de Emprego Exclusivas:
                <span className="block bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Cadastre seu Currículo em Nosso Banco de Talentos
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Nossa plataforma de recrutamento inteligente conecta você às melhores vagas em empresas inovadoras. Pare de procurar e deixe a oportunidade de carreira perfeita encontrar você.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={scrollToForm}
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Cadastre seu Currículo Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <div className="flex items-center text-slate-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Grátis • Leva 60 segundos • 100% Confidencial
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in-on-scroll">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Uma Forma Inteligente de Impulsionar sua Carreira no Mercado de Trabalho
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Chega de se candidatar a centenas de vagas. Nossa tecnologia encontra as oportunidades que realmente correspondem ao seu perfil e potencial de crescimento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <Card className="fade-in-on-scroll group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Análise de Perfil Além das Palavras-chave</h3>
                <p className="text-slate-600 leading-relaxed">
                  Nosso algoritmo proprietário analisa seu perfil completo — habilidades, experiência e trajetória — para entender o que torna você único. Conectamos você a vagas de emprego que se alinham com seus objetivos de longo prazo, não apenas com uma lista de requisitos.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="fade-in-on-scroll group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Key className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Acesso a Vagas de Emprego Confidenciais e Exclusivas</h3>
                <p className="text-slate-600 leading-relaxed">
                  Muitas das melhores oportunidades nunca são anunciadas publicamente. Nossa rede de talentos oferece acesso exclusivo a vagas em startups de ponta e empresas consolidadas que você não encontrará em outros portais de emprego.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="fade-in-on-scroll group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Sua Busca de Emprego, Seus Termos: Processo 100% Confidencial</h3>
                <p className="text-slate-600 leading-relaxed">
                  Seu perfil é totalmente sigiloso. Só apresentamos você a empresas quando identificamos um forte alinhamento mútuo e com sua permissão explícita. Você está sempre no controle do seu processo seletivo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-in-on-scroll">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Seu Próximo Passo na Carreira em Apenas 3 Etapas
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Seu futuro profissional está a poucos minutos de distância.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="fade-in-on-scroll text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-transparent"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Crie Seu Perfil Profissional</h3>
              <p className="text-slate-600 leading-relaxed">
                Processo rápido que leva apenas 60 segundos. Fale-nos sobre suas habilidades, experiência e objetivos de carreira.
              </p>
            </div>

            {/* Step 2 */}
            <div className="fade-in-on-scroll text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Deixe Nossa IA Encontrar as Melhores Vagas</h3>
              <p className="text-slate-600 leading-relaxed">
                Nosso algoritmo de recrutamento inteligente começa a buscar oportunidades compatíveis imediatamente. Diga adeus à rolagem infinita em quadros de vagas.
              </p>
            </div>

            {/* Step 3 */}
            <div className="fade-in-on-scroll text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Receba Convites para Entrevistas</h3>
              <p className="text-slate-600 leading-relaxed">
                Seja notificado quando encontrarmos a vaga perfeita. Cada oportunidade é avaliada por nossos especialistas para garantir total compatibilidade com seu perfil profissional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section ref={formRef} className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 fade-in-on-scroll">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Junte-se ao Nosso Banco de Talentos e Seja Encontrado por Recrutadores
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Dê o primeiro passo em direção ao seu próximo marco na carreira.
            </p>
          </div>

          <Card className="fade-in-on-scroll shadow-2xl border-0">
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-700 font-medium">Nome</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="João"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-700 font-medium">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Silva"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">Endereço de Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="joao@exemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700 font-medium">Número de Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="+55 (11) 98765-4321"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentRole" className="text-slate-700 font-medium">Cargo Atual ou Desejado</Label>
                    <Input
                      id="currentRole"
                      value={formData.currentRole}
                      onChange={(e) => handleInputChange('currentRole', e.target.value)}
                      className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Engenheiro de Software Sênior"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-slate-700 font-medium">Nível de Experiência</Label>
                    <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                      <SelectTrigger className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                        <SelectValue placeholder="Selecione o nível de experiência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-2">0-2 anos</SelectItem>
                        <SelectItem value="3-5">3-5 anos</SelectItem>
                        <SelectItem value="6-8">6-8 anos</SelectItem>
                        <SelectItem value="9-12">9-12 anos</SelectItem>
                        <SelectItem value="12+">12+ anos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-700 font-medium">Localização de Preferência (Cidade, Estado ou Remoto)</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="São Paulo, SP, ou Remoto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests" className="text-slate-700 font-medium">Áreas de Interesse (Ex: Tecnologia, Finanças, Marketing Digital)</Label>
                  <Input
                    id="interests"
                    value={formData.interests}
                    onChange={(e) => handleInputChange('interests', e.target.value)}
                    className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Tecnologia, Finanças, Marketing Digital"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Quero Receber Vagas Exclusivas
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <p className="text-center text-sm text-slate-500 mt-4">
                  Ao se cadastrar, você concorda com nossos Termos de Serviço e Política de Privacidade. Conectamos talentos a grandes oportunidades.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in-on-scroll">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Profissionais que Confiam em Nossa Plataforma de Recrutamento
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que aceleraram suas carreiras com nossa ajuda.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="fade-in-on-scroll hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="mb-4">
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-semibold">
                    Encontrou sua vaga em 2 semanas
                  </span>
                </div>
                <blockquote className="text-slate-600 mb-6 leading-relaxed">
                  "Esta foi a busca de emprego mais fácil e eficaz que já tive. A correspondência foi incrivelmente precisa e encontrei meu cargo dos sonhos em duas semanas."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-indigo-600 font-bold">SJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Sarah Johnson</p>
                    <p className="text-slate-500 text-sm">Senior Product Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="fade-in-on-scroll hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="mb-4">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                    3 matches perfeitos, 2 ofertas
                  </span>
                </div>
                <blockquote className="text-slate-600 mb-6 leading-relaxed">
                  "A abordagem personalizada fez toda a diferença. Em vez de me candidatar a centenas de empregos, tive três combinações perfeitas e recebi duas ofertas."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-bold">MC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Michael Chen</p>
                    <p className="text-slate-500 text-sm">Lead Data Scientist</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="fade-in-on-scroll hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="mb-4">
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">
                    Processo 100% confidencial
                  </span>
                </div>
                <blockquote className="text-slate-600 mb-6 leading-relaxed">
                  "Finalmente, uma plataforma que entende meus objetivos de carreira. As oportunidades eram exatamente o que eu procurava e o processo foi totalmente confidencial."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold">AR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Alex Rodriguez</p>
                    <p className="text-slate-500 text-sm">Engineering Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted Companies Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 fade-in-on-scroll">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Conectamos Talentos com as Melhores Empresas do Mercado
            </h2>
            <p className="text-slate-600">
              Trabalhamos com empresas líderes em tecnologia, finanças, saúde e outros setores em crescimento.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60 fade-in-on-scroll">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-center h-16 bg-slate-100 rounded-lg">
                <Building className="w-8 h-8 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">TalentMatch</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Conectando talentos excepcionais com oportunidades extraordinárias através de correspondência inteligente.
              </p>
              <p className="text-slate-500 text-xs">
                © 2024 TalentMatch. Todos os direitos reservados.
              </p>
            </div>

            {/* For Candidates */}
            <div>
              <h4 className="font-semibold mb-4">Para Candidatos</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Casos de Sucesso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Recursos de Carreira</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Junte-se à Rede</a></li>
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h4 className="font-semibold mb-4">Para Empresas</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Anunciar Vaga</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Busca de Talentos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Empresas</a></li>
              </ul>
            </div>

            {/* Legal & Contact */}
            <div>
              <h4 className="font-semibold mb-4">Legal e Contato</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Serviço</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Styles are in globals.css */}
    </div>
  );
}
