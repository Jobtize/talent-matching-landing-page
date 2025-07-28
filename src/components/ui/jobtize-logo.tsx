import React from 'react'

interface JobtizeLogoProps {
  className?: string
  width?: number
  height?: number
}

export const JobtizeLogo: React.FC<JobtizeLogoProps> = ({ 
  className = "", 
  width = 32, 
  height = 32 
}) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Logo SVG baseada na imagem fornecida */}
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-lg"
      >
        {/* Fundo azul - mesma cor das letras para harmonia visual */}
        <rect width="100" height="100" rx="12" fill="#2563EB"/>
        
        {/* Ícone de aperto de mão estilizado */}
        <g transform="translate(20, 25)">
          {/* Mão esquerda */}
          <path 
            d="M15 35 C10 30, 8 25, 12 20 C16 15, 22 18, 25 22 L30 27" 
            stroke="white" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* Mão direita */}
          <path 
            d="M45 35 C50 30, 52 25, 48 20 C44 15, 38 18, 35 22 L30 27" 
            stroke="white" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* Conexão/aperto */}
          <circle cx="30" cy="27" r="3" fill="white"/>
          
          {/* Detalhes adicionais */}
          <path 
            d="M25 30 Q30 25, 35 30" 
            stroke="white" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  )
}

export default JobtizeLogo
