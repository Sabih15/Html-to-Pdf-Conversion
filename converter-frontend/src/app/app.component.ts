import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PDFDocument } from 'pdf-lib';
import { PdfService } from 'src/services/pdf.service';
import { PasswordPromptComponent } from './password-prompt/password-prompt.component';
import { HtmlTagModel } from 'src/model/htmlTagModel';
import { LoaderService } from 'src/services/loader.service';
import {saveAs as importedSaveAs} from "file-saver";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  htmlFile: File;
  pdfFile: File;
  pdfBuffer: Uint8Array;
  showPasswordPrompt = false;
  pdfFilePassword: string = "";
  htmlTagModel: HtmlTagModel[];
  htmlContent = '';
  showHTMLConverteroptions = false;
  showPDFConverteroptions = false;
  success = "success";
  @ViewChild('div') div: ElementRef;

  constructor(private pdfService: PdfService, public dialog: MatDialog, public loaderService: LoaderService) { }
  openPasswordPrompt(): void {
    this.dialog.open(PasswordPromptComponent, {
      data: { pdffile: this.pdfFile },
      width: '250px', height: '250px'
    }).afterClosed().subscribe(res => {
      if (res != 'undefined' && res) {
        this.pdfFilePassword = res['data']
        this.getHtml(true);
      }

    })
  }

  pdfFileUploadChange(event: any) {
    this.pdfFile = event.target.files[0];
    this.pdfFile.arrayBuffer().then(buffer => {
      this.pdfBuffer = new Uint8Array(buffer);
    })
  }

  htmlFileUploadChange(event: any) {
    this.htmlFile = event.target.files[0];
  }

  downloadAsPdf() {
    if (this.htmlFile == null) {
      alert("file not selected")
    }
    else {
      this.pdfService.getPdf(this.htmlFile);
    }
  }

  downloadAsHtml() {
    if (this.pdfFile == null) {
      alert("file not selected")
    }
    else {
      this.pdfFile.arrayBuffer().then(res => {
        PDFDocument.load(res, { ignoreEncryption: true }).then(pdfDoc => {
          if (pdfDoc.isEncrypted) {
            this.openPasswordPrompt();
          }
          else {
            this.getHtml(false);
          }
        });
      });
    }
  }

  getHtml(isEncrypted: boolean) {
    if (isEncrypted) {
      this.pdfService.getHtml(this.pdfFile, this.pdfFilePassword).subscribe(res => {
        const f = new File([res], "data.pdf", { type: "application/json" })
        f.arrayBuffer().then(buffer => {
          this.pdfBuffer = new Uint8Array(buffer);
          this.pdfService.extractFormFields(this.pdfBuffer).then(res => {
            this.htmlTagModel = res;
            this.createHTMLElements();
          })
        })
      })
    }
    else {
      this.pdfService.extractFormFields(this.pdfBuffer).then(res => {
        this.htmlTagModel = res;
        this.createHTMLElements();
      })
    }
  }

  selectionChanged(event: any) {
    if (event.target.value != "") {
      if (event.target.value == "htmltopdf") {
        this.showPDFConverteroptions = false;
        this.showHTMLConverteroptions = true;
      }
      else if (event.target.value == "pdftohtml") {
        this.showHTMLConverteroptions = false;
        this.showPDFConverteroptions = true;
      }
    }
  }

  createHTMLElements() {
    if (this.htmlTagModel.length == 0) {
      alert("There ar no interactive fields in the selected PDF.")
      return;
    }


    var mainDivStyle = `style="display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;"`;

    var secondDivStyle = `style="display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 400px;
    box-shadow: 10px;
    margin-top: 50px;
    padding: 20px 30px;
    background: linear-gradient(90deg, var(--c1, #82B5F5), var(--c2, #EEE2B2) 51%, var(--c1, #82B5F5));"`;


    this.htmlContent = `<div ${mainDivStyle}>`;

    this.htmlContent += `<div ${secondDivStyle}>`

    var bar = new Promise<void>((resolve, reject) => {


      this.htmlTagModel.forEach((element, index) => {
        if (element.elementType == 'PDFTextField') {

          this.htmlContent = this.htmlContent +
            `
        <input placeholder="${element.name}" 
        style="padding:10px; 
        border:none; 
        border-bottom: 2px solid #5A5A5A;
        outline:none;
        background-color: transparent;
        color: #5A5A5A;
        font-family: Arial, sans-serif;
        " 
        type="text">`

        }

        else if (element.elementType == 'PDFDropdown') {
          if (this.htmlContent != "")
            this.htmlContent = this.htmlContent + `<br>`

          // this.htmlContent = this.htmlContent + `<h3 style="color:#5A5A5A; text-transform:uppercase; font-family: Arial, sans-serif" >${element.name}</h3>` 

          this.htmlContent = this.htmlContent +
            `<label 
        style="color:#5A5A5A; 
        text-transform:capitalize; 
        font-family: Arial, sans-serif; 
        margin-bottom:10px;
        margin:10px;">
        ${element.name}
        </label>
        <select>`
          element.options.forEach(el => {
            this.htmlContent = this.htmlContent + `<option value"${el}">${el}</options>`
          });
          this.htmlContent = this.htmlContent + `</select>`
        }

        else if (element.elementType == 'PDFRadioGroup') {
          if (this.htmlContent != "")
            this.htmlContent = this.htmlContent + `<br>`

          this.htmlContent = this.htmlContent +
            `<label 
        style="color:#5A5A5A; 
        text-transform:capitalize; 
        font-family: Arial, sans-serif;
        margin:10px;">
        ${element.name}
        </label>`

          element.options.forEach(el => {
            this.htmlContent = this.htmlContent +
              `<input
          style="margin: 10px 10px; font-family: Arial, sans-serif; "
          type="radio" name=${element.name} value=${el}><label style="color:#5A5A5A; font-family: Arial, sans-serif;" >${el}</label><br>`
          });
        }
        if (index == this.htmlTagModel.length - 1) resolve();
      })

    });//PROMISE END

    bar.then(() => {
      this.htmlContent += `</div>` //CLOSIND 2ND DIV
      this.htmlContent += `</div>` //CLOSING MAIN DIV
      var fileObj = new File([this.htmlContent], "converted_HTML.html", { type: "text/html" });
      var downloadURL = window.URL.createObjectURL(fileObj);
      importedSaveAs(fileObj)
      // window.open(downloadURL)
      // var link = document.createElement('a');


      // link.href = downloadURL;
      // link.target = '_blank'
      // link.click();

    })

    // this.div.nativeElement.insertAdjacentHTML('beforeend', this.htmlContent);
  }
}
