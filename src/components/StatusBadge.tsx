import { cn } from "@/lib/cn";
import { statusColor } from "@/lib/format";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
        statusColor(status),
      )}
    >
      {status}
    </span>
  );
}
