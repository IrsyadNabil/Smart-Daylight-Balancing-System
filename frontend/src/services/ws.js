import { WS_URL, DEMO } from '../config'
import { getToken } from './api'
import { subscribe } from './demo'

// connect(onMessage, onLink) -> fungsi untuk berhenti. onLink: 'connecting' | 'open' | 'closed'
export function connect(onMessage, onLink) {
  if (DEMO) { onLink('open'); return subscribe(onMessage) }
  let ws, timer, stopped = false, tries = 0
  const open = () => {
    onLink('connecting')
    const base = WS_URL.startsWith('/') ? (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + WS_URL : WS_URL
    ws = new WebSocket(base + '?token=' + encodeURIComponent(getToken() || ''))
    ws.onopen = () => { tries = 0; onLink('open') }
    ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)) } catch {} }
    ws.onclose = () => {
      onLink('closed')
      if (!stopped) timer = setTimeout(open, Math.min(1000 * 2 ** tries++, 15000))
    }
  }
  open()
  return () => { stopped = true; clearTimeout(timer); ws && ws.close() }
}
