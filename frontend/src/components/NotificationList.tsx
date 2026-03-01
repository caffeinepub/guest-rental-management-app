import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, CheckCircle2, Loader2, CalendarDays, Banknote } from 'lucide-react';
import { type Notification, type GuestProfile, NotificationStatus } from '../backend';
import { useClearNotification } from '../hooks/useQueries';

interface NotificationListProps {
  notifications: Notification[];
  guests: GuestProfile[];
}

export default function NotificationList({ notifications, guests }: NotificationListProps) {
  const clearNotification = useClearNotification();

  const guestMap = new Map(guests.map((g) => [g.id, g]));

  const active = notifications.filter((n) => n.status === NotificationStatus.active);
  const cleared = notifications.filter((n) => n.status === NotificationStatus.cleared);

  const handleMarkPaid = async (notifId: string, guestId: string) => {
    const guest = guestMap.get(guestId);
    if (!guest) return;
    await clearNotification.mutateAsync(notifId);
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <BellOff className="w-8 h-8 text-success" />
        </div>
        <p className="font-display text-lg font-semibold text-foreground">All Clear!</p>
        <p className="text-sm text-muted-foreground mt-1">No notifications at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Notifications */}
      {active.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-warning" />
            <h3 className="font-semibold text-sm text-foreground">
              Active Bills Due
              <Badge variant="secondary" className="ml-2 bg-warning/20 text-warning-foreground border-warning/30 text-xs">
                {active.length}
              </Badge>
            </h3>
          </div>
          <div className="space-y-3">
            {active.map((notif) => {
              const guest = guestMap.get(notif.guestId);
              const isClearing = clearNotification.isPending && clearNotification.variables === notif.id;
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
                          <p className="font-semibold text-sm text-foreground">
                            {guest?.fullName ?? notif.guestId}
                          </p>
                          {guest && (
                            <p className="text-xs text-muted-foreground">{guest.roomNumber}</p>
                          )}
                          <p className="text-sm text-foreground mt-1">{notif.message}</p>
                          <div className="flex flex-wrap gap-3 mt-2">
                            {guest && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Banknote className="w-3 h-3" />
                                ₱{Number(guest.rentAmount).toLocaleString()}
                              </span>
                            )}
                            {guest && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CalendarDays className="w-3 h-3" />
                                Due: {guest.billDueDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs font-semibold flex-shrink-0 bg-success/80 hover:bg-success text-success-foreground"
                        onClick={() => handleMarkPaid(notif.id, notif.guestId)}
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

      {/* Cleared Notifications */}
      {cleared.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h3 className="font-semibold text-sm text-foreground">
              Cleared / Paid
              <Badge variant="secondary" className="ml-2 bg-success/15 text-success border-success/30 text-xs">
                {cleared.length}
              </Badge>
            </h3>
          </div>
          <div className="space-y-2">
            {cleared.map((notif) => {
              const guest = guestMap.get(notif.guestId);
              return (
                <Card key={notif.id} className="border-border bg-muted/30 opacity-70">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {guest?.fullName ?? notif.guestId}
                          {guest && <span className="text-muted-foreground font-normal"> · {guest.roomNumber}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{notif.message}</p>
                      </div>
                      <Badge variant="secondary" className="bg-success/15 text-success border-success/30 text-xs flex-shrink-0">
                        Paid
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
