import { Inject, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { Job } from './entites/Job';
import { EntityManager } from 'typeorm';

@Injectable()
export class AppService {

  @Inject(EntityManager)
  private entityManager: EntityManager;

  getHello(): string {
    return 'Hello World!';
  }

  // 实现爬虫
  async startSpider() {
    const browser = await puppeteer.launch({
      headless: false, // 将headless设置为true，此处不需要界面
      defaultViewport: {
        width: 0,
        height: 0
      }
    });
    const page = await browser.newPage();
    // 打开指定URL
    // 方案1：增加等待时长
    // await page.goto('https://www.zhipin.com/web/geek/job?query=后端&city=100010000');
    // await page.waitForSelector('.job-list-box',{timeout:60000});

    // 方案2：等待页面完全加载后解析
    await page.goto('https://www.zhipin.com/web/geek/job?query=后端&city=100010000', { waitUntil: 'load' });
    await page.waitForSelector('.job-list-box');


    // 1.获取页数信息
    const totalPage = await page.$eval('.options-pages a:nth-last-child(2)', el => {
      return parseInt(el.textContent)
    });
    console.log('检索页数：', totalPage);

    // 2.遍历岗位信息数据列表
    const allJobs = []; for (let i = 1; i <= totalPage; i++) {
      // 依次打开每一页的内容
      await page.goto('https://www.zhipin.com/web/geek/job?query=后端&city=100010000&page=' + i);
      await page.waitForSelector('.job-list-box');
      // 解析每个节点的数据
      const jobs = await page.$eval('.job-list-box', el => {

        return [...el.querySelectorAll('.job-card-wrapper')].map(item => {
          return {
            job: {
              name: item.querySelector('.job-name').textContent,
              area: item.querySelector('.job-area').textContent,
              salary: item.querySelector('.salary').textContent
            },
            link: item.querySelector('a').href,
            company: {
              name: item.querySelector('.company-name').textContent
            }
          }
        })
      });
      // 存储所有的数据信息
      allJobs.push(...jobs);
    }
    console.log('检索结果：', allJobs);

    // 3.获取所有列表数据的详情信息
    for (let i = 0; i < allJobs.length; i++) {
      await page.goto(allJobs[i].link);
      try {
        await page.waitForSelector('.job-sec-text');
        const jd = await page.$eval('.job-sec-text', el => {
          return el.textContent
        });
        allJobs[i].desc = jd;
        // 打印数据信息
        console.log(allJobs[i]);

        // 4.数据入库
        const job = new Job();
        job.name = allJobs[i].job.name;
        job.area = allJobs[i].job.area;
        job.salary = allJobs[i].job.salary;
        job.link = allJobs[i].link;
        job.company = allJobs[i].company.name;
        job.desc = allJobs[i].desc;
        await this.entityManager.save(Job, job);

      } catch (e) {
        // 捕获异常处理（例如页面打开可能会超时导致终止，直接跳过即可）
        console.log('捕获异常....');
      }
    }
  }

}
