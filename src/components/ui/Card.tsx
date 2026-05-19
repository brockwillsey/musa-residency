import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className,
}: CardProps) {
  return <div className={cn("p-6 pb-0", className)}>{children}</div>
}

export function CardContent({
  children,
  className,
}: CardProps) {
  return <div className={cn("p-6", className)}>{children}</div>
}

export function CardFooter({
  children,
  className,
}: CardProps) {
  return (
    <div className={cn("p-6 pt-0 flex items-center", className)}>
      {children}
    </div>
  )
}