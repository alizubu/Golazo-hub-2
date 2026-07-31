export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="w-12 h-12 border-4 border-secondary border-t-pitch-bright rounded-full animate-spin"></div>
      <p className="text-muted-foreground font-semibold animate-pulse">Loading...</p>
    </div>
  );
}
