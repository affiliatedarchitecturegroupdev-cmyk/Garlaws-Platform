import { Controller, Get, Query } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('api/services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    if (category) {
      return this.servicesService.findByCategory(category);
    }
    return this.servicesService.findAll();
  }
}