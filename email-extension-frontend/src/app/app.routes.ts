import { Routes } from '@angular/router';
import { EmailAssistantComponent } from './components/email-assistant/email-assistant.component';

export const routes: Routes = [
  { path: '', component: EmailAssistantComponent },
  { path: '**', redirectTo: '' }
];