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
        const options = await this.getOptionsBrowser()
        const browser = await puppeteer.launch(options)
        const page = await browser.newPage()
        await page.setContent(html)
        return await page.pdf({ format: "a4" })
    }

}