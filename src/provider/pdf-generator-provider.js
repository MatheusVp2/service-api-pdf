import fs from "node:fs";
import path from "node:path";

import hbs from "handlebars";

import puppeteer from "puppeteer";

import { fileURLToPath } from 'url';
import { transcode } from "node:buffer";

const PERFORMANCE_ARGS = [
    '--autoplay-policy=user-gesture-required',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
    "--single-process",
]

class PuppeteerProvider {

    constructor(){
        this.init()
    }

    async init(){
        this.browser = undefined
        this.page = undefined
    }

    async getBrowser(){
        return await puppeteer.launch({
            headless: false,
            args: PERFORMANCE_ARGS,
            executablePath:
                process.env.NODE_ENV === "production"
                    ? process.env.PUPPETEER_EXECUTABLE_PATH
                    : puppeteer.executablePath(),
        });
    }

    async openBrowserAndPage(){
        this.browser = await this.getBrowser()
        this.page = await this.browser.newPage()
        await this.page.setContent(`<link type="text/css" href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css" rel="stylesheet" /><h1>Start Server</>`)
    }

    async closeBrowser(){
        await this.browser.close()
        this.page = undefined
    }

    get isBrowserConnected() {
        if(this.browser)
            return this.browser.isConnected()
        return false
    }

}

export class PDFGeneratorProvider extends PuppeteerProvider {

    constructor() {
        super()
        this.initialize()
    }

    async initialize() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        this.templatePath = path.join(__dirname, "..", "templates", "pdf")
    }

    renderHTML(filename, data) {
        var source = fs.readFileSync(path.join(this.templatePath, filename), 'utf8').toString();
        var template = hbs.compile(source);
        return template(data);
    }

    async createPDF(html) {
        if(!this.isBrowserConnected) throw new Error("Browser is not connected")
        await this.page.setContent(html)
        return await this.page.pdf({ format: "a4" })
    }

}
