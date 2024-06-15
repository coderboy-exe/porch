import { Injectable } from '@nestjs/common';
import { Membership } from '@prisma/client';
import { differenceInDays } from 'date-fns';
import { DbService } from 'src/db/db.service';
import { MemberWithRemainingDays } from './memberships.types';

@Injectable()
export class MembershipService {
    constructor(private readonly dbService: DbService) { }

    async getMembershipBreakdown() {
        try {
            const memberships = await this.dbService.membership.findMany({
                include: {
                    user: true,
                    addOns: true,
                }
            });
            const today = new Date();
            let newMembers: MemberWithRemainingDays[] = []
            let existingMembers:  MemberWithRemainingDays[] = []

            memberships.forEach((m) => {
                const remainingDays = differenceInDays(m.dueDate, today)

                if (m.isFirstMonth) {
                    newMembers.push({ membership: m, remainingDays })
                } else {
                    existingMembers.push({ membership: m, remainingDays })
                }
            })

            return { newMembers, existingMembers }
        } catch (err) {
            console.error("An error occured: ", err)
        }
    }
}
