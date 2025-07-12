import { ReactNode } from "react";

export const ProfileInfoRow = ({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: ReactNode }) => (
    <div className="grid grid-cols-3 gap-4 items-start py-3 border-b border-gray-100 last:border-b-0">
        <div className="col-span-1 flex items-center text-sm font-medium text-muted-foreground">
            <Icon className="h-4 w-4 mr-2" />
            <span>{label}</span>
        </div>
        <div className="col-span-2 text-md">{children}</div>
    </div>
);