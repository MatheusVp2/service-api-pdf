import fs from "node:fs"
import path from "node:path"

import hbs from "handlebars"

import puppeteer from "puppeteer"
import { logger } from "../helpers/logger.mjs"

import { fileURLToPath } from 'url';



export class PDFGeneratorProvider {

    constructor() {
        this.initialize()
    }

    initialize() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        this.props = {
            templatePath: path.join(__dirname, "..", "templates", "pdf")
        }
    }

    async getBrowser() {
        return await puppeteer.launch({
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
            ],
            executablePath:
                process.env.NODE_ENV === "production"
                    ? process.env.PUPPETEER_EXECUTABLE_PATH
                    : puppeteer.executablePath(),
        });
    }

    renderHbsHTML(html, data) {
        var template = hbs.compile(html);
        return template(data);
    }

    renderHTML(filename, data) {
        var source = fs.readFileSync(path.join(this.props.templatePath, filename), 'utf8').toString();
        var template = hbs.compile(source);
        return template(data);
    }

    async createPDF(html){
        logger.info("Gerando Browser")
        const browser = await this.getBrowser()
        logger.info("Gerando Page")
        const page = await browser.newPage()
        logger.info("Gerando Page Html")
        await page.setContent(html)
        logger.info("Gerando PDF Buffer")
        return await page.pdf({ format: "a4" })
    }

}