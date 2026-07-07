// components/StatusBadge.tsx
"use client";

interface StatusBadgeProps {
  status: 'available' | 'loaned' | 'reserved' | 'overdue';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StatusBadge({ status, size = 'md', showLabel = true }: StatusBadgeProps) {
  const config = {
    available: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Disponible",
      dot: "bg-green-500",
      border: "border-green-200",
      hover: "hover:bg-green-200"
    },
    loaned: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      label: "Prestado",
      dot: "bg-yellow-500",
      border: "border-yellow-200",
      hover: "hover:bg-yellow-200"
    },
    reserved: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      label: "Reservado",
      dot: "bg-purple-500",
      border: "border-purple-200",
      hover: "hover:bg-purple-200"
    },
    overdue: {
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Vencido",
      dot: "bg-red-500",
      border: "border-red-200",
      hover: "hover:bg-red-200"
    }
  };

  const style = config[status] || config.available;
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  };

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${style.border} ${style.bg} ${style.text} ${sizeClasses[size]} ${style.hover} transition-colors`}>
      <span className={`rounded-full ${style.dot} ${dotSizes[size]}`} />
      {showLabel && style.label}
    </span>
  );
}