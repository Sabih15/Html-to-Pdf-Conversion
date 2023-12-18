import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PDFDocument } from 'pdf-lib';
import { HtmlTagModel } from 'src/model/htmlTagModel';

@Injectable({
    providedIn: 'root'
})
export class PdfService {

    baseUrl: string = 'http://localhost:8000/api/backend'

    constructor(private http: HttpClient) { }

    getHtml(file: File, password: string): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('file', file);
        formData.append('password', password);

        return this.http.post(this.baseUrl + '/getUnprotectedPdf', formData, { responseType: 'blob' as 'json' });
    }

    getPdf(file: File) {
        const formData: FormData = new FormData();
        formData.append('file', file);

        this.http.post(this.baseUrl + '/getPdf', formData, { responseType: 'blob' as 'json' }).subscribe((res: any) => {

            var downloadURL = window.URL.createObjectURL(res);
            var link = document.createElement('a');
            link.href = downloadURL;
            link.download = "pdf_converted.pdf";
            link.click();
        });
    }

    async extractFormFields(pdfBytes: Uint8Array): Promise<HtmlTagModel[]> {
        var htmlTagModel: HtmlTagModel[] = [];

        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        console.log(fields)
        fields.forEach(field => {
            const type = field.constructor.name
            const name = field.getName()
            console.log(`${type}: ${name}`)

            if (type == 'PDFRadioGroup')
            {
                var radioGroup = form.getRadioGroup(name)
                var options = radioGroup.getOptions();

                var item: HtmlTagModel = {
                defaultValue: undefined,
                elementType: 'PDFRadioGroup',
                name: name.replace(/[0-9]/g, ''),
                options: options,
                elementGroup: undefined
                }
                htmlTagModel.push(item);                
            }
            else if (type == 'PDFDropdown') 
            {
                var dropdown = form.getDropdown(name);
                var options = dropdown.getOptions();
                var item: HtmlTagModel = {
                    defaultValue: undefined,
                    elementType: 'PDFDropdown',
                    name: name.replace(/[0-9]/g, ''),
                    options: options,
                    elementGroup: undefined
                    }
                    htmlTagModel.push(item);
            }
            else if (type == 'PDFTextField') 
            {
                var item: HtmlTagModel = {
                    defaultValue: undefined,
                    elementType: 'PDFTextField',
                    name: name.replace(/[0-9]/g, ''),
                    options: [],
                    elementGroup: undefined
                }
                htmlTagModel.push(item);
            }
          })

          return htmlTagModel;
      }
}
