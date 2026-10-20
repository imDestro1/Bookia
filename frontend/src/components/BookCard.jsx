import { Link } from 'react-router-dom';
import { countAvailableStores, formatPrice, lowestPrice } from '../services/format';

export default function BookCard({ book }) {
  const price = lowestPrice(book);
  const stores = countAvailableStores(book.offers);
  return (
    <Link
      to={`/libros/${book._id}`}
      className="card group flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-leather-300 hover:shadow-md"
    >
      {book.genre && (
        <span className="mb-3 self-start rounded-full bg-leather-50 px-2.5 py-0.5 text-xs font-semibold text-leather-700">
          {book.genre}
        </span>
      )}
      <h3 className="font-serif text-lg font-bold leading-snug text-ink group-hover:text-leather-700">
        {book.title}
      </h3>
      <p className="mt-1 text-sm text-stone-600">{book.author}</p>
      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <p className="text-sm text-stone-500">
          {price !== null ? (
            <>
              desde{' '}
              <span className="text-base font-bold text-leather-700">{formatPrice(price)}</span>
            </>
          ) : (
            'Sin precio registrado'
          )}
        </p>
        <p className="text-right text-xs font-medium text-sage-700">
          {stores === 1 ? '1 librería' : `${stores} librerías`}
        </p>
      </div>
    </Link>
  );
}
