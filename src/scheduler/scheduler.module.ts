import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { DbModule } from 'src/db/db.module';
import { MembershipModule } from 'src/membership/membership.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MembershipService } from 'src/membership/membership.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [ScheduleModule.forRoot(), EventEmitterModule.forRoot(),
    DbModule, MembershipModule],
  providers: [SchedulerService, MembershipService]
})
export class SchedulerModule {}
