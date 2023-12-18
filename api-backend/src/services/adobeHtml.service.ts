const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');

export const ExtractTextTableInfoWithStylingInfoFromPDF = (filename: string) : Promise<any> => {
    try {
        // Initial setup, create credentials instance.
        const credentials = PDFServicesSdk.Credentials
            .servicePrincipalCredentialsBuilder()
            .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
            .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
            .build();
    
        // Create an ExecutionContext using credentials
        const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);
    
        // Build extractPDF options
        const options = new PDFServicesSdk.ExtractPDF.options.ExtractPdfOptions.Builder()
            .addElementsToExtract(PDFServicesSdk.ExtractPDF.options.ExtractElementType.TEXT, PDFServicesSdk.ExtractPDF.options.ExtractElementType.TABLES)
            .getStylingInfo(true)
            .build();
    
        // Create a new operation instance.
        const extractPDFOperation = PDFServicesSdk.ExtractPDF.Operation.createNew(),
            input = PDFServicesSdk.FileRef.createFromLocalFile(filename,
                PDFServicesSdk.ExtractPDF.SupportedSourceFormat.pdf
            );
    
        // Set operation input from a source file.
        extractPDFOperation.setInput(input);
    
        // Set options
        extractPDFOperation.setOptions(options);
    
        return extractPDFOperation.execute(executionContext);
            
    } catch (err) {
        console.log('Exception encountered while executing operation', err);
        throw err;
    }
    
}