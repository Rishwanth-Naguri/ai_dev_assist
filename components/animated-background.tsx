export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      {/* Cyan glow */}
      <div
        className="animate-blob absolute -top-40 -left-32 size-[36rem] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.78 0.14 195 / 0.55), transparent 70%)",
        }}
      />
      {/* Deep blue glow */}
      <div
        className="animate-blob-slow absolute -bottom-40 -right-32 size-[40rem] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.55 0.18 240 / 0.55), transparent 70%)",
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
    </div>
  )
}
