export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Soft starfield grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Floating blob 1 — deep violet, top-left */}
      <div
        className="animate-blob-a absolute -top-32 -left-32 size-[42rem] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.55 0.24 295 / 0.7) 0%, transparent 65%)",
        }}
      />

      {/* Floating blob 2 — electric blue, mid-right */}
      <div
        className="animate-blob-b absolute top-1/3 -right-40 size-[44rem] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.6 0.2 235 / 0.65) 0%, transparent 65%)",
        }}
      />

      {/* Floating blob 3 — indigo, bottom-center */}
      <div
        className="animate-blob-c absolute -bottom-40 left-1/4 size-[38rem] rounded-full opacity-45 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.5 0.22 265 / 0.7) 0%, transparent 65%)",
        }}
      />

      {/* Small accent — cyan highlight */}
      <div
        className="animate-blob-a absolute top-1/4 left-1/3 size-[18rem] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.78 0.14 200 / 0.6) 0%, transparent 65%)",
          animationDelay: "-8s",
        }}
      />

      {/* Top vignette for header readability */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent" />
      {/* Bottom vignette for depth */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  )
}
