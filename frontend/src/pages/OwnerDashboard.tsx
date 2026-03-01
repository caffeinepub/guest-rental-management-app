import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Bell, Plus, RefreshCw, Lock, CalendarCheck } from 'lucide-react';
import {
  useGetGuests,
  useGetNotifications,
  useGetMonthlyBillNotifications,
  useGenerateMonthlyBills,
} from '../hooks/useQueries';
import { NotificationStatus } from '../backend';
import GuestCard from '../components/GuestCard';
import GuestForm from '../components/GuestForm';
import NotificationList from '../components/NotificationList';
import MonthlyBillNotificationList from '../components/MonthlyBillNotificationList';
import OwnerPinPrompt from '../components/OwnerPinPrompt';

const NOW = new Date();
const CURRENT_MONTH = NOW.getMonth() + 1; // 1-based
const CURRENT_YEAR = NOW.getFullYear();

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function OwnerDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const { data: guests = [], isLoading: guestsLoading, refetch: refetchGuests } = useGetGuests();
  const { data: notifications = [], isLoading: notifsLoading, refetch: refetchNotifs } = useGetNotifications();
  const {
    data: monthlyNotifications = [],
    isLoading: monthlyLoading,
    refetch: refetchMonthly,
  } = useGetMonthlyBillNotifications(CURRENT_MONTH, CURRENT_YEAR);

  const generateMonthlyBills = useGenerateMonthlyBills();

  // Auto-generate monthly bills when dashboard is authenticated
  useEffect(() => {
    if (authenticated) {
      generateMonthlyBills.mutate({ month: CURRENT_MONTH, year: CURRENT_YEAR });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  const activeNotifCount = notifications.filter((n) => n.status === NotificationStatus.active).length;
  const activeMonthlyCount = monthlyNotifications.filter((n) => !n.cleared).length;

  const handleRefresh = () => {
    refetchGuests();
    refetchNotifs();
    refetchMonthly();
    generateMonthlyBills.mutate({ month: CURRENT_MONTH, year: CURRENT_YEAR });
  };

  // Show PIN prompt if not authenticated
  if (!authenticated) {
    return <OwnerPinPrompt onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Owner Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your guests and track bill payments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAuthenticated(false)}
            className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
          >
            <Lock className="w-4 h-4" />
            Lock Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)} className="gap-2 font-semibold">
            <Plus className="w-4 h-4" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-foreground">{guests.length}</p>
              <p className="text-xs text-muted-foreground">Total Guests</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-warning-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-foreground">{activeNotifCount}</p>
              <p className="text-xs text-muted-foreground">Bills Due</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
              <Bell className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-foreground">
                {notifications.filter((n) => n.status !== NotificationStatus.active).length}
              </p>
              <p className="text-xs text-muted-foreground">Bills Cleared</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-foreground">{activeMonthlyCount}</p>
              <p className="text-xs text-muted-foreground">Monthly Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="guests" className="w-full">
        <TabsList className="mb-6 bg-muted/60">
          <TabsTrigger value="guests" className="gap-2 font-semibold">
            <Users className="w-4 h-4" />
            Guests
            {guests.length > 0 && (
              <span className="ml-1 bg-primary/20 text-primary text-xs rounded-full px-1.5 py-0.5 font-bold">
                {guests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 font-semibold">
            <Bell className="w-4 h-4" />
            Notifications
            {activeNotifCount > 0 && (
              <span className="ml-1 bg-warning/30 text-warning-foreground text-xs rounded-full px-1.5 py-0.5 font-bold">
                {activeNotifCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="monthly-bills" className="gap-2 font-semibold">
            <CalendarCheck className="w-4 h-4" />
            Monthly Bills
            {activeMonthlyCount > 0 && (
              <span className="ml-1 bg-primary/20 text-primary text-xs rounded-full px-1.5 py-0.5 font-bold">
                {activeMonthlyCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Guests Tab */}
        <TabsContent value="guests">
          {guestsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="shadow-card">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : guests.length === 0 ? (
            <Card className="shadow-card border-dashed border-2 border-border">
              <CardContent className="py-16 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-display text-xl mb-2">No Guests Yet</CardTitle>
                <CardDescription className="mb-6 max-w-xs">
                  Start by adding your first guest. You can track their room, rent, and bill due dates.
                </CardDescription>
                <Button onClick={() => setAddOpen(true)} className="gap-2 font-semibold">
                  <Plus className="w-4 h-4" />
                  Add First Guest
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {guests.map((guest) => (
                <GuestCard key={guest.id} guest={guest} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-lg">Bill Notifications</CardTitle>
              <CardDescription>
                Review outstanding bills and mark them as paid once payment is received.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border">
                      <Skeleton className="w-9 h-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : (
                <NotificationList notifications={notifications} guests={guests} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Bills Tab */}
        <TabsContent value="monthly-bills">
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-primary" />
                    Monthly Bills — {MONTH_NAMES[CURRENT_MONTH - 1]} {CURRENT_YEAR}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Auto-generated monthly bill notifications for all guests. Mark each as paid once
                    rent is collected.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MonthlyBillNotificationList
                notifications={monthlyNotifications}
                isLoading={monthlyLoading || generateMonthlyBills.isPending}
                month={CURRENT_MONTH}
                year={CURRENT_YEAR}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Guest Modal */}
      <GuestForm open={addOpen} onClose={() => setAddOpen(false)} mode="add" />
    </div>
  );
}
