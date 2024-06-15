import { AddOnService, Membership, User } from "@prisma/client";

export type MemberWithRemainingDays = {
    membership: Membership & { user: User; addOns: AddOnService[] };
    remainingDays: number;
  };

export type MemberWithUserAndAddOns = Membership & { user: User; addOns: AddOnService[] };
