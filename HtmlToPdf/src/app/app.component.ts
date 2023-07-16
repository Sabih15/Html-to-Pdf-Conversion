import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  externalHtml: any;
  title = 'htmltopdf_Phase1';

  constructor(private http:HttpClient,
    private sanitizer:DomSanitizer){
  
    }

  openHTML() {
    this.http.get('assets/sample2.html', { responseType: 'text' }).subscribe(
      data => this.externalHtml = this.sanitizer.bypassSecurityTrustHtml(data)
    );
  }
}
