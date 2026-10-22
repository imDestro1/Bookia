// Editable store fields, shared by the admin store list and the store owner panel.
export const STORE_FIELDS = [
  { name: 'name', label: 'Nombre', required: true, wide: true },
  { name: 'address', label: 'Dirección', required: true, wide: true },
  { name: 'phone', label: 'Teléfono', type: 'tel' },
  { name: 'schedule', label: 'Horario' },
  { name: 'maps_url', label: 'Enlace de Google Maps', type: 'url', wide: true },
];
