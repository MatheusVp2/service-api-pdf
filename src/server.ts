import express, { Request, Response } from "express";
import cors from "cors";
import { PDFGeneratorProvider } from "./provider/pdf-generator-provider";

const PDFGenerator = new PDFGeneratorProvider()

const app = express()

app.use(cors())
app.use(express.json())

const DefaultRequestQueryPdf = {
    type: "view"
}

type RequestQueryPdf = {
    token?: string
    id?: string
    type?: string
    filename?: string
}

app.get("/health", (req: Request, res: Response) => {
    res.json({ message: "Funcionando com sucesso." })
})

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Funcionando com sucesso. Alterado" })
})


app.get("/pdf", async (req: Request, res: Response) => {
    const params: RequestQueryPdf = {
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