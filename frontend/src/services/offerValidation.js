// Validates the initial offer of a new book; returns an error message or ''.
export function validateInitialOffer(offer) {
  if (!offer.enabled) return '';
  if (!offer.store_id) return 'Elige la librería donde se vende el libro.';
  const price = Number(offer.price);
  if (offer.price === '' || !Number.isFinite(price) || price <= 0) {
    return 'El precio debe ser mayor a 0.';
  }
  const stock = Number(offer.stock);
  if (offer.stock === '' || !Number.isInteger(stock) || stock < 0) {
    return 'Las existencias deben ser un número entero de 0 o más.';
  }
  return '';
}
