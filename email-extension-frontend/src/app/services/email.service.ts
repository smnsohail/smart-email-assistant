import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface EmailRequest {
  emailContent: string;
  tone: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // Update this URL to match your Spring Boot backend
  private readonly API_URL = 'http://localhost:8080/api/email/generate';

  constructor(private http: HttpClient) {}

  generateEmailResponse(request: EmailRequest): Observable<string> {
    return this.http.post(this.API_URL, request, { 
      responseType: 'text' 
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please ensure the backend is running.';
          break;
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 500:
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message || 'Unknown error occurred'}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}