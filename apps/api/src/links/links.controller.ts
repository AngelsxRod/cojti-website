import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { LinksService } from './links.service';
import { LinksWriteGuard } from './links-write.guard';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  @UseGuards(LinksWriteGuard)
  create(@Body() body: unknown) {
    return this.linksService.create(body);
  }

  @Get()
  findAll() {
    return this.linksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.linksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(LinksWriteGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    return this.linksService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(LinksWriteGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.linksService.remove(id);
  }
}
