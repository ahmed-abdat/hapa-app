import React from 'react'

const BeforeLogin: React.FC = () => {
  return (
    <div className="text-center p-4">
      <div className="mb-4">
        <h3 className="text-primary mb-2 text-lg font-bold">
          Haute Autorité de la Presse et de l&apos;Audiovisuel
        </h3>
        <p className="text-gray-600 text-sm m-0 italic">
          الهيئة العليا للصحافة والإعلام المرئي والمسموع
        </p>
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        <p className="m-0">
          Accès réservé aux administrateurs autorisés | للمديرين المعتمدين فقط
        </p>
      </div>
    </div>
  )
}

export default BeforeLogin
