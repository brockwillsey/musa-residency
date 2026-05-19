import { Badge } from "@/components/ui/Badge"
import type { BookingStatus } from "@/types"

const statusConfig: Record<
  BookingStatus,
  { label: string; variant: "default" | "secondary" | "accent" | "destructive" | "outline" }
> = {
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "accent" },
  declined: { label: "Declined", variant: "destructive" },
  auto_declined: { label: "Auto-Declined", variant: "destructive" },
  payment_processing: { label: "Processing Payment", variant: "secondary" },
  confirmed: { label: "Confirmed", variant: "accent" },
  cancelled: { label: "Cancelled", variant: "outline" },
  completed: { label: "Completed", variant: "default" },
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}