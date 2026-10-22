// Reservation statuses and display helpers shared by the reader and store screens.

export const MAX_RESERVATION_QUANTITY = 5;

export const RESERVATION_STATUS = {
  pendiente: { label: 'Pendiente', tone: 'bg-amber-100 text-amber-800' },
  confirmada: { label: 'Confirmada', tone: 'bg-sky-100 text-sky-800' },
  entregada: { label: 'Entregada', tone: 'bg-sage-100 text-sage-700' },
  cancelada: { label: 'Cancelada', tone: 'bg-stone-100 text-stone-600' },
  vencida: { label: 'Vencida', tone: 'bg-red-50 text-red-700' },
};

// Statuses that still hold the copies in the store.
export function isActiveReservation(reservation) {
  return reservation?.status === 'pendiente' || reservation?.status === 'confirmada';
}

// Actions a store manager can take from each status: [status to set, button label].
export function managerActions(reservation) {
  if (reservation?.status === 'pendiente') {
    return [
      ['confirmada', 'Confirmar'],
      ['entregada', 'Entregada'],
      ['cancelada', 'Cancelar'],
    ];
  }
  if (reservation?.status === 'confirmada') {
    return [
      ['entregada', 'Entregada'],
      ['cancelada', 'Cancelar'],
    ];
  }
  return [];
}

// Quantities a reader may pick for an offer with `stock` copies (1..min(stock, max)).
export function quantityOptions(stock) {
  const limit = Math.min(Math.max(0, Math.floor(Number(stock)) || 0), MAX_RESERVATION_QUANTITY);
  return Array.from({ length: limit }, (_, index) => index + 1);
}
