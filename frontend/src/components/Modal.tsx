
import { ReactNode, useEffect } from 'react'

export default function Modal({ open, onClose, children }: { open: boolean, onClose: ()=>void, children: ReactNode }) {
  useEffect(()=>{
    function onEsc(e: KeyboardEvent){ if(e.key==='Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    return ()=> document.removeEventListener('keydown', onEsc)
  }, [onClose])
  if(!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e=> e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
