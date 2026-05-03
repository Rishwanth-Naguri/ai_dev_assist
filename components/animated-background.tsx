export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Layered radial base — deep navy/indigo wash so it never reads as flat black. */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(120% 80% at 12% 8%, rgba(76, 29, 149, 0.35), transparent 60%),
            radial-gradient(110% 90% at 88% 20%, rgba(30, 64, 175, 0.32), transparent 55%),
            radial-gradient(90% 70% at 50% 100%, rgba(67, 56, 202, 0.28), transparent 60%),
            linear-gradient(180deg, #0a0612 0%, #07060e 60%, #050409 100%)
          `,
        }}
      />

      {/* Slow-panning gradient sheen on top of the base. */}
      <div
        className="absolute inset-0 opacity-60 animate-gradient-pan"
        style={{
          background:
            "linear-gradient(120deg, transparent 0%, rgba(99, 102, 241, 0.08) 30%, rgba(139, 92, 246, 0.10) 50%, rgba(59, 130, 246, 0.08) 70%, transparent 100%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Floating blobs — purple (top-left), blue (bottom-right), violet (center). */}
      <div
        className="absolute -top-32 -left-24 size-[36rem] rounded-full opacity-50 mix-blend-screen blur-3xl animate-blob-1"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.55), rgba(168, 85, 247, 0) 65%)",
        }}
      />
      <div
        className="absolute -bottom-40 -right-24 size-[40rem] rounded-full opacity-50 mix-blend-screen blur-3xl animate-blob-2"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(59, 130, 246, 0.55), rgba(59, 130, 246, 0) 65%)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 size-[28rem] -translate-x-1/2 rounded-full opacity-35 mix-blend-screen blur-3xl animate-blob-3"
        style={{
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.45), rgba(139, 92, 246, 0) 70%)",
        }}
      />

      {/* Vignette to anchor the corners. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 70% at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  )
}
