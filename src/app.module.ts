import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { MembershipModule } from './membership/membership.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [DbModule, MembershipModule, SchedulerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
