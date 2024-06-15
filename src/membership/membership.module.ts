import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { DbModule } from 'src/db/db.module';
import { DbService } from 'src/db/db.service';

@Module({
  imports: [DbModule],
  providers: [MembershipService, DbService]
})
export class MembershipModule {}
