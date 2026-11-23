export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export const WS_URL = import.meta.env.VITE_WS_URL || '/ws'
export const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'
export const ROOMS = ['room_01', 'room_02']
export const roomLabel = (id) => 'Room ' + id.slice(-2)
