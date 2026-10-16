import { Module } from '@nestjs/common';

import { LinksService } from './links.service';
import { LinksController } from './links.controller';
import { LinksWriteGuard } from './links-write.guard';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LinksController],
  providers: [LinksService, LinksWriteGuard],
})
export class LinksModule {}
