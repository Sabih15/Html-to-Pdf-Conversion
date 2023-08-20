import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import domToImage from 'dom-to-image';
import jsPDF, { jsPDFOptions } from 'jspdf';
import * as moment from 'moment';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  @ViewChild('dataToExport', { static: false }) dataToExport!: ElementRef;
  externalHtml: any;
  title = 'htmltopdf_Phase1';
  pdfName = 'abc';

  constructor(private http: HttpClient,
    private sanitizer: DomSanitizer) {

  }

  openHTML() {
    this.http.get('/assets/sample2.html', { responseType: 'text' }).subscribe(
      data => this.externalHtml = this.sanitizer.bypassSecurityTrustHtml(data)
    );
  }

  public async downloadAsPdf() {

    const formElement = this.dataToExport.nativeElement;

    html2canvas(formElement).then((canvas) => {
      const width = this.dataToExport.nativeElement.clientWidth;
      const height = this.dataToExport.nativeElement.clientHeight + 40;
      let jsPdfOptions: jsPDFOptions = {
        orientation: 'l',
        unit: 'pt',
        format: [width + 50, height + 220]
      };
      const pdf = new jsPDF(jsPdfOptions);
      const imgData = canvas.toDataURL('image/png');
      pdf.setFontSize(48);
      pdf.setTextColor('#2585fe');
      pdf.text(this.pdfName ? this.pdfName.toUpperCase() : 'Untitled dashboard'.toUpperCase(), 25, 75);
      pdf.setFontSize(24);
      pdf.setTextColor('#131523');
      pdf.text('Report date: ' + moment().format('ll'), 25, 115);
      pdf.addImage(imgData, 'PNG', 25, 185, width, height);
      pdf.save('form.pdf');
    });

    // const width = this.dataToExport.nativeElement.clientWidth;
    // const height = this.dataToExport.nativeElement.clientHeight + 40;
    // let orientation = 'l';
    // let imageUnit = 'pt';
    // if (width > height) {
    //   orientation = 'l';
    // } else {
    //   orientation = 'p';
    // }
    // domToImage
    //   .toPng(this.dataToExport.nativeElement, {
    //     width: width,
    //     height: height
    //   })
    //   .then(result => {
    //     let jsPdfOptions: jsPDFOptions = {
    //       orientation: 'l',
    //       unit: 'pt',
    //       format: [width + 50, height + 220]
    //     };
    //     const pdf = new jsPDF(jsPdfOptions);
    //     pdf.setFontSize(48);
    //     pdf.setTextColor('#2585fe');
    //     pdf.text(this.pdfName ? this.pdfName.toUpperCase() : 'Untitled dashboard'.toUpperCase(), 25, 75);
    //     pdf.setFontSize(24);
    //     pdf.setTextColor('#131523');
    //     pdf.text('Report date: ' + moment().format('ll'), 25, 115);
    //     pdf.addImage(result, 'PNG', 25,   185, width, height);
    //     pdf.save('file_name' + '.pdf');
    //   })
    //   .catch(error => {
    //   });
  }
}
