import { Controller, Get, Param } from '@nestjs/common';
import { PropertiesService } from './properties.service';

@Controller('api/properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Get()
  findAll() {
    return this.propertiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(parseInt(id));
  }
}