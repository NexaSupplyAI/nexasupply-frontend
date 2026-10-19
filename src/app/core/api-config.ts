const local = typeof window !== 'undefined'
  && ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_CONFIG = {
  inventory: local ? 'http://localhost:8081' : '/backend/inventory',
  orders: local ? 'http://localhost:8082' : '/backend/orders',
  suppliers: local ? 'http://localhost:8083' : '/backend/suppliers',
  reporting: local ? 'http://localhost:8084' : '/backend/reporting',
  ai: local ? 'http://localhost:8085' : '/backend/ai'
} as const;
