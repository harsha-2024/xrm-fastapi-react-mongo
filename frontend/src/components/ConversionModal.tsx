
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Modal from './Modal'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

type Account = { id:string; name:string }

export default function ConversionModal({ open, onClose, lead }: { open:boolean, onClose:()=>void, lead: any }){
  const { token } = useAuth()
  const headers = useMemo(()=> token ? { Authorization: `Bearer ${token}` } : {}, [token])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [accountName, setAccountName] = useState('')
  const [oppName, setOppName] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(()=>{
    setOppName(`${lead?.first_name||''} ${lead?.last_name||''}`.trim() + ' Opportunity')
  }, [lead])

  useEffect(()=>{
    let active = true
    async function run(){
      if(!token) return
      if(!search) { setResults([]); return }
      try {
        const r = await axios.get(API_BASE + '/api/v1/accounts', { headers, params: { q: search, page: 1, size: 10 } })
        if(active) setResults(r.data.items||[])
      } catch(e:any){ if(active) setResults([]) }
    }
    const id = setTimeout(run, 300) // debounce
    return ()=> { active = false; clearTimeout(id) }
  }, [search, token])

  async function submit(){
    if(!token) return
    setLoading(true); setError('')
    try {
      const payload: any = { amount, opportunity_name: oppName, title }
      if(selectedAccount) payload.account_id = selectedAccount.id
      else if(accountName) payload.account_name = accountName
      const r = await axios.post(API_BASE + `/api/v1/leads/${lead.id}/convert`, payload, { headers })
      onClose()
    } catch(e:any){ setError(e?.response?.data?.detail || 'Conversion failed') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h3>Convert Lead</h3>
      <p style={{color:'var(--muted)', marginTop:-6}}>Create contact & opportunity, and attach to an account.</p>

      <label>Search Account</label>
      <input className="input" placeholder="Type to search existing accounts" value={search} onChange={e=> setSearch(e.target.value)} />
      {results.length>0 && (
        <div className="card" style={{marginTop:8, maxHeight:160, overflowY:'auto'}}>
          {results.map(a=> (
            <div key={a.id} style={{display:'flex', justifyContent:'space-between', padding:'6px 8px'}}>
              <span>{a.name}</span>
              <button className="button" onClick={()=>{ setSelectedAccount(a); setSearch(a.name); setResults([]) }}>Select</button>
            </div>
          ))}
        </div>
      )}
      {selectedAccount && (
        <p style={{color:'var(--muted)'}}>Selected account: <strong>{selectedAccount.name}</strong></p>
      )}

      <label style={{marginTop:8}}>Or New Account Name</label>
      <input className="input" placeholder="e.g., ACME Corp" value={accountName} onChange={e=> { setAccountName(e.target.value); setSelectedAccount(null) }} />

      <div className="grid" style={{marginTop:8}}>
        <div className="col-6">
          <label>Opportunity Name</label>
          <input className="input" value={oppName} onChange={e=> setOppName(e.target.value)} />
        </div>
        <div className="col-6">
          <label>Amount</label>
          <input className="input" type="number" min={0} step={0.01} value={amount} onChange={e=> setAmount(parseFloat(e.target.value)||0)} />
        </div>
      </div>

      <label style={{marginTop:8}}>Title (for contact)</label>
      <input className="input" placeholder="e.g., CTO" value={title} onChange={e=> setTitle(e.target.value)} />

      {error && <p style={{color:'tomato'}}>{error}</p>}

      <div style={{display:'flex', gap:8, marginTop:12}}>
        <button className="button" onClick={submit} disabled={loading}>{loading? 'Converting...' : 'Convert'}</button>
        <button className="button" style={{background:'#6c757d'}} onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  )
}
