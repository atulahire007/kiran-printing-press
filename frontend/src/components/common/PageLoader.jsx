export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white dark:bg-gray-950 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2}>
              <path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/>
              <path d="M8 7h8M8 11h8M8 15h5"/>
            </svg>
          </div>
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping" />
      </div>
      <div className="text-center">
        <p className="font-display font-bold text-ink dark:text-white">Kiran Printing Press</p>
        <p className="text-xs text-gray-400 mt-1">Loading...</p>
      </div>
    </div>
  );
}
