import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, CheckCircle2, CalendarDays, Banknote } from 'lucide-react';
import { type Notification } from '../backend';

interface GuestBillNotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function GuestBillNotificationList({
  notifications,
  isLoading,
}: GuestBillNotificationListProps) {
  // Only show monthly bill notifications (billingMonth > 0)
  const monthlyNotifications = notifications.filter((n) => Number(n.billingMonth) > 0);

  const active = monthlyNotifications.filter((n) => !n.cleared);
  const cleared = monthlyNotifications.filter((n) => n.cleared);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border animate-pulse">
            <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
            <div className="h-6 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (monthlyNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <BellOff className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-sm text-foreground">No Monthly Bills Yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Your monthly bill notifications will appear here once generated.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Active / Pending Bills */}
      {active.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-warning" />
            <h4 className="font-semibold text-sm text-foreground">
              Pending Bills
              <Badge
                variant="secondary"
                className="ml-2 bg-warning/20 text-warning-foreground border-warning/30 text-xs"
              >
                {active.length}
              </Badge>
            </h4>
          </div>
          <div className="space-y-2">
            {active.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-warning/40 bg-warning/5"
              >
                <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5 text-warning-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {MONTH_NAMES[Number(notif.billingMonth) - 1]} {Number(notif.billingYear)} Bill
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Banknote className="w-3 h-3" />
                      ₱{Number(notif.amount).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="w-3 h-3" />
                      Due: {notif.dueDate}
                    </span>
                  </div>
                </div>
                <Badge className="bg-warning/20 text-warning-foreground border-warning/30 text-xs flex-shrink-0">
                  Pending
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cleared / Paid Bills */}
      {cleared.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h4 className="font-semibold text-sm text-foreground">
              Paid Bills
              <Badge
                variant="secondary"
                className="ml-2 bg-success/15 text-success border-success/30 text-xs"
              >
                {cleared.length}
              </Badge>
            </h4>
          </div>
          <div className="space-y-2">
            {cleared.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30 opacity-75"
              >
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {MONTH_NAMES[Number(notif.billingMonth) - 1]} {Number(notif.billingYear)} Bill
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Banknote className="w-3 h-3" />
                      ₱{Number(notif.amount).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="w-3 h-3" />
                      Due: {notif.dueDate}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-success/15 text-success border-success/30 text-xs flex-shrink-0"
                >
                  Paid
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
