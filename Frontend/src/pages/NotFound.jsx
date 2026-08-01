import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section-shell py-24 text-center text-white sm:py-28">
      <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
        The page you requested does not exist or may have been moved. Use the link below to continue browsing.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-[#2f6df7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#245fe0]"
      >
        Return to Home
      </Link>
    </section>
  );
}
