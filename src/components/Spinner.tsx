// src/components/Spinner.tsx

type SpinnerProps = {
  label?: string;
  className?: string;
};

export function Spinner({ label, className = "" }: SpinnerProps) {
  return (
    <div className={`flex items-center gap-2 text-inherit ${className}`}>
      <span className="inline-block h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
