import { cn } from "@/lib/utils";


export function PlanButton({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-colors",
          active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {children}
      </button>
    )
  }