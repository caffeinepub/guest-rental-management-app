import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Phone, DoorOpen, CalendarDays, Banknote, Loader2 } from 'lucide-react';
import { type GuestProfile, PaymentStatus } from '../backend';
import { useRemoveGuest } from '../hooks/useQueries';
import GuestForm from './GuestForm';

interface GuestCardProps {
  guest: GuestProfile;
}

export default function GuestCard({ guest }: GuestCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const removeGuest = useRemoveGuest();

  const handleRemove = async () => {
    await removeGuest.mutateAsync(guest.id);
  };

  const isPaid = guest.paymentStatus === PaymentStatus.paid;

  return (
    <>
      <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200 border border-border animate-fade-in">
        <CardContent className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm font-display">
                  {guest.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground leading-tight">{guest.fullName}</h3>
                <span className="text-xs text-muted-foreground font-mono">ID: {guest.id}</span>
              </div>
            </div>
            <Badge
              variant={isPaid ? 'secondary' : 'default'}
              className={
                isPaid
                  ? 'bg-success/15 text-success border-success/30 font-semibold'
                  : 'bg-warning/20 text-warning-foreground border-warning/40 font-semibold'
              }
            >
              {isPaid ? '✓ Paid' : '⏳ Pending'}
            </Badge>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground truncate">{guest.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DoorOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground">{guest.roomNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Banknote className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground font-semibold">₱{Number(guest.rentAmount).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground">{guest.billDueDate}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs font-semibold"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                  disabled={removeGuest.isPending}
                >
                  {removeGuest.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Guest?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove <strong>{guest.fullName}</strong> (Room {guest.roomNumber})?
                    This will also delete all their notifications. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemove}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <GuestForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        guest={guest}
        mode="edit"
      />
    </>
  );
}
