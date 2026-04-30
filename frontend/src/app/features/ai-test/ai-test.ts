import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-test.html',
  styleUrl: './ai-test.css'
})
export class AiTest {
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  verificationResult: Record<string, string> | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  private apiKey: string = 'AIzaSyASMS94WELok0ajiQ3DFsv0OIAU9k8dRZM';
  
  private get apiUrl(): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
  }

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.error = null;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  async verifyDocument(): Promise<void> {
    if (!this.selectedFile || !this.imagePreview) {
      this.error = 'Please select an image first.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.verificationResult = null;
    this.cdr.detectChanges();

    try {
      const base64Data = this.imagePreview.split(',')[1];
      
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `You are a document verification expert. 
                1. Analyze the image to determine if it is a Pakistani CNIC (National Identity Card) front side.
                2. Set 'isCnic' (boolean) to true only if it is a Pakistani CNIC.
                3. If 'isCnic' is true, extract: CNIC Number, Full Name, Father Name, Gender, Date of Birth, Date of Issue, and Date of Expiry.
                4. If 'isCnic' is false, return an empty object for data fields and include an 'errorMessage' field explaining why it's not a CNIC.
                Return ONLY a JSON object in this format:
                {
                  "isCnic": boolean,
                  "extractedData": { "CNIC Number": "...", "Full Name": "...", ... },
                  "errorMessage": "string (optional)"
                }`
              },
              {
                inline_data: {
                  mime_type: this.selectedFile.type,
                  data: base64Data
                }
              }
            ]
          }
        ]
      };

      this.http.post(this.apiUrl, payload).subscribe({
        next: (data: any) => {
          this.isLoading = false;
          try {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
              const result = JSON.parse(jsonMatch[0]);
              if (result.isCnic) {
                this.verificationResult = result.extractedData;
                this.error = null;
              } else {
                this.verificationResult = null;
                this.error = result.errorMessage || 'This does not appear to be a valid Pakistani CNIC front side.';
              }
            } else {
              this.error = 'Could not parse JSON: ' + textResponse;
            }
          } catch (e: any) {
            this.error = 'Parse Error: ' + e.message;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'API Error: ' + (err.error?.error?.message || err.message);
          this.cdr.detectChanges();
        }
      });
    } catch (e: any) {
      this.isLoading = false;
      this.error = 'Error: ' + e.message;
      this.cdr.detectChanges();
    }
  }
}
