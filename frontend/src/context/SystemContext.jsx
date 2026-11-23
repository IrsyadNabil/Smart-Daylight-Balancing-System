import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import * as api from '../services/api'
import { connect } from '../services/ws'

const Ctx = createContext(null)
export const useSystem = () => useContext(Ctx)

export function SystemProvider({ children }) {
  const [token, setTokenState] = useState(api.getToken())
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [link, setLink] = useState('connecting')
  const [updated, setUpdated] = useState(null)
  const [trend, setTrend] = useState([])
  const [toasts, setToasts] = useState([])
  const lux = useRef({})

  const login = async (u, p) => { await api.login(u, p); setTokenState(api.getToken()) }
  const logout = useCallback(() => { api.clearToken(); setTokenState(null); setData(null); setTrend([]) }, [])
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id))

  useEffect(() => {
    window.addEventListener('auth:expired', logout)
    return () => window.removeEventListener('auth:expired', logout)
  }, [logout])

  const onMsg = useCallback((m) => {
    const d = m.data
    setUpdated(new Date())
    if (m.type === 'snapshot') {
      setData(d)
      Object.entries(d.rooms).forEach(([id, r]) => (lux.current[id] = r.latest_lux))
    } else if (m.type === 'room.update') {
      const { room_id, ...rest } = d
      setData((s) => s && { ...s, rooms: { ...s.rooms, [room_id]: { ...s.rooms[room_id], ...rest } } })
      if (rest.latest_lux !== undefined) {
        lux.current[room_id] = rest.latest_lux
        if (room_id === 'room_02') setTrend((t) => [...t.slice(-39), { t: new Date().toLocaleTimeString('id-ID'), ...lux.current }])
      }
    } else if (m.type === 'device.update' || m.type === 'device.status') {
      setData((s) => s && { ...s, device: { ...s.device, ...d } })
    } else if (m.type === 'notification') {
      const id = Date.now() + Math.random()
      setToasts((t) => [...t, { id, ...d }])
      setTimeout(() => dismiss(id), 8000)
    }
  }, [])

  useEffect(() => {
    if (!token) return
    let dead = false
    api.getState().then((s) => { if (!dead) { setData(s); setError(''); setUpdated(new Date()); Object.entries(s.rooms).forEach(([id, r]) => (lux.current[id] = r.latest_lux)) } })
      .catch((e) => !dead && setError(e.message))
    const off = connect(onMsg, setLink)
    return () => { dead = true; off() }
  }, [token, onMsg])

  return <Ctx.Provider value={{ token, data, error, link, updated, trend, toasts, dismiss, login, logout }}>{children}</Ctx.Provider>
}
