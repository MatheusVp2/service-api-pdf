import express, { Request, Response } from "express";
import cors from "cors";
import { PDFGeneratorProvider } from "./provider/pdf-generator-provider";
import { logger } from "./helpers/logger";


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


const version = "0.0.4"
app.get("/health", (req: Request, res: Response) => {
    res.json({ message: "Funcionando com sucesso.", version: version })
})



app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Funcionando com sucesso.", version: version })
})


app.get("/pdf", async (req: Request, res: Response) => {
    try {
        const params: RequestQueryPdf = {
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