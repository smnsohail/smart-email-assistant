import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailService, EmailRequest } from '../../services/email.service';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-email-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-assistant.component.html',
  styleUrls: ['./email-assistant.component.css']
})
export class EmailAssistantComponent implements OnInit, OnDestroy {
  emailContent: string = '';
  selectedTone: string = 'professional';
  customTone: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  generatedResponse: string = '';
  
  private subscription?: Subscription;

  toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'custom', label: 'Custom' }
  ];

  constructor(private emailService: EmailService) {}

  onToneChange() {
    this.errorMessage = '';
    if (this.selectedTone !== 'custom') {
      this.customTone = '';
    }
  }

  ngOnInit() {
    // Listen for messages from browser extension content script
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.handleMessage.bind(this));
    }
  }

  private handleMessage(event: MessageEvent) {
    if (event.data.type === 'INITIAL_EMAIL_CONTENT') {
      this.emailContent = event.data.content;
    }
  }

  onSubmit() {
    this.errorMessage = '';
    this.generatedResponse = '';

    // Validation
    if (!this.emailContent.trim()) {
      this.errorMessage = 'Please enter email content';
      return;
    }

    if (this.selectedTone === 'custom' && !this.customTone.trim()) {
      this.errorMessage = 'Please enter a custom tone';
      return;
    }

    this.isLoading = true;
    
    const request: EmailRequest = {
      emailContent: this.emailContent,
      tone: this.selectedTone === 'custom' ? this.customTone : this.selectedTone
    };

    this.subscription = this.emailService.generateEmailResponse(request)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: string) => {
          if (response) {
            this.generatedResponse = response;
          }
        },
        error: (error: Error) => {
          console.error('Error generating email:', error);
          this.errorMessage = error.message;
        }
      });
  }

  clearForm() {
    this.emailContent = '';
    this.selectedTone = 'professional';
    this.customTone = '';
    this.errorMessage = '';
    this.generatedResponse = '';
  }

  copyToClipboard() {
    if (this.generatedResponse) {
      navigator.clipboard.writeText(this.generatedResponse).then(() => {
        // Could add a success message here
        console.log('Response copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
      });
    }
  }

  insertIntoEmail() {
    if (this.generatedResponse && typeof window !== 'undefined') {
      // Send message to content script to insert the response
      window.parent.postMessage({
        type: 'INSERT_RESPONSE',
        response: this.generatedResponse
      }, '*');
      
      // Close the popup
      window.parent.postMessage({
        type: 'CLOSE_POPUP'
      }, '*');
    }
  }
}