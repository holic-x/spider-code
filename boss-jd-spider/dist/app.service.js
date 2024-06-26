"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer_1 = require("puppeteer");
const Job_1 = require("./entites/Job");
const typeorm_1 = require("typeorm");
let AppService = class AppService {
    getHello() {
        return 'Hello World!';
    }
    async startSpider() {
        const browser = await puppeteer_1.default.launch({
            headless: false,
            defaultViewport: {
                width: 0,
                height: 0
            }
        });
        const page = await browser.newPage();
        await page.goto('https://www.zhipin.com/web/geek/job?query=后端&city=100010000', { waitUntil: 'load' });
        await page.waitForSelector('.job-list-box');
        const totalPage = await page.$eval('.options-pages a:nth-last-child(2)', el => {
            return parseInt(el.textContent);
        });
        console.log('检索页数：', totalPage);
        const allJobs = [];
        for (let i = 1; i <= totalPage; i++) {
            await page.goto('https://www.zhipin.com/web/geek/job?query=后端&city=100010000&page=' + i);
            await page.waitForSelector('.job-list-box');
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
                    };
                });
            });
            allJobs.push(...jobs);
        }
        console.log('检索结果：', allJobs);
        for (let i = 0; i < allJobs.length; i++) {
            await page.goto(allJobs[i].link);
            try {
                await page.waitForSelector('.job-sec-text');
                const jd = await page.$eval('.job-sec-text', el => {
                    return el.textContent;
                });
                allJobs[i].desc = jd;
                console.log(allJobs[i]);
                const job = new Job_1.Job();
                job.name = allJobs[i].job.name;
                job.area = allJobs[i].job.area;
                job.salary = allJobs[i].job.salary;
                job.link = allJobs[i].link;
                job.company = allJobs[i].company.name;
                job.desc = allJobs[i].desc;
                await this.entityManager.save(Job_1.Job, job);
            }
            catch (e) {
                console.log('捕获异常....');
            }
        }
    }
};
exports.AppService = AppService;
__decorate([
    (0, common_1.Inject)(typeorm_1.EntityManager),
    __metadata("design:type", typeorm_1.EntityManager)
], AppService.prototype, "entityManager", void 0);
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map