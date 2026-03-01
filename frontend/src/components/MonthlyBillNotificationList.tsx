import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, CheckCircle2, Loader2, CalendarDays, Banknote, Home } from 'lucide-react';
import { type Notification } from '../backend';
import { useMarkNotificationAsCleared } from '../hooks/useQueries';

interface MonthlyBillNotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  month: number;
  year: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthlyBillNotificationList({
  notifications,
  isLoading,
  month,
  year,
}: MonthlyBillNotificationListProps) {
  const markCleared = useMarkNotificationAsCleared();

  const active = notifications.filter((n) => !n.cleared);
  const cleared = notifications.filter((n) => n.cleared);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border animate-pulse">
            <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
            <div className="h-8 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <BellOff className="w-8 h-8 text-success" />
        </div>
        <p className="font-display text-lg font-semibold text-foreground">No Bills This Month</p>
        <p className="text-sm text-muted-foreground mt-1">
          No monthly bill notifications for {MONTH_NAMES[month - 1]} {year}.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Bills are auto-generated when the dashboard loads.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Bills */}
      {active.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-warning" />
            <h3 className="font-semibold text-sm text-foreground">
              Pending Bills
              <Badge
                variant="secondary"
                className="ml-2 bg-warning/20 text-warning-foreground border-warning/30 text-xs"
              >
                {active.length}
              </Badge>
            </h3>
          </div>
          <div className="space-y-3">
            {active.map((notif) => {
              const isClearing =
                markCleared.isPending && markCleared.variables === notif.id;
              return (
                <Card
                  key={notif.id}
                  className="border-warning/40 bg-warning/5 shadow-card animate-fade-in"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bell className="w-4 h-4 text-warning-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">{notif.guestName}</p>
                          <div className="flex flex-wrap gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Home className="w-3 h-3" />
                              Room {notif.roomNumber}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Banknote className="w-3 h-3" />
                              ₱{Number(notif.amount).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CalendarDays className="w-3 h-3" />
                              Due: {notif.dueDate}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Billing: {MONTH_NAMES[Number(notif.billingMonth) - 1]} {Number(notif.billingYear)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs font-semibold flex-shrink-0 bg-success/80 hover:bg-success text-success-foreground"
                        onClick={() => markCleared.mutate(notif.id)}
                        disabled={isClearing}
                      >
                        {isClearing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Mark Paid
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Cleared Bills */}
      {cleared.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h3 className="font-semibold text-sm text-foreground">
              Cleared / Paid
              <Badge
                variant="secondary"
                className="ml-2 bg-success/15 text-success border-success/30 text-xs"
              >
                {cleared.length}
              </Badge>
            </h3>
          </div>
          <div className="space-y-2">
            {cleared.map((notif) => (
              <Card key={notif.id} className="border-border bg-muted/30 opacity-70">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {notif.guestName}
                        <span className="text-muted-foreground font-normal"> · Room {notif.roomNumber}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₱{Number(notif.amount).toLocaleString()} · Due: {notif.dueDate} ·{' '}
                        {MONTH_NAMES[Number(notif.billingMonth) - 1]} {Number(notif.billingYear)}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-success/15 text-success border-success/30 text-xs flex-shrink-0"
                    >
                      Paid
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
