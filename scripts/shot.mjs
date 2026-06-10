// Screenshot helper: node scripts/shot.mjs <url> <outfile> [width] [height]
import { chromium } from 'playwright'

const [, , url, out, w = '1280', h = '900'] = process.argv
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: +w, height: +h } })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(2600) // let mount animations settle
await page.screenshot({ path: out, fullPage: true })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await browser.close()
if (errors.length) { console.error('PAGE ERRORS:', errors.join('\n')); process.exit(1) }
console.log('saved', out)
