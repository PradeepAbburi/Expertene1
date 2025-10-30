export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-muted animate-pulse rounded-md ${className}`}
      aria-hidden
    />
  );
}

export function SkeletonAvatar({ size = 12 }: { size?: number }) {
  const s = `${size}`;
  return <div className={`rounded-full bg-muted animate-pulse w-${s} h-${s}`} aria-hidden />;
}

export function SkeletonForm() {
  return (
    <div className="space-y-4">
      <div>
        <SkeletonLine className="h-6 w-1/3 mb-2" />
        <SkeletonLine className="h-10 w-full" />
      </div>

      <div>
        <SkeletonLine className="h-6 w-1/3 mb-2" />
        <SkeletonLine className="h-24 w-full" />
      </div>

      <div className="flex gap-2 justify-end">
        <SkeletonLine className="h-10 w-24" />
        <SkeletonLine className="h-10 w-32" />
      </div>
    </div>
  );
}

export default SkeletonForm;
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
