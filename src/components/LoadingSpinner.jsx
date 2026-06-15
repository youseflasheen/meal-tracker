const LoadingSpinner = ({ text = 'جاري التحميل...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 animate-fade-in">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-surface-2"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-primary/30 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="text-text-muted text-sm font-medium animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
