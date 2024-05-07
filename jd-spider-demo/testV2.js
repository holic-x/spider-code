import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
        width: 0,
        height: 0
    }
});
const page = await browser.newPage();
// 打开指定URL
await page.goto('https://www.zhipin.com/web/geek/job?query=后端&city=100010000');
await page.waitForSelector('.job-list-box');

// 1.获取页数信息
const totalPage = await page.$eval('.options-pages a:nth-last-child(2)', el => {
    return parseInt(el.textContent)
});
console.log('检索页数：',totalPage);

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
console.log('检索结果：',allJobs);

// 3.获取所有列表数据的详情信息
for(let i=0; i< allJobs.length;i ++){
    await page.goto(allJobs[i].link);
    try{
        await page.waitForSelector('.job-sec-text');
        const jd= await page.$eval('.job-sec-text', el => {
            return el.textContent
        });
        allJobs[i].desc = jd;
        console.log(allJobs[i]);
    }catch(e){
        // 捕获异常处理（例如页面打开可能会超时导致终止，直接跳过即可）
        console.log('捕获异常....');
    }
}
    
