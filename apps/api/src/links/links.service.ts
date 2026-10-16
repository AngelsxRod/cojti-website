import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateLinkDto, UpdateLinkDto } from '@cojti/api';
import { links } from '@cojti/db';
import { asc, eq } from 'drizzle-orm';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class LinksService {
  constructor(private readonly database: DatabaseService) {}

  async create(values: CreateLinkDto) {
    const [link] = await this.database.db
      .insert(links)
      .values(values)
      .returning();
    return link;
  }

  findAll() {
    return this.database.db.select().from(links).orderBy(asc(links.id));
  }

  async findOne(id: number) {
    const [link] = await this.database.db
      .select()
      .from(links)
      .where(eq(links.id, id))
      .limit(1);

    if (!link) throw new NotFoundException(`Link #${id} was not found`);
    return link;
  }

  async update(id: number, values: UpdateLinkDto) {
    const [link] = await this.database.db
      .update(links)
      .set(values)
      .where(eq(links.id, id))
      .returning();

    if (!link) throw new NotFoundException(`Link #${id} was not found`);
    return link;
  }

  async remove(id: number) {
    const [link] = await this.database.db
      .delete(links)
      .where(eq(links.id, id))
      .returning({ id: links.id });

    if (!link) throw new NotFoundException(`Link #${id} was not found`);
  }
}
