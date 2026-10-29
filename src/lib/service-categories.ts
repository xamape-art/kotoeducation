// Original service categories are stored in English; new ones created in the panel are stored as typed
export const CATEGORY_LABELS: Record<string, string> = {
  walk: 'Paseos',
  visit: 'Visitas',
  care: 'Cuidado',
  training: 'Educación',
}

export const categoryLabel = (category: string) => CATEGORY_LABELS[category] ?? category

export function formatPrice(price: number) {
  return `${Number(price).toLocaleString('es-ES', { maximumFractionDigits: 2 })}€`
}
