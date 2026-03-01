import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";

import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type GuestProfile = {
    id : Text;
    fullName : Text;
    phoneNumber : Text;
    roomNumber : Text;
    rentAmount : Nat;
    billDueDate : Text;
    paymentStatus : PaymentStatus;
    createdAt : Time.Time;
  };

  type PaymentStatus = {
    #pending;
    #paid;
  };

  module PaymentStatus {
    public func compare(status1 : PaymentStatus, status2 : PaymentStatus) : Order.Order {
      switch (status1, status2) {
        case (#pending, #paid) { #less };
        case (#paid, #pending) { #greater };
        case (_) { #equal };
      };
    };
  };

  type Notification = {
    id : Text;
    guestId : Text;
    guestName : Text;
    roomNumber : Text;
    amount : Nat;
    message : Text;
    dueDate : Text;
    status : NotificationStatus;
    createdAt : Time.Time;
    billingMonth : Nat;
    billingYear : Nat;
    cleared : Bool;
  };

  type NotificationStatus = {
    #active;
    #cleared;
  };

  module NotificationStatus {
    public func compare(status1 : NotificationStatus, status2 : NotificationStatus) : Order.Order {
      switch (status1, status2) {
        case (#active, #cleared) { #less };
        case (#cleared, #active) { #greater };
        case (_) { #equal };
      };
    };
  };

  let guestProfiles = Map.empty<Text, GuestProfile>();
  let notifications = Map.empty<Text, Notification>();

  // Store the owner PIN in stable state
  var ownerPin = "18215";

  public shared ({ caller }) func addGuest(
    id : Text,
    fullName : Text,
    phoneNumber : Text,
    roomNumber : Text,
    rentAmount : Nat,
    billDueDate : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add guests");
    };

    if (guestProfiles.containsKey(id)) {
      Runtime.trap("Guest already exists");
    };

    let newGuest : GuestProfile = {
      id;
      fullName;
      phoneNumber;
      roomNumber;
      rentAmount;
      billDueDate;
      paymentStatus = #pending;
      createdAt = Time.now();
    };

    guestProfiles.add(id, newGuest);

    let notification : Notification = {
      id = "notif_" # id;
      guestId = id;
      guestName = fullName;
      roomNumber;
      amount = rentAmount;
      message = "Your bill is due on " # billDueDate;
      dueDate = billDueDate;
      status = #active;
      createdAt = Time.now();
      billingMonth = 0;
      billingYear = 0;
      cleared = false;
    };

    notifications.add(notification.id, notification);
  };

  public shared ({ caller }) func updateGuest(
    id : Text,
    fullName : Text,
    phoneNumber : Text,
    roomNumber : Text,
    rentAmount : Nat,
    billDueDate : Text,
    paymentStatus : PaymentStatus,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update guests");
    };

    switch (guestProfiles.get(id)) {
      case (null) { Runtime.trap("Guest not found") };
      case (?guest) {
        let updatedGuest : GuestProfile = {
          id;
          fullName;
          phoneNumber;
          roomNumber;
          rentAmount;
          billDueDate;
          paymentStatus;
          createdAt = guest.createdAt;
        };
        guestProfiles.add(id, updatedGuest);

        switch (paymentStatus) {
          case (#paid) {
            for ((_, notif) in notifications.entries()) {
              if (notif.guestId == id and notif.status == #active) {
                let updatedNotif : Notification = {
                  notif with status = #cleared
                };
                notifications.add(notif.id, updatedNotif);
              };
            };
          };
          case (_) {};
        };
      };
    };
  };

  public shared ({ caller }) func removeGuest(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove guests");
    };

    if (not guestProfiles.containsKey(id)) {
      Runtime.trap("Guest not found");
    };
    guestProfiles.remove(id);

    let notificationsToRemove = List.empty<Text>();
    for ((notifId, notif) in notifications.entries()) {
      if (notif.guestId == id) {
        notificationsToRemove.add(notifId);
      };
    };
    for (notifId in notificationsToRemove.values()) {
      notifications.remove(notifId);
    };
  };

  public query ({ caller }) func getGuests() : async [GuestProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view guests");
    };
    guestProfiles.values().toArray();
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view notifications");
    };
    notifications.values().toArray();
  };

  public shared ({ caller }) func createNotification(guestId : Text, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create notifications");
    };

    if (not guestProfiles.containsKey(guestId)) {
      Runtime.trap("Guest not found");
    };

    let guestName : Text = switch (guestProfiles.get(guestId)) {
      case (null) { "Unknown Guest" };
      case (?guest) { guest.fullName };
    };

    let roomNumber : Text = switch (guestProfiles.get(guestId)) {
      case (null) { "Unknown Room" };
      case (?guest) { guest.roomNumber };
    };

    let amount : Nat = switch (guestProfiles.get(guestId)) {
      case (null) { 0 };
      case (?guest) { guest.rentAmount };
    };

    let notification : Notification = {
      id = "notif_" # guestId # "_" # debug_show (Time.now());
      guestId;
      guestName;
      roomNumber;
      amount;
      message;
      dueDate = "";
      status = #active;
      createdAt = Time.now();
      billingMonth = 0;
      billingYear = 0;
      cleared = false;
    };

    notifications.add(notification.id, notification);
  };

  public shared ({ caller }) func clearNotification(notifId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear notifications");
    };

    switch (notifications.get(notifId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notif) {
        let updatedNotif : Notification = {
          notif with status = #cleared
        };
        notifications.add(notifId, updatedNotif);
      };
    };
  };

  public shared ({ caller }) func markNotificationAsCleared(notifId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark notifications as cleared");
    };

    switch (notifications.get(notifId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notif) {
        let updatedNotif : Notification = {
          notif with cleared = true
        };
        notifications.add(notifId, updatedNotif);
      };
    };
  };

  public query ({ caller }) func getNotificationsForGuest(guestId : Text) : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view notifications");
    };

    if (not guestProfiles.containsKey(guestId)) {
      Runtime.trap("Guest not found");
    };

    notifications.values().toArray().filter(
      func(notif) {
        notif.guestId == guestId;
      }
    );
  };

  public query ({ caller }) func getMonthlyBillNotifications(month : Nat, year : Nat) : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view monthly bill notifications");
    };

    notifications.values().toArray().filter(
      func(notif) {
        notif.billingMonth == month and notif.billingYear == year;
      }
    );
  };

  public shared ({ caller }) func generateMonthlyBillsTrigger(month : Nat, year : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can trigger monthly bill generation");
    };

    let currentTime = Time.now();

    for ((guestId, guest) in guestProfiles.entries()) {
      let dueDate = guest.billDueDate;
      let existingNotifications : [Notification] = notifications.values().toArray().filter(
        func(notif) {
          notif.guestId == guestId and notif.billingMonth == month and notif.billingYear == year;
        }
      );

      if (existingNotifications.size() == 0) {
        let notification : Notification = {
          id = "bill_" # guestId # "_" # debug_show(month) # "_" # debug_show(year);
          guestId;
          guestName = guest.fullName;
          roomNumber = guest.roomNumber;
          amount = guest.rentAmount;
          message = "Monthly bill for " # dueDate;
          dueDate;
          status = #active;
          createdAt = currentTime;
          billingMonth = month;
          billingYear = year;
          cleared = false;
        };
        notifications.add(notification.id, notification);
      };
    };
  };

  // Validate the owner PIN - accessible to any authenticated user to support login flow
  public shared ({ caller }) func validateOwnerPin(inputPin : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can validate the PIN");
    };
    inputPin == ownerPin;
  };

  // Update the PIN - admin only
  public shared ({ caller }) func changeOwnerPin(newPin : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can change the owner PIN");
    };
    ownerPin := newPin;
  };
};
