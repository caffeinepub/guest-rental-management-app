import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type GuestProfile, type Notification, PaymentStatus } from '../backend';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  guests: ['guests'] as const,
  notifications: ['notifications'] as const,
  notificationsForGuest: (guestId: string) => ['notifications', 'guest', guestId] as const,
  monthlyBillNotifications: (month: number, year: number) =>
    ['notifications', 'monthly', month, year] as const,
};

// ─── Guests ───────────────────────────────────────────────────────────────────
export function useGetGuests() {
  const { actor, isFetching } = useActor();
  return useQuery<GuestProfile[]>({
    queryKey: QUERY_KEYS.guests,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGuests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddGuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      fullName: string;
      phoneNumber: string;
      roomNumber: string;
      rentAmount: bigint;
      billDueDate: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.addGuest(
        params.id,
        params.fullName,
        params.phoneNumber,
        params.roomNumber,
        params.rentAmount,
        params.billDueDate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
}

export function useUpdateGuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      fullName: string;
      phoneNumber: string;
      roomNumber: string;
      rentAmount: bigint;
      billDueDate: string;
      paymentStatus: PaymentStatus;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateGuest(
        params.id,
        params.fullName,
        params.phoneNumber,
        params.roomNumber,
        params.rentAmount,
        params.billDueDate,
        params.paymentStatus
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
}

export function useRemoveGuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.removeGuest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────
export function useGetNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: QUERY_KEYS.notifications,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNotificationsForGuest(guestId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: QUERY_KEYS.notificationsForGuest(guestId),
    queryFn: async () => {
      if (!actor || !guestId) return [];
      return actor.getNotificationsForGuest(guestId);
    },
    enabled: !!actor && !isFetching && !!guestId,
  });
}

export function useGetMonthlyBillNotifications(month: number, year: number) {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: QUERY_KEYS.monthlyBillNotifications(month, year),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMonthlyBillNotifications(BigInt(month), BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClearNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notifId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.clearNotification(notifId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'guest'] });
    },
  });
}

export function useMarkNotificationAsCleared() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notifId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.markNotificationAsCleared(notifId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'monthly'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'guest'] });
    },
  });
}

export function useCreateNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { guestId: string; message: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.createNotification(params.guestId, params.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
}

export function useGenerateMonthlyBills() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { month: number; year: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.generateMonthlyBillsTrigger(BigInt(params.month), BigInt(params.year));
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.monthlyBillNotifications(variables.month, variables.year),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
}

// ─── Owner PIN ────────────────────────────────────────────────────────────────
export function useValidateOwnerPin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (inputPin: string): Promise<boolean> => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.validateOwnerPin(inputPin);
    },
  });
}

export function useChangeOwnerPin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (newPin: string): Promise<void> => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.changeOwnerPin(newPin);
    },
  });
}
