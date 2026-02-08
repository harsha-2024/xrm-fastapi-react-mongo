
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import ConversionModal from '../components/ConversionModal'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

type Lead = { id:string; first_name:string; last_name:string; email?:string; phone?:string; status:string }

export default function Leads(){
  const { token } = useAuth()
  const [rows, setRows] = useState<Lead[]>([])
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const [open, setOpen] = useState(false)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  async function load(){
    if(!token) return
    const r = await axios.get(API_BASE + '/api/v1/leads', { headers })
    setRows(r.data.items||[])
  }

  useEffect(()=>{ load() }, [token])

  function onConvertClick(lead: Lead){ setActiveLead(lead); setOpen(true) }
  function onClose(){ setOpen(false); setActiveLead(null); load() }

  return (
    <div>
      <h2>Leads</h2>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(l=> (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.first_name}</td>
                <td>{l.last_name}</td>
                <td>{l.status}</td>
                <td>
                  {l.status !== 'converted' ? (
                    <button className="button" onClick={()=>onConvertClick(l)}>Convert</button>
                  ) : (
                    <span style={{color:'var(--muted)'}}>Converted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConversionModal open={open} onClose={onClose} lead={activeLead} />
    </div>
  )
}
