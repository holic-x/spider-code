import { Controller, Get, Sse } from '@nestjs/common';
import { AppService } from './app.service';
import { setTimeout } from 'timers/promises';
import { Observable } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 启动爬虫接口
  @Get('start-spider')
  startSpider() {
    this.appService.startSpider();
    return "爬虫已启动";
  }

  // 实时查看爬取的数据
  @Sse('stream')
  stream() {
    return new Observable((observer) => {
      observer.next({ data: { msg: 'aaa' } });

      // setTimeout(() => {
      //   observer.next({ data: { msg: 'bbb' } });
      // }, 2000);

      // setTimeout(() => {
      //   observer.next({ data: { msg: 'bbb' } });
      // }, 5000);

    });


  }
}
