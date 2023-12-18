const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');

export const generatePdfFromHTMLWithInlineCSS = (filename: string): Promise<any> => {
    try {
        const setCustomOptions = (htmlToPDFOperation: any) => {
            // Define the page layout, in this case an 8 x 11.5 inch page (effectively portrait orientation).
            const pageLayout = new PDFServicesSdk.CreatePDF.options.html.PageLayout();
            pageLayout.setPageSize(20, 25);

            // Set the desired HTML-to-PDF conversion options.
            const htmlToPdfOptions = new PDFServicesSdk.CreatePDF.options.html.CreatePDFFromHtmlOptions.Builder()
                .includesHeaderFooter(true)
                .withPageLayout(pageLayout)
                .build();
            htmlToPDFOperation.setOptions(htmlToPdfOptions);
        };
        // Initial setup, create credentials instance.
        const credentials = PDFServicesSdk.Credentials
            .servicePrincipalCredentialsBuilder()
            .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
            .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
            .build();

        // Create an ExecutionContext using credentials and create a new operation instance.
        const executionContext = PDFServicesSdk.ExecutionContext.create(credentials),
            htmlToPDFOperation = PDFServicesSdk.CreatePDF.Operation.createNew();

        // Set operation input from a source file.
        // const input = this.PDFServicesSdk.FileRef.createFromLocalFile('resources/createPDFFromHTMLWithInlineCSSInput.html');
        const input = PDFServicesSdk.FileRef.createFromLocalFile(filename, PDFServicesSdk.ExtractPDF.SupportedSourceFormat.HTML);
        htmlToPDFOperation.setInput(input);

        // Provide any custom configuration options for the operation.
        setCustomOptions(htmlToPDFOperation);

        // Execute the operation and Save the result to the specified location.
        return htmlToPDFOperation.execute(executionContext)

    }
    catch (err) {
        console.log('Exception encountered while executing operation', err);
        throw err;
    }
}

export const getUnprotectedPdf = (inputPath: string, password: string): Promise<any> => {
    try {
        // Initial setup, create credentials instance.
        const credentials = PDFServicesSdk.Credentials
            .servicePrincipalCredentialsBuilder()
            .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
            .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
            .build();

        // Create an ExecutionContext using credentials
        const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);

        // Create a new operation instance.
        const removeProtectionOperation = PDFServicesSdk.RemoveProtection.Operation.createNew(),
            input = PDFServicesSdk.FileRef.createFromLocalFile(inputPath,
                PDFServicesSdk.RemoveProtection.SupportedSourceFormat.pdf
            );

        // Set operation input from a source file.
        removeProtectionOperation.setInput(input);

        // Set the password for removing security from a PDF document.
        removeProtectionOperation.setPassword(password);

        return removeProtectionOperation.execute(executionContext)
    }
    catch (err) {
        console.log('Exception encountered while executing operation', err);
        throw err;
    }
}