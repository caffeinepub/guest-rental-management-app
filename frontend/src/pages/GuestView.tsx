import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Phone,
  DoorOpen,
  CalendarDays,
  Banknote,
  Bell,
  User,
} from 'lucide-react';
import { useGetGuests, useGetNotificationsForGuest } from '../hooks/useQueries';
import { PaymentStatus, NotificationStatus } from '../backend';
import GuestBillNotificationList from '../components/GuestBillNotificationList';

export default function GuestView() {
  const [searchId, setSearchId] = useState('');
  const [submittedId, setSubmittedId] = useState('');

  const { data: allGuests = [], isLoading: guestsLoading } = useGetGuests();

  const guest = allGuests.find((g) => g.id === submittedId) ?? null;

  const {
    data: guestNotifications = [],
    isLoading: notifsLoading,
  } = useGetNotificationsForGuest(submittedId && guest ? submittedId : '');

  const activeNotifications = guestNotifications.filter(
    (n) => n.status === NotificationStatus.active
  );
  const clearedNotifications = guestNotifications.filter(
    (n) => n.status === NotificationStatus.cleared
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedId(searchId.trim());
  };

  const isSearching = submittedId !== '' && (guestsLoading || notifsLoading);
  const notFound = submittedId !== '' && !guestsLoading && !guest;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">Guest Bill Lookup</h1>
        <p className="text-muted-foreground mt-2">
          Enter your Guest ID to check your bill status and notifications.
        </p>
      </div>

      {/* Search Form */}
      <Card className="shadow-card border-border">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="guestId" className="text-sm font-semibold">
                Your Guest ID
              </Label>
              <Input
                id="guestId"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. G001"
                className="font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="gap-2 font-semibold w-full sm:w-auto" disabled={!searchId.trim()}>
                <Search className="w-4 h-4" />
                Look Up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isSearching && (
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}

      {/* Not Found */}
      {notFound && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Guest Not Found</AlertTitle>
          <AlertDescription>
            No guest found with ID <strong className="font-mono">{submittedId}</strong>. Please check your ID and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Guest Profile */}
      {!isSearching && guest && (
        <div className="space-y-4 animate-fade-in">
          {/* Outstanding Bill Banner */}
          {activeNotifications.length > 0 && (
            <Alert className="border-warning/50 bg-warning/10 text-warning-foreground">
              <AlertTriangle className="h-4 w-4 text-warning-foreground" />
              <AlertTitle className="font-display font-bold text-warning-foreground">
                Bill Due — Action Required
              </AlertTitle>
              <AlertDescription className="text-warning-foreground/90">
                {activeNotifications.map((n) => n.message).join(' · ')}
                <br />
                <span className="font-semibold">
                  Amount Due: ₱{Number(guest.rentAmount).toLocaleString()}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Paid Confirmation */}
          {guest.paymentStatus === PaymentStatus.paid &&
            clearedNotifications.length > 0 &&
            activeNotifications.length === 0 && (
              <Alert className="border-success/40 bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertTitle className="font-display font-bold text-success">
                  Payment Confirmed ✓
                </AlertTitle>
                <AlertDescription className="text-success/80">
                  Your bill has been marked as paid by the owner. Thank you!
                </AlertDescription>
              </Alert>
            )}

          {/* Guest Profile Card */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-xl">{guest.fullName}</CardTitle>
                    <CardDescription className="font-mono text-xs">ID: {guest.id}</CardDescription>
                  </div>
                </div>
                <Badge
                  className={
                    guest.paymentStatus === PaymentStatus.paid
                      ? 'bg-success/15 text-success border-success/30 font-semibold'
                      : 'bg-warning/20 text-warning-foreground border-warning/40 font-semibold'
                  }
                >
                  {guest.paymentStatus === PaymentStatus.paid ? '✓ Paid' : '⏳ Pending'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-border">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Phone
                  </p>
                  <p className="text-sm font-medium text-foreground">{guest.phoneNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <DoorOpen className="w-3 h-3" /> Room
                  </p>
                  <p className="text-sm font-medium text-foreground">{guest.roomNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Banknote className="w-3 h-3" /> Rent Amount
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    ₱{Number(guest.rentAmount).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="w-3 h-3" /> Due Date
                  </p>
                  <p className="text-sm font-medium text-foreground">{guest.billDueDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Bill Notifications */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Monthly Bill Notifications
              </CardTitle>
              <CardDescription>
                Your monthly rent bills and payment history.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <GuestBillNotificationList
                notifications={guestNotifications}
                isLoading={notifsLoading}
              />
            </CardContent>
          </Card>

          {/* Legacy Notification History (non-monthly) */}
          {guestNotifications.filter((n) => Number(n.billingMonth) === 0).length > 0 && (
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  Other Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {guestNotifications
                  .filter((n) => Number(n.billingMonth) === 0)
                  .map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        notif.status === NotificationStatus.active
                          ? 'border-warning/40 bg-warning/5'
                          : 'border-border bg-muted/30 opacity-70'
                      }`}
                    >
                      {notif.status === NotificationStatus.active ? (
                        <Bell className="w-4 h-4 text-warning-foreground mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{notif.message}</p>
                      </div>
                      <Badge
                        className={
                          notif.status === NotificationStatus.active
                            ? 'bg-warning/20 text-warning-foreground border-warning/30 text-xs flex-shrink-0'
                            : 'bg-success/15 text-success border-success/30 text-xs flex-shrink-0'
                        }
                      >
                        {notif.status === NotificationStatus.active ? 'Active' : 'Cleared'}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Welcome State */}
      {!submittedId && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-primary" />
          </div>
          <p className="font-display text-lg font-semibold text-foreground">Enter Your Guest ID</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Your Guest ID was assigned when you registered. Ask your landlord if you don't know it.
          </p>
        </div>
      )}
    </div>
  );
}
