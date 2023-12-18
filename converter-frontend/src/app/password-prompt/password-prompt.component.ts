import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PdfService } from 'src/services/pdf.service';

@Component({
  selector: 'app-password-prompt',
  templateUrl: './password-prompt.component.html',
  styleUrls: ['./password-prompt.component.scss']
})
export class PasswordPromptComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {pdffile: File},
  private pdfService: PdfService, 
  public dialogRef: MatDialogRef<PasswordPromptComponent>)  {}
  
  @Input() showPasswordPrompt = false;
  password: string = '';

  closePasswordPrompt(okPreseed: boolean) {
    this.showPasswordPrompt = false;
    if (okPreseed)
      this.dialogRef.close({data: this.password});
    else
      this.dialogRef.close();
    this.password = ''; // Clear the password input
  }
}
