import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface GuestProfile {
    id: string;
    paymentStatus: PaymentStatus;
    createdAt: Time;
    rentAmount: bigint;
    fullName: string;
    roomNumber: string;
    billDueDate: string;
    phoneNumber: string;
}
export interface Notification {
    id: string;
    status: NotificationStatus;
    billingMonth: bigint;
    createdAt: Time;
    dueDate: string;
    guestName: string;
    roomNumber: string;
    message: string;
    cleared: boolean;
    amount: bigint;
    billingYear: bigint;
    guestId: string;
}
export interface UserProfile {
    name: string;
}
export enum NotificationStatus {
    active = "active",
    cleared = "cleared"
}
export enum PaymentStatus {
    pending = "pending",
    paid = "paid"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addGuest(id: string, fullName: string, phoneNumber: string, roomNumber: string, rentAmount: bigint, billDueDate: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    changeOwnerPin(newPin: string): Promise<void>;
    clearNotification(notifId: string): Promise<void>;
    createNotification(guestId: string, message: string): Promise<void>;
    generateMonthlyBillsTrigger(month: bigint, year: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGuests(): Promise<Array<GuestProfile>>;
    getMonthlyBillNotifications(month: bigint, year: bigint): Promise<Array<Notification>>;
    getNotifications(): Promise<Array<Notification>>;
    getNotificationsForGuest(guestId: string): Promise<Array<Notification>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationAsCleared(notifId: string): Promise<void>;
    removeGuest(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateGuest(id: string, fullName: string, phoneNumber: string, roomNumber: string, rentAmount: bigint, billDueDate: string, paymentStatus: PaymentStatus): Promise<void>;
    validateOwnerPin(inputPin: string): Promise<boolean>;
}
