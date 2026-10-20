import { Link } from 'react-router-dom';

export default function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm font-semibold text-leather-600 hover:underline"
    >
      <span aria-hidden="true">←</span> {children}
    </Link>
  );
}
