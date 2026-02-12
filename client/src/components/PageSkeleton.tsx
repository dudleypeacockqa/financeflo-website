export default function PageSkeleton() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-mono">Loading…</p>
      </div>
    </div>
  );
}
