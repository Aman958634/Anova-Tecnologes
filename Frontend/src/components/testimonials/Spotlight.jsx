export default function Spotlight({ active }) {
  return (
    <span
      aria-hidden="true"
      // Cursor-follow light uses CSS variables updated by the card container.
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{
        background:
          'radial-gradient(520px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(134,194,255,0.26), rgba(134,194,255,0) 58%)',
        opacity: active ? 1 : 0,
      }}
    />
  );
}
