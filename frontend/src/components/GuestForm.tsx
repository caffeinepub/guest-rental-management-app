import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { type GuestProfile, PaymentStatus } from '../backend';
import { useAddGuest, useUpdateGuest } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';

interface GuestFormProps {
  open: boolean;
  onClose: () => void;
  guest?: GuestProfile | null;
  mode: 'add' | 'edit';
}

interface FormData {
  id: string;
  fullName: string;
  phoneNumber: string;
  roomNumber: string;
  rentAmount: string;
  billDueDate: string;
}

const emptyForm: FormData = {
  id: '',
  fullName: '',
  phoneNumber: '',
  roomNumber: '',
  rentAmount: '',
  billDueDate: '',
};

export default function GuestForm({ open, onClose, guest, mode }: GuestFormProps) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const addGuest = useAddGuest();
  const updateGuest = useUpdateGuest();

  const isLoading = addGuest.isPending || updateGuest.isPending;

  useEffect(() => {
    if (guest && mode === 'edit') {
      setForm({
        id: guest.id,
        fullName: guest.fullName,
        phoneNumber: guest.phoneNumber,
        roomNumber: guest.roomNumber,
        rentAmount: guest.rentAmount.toString(),
        billDueDate: guest.billDueDate,
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [guest, mode, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const validate = (): boolean => {
    if (!form.id.trim()) { setError('Guest ID is required.'); return false; }
    if (!form.fullName.trim()) { setError('Full name is required.'); return false; }
    if (!form.phoneNumber.trim()) { setError('Phone number is required.'); return false; }
    if (!form.roomNumber.trim()) { setError('Room number is required.'); return false; }
    if (!form.rentAmount || isNaN(Number(form.rentAmount)) || Number(form.rentAmount) <= 0) {
      setError('Rent amount must be a positive number.'); return false;
    }
    if (!form.billDueDate.trim()) { setError('Bill due date is required.'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === 'add') {
        await addGuest.mutateAsync({
          id: form.id.trim(),
          fullName: form.fullName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          roomNumber: form.roomNumber.trim(),
          rentAmount: BigInt(Math.round(Number(form.rentAmount))),
          billDueDate: form.billDueDate.trim(),
        });
      } else if (guest) {
        await updateGuest.mutateAsync({
          id: guest.id,
          fullName: form.fullName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          roomNumber: form.roomNumber.trim(),
          rentAmount: BigInt(Math.round(Number(form.rentAmount))),
          billDueDate: form.billDueDate.trim(),
          paymentStatus: guest.paymentStatus,
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists')) {
        setError('A guest with this ID already exists. Please use a different ID.');
      } else {
        setError(msg || 'An error occurred. Please try again.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {mode === 'add' ? '🏠 Add New Guest' : '✏️ Edit Guest'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Fill in the details to register a new guest.'
              : 'Update the guest information below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Guest ID */}
          <div className="space-y-1.5">
            <Label htmlFor="id">Guest ID <span className="text-destructive">*</span></Label>
            <Input
              id="id"
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="e.g. G001"
              disabled={mode === 'edit' || isLoading}
              className="font-mono"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
            <Input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="e.g. Maria Santos"
              disabled={isLoading}
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">Phone Number <span className="text-destructive">*</span></Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. +63 912 345 6789"
              disabled={isLoading}
            />
          </div>

          {/* Room Number */}
          <div className="space-y-1.5">
            <Label htmlFor="roomNumber">Room Number <span className="text-destructive">*</span></Label>
            <Input
              id="roomNumber"
              name="roomNumber"
              value={form.roomNumber}
              onChange={handleChange}
              placeholder="e.g. Room 3A"
              disabled={isLoading}
            />
          </div>

          {/* Rent Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="rentAmount">Rent Amount (₱) <span className="text-destructive">*</span></Label>
            <Input
              id="rentAmount"
              name="rentAmount"
              type="number"
              min="1"
              value={form.rentAmount}
              onChange={handleChange}
              placeholder="e.g. 5000"
              disabled={isLoading}
            />
          </div>

          {/* Bill Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="billDueDate">Bill Due Date <span className="text-destructive">*</span></Label>
            <Input
              id="billDueDate"
              name="billDueDate"
              type="date"
              value={form.billDueDate}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'add' ? 'Add Guest' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
