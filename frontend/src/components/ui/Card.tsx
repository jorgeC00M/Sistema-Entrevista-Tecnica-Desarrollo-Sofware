import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: Props) {
  return (
    <div className={`rounded-superficie border border-tinta-100 bg-white p-4 ${className}`}>
      {children}
    </div>
  )
}
