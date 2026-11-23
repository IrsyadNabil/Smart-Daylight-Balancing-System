import { API_BASE_URL, DEMO } from '../config'
import * as demo from './demo'

const KEY = 'sdbs_token'
export const getToken = () => { try { return sessionStorage.getItem(KEY) } catch { return null } }
export const setToken = (t) => { try { sessionStorage.setItem(KEY, t) } catch {} }
export const clearToken = () => { try { sessionStorage.removeItem(KEY) } catch {} }

async function req(path, { method = 'GET', body, query } = {}) {
  const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v)).toString() : ''
  let res
  try {
    res = await fetch(API_BASE_URL + path + qs, {
      method,
      headers: { 'Content-Type': 'application/json', ...(getToken() && { Authorization: 'Bearer ' + getToken() }) },
      body: body ? JSON.stringify(body) : undefined
    })
  } catch {
    throw new Error('Server tidak dapat dihubungi')
  }
  if (res.status === 401 && path !== '/auth/login') {
    clearToken()
    window.dispatchEvent(new Event('auth:expired'))
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error?.message || 'Permintaan gagal (' + res.status + ')')
  return json
}

const real = {
  login: async (username, password) => setToken((await req('/auth/login', { method: 'POST', body: { username, password } })).token),
  getState: () => req('/state'),
  setLight: (id, enabled) => req(`/rooms/${id}/light`, { method: 'POST', body: { enabled } }),
  setMode: (id, mode) => req(`/rooms/${id}/mode`, { method: 'POST', body: { mode } }),
  setBrightness: (id, brightness) => req(`/rooms/${id}/brightness`, { method: 'POST', body: { brightness } }),
  setTarget: (id, target_lux) => req(`/rooms/${id}/target`, { method: 'POST', body: { target_lux } }),
  getReadings: (query) => req('/history/readings', { query }),
  getActivity: (query) => req('/history/activity', { query })
}

const impl = DEMO ? demo : real
export const { login, getState, setLight, setMode, setBrightness, setTarget, getReadings, getActivity } = impl
