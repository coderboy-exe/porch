import { Test, TestingModule } from '@nestjs/testing';
import { MembershipService } from './membership.service';
import { DbService } from 'src/db/db.service';

describe('MembershipService', () => {
  let service: MembershipService;
  let dbService: DbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembershipService, DbService],
    }).compile();

    service = module.get<MembershipService>(MembershipService);
    dbService = module.get<DbService>(DbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
