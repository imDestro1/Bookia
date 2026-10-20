export function LoadingState({ label = 'Cargando…' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-12 text-leather-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-leather-200 border-t-leather-600" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const message = error?.message || 'Ocurrió un error inesperado.';
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-semibold text-red-800">No pudimos cargar la información</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-4">
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="rounded-xl border border-dashed border-leather-200 bg-white/60 p-10 text-center">
      <p className="font-serif text-lg font-semibold text-leather-800">{title}</p>
      {children && <div className="mt-2 text-sm text-stone-600">{children}</div>}
    </div>
  );
}
