export function AiCoreFallback({ caption = "AI Core" }: { caption?: string }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-6"
      role="img"
      aria-label={caption}
    >
      <div className="relative aspect-square w-[64%] max-w-[290px]">
        <span className="absolute inset-[2.7%] rounded-full border border-core-cyan/55 shadow-[0_0_50px_rgba(56,225,245,0.18)]" />
        <span className="absolute inset-[9.6%] rounded-full border border-core-violet/50" />
        <span className="absolute inset-[15.2%] rounded-full border border-slate-300/30" />
        <span className="absolute inset-[20.3%] rounded-full bg-[radial-gradient(circle_at_36%_30%,#dff8ff_0%,#38e1f5_22%,#0d5468_55%,#070b11_100%)] shadow-[0_0_90px_rgba(56,225,245,0.3)]" />
        <span className="absolute inset-[20.3%] rounded-full ring-1 ring-inset ring-white/10" />
      </div>
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-slate-500">
        {caption}
      </p>
    </div>
  );
}
