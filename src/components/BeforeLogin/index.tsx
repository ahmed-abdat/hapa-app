import React from 'react'

const BeforeLogin: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#138B3A', marginBottom: '1rem', fontSize: '20px', fontWeight: 'bold' }}>
          Haute Autorité de la Presse et de l&apos;Audiovisuel
        </h3>
        <p style={{ color: '#666', fontSize: '14px', margin: 0, fontStyle: 'italic' }}>
          الهيئة العليا للصحافة والإعلام المرئي والمسموع
        </p>
      </div>
      
      <div style={{ 
        background: 'linear-gradient(135deg, #f8f9fa 0%, rgba(19, 139, 58, 0.1) 100%)',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #138B3A',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        <p style={{ margin: 0, color: '#2C3E50', fontSize: '16px', lineHeight: '1.5' }}>
          <strong>Panneau d&apos;administration</strong>
        </p>
        <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '14px' }}>
          Connectez-vous pour gérer le contenu du site officiel de l&apos;autorité de régulation des médias de Mauritanie.
        </p>
      </div>
      
      <div style={{ marginTop: '1.5rem', fontSize: '12px', color: '#999' }}>
        <p style={{ margin: 0 }}>
          Accès réservé aux administrateurs autorisés | للمديرين المعتمدين فقط
        </p>
      </div>
    </div>
  )
}

export default BeforeLogin
