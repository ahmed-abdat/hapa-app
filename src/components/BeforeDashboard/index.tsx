import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Bienvenue dans votre tableau de bord HAPA!</h4>
        <p style={{ marginBottom: 0, fontSize: '14px', opacity: 0.9 }}>
          Welcome to your HAPA dashboard! | أهلاً بك في لوحة تحكم الهيئة!
        </p>
      </Banner>
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #D4A574' }}>
        <h5 style={{ color: '#065986', marginBottom: '0.5rem' }}>
          🏛️ Haute Autorité de la Presse et de l'Audiovisuel
        </h5>
        <p style={{ margin: 0, color: '#2C3E50', fontSize: '14px' }}>
          Système de gestion de contenu pour l'autorité de régulation des médias de Mauritanie
        </p>
      </div>
      Voici ce que vous pouvez faire:
      <ul className={`${baseClass}__instructions`}>
        <li>
          📝 <strong>Créer du contenu:</strong> Utilisez les sections <em>Pages</em> et <em>Articles</em> pour publier du contenu en français et en arabe.
        </li>
        <li>
          🌐 <strong>Navigation bilingue:</strong> Gérez les menus Header et Footer avec des liens localisés pour les deux langues.
        </li>
        <li>
          📊 <strong>Médias et documents:</strong> Téléchargez des images, PDFs et documents officiels dans la section <em>Médias</em>.
        </li>
        <li>
          📮 <strong>Feedback public:</strong> Consultez les messages du public dans la section <em>Feedback</em>.
        </li>
        <li>
          🏷️ <strong>Catégories:</strong> Organisez votre contenu avec des catégories bilingues.
        </li>
      </ul>
      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e8f4f8', borderRadius: '6px', border: '1px solid #065986' }}>
        <h6 style={{ color: '#065986', marginBottom: '0.5rem' }}>💡 Guide d'utilisation bilingue:</h6>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '14px' }}>
          <li><strong>🇫🇷 Français:</strong> Cliquez sur l'onglet "Français" pour modifier le contenu en français</li>
          <li><strong>🇲🇷 العربية:</strong> Cliquez sur l'onglet "العربية" pour modifier le contenu en arabe (RTL automatique)</li>
          <li><strong>👀 Prévisualisation:</strong> Visitez <code>/fr/page</code> ou <code>/ar/page</code> pour voir le résultat</li>
          <li><strong>🔄 Fallback:</strong> Si une traduction arabe manque, le contenu français s'affiche par défaut</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '6px', border: '1px solid #D4A574' }}>
        <h6 style={{ color: '#856404', marginBottom: '0.5rem' }}>⚠️ Important pour HAPA:</h6>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '14px', color: '#856404' }}>
          <li>Toujours remplir le contenu français en premier (langue par défaut)</li>
          <li>Ajouter la traduction arabe pour l'accessibilité publique</li>
          <li>Vérifier les deux versions avant publication</li>
        </ul>
      </div>
    </div>
  )
}

export default BeforeDashboard
