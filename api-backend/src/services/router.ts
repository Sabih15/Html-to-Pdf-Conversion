/**
 * Required External Modules and Interfaces
 */

import express, { Request, Response } from "express";
import * as adobePdfService from "./adobePdf.service";
import * as adobeHtmlService from "./adobeHtml.service";
import { HelperService } from "./helper.service";
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, './')
    },
    filename: function (req: any, file: any, cb: any) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })
var fileSystem = require('fs')


/**
 * Router Definition
 */

export const router = express.Router();

/**
 * Controller Definitions
 */

//GET html

router.post("/getUnprotectedPdf", upload.single('file'), async (request: any, response: any) => {
    try {
        var fileName = request.file.originalname;
        var password = request.body.password;
        console.log(fileName)
        console.log(password)
        var decryptFilePath = HelperService.CreateHtmlOutputFilePath("unprotected", ".pdf")
        adobePdfService.getUnprotectedPdf(fileName, password).then(async (result) => {
            result.saveAsFile(decryptFilePath)
                .then(async () => {
                    var stat = await fileSystem.statSync(decryptFilePath);
                    response.writeHead(200, {
                        'Content-Type': 'application/pdf',
                        'Content-Length': stat.size
                    })
                    var readStream = fileSystem.createReadStream(decryptFilePath);
                    readStream.pipe(response);

                    fileSystem.unlink('./' + fileName, (err:any) => {
                        if (err)
                        throw err
                    })
                    // var jsonData = "";
                    // await fileSystem.readFile(decryptFilePath, 'utf-8', (err: any, data: any) => {
                    //     if (err) {
                    //         console.log(err);
                    //     }
                    //     else {

                    //         // jsonData = data;
                    //         // response.json(jsonData);
                    //     }
                    // })
                })
        }).catch((err: any) => {
            if (err instanceof PDFServicesSdk.Error.ServiceApiError
                || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
                response.status(401).send("The password is incorrect");
            }
            else {
                response.status(500).send(err.message);
            }
        })
    }
    catch (e: any) {
        response.status(500).send(e.message);
    }
})

// GET pdf

router.post("/getPdf", upload.single('file'), (req: any, res: any) => {
    try {
        var fileName = req.file.originalname;
        adobePdfService.generatePdfFromHTMLWithInlineCSS(fileName).then(async (result) => {
            let outputFilePath = HelperService.createOutputFilePath();
            result.saveAsFile(outputFilePath).then(async (x: any) => {
                var stat = await fileSystem.statSync(outputFilePath);
                res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Length': stat.size
                });
                var readStream = fileSystem.createReadStream(outputFilePath);
                readStream.pipe(res);

                //delete original file
                fileSystem.unlink('./' + fileName, (err: any) => {
                    if (err) {
                        throw err;
                    }
                });
            })
                .catch((err: any) => {
                    console.log('Exception encountered while executing operation', err);
                    throw err;
                })
        })
    }
    catch (e: any) {
        res.status(500).send(e.message);
    }
});
