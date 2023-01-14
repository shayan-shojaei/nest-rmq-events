import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('emit/:count')
  emitMessage(@Param('count', ParseIntPipe) count: number): Promise<string> {
    return this.appService.emitMessage(count);
  }
}
