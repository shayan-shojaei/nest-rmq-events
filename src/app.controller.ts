import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('emit/:message')
  emitMessage(@Param('message') message): string {
    return this.appService.emitMessage(message);
  }
  @Get('delete/:message')
  deleteMessage(@Param('message') message): string {
    return this.appService.deletePlace(message);
  }
}
