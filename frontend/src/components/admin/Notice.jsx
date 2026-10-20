export default function Notice({ notice, onClose }) {
  if (!notice) return null;
  const tone =
    notice.type === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-sage-600/30 bg-sage-100 text-sage-700';
  return (
    <div
      role="status"
      className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${tone}`}
    >
      <span>{notice.text}</span>
      <button type="button" onClick={onClose} className="font-bold" aria-label="Cerrar aviso">
        ×
      </button>
    </div>
  );
}
