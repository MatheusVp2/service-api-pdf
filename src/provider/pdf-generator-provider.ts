import fs from "node:fs"
import path from "node:path"

import hbs from "handlebars"

import chrome from 'chrome-aws-lambda'
import puppeteer from "puppeteer"


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

    private async getBrowser() {
        const isDev = !process.env.AWS_REGION
        if (!isDev) {
            let options = {
                args: chrome.args,
                executablePath: await chrome.executablePath,
                headless: chrome.headless
            }
            return await chrome.puppeteer.launch({
                args: chrome.args,
                defaultViewport: chrome.defaultViewport,
                executablePath: await chrome.executablePath,
                headless: chrome.headless,
                ignoreHTTPSErrors: true,
            });
        }
        return await puppeteer.launch()
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
        const browser = await this.getBrowser()
        const page = await browser.newPage()
        await page.setContent(html)
        return await page.pdf({ format: "a4" })
    }

}