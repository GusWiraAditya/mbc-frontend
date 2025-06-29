import { type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border bg-card text-card-foreground shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold tracking-tight text-lg">{title}</h3>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold">{value}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

// Komponen Skeleton untuk ditampilkan saat loading
export function StatCardSkeleton() {
    return (
        <div className="flex flex-col justify-between rounded-xl border bg-card text-card-foreground shadow p-6">
            <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <div>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
            </div>
        </div>
    );
}
