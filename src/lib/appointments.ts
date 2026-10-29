export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export const STATUS_BADGE: Record<string, string> = {
  pending: 'border-yellow-300 text-yellow-700 bg-yellow-50',
  confirmed: 'border-green-300 text-green-700 bg-green-50',
  completed: 'border-gray-300 text-gray-600 bg-gray-50',
  cancelled: 'border-red-300 text-red-600 bg-red-50 line-through',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
}
