import cors from "cors";
import express from "express";
import { PDFGeneratorProvider } from "./provider/pdf-generator-provider.js";

import "dotenv/config";

const PDFGenerator = new PDFGeneratorProvider()

const app = express()

app.use(cors())
app.use(express.json())


const version = "2.0.1"


app.get("/health", (req, res) => {
    res.json({ message: "Funcionando com sucesso.", version: version })
})

app.get("/", (req, res) => {
    res.json({ message: "Funcionando com sucesso.", version: version })
})

app.get("/open-navigator", async (req, res) => {
    await PDFGenerator.openBrowserAndPage()
    res.json({ isOpen: PDFGenerator.isBrowserConnected })
})

app.get("/close-navigator", async (req, res) => {
    await PDFGenerator.closeBrowser()
    res.json({ isOpen: PDFGenerator.isBrowserConnected })
})

app.get("/pdf", async (req, res) => {
    const params = {
        ...{ type: "view" },
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