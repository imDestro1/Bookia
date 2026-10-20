import { formatStock, stockLevel } from '../services/format';

const LEVEL_CLASSES = {
  ok: 'bg-sage-100 text-sage-700',
  low: 'bg-amber-100 text-amber-800',
  out: 'bg-stone-200 text-stone-600',
};

// Badge showing how many copies an offer has: "3 ejemplares", "Pocas unidades" style, "Agotado".
export default function AvailabilityBadge({ stock }) {
  const level = stockLevel(stock);
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_CLASSES[level]}`}
      title={level === 'low' ? 'Pocas unidades' : undefined}
    >
      {formatStock(stock)}
      {level === 'low' && <span className="ml-1 font-normal">· Pocas unidades</span>}
    </span>
  );
}
