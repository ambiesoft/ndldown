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

if(!options.url) {
    console.error('No url')
    return
}


async function waitForPageLoaded(page, url) {
    let tried = 0
    const wait = 60000
    if(url && url != page.url()) {
      await page.goto(url)
      while(url != page.url()) {
        trace(`${url} != ${page.url()}`)
        await page.waitForNavigation({timeout: wait, waitUntil: "domcontentloaded"});
        if(++tried > 100) {
          console.error('Can not reach ' + url)
          return false
        }
      }
    } else {
      await page.waitForNavigation({timeout: wait, waitUntil: "domcontentloaded"});
    }
    return true;
  }

// -----------------
(async ()=> {
    const brow = await pptr.launch(launchOption)    
    const page = await brow.newPage()
    trace('New page created')
    let url = options.url;
    try {
        if(!await waitForPageLoaded(page, url)) {
            return;
        }
        trace('Navigated to ' + url);

        const endIndexElem = await page.$('#form-page-control-selection > div.mb-placeholder.mb-pageindex')
        let endIndex = await endIndexElem.evaluate((node)=>node.innerText)
        endIndex = endIndex.match(/\d+/g)
        endIndex = parseInt(endIndex, 10)
        if(endIndex <= 0) {
            throw 'EndIndex not set'
        }
        trace('EndIndex is ' + endIndex);

        const ranges = ndlfunc.getDownRanges(endIndex)

        // kokokara
        console.log(ranges)

    } catch(err) {
        console.error(err)
    } finally {
        await brow.close();
    }

    
    
})();

