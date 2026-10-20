export default function AvailabilityBadge({ available }) {
  return available ? (
    <span className="inline-flex items-center rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-semibold text-sage-700">
      Disponible
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
      Agotado
    </span>
  );
}
