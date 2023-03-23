import fs from "node:fs"
import path from "node:path"

import hbs from "handlebars"

import chrome from 'chrome-aws-lambda'
import puppeteer from "puppeteer-core"
import { logger } from "../helpers/logger"


type PDFGeneratorProviderProps = {
    templatePath: string
}

export class PDFGeneratorProvider {

    props: PDFGeneratorProviderProps

    constructor() {
        this.initialize()
    }

    private initialize() {
        this.props = {
            templatePath: path.join(__dirname, "..", "templates", "pdf")
        }
    }

    private async getOptionsBrowser() {
        const isDev = !process.env.AWS_REGION
        let options = {};
        if (!isDev) {
            options = {
                args: chrome.args,
                executablePath: await chrome.executablePath,
                headless: chrome.headless
            }
        }
        return options
    }

    private async getOptions() {
        const isDev = !process.env.AWS_REGION

        const chromeExecPaths = {
            win32: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            linux: '/usr/bin/google-chrome',
            darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        }

        const exePath = chromeExecPaths[process.platform]

        if (!isDev) {
            return {
                args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
                defaultViewport: chrome.defaultViewport,
                executablePath: await chrome.executablePath,
                headless: true,
                ignoreHTTPSErrors: true,
            }
        }

        return {
            args: [],
            ignoreDefaultArgs: ['--disable-extensions'],
            executablePath: exePath,
            headless: true
        }
    }

    private async getBrowser() {
        return await chrome.puppeteer.launch({
            args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
            ignoreHTTPSErrors: true,
        });
    }

    public renderHbsHTML(html: string, data: any) {
        var template = hbs.compile(html);
        return template(data);
    }

    public renderHTML(filename: string, data: any) {
        var source = fs.readFileSync(path.join(this.props.templatePath, filename), 'utf8').toString();
        var template = hbs.compile(source);
        return template(data);
    }

    public async createPDF(html: string): Promise<Buffer> {
        logger.info("Gerando Options")
        // const options = await this.getOptions()
        logger.info("Gerando Browser")
        const browser = await this.getBrowser()
        logger.info("Gerando Page")
        const page = await browser.newPage()
        logger.info("Gerando Timeout")
        page.setDefaultNavigationTimeout(0);
        logger.info("Gerando Page Html")
        await page.setContent(html)
        logger.info("Gerando PDF Buffer")
        return await page.pdf({ format: "a4" })
    }

}