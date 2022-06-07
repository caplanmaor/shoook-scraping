const pt = require("puppeteer");
const cheerio = require("cheerio");
const excelJS = require("exceljs");
const workbook = new excelJS.Workbook();
const worksheet = workbook.addWorksheet("Prices");
const path = "./files";
let id = 0;
worksheet.columns = [
  { header: "ID", key: "id", width: 10 },
  { header: "Name", key: "name", width: 10 },
  { header: "Price", key: "price", width: 25 },
];

function scanUrl(name, urls, priceClass, nameClass) {
  pt.launch().then(async (browser) => {
    //browser new page
    const p = await browser.newPage();
    //set viewpoint of browser page
    await p.setViewport({ width: 1920, height: 1080 });
    //launch URL

    for (let url of urls) {
      await p.goto(url);

      // await p.hover(
      //   "#header > div.container.relative > div.head_width > nav > div > div:nth-child(1) > div.menu_item_top.ease > a > span"
      // );

      // await p.click(
      //   "#header > div.container.relative > div.head_width > nav > div > div:nth-child(1) > div.menu_drop.menu_drop_big.has_sale > div.clearfix.column-2 > div:nth-child(1) > div > a"
      // );

      p.waitForTimeout(1000);

      await p.evaluate(scrollToBottom);

      // HTML
      let html = await p.evaluate(() => document.body.innerHTML);
      const $ = cheerio.load(html);

      // prices
      let prices = $(priceClass)
        .map(function () {
          return $(this).text();
        })
        .get();
      prices.forEach((element, index, array) => {
        array[index] = element.replace(/[\n\t₪]/g, "");
      });

      // names
      let names = $(nameClass)
        .map(function () {
          return $(this).text();
        })
        .get();
      names.forEach((element, index, array) => {
        array[index] = element.replace(/[\n]/g, "");
      });

      // delete duplicates
      let prices_uniq = [];
      let names_uniq = [];

      names.forEach((element, index) => {
        if (!names_uniq.includes(element)) {
          names_uniq.push(names[index]);
          prices_uniq.push(prices[index]);
        }
      });

      // arrange data for export
      let table = [];
      names_uniq.forEach((element, index) => {
        id++;
        obj = {};
        obj["id"] = id;
        obj["name"] = element;
        obj["price"] = prices_uniq[index];
        table.push(obj);
      });

      // add to worksheet
      table.forEach((element) => {
        worksheet.addRow(element);
      });
    }

    // Making first line in excel bold
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    const data = await workbook.xlsx.writeFile(`${path}/${name}_items.xlsx`);
    console.log("saved file");
    //browser close
    await browser.close();
  });
}

async function scrollToBottom() {
  await new Promise((resolve) => {
    const distance = 100; // should be less than or equal to window.innerHeight
    const delay = 100;
    const timer = setInterval(() => {
      document.scrollingElement.scrollBy(0, distance);
      if (
        document.scrollingElement.scrollTop + window.innerHeight >=
        document.scrollingElement.scrollHeight
      ) {
        clearInterval(timer);
        resolve();
      }
    }, delay);
  });
}

module.exports = { scanUrl };
