const pptr = require('puppeteer')
const commandLineArgs = require('command-line-args');
const ndlfunc = require('./ndlfunc')

function trace(message) {
  console.log(message)
}

launchOption = {
  // executablePath: 
  headless: false,
  slowMo: 50, // typing delay
  timeout: 60000,
  args: [
    '--incognito'
  ],
};



const optionDefinitions = [
  {
    name: 'verbose',
    alias: 'v',
    type: Boolean
  },
  {
    name: 'url',
    alias: 'u',
    type: String,
  },
];
const options = commandLineArgs(optionDefinitions);

if (!options.url) {
  console.error('No url')
  return
}


async function waitForPageLoaded(page, url) {
  let tried = 0
  const wait = 60000
  if (url && url != page.url()) {
    await page.goto(url)
    while (url != page.url()) {
      trace(`${url} != ${page.url()}`)
      await page.waitForNavigation({ timeout: wait, waitUntil: "domcontentloaded" });
      if (++tried > 100) {
        console.error('Can not reach ' + url)
        return false
      }
    }
  } else {
    await page.waitForNavigation({ timeout: wait, waitUntil: "domcontentloaded" });
  }
  return true;
}

async function waitForPDFPage(page) {
  let tried = 0
  const wait = 60000
  
    
    while (true) {
      trace(page.url());
      // await page.waitForNavigation({ timeout: wait, waitUntil: ['networkidle2'] });
      await page.waitForNavigation();
      let cont = await page.content();
      trace(cont);
      if (++tried > 100) {
        console.error('can not get PDF page')
        return false
      }
      page.conte
    }
  
  return true;
}

// -----------------
(async () => {
  const brow = await pptr.launch(launchOption)
  const page = await brow.newPage()
  trace('New page created')
  let url = options.url;
  try {
    if (!await waitForPageLoaded(page, url)) {
      return;
    }
    trace('Navigated to ' + url);

    const endIndexElem = await page.$('#form-page-control-selection > div.mb-placeholder.mb-pageindex')
    let endIndex = await endIndexElem.evaluate((node) => node.innerText)
    endIndex = endIndex.match(/\d+/g)
    endIndex = parseInt(endIndex, 10)
    if (endIndex <= 0) {
      throw 'EndIndex not set'
    }
    trace('EndIndex is ' + endIndex);

    const ranges = ndlfunc.getDownRanges(endIndex)
    for(let i=0 ; i < ranges.length; ++i) {
      let range = ranges[i];
      let srange = range[0] + '-' + (range.length >= 2 ? range[1] : '');
      trace(srange);

      const btnPrint = await page.$('#btn-print');
      if(!btnPrint) {
        throw 'btnPrint not found';
      }
      await btnPrint.click();

      const inputRange = await page.$('#form-dialog-print > ul > li:nth-child(2) > input[type=text]:nth-child(3)');
      inputRange.type(srange);

      const btnCreatePDF = await page.$('#btn-print-notinlibrary');
      // const navigationPromise = page.waitForNavigation();
      await btnCreatePDF.click();

      // This never ends
      // await Promise.all([btnCreatePDF.click(), page.waitForNavigation()]);
      // await navigationPromise;

      let cont = await page.content();
      trace(cont);
    }
    

  } catch (err) {
    console.error(err)
  } finally {
    await brow.close();
  }



})();

