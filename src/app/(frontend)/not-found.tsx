'use client'

import React, { useState } from 'react'
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  Home, 
  Phone, 
  Mail, 
  ArrowRight,
  FileText,
  Scale,
  Users,
  Newspaper,
  AlertCircle,
  HelpCircle
} from 'lucide-react'

export default function NotFound() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/fr/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const quickLinks = [
    {
      icon: Home,
      title: 'Accueil',
      description: 'Retour à la page d&apos;accueil',
      href: '/fr'
    },
    {
      icon: Newspaper,
      title: 'Actualités',
      description: 'Actualités et annonces officielles',
      href: '/fr/news'
    },
    {
      icon: Users,
      title: 'À propos',
      description: 'À propos de HAPA',
      href: '/fr/about'
    },
    {
      icon: Scale,
      title: 'Services',
      description: 'Services et procédures',
      href: '/fr/forms'
    },
    {
      icon: FileText,
      title: 'Cadre juridique',
      description: 'Cadre juridique et réglementaire',
      href: '/fr/about/bylaws'
    },
    {
      icon: Phone,
      title: 'Contact',
      description: 'Nous contacter',
      href: '/fr/contact'
    }
  ]

  const popularSearches = [
    'Licences',
    'Actualités',
    'Décisions',
    'Contact',
    'Plaintes'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section with 404 */}
      <section className="section-spacing">
        <div className="hapa-container">
          <div className="text-center max-w-4xl mx-auto">
            {/* 404 Number with HAPA Branding */}
            <div className="relative mb-8">
              <div className="text-[200px] sm:text-[250px] md:text-[300px] font-bold text-primary/20 leading-none select-none" aria-hidden="true">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg transform -rotate-3">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-lg font-semibold">Page non trouvée</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              404 - Page non trouvée
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Désolé, la page que vous recherchez n&apos;existe pas.
            </p>

            {/* Search Section */}
            <Card className="max-w-md mx-auto mb-12">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher dans nos contenus..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                </form>
                
                {/* Popular Searches */}
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Recherches populaires:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {popularSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(term)
                          router.push(`/fr/search?q=${encodeURIComponent(term)}`)
                        }}
                        className="text-xs px-3 py-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button asChild size="lg" className="gap-2">
                <Link href="/fr">
                  <Home className="w-5 h-5" />
                  Retour à l&apos;accueil
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/fr/contact">
                  <HelpCircle className="w-5 h-5" />
                  Obtenir de l&apos;aide
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Links */}
      <section className="section-spacing-sm bg-muted/30">
        <div className="hapa-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Liens utiles
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explorez nos services principaux et trouvez l&apos;information que vous recherchez
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                  <CardContent className="p-6">
                    <Link href={link.href} className="block">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {link.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {link.description}
                          </p>
                          <div className="flex items-center gap-2 mt-3 text-primary group-hover:gap-3 transition-all">
                            <span className="text-sm font-medium">
                              Voir plus
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="section-spacing-sm bg-primary/5">
        <div className="hapa-container">
          <Card className="max-w-2xl mx-auto border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                Besoin d&apos;aide immédiate ?
              </h3>
              <p className="text-muted-foreground mb-6">
                Notre équipe est disponible pour vous aider à naviguer sur notre site et trouver l&apos;information dont vous avez besoin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/fr/contact">
                    <Mail className="w-4 h-4" />
                    Nous écrire
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <a href="tel:+22245252525">
                    <Phone className="w-4 h-4" />
                    Nous appeler
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export const metadata: Metadata = {
  title: '404 - Page non trouvée | HAPA',
  description: 'La page que vous recherchez n&apos;existe pas.',
}