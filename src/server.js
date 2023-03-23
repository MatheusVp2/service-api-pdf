import express from "express";
import cors from "cors";
import { PDFGeneratorProvider } from "./provider/pdf-generator-provider.mjs";
import { logger } from "./helpers/logger.mjs";

import "dotenv/config"

const PDFGenerator = new PDFGeneratorProvider()


const app = express()

app.use(cors())
app.use(express.json())

const DefaultRequestQueryPdf = {
    type: "view"
}

const version = "0.1.0"
app.get("/health", (req, res) => {
    res.json({ message: "Funcionando com sucesso.", version: version })
})



app.get("/",  (req, res) => {
    res.json({ message: "Funcionando com sucesso.", version: version })
})


app.get("/pdf", async  (req, res) => {
    try {
        const params = {
            ...DefaultRequestQueryPdf,
            ...req.query
        }
        logger.info("Gerando HTML")
        const html = PDFGenerator.renderHTML("documento.hbs", { nome: "ANDRE" })


        logger.info("Gerando PDF")
        const pdf = await PDFGenerator.createPDF(html)

        logger.info("Retornando PDF")
        res.contentType("application/pdf")
        if (params.type === "download") {
            res.attachment(params?.filename ? `${params?.filename}.pdf` : `${params?.id}.pdf`)
        }
        res.send(pdf)
    } catch (err) {
        console.log(err)
        logger.info(err)
    }
})


const server_port = process.env.PORT || 3000;


app.listen(server_port, () => console.log(`Servidor esta ligado na porta ${server_port}.`))