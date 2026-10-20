import { useEffect, useState } from 'react';

function toFormValues(fields, initial) {
  const values = {};
  fields.forEach((field) => {
    const value = initial?.[field.name];
    values[field.name] = value === undefined || value === null ? '' : String(value);
  });
  return values;
}

// Generic create/edit form driven by a field config list.
export default function ResourceForm({ title, fields, initial, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(fields, initial));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(toFormValues(fields, initial));
    setError('');
  }, [fields, initial]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {};
      fields.forEach((field) => {
        payload[field.name] = values[field.name].trim();
      });
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h3 className="font-serif text-lg font-bold text-leather-800">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className={field.wide ? 'sm:col-span-2' : ''}>
            <label htmlFor={`field-${field.name}`} className="label">
              {field.label}
              {field.required && ' *'}
            </label>
            <input
              id={`field-${field.name}`}
              name={field.name}
              type={field.type || 'text'}
              required={field.required}
              value={values[field.name]}
              onChange={handleChange}
              className="input"
            />
          </div>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
