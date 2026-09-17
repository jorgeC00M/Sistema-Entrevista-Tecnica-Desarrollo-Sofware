import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: Props) {
  return (
    <div className={`rounded-lg bg-white p-4 ring-1 ring-slate-200 ${className}`}>{children}</div>
  )
}
