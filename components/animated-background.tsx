"use client"

/**
 * Subtle animated background with layered radial gradients.
 * Dark blue, purple, and black tones with slow CSS keyframe movement.
 * Minimal and non-distracting — sits behind all content.
 */
export function AnimatedBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Base gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(88, 28, 135, 0.15), transparent 70%), " +
            "radial-gradient(ellipse 60% 50% at 100% 50%, rgba(30, 64, 175, 0.1), transparent 60%), " +
            "radial-gradient(ellipse 60% 50% at 0% 80%, rgba(88, 28, 135, 0.08), transparent 60%), " +
            "#0a0a0b",
        }}
      />

      {/* Slow-moving gradient layer */}
      <div
        className="absolute inset-0 animate-bg-drift"
        style={{
          background:
            "radial-gradient(circle 600px at 30% 20%, rgba(99, 102, 241, 0.06), transparent 50%), " +
            "radial-gradient(circle 500px at 70% 80%, rgba(139, 92, 246, 0.05), transparent 50%)",
        }}
      />

      {/* Subtle noise texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
