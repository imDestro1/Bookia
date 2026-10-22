import { RESERVATION_STATUS } from '../services/reservations';

export default function ReservationStatusBadge({ status }) {
  const info = RESERVATION_STATUS[status] ?? { label: status, tone: 'bg-stone-100 text-stone-600' };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${info.tone}`}>
      {info.label}
    </span>
  );
}
