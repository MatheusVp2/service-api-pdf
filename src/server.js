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

const version = "1.0.1"
app.get("/health", (req, res) => {
    res.json({ message: "Funcionando com sucesso.", version: version })
})



app.get("/",  (req, res) => {
    res.json({ message: "Funcionando com sucesso.", version: version })
})


app.get("/pdf", async  (req, res) => {
    const params = {
        ...DefaultRequestQueryPdf,
        ...req.query
    }
    const html = PDFGenerator.renderHTML("documento.hbs", { nome: "ANDRE" })
    const pdf = await PDFGenerator.createPDF(html)
    res.contentType("application/pdf")
    if (params.type === "download") {
        res.attachment(params?.filename ? `${params?.filename}.pdf` : `${params?.id}.pdf`)
    }
    res.send(pdf)
})


const server_port = process.env.PORT || 3000;


app.listen(server_port, () => console.log(`Servidor esta ligado na porta ${server_port}.`))