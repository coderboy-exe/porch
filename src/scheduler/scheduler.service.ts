import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { format, isSameMonth, toDate } from 'date-fns';
import { MembershipService } from 'src/membership/membership.service';
import { MemberWithRemainingDays, MemberWithUserAndAddOns } from 'src/membership/memberships.types';
import { sendEmail } from 'src/utils/emailHelper';

@Injectable()
export class SchedulerService {
    constructor(
        private readonly membershipService: MembershipService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    private readonly logger = new Logger(SchedulerService.name);

    @Cron(CronExpression.EVERY_DAY_AT_6AM)
    async calculateReminder() {
        const today = new Date()
        const membersData = await this.membershipService.getMembershipBreakdown();
        membersData.newMembers.forEach((m) => {
            if (m.remainingDays === 7) {
                this.eventEmitter.emit('newUser.reminder', m.membership)
            }
        })
        membersData.existingMembers.forEach((m) => {
            const isDueThisMonth = m.membership.addOns.some((addOn) => isSameMonth(today, new Date(addOn.dueDate)));
            if (isDueThisMonth) {
                this.eventEmitter.emit('existingUser.reminder', m.membership)
            }
        })

        this.logger.debug('Called everyday by 6AM');
    }

    @OnEvent('newUser.reminder', { async: true })
    async sendNewMemberReminder(membership: MemberWithUserAndAddOns) {
        const totalAddOnMonthlyAmount = membership.addOns.reduce((total, addOn) => total + addOn.monthlyAmount, 0);
        const totalAmount = membership.totalAmount + totalAddOnMonthlyAmount;
        const formattedDueDate = format(new Date(membership.dueDate), 'yyyy-MM-dd');
        const msg = `Kindly remember your upcoming payment due on ${formattedDueDate}. Membership Type: ${membership.type}.\n\nAnnual Fee: $${membership.totalAmount}.\n\nAddOn Service Total Monthly Amount: $${totalAddOnMonthlyAmount}.\n\nTotal Amount: $${totalAmount}\n`;
        const emailRes = await sendEmail(
            "usottah@gmail.com", membership.user.email, 
            `Fitness+ Membership Reminder - ${membership.type}`,
            msg, `${membership.user.firstName} ${membership.user.lastName}`,
            "Fitness+ Team"
        )
    }
    
    @OnEvent('existingUser.reminder', { async: true })
    async sendExistingMemberReminder(membership: MemberWithUserAndAddOns) {
        const addOnsDetails = membership.addOns.map(addOn => ({
            name: addOn.name,
            monthlyAmount: addOn.monthlyAmount,
            dueDate: addOn.dueDate,
        }));

        const totalAddOnMonthlyAmount = addOnsDetails.reduce((total, addOn) => total + addOn.monthlyAmount, 0);
        const addOnsMessage = addOnsDetails.map(addOn => `- ${addOn.name}: $${addOn.monthlyAmount}. Due on ${format(new Date(addOn.dueDate), 'yyyy-MM-dd')}`).join('\n');
        
        const msg = `AddOn Services:\n${addOnsMessage}\n\nTotal Amount: $${totalAddOnMonthlyAmount}.`;

        const emailRes = await sendEmail(
            "usottah@gmail.com", membership.user.email, 
            `Fitness+ Membership Reminder - ${membership.type}`,
            msg, `${membership.user.firstName} ${membership.user.lastName}`,
            "Fitness+ Team"
        )
    }

}
