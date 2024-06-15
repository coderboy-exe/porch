import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { MembershipService } from 'src/membership/membership.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { sendEmail } from 'src/utils/emailHelper';
import { isSameMonth } from 'date-fns';

jest.mock('src/utils/emailHelper');

describe('SchedulerService', () => {
  let service: SchedulerService;
  let membershipService: MembershipService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: MembershipService,
          useValue: {
            getMembershipBreakdown: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    membershipService = module.get<MembershipService>(MembershipService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateReminder', () => {
    it('should emit newUser.reminder event for new members with 7 days remaining', async () => {
      const membersData = {
        newMembers: [{ remainingDays: 7, membership: {
          id: 3,
          isFirstMonth: true,
          startDate: new Date(),
          userId: 3,
          dueDate: new Date(),
          type: 'Basic',
          totalAmount: 100,
          user: { id: 3, email: 'test@example.com', firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
          addOns: [{ id: 2, membershipId: 3, name: "Another", dueDate: new Date(), monthlyAmount: 20 }],
        } }],
        existingMembers: [],
      };
      jest.spyOn(membershipService, 'getMembershipBreakdown').mockResolvedValue(membersData);

      await service.calculateReminder();

      expect(eventEmitter.emit).toHaveBeenCalledWith('newUser.reminder', membersData.newMembers[0].membership);
    });

    it('should emit existingUser.reminder event for existing members with add-ons due this month', async () => {
      const today = new Date();
      const membersData = {
        newMembers: [],
        existingMembers: [{
          membership: {
            id: 3,
            isFirstMonth: false,
            startDate: new Date(),
            userId: 3,
            dueDate: new Date(),
            type: 'Basic',
            totalAmount: 100,
            user: { id: 3, email: 'test@example.com', firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
            addOns: [{ id: 2, membershipId: 3, name: "Another", dueDate: today, monthlyAmount: 20 }],
          },
          remainingDays: 3
        }],
      };
      jest.spyOn(membershipService, 'getMembershipBreakdown').mockResolvedValue(membersData);
      // jest.spyOn(isSameMonth, 'mockImplementation').mockReturnValue(true);

      await service.calculateReminder();

      expect(eventEmitter.emit).toHaveBeenCalledWith('existingUser.reminder', membersData.existingMembers[0].membership);
    });

    // it('should log the message "Called everyday by 6AM"', async () => {
    //   const logSpy = jest.spyOn(service['logger'], 'debug');

    //   await service.calculateReminder();

    //   expect(logSpy).toHaveBeenCalledWith('Called everyday by 6AM');
    // });
  });

  describe('sendNewMemberReminder', () => {
    it('should send an email with the correct details', async () => {
      const membership = {
        id: 3,
        isFirstMonth: true,
        startDate: new Date(),
        userId: 3,
        dueDate: new Date(),
        type: 'Basic',
        totalAmount: 100,
        user: { id: 3, email: 'test@example.com', firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
        addOns: [{ id: 2, membershipId: 3, name: "Another", dueDate: new Date(), monthlyAmount: 20 }],
      };
      const totalAddOnMonthlyAmount = membership.addOns.reduce((total, addOn) => total + addOn.monthlyAmount, 0);
      const totalAmount = membership.totalAmount + totalAddOnMonthlyAmount;
      const msg = `Kindly remember your upcoming payment due on ${membership.dueDate.toISOString().split('T')[0]}. Membership Type: ${membership.type}.\n\nAnnual Fee: $${membership.totalAmount}.\n\nAddOn Service Total Monthly Amount: $${totalAddOnMonthlyAmount}.\n\nTotal Amount: $${totalAmount}\n`;

      await service.sendNewMemberReminder(membership);

      expect(sendEmail).toHaveBeenCalledWith(
        process.env.EMAIL_USERNAME,
        membership.user.email,
        `Fitness+ Membership Reminder - ${membership.type}`,
        msg,
        `${membership.user.firstName} ${membership.user.lastName}`,
        "Fitness+ Team"
      );
    });
  });

  describe('sendExistingMemberReminder', () => {
    it('should send an email with the correct details', async () => {
      const membership = {
        id: 1,
        type: 'Basic',
        totalAmount: 20,
        isFirstMonth: false,
        userId: 2,
        startDate: new Date(),
        dueDate: new Date(),
        user: { id: 2, email: 'test@example.com', firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
        addOns: [{ id: 5, membershipId: 1, name: 'Addon1', monthlyAmount: 20, dueDate: new Date() }],
      };
      const addOnsDetails = membership.addOns.map(addOn => ({
        name: addOn.name,
        monthlyAmount: addOn.monthlyAmount,
        dueDate: addOn.dueDate,
      }));
      const totalAddOnMonthlyAmount = addOnsDetails.reduce((total, addOn) => total + addOn.monthlyAmount, 0);
      const addOnsMessage = addOnsDetails.map(addOn => `- ${addOn.name}: $${addOn.monthlyAmount}. Due on ${addOn.dueDate.toISOString().split('T')[0]}`).join('\n');
      const msg = `AddOn Services:\n${addOnsMessage}\n\nTotal Amount: $${totalAddOnMonthlyAmount}.`;

      await service.sendExistingMemberReminder(membership);

      expect(sendEmail).toHaveBeenCalledWith(
        process.env.EMAIL_USERNAME,
        membership.user.email,
        `Fitness+ Membership Reminder - ${membership.type}`,
        msg,
        `${membership.user.firstName} ${membership.user.lastName}`,
        "Fitness+ Team"
      );
    });
  });
});
