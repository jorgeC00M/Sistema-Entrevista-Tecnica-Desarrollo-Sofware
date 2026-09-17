export default function Mensaje({ autor, children }) {
  const esSistema = autor === 'sistema'
  return (
    <div className={`flex ${esSistema ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap sm:max-w-[75%] ${
          esSistema ? 'bg-white text-slate-800 ring-1 ring-slate-200' : 'bg-indigo-600 text-white'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
