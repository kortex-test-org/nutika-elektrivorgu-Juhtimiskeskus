"use client"

import React from "react"

// 🐾 1. Анимированный загрузчик CatSpinner
export function CatSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4 select-none">
      <div className="relative w-24 h-24">
        {/* Spinning dotted track with an adorable orange cat head chasing it */}
        <svg className="w-full h-full animate-[spin_2.5s_linear_infinite]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="35" stroke="#8B5CF6" strokeWidth="4" strokeDasharray="30 15 10 15" strokeLinecap="round" opacity="0.8" />
          {/* Cute Cat Head */}
          <circle cx="50" cy="15" r="10" fill="#F59E0B" />
          {/* Ears */}
          <polygon points="42,10 40,0 47,8" fill="#D97706" />
          <polygon points="58,10 60,0 53,8" fill="#D97706" />
          {/* Eyes & Nose */}
          <circle cx="47" cy="13" r="1.5" fill="#1E293B" />
          <circle cx="53" cy="13" r="1.5" fill="#1E293B" />
          <path d="M 49 16 Q 50 17 51 16" stroke="#1E293B" strokeWidth="1" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl animate-bounce">🐾</span>
        </div>
      </div>
      <p className="text-sm font-medium text-violet-500 animate-pulse font-sans">Мурчим и загружаем... Мяу! 🐾</p>
    </div>
  )
}

// 💤 2. Спящий свернувшийся котик (Curled Sleeping Cat) для состояния OFF
export function SleepingCat({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={`${className} transition-all duration-300 hover:scale-110`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Curled cat body */}
      <circle cx="50" cy="55" r="32" fill="#94A3B8" /> {/* Slate gray */}
      <circle cx="45" cy="55" r="25" fill="#64748B" />
      {/* Head */}
      <circle cx="72" cy="42" r="16" fill="#94A3B8" />
      {/* Ears */}
      <polygon points="62,34 68,18 73,30" fill="#64748B" />
      <polygon points="73,30 79,18 84,34" fill="#64748B" />
      {/* Closed eyes */}
      <path d="M 64 43 Q 68 46 72 43" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 74 43 Q 78 46 82 43" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      {/* Nose and mouth */}
      <path d="M 73.5 47 L 72.5 49 L 71.5 47 Z" fill="#FDA4AF" />
      <path d="M 70 51 Q 72.5 53 72.5 51 Q 72.5 53 75 51" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Tail curled around */}
      <path d="M 22 66 Q 12 50 12 35 Q 12 22 22 22" stroke="#94A3B8" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Little floating Zzz */}
      <text x="18" y="18" fill="#A78BFA" fontSize="16" fontWeight="bold" fontFamily="monospace" className="animate-bounce">💤</text>
    </svg>
  )
}

// ⚡ 3. Активный бодрствующий рыжий котик (Active Ginger Cat) для состояния ON
export function ActiveCat({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={`${className} transition-all duration-300 hover:scale-110`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cat body sitting */}
      <ellipse cx="50" cy="65" rx="22" ry="26" fill="#F59E0B" /> {/* Orange Ginger */}
      {/* Creamy belly */}
      <ellipse cx="50" cy="69" rx="13" ry="17" fill="#FEF3C7" />
      {/* Head */}
      <circle cx="50" cy="34" r="19" fill="#F59E0B" />
      {/* Ears with pink inner ear */}
      <polygon points="33,28 30,8 43,20" fill="#D97706" />
      <polygon points="35,26 33,12 42,20" fill="#FDA4AF" />
      
      <polygon points="67,28 70,8 57,20" fill="#D97706" />
      <polygon points="65,26 67,12 58,20" fill="#FDA4AF" />
      
      {/* Shiny Wide Green/Yellow Eyes */}
      <circle cx="42" cy="32" r="5" fill="#A7F3D0" />
      <circle cx="42" cy="32" r="2.5" fill="#064E3B" />
      <circle cx="40" cy="30" r="1" fill="#FFFFFF" /> {/* catchlight */}
      
      <circle cx="58" cy="32" r="5" fill="#A7F3D0" />
      <circle cx="58" cy="32" r="2.5" fill="#064E3B" />
      <circle cx="56" cy="30" r="1" fill="#FFFFFF" /> {/* catchlight */}
      
      {/* Nose and happy mouth */}
      <path d="M 51 36 L 50 38 L 49 36 Z" fill="#FDA4AF" />
      <path d="M 46 40 Q 50 42.5 50 40 Q 50 42.5 54 40" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
      
      {/* Whiskers */}
      <path d="M 34 38 L 22 36 M 34 41 L 20 41 M 34 44 L 22 46" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
      <path d="M 66 38 L 78 36 M 66 41 L 80 41 M 66 44 L 78 46" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
      
      {/* Upright happy tail */}
      <path d="M 68 76 Q 88 74 82 46 Q 78 30 84 20" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" fill="none" />
      
      {/* Electric Sparks */}
      <path d="M 12 18 L 8 26 L 14 26 L 10 36 L 20 24 L 14 24 Z" fill="#F59E0B" className="animate-pulse" />
      <path d="M 88 18 L 84 26 L 90 26 L 86 36 L 96 24 L 90 24 Z" fill="#F59E0B" className="animate-pulse" />
    </svg>
  )
}

// 🐾 4. Векторная иллюстрация растерянного котика (Confused Empty Cat) для пустых экранов
export function EmptyCat({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg className={`${className} select-none animate-fade-in`} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Confused/thinking cloud */}
      <path d="M 25 25 C 20 20, 10 35, 20 45 C 10 50, 25 65, 35 55 C 45 65, 60 50, 50 40 C 60 30, 40 10, 25 25 Z" fill="#E2E8F0" opacity="0.6" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
      <text x="28" y="44" fill="#64748B" fontSize="16" fontWeight="bold" fontFamily="monospace">?</text>
      
      {/* Curled cat body */}
      <ellipse cx="65" cy="80" rx="30" ry="24" fill="#64748B" />
      {/* Head tilted slightly sideways */}
      <g transform="rotate(-8 60 45)">
        <circle cx="60" cy="45" r="20" fill="#64748B" />
        {/* Confused eyes (one wide, one squinting!) */}
        <circle cx="52" cy="43" r="6" fill="#FFFFFF" />
        <circle cx="52" cy="43" r="2.5" fill="#1E293B" />
        
        <path d="M 64 45 Q 68 40 72 45" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <path d="M 64 45 Q 68 40 72 45" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Nose & tiny mouth */}
        <path d="M 61 50 L 60 52 L 59 50 Z" fill="#FDA4AF" />
        <circle cx="60" cy="55" r="2" fill="#1E293B" />
        
        {/* Pointy ears */}
        <polygon points="42,38 32,18 48,28" fill="#475569" />
        <polygon points="78,38 88,18 72,28" fill="#475569" />
      </g>
      
      {/* Paws */}
      <circle cx="48" cy="98" r="6" fill="#475569" />
      <circle cx="78" cy="98" r="6" fill="#475569" />
      {/* Tail on the floor */}
      <path d="M 92 90 Q 105 100 100 110" stroke="#64748B" strokeWidth="7" strokeLinecap="round" fill="none" />
    </svg>
  )
}
