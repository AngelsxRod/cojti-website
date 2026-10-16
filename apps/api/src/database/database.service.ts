import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createDatabase, type Database } from '@cojti/db';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly connection = createDatabase(process.env.DATABASE_URL);

  get db(): Database {
    return this.connection.db;
  }

  async onModuleDestroy() {
    await this.connection.pool.end();
  }
}
