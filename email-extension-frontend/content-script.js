// Content script for Smart Email Assistant Browser Extension
// This script runs on email client pages (Gmail, Outlook, etc.)

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    BUTTON_ID: 'smart-email-assistant-btn',
    BUTTON_CLASS: 'sea-assistant-button',
    POPUP_ID: 'smart-email-popup',
    EXTENSION_ID: chrome.runtime.id
  };

  // Add Smart Email Assistant button to email interfaces
  function addSmartEmailButton() {
    // Remove existing button if present
    const existingButton = document.getElementById(CONFIG.BUTTON_ID);
    if (existingButton) {
      existingButton.remove();
    }

    // Create the button
    const button = document.createElement('button');
    button.id = CONFIG.BUTTON_ID;
    button.className = CONFIG.BUTTON_CLASS;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
      </svg>
      Smart Email Assistant
    `;
    button.title = 'Generate smart email response';
    
    // Add click handler
    button.addEventListener('click', handleButtonClick);

    // Try to find appropriate location to inject the button
    injectButton(button);
  }

  // Inject button into the email interface
  function injectButton(button) {
    // Gmail injection points
    const gmailToolbar = document.querySelector('[role="toolbar"]');
    const gmailCompose = document.querySelector('[role="button"][aria-label*="Send"]');
    
    // Outlook injection points
    const outlookToolbar = document.querySelector('[data-app-section="MailCompose"]');
    const outlookButtons = document.querySelector('.ms-Button-flexContainer');

    if (gmailToolbar) {
      // Gmail - add to toolbar
      gmailToolbar.appendChild(button);
    } else if (gmailCompose && gmailCompose.parentNode) {
      // Gmail - add near send button
      gmailCompose.parentNode.insertBefore(button, gmailCompose);
    } else if (outlookToolbar) {
      // Outlook - add to compose toolbar
      outlookToolbar.appendChild(button);
    } else if (outlookButtons) {
      // Outlook - add to button container
      outlookButtons.appendChild(button);
    } else {
      // Fallback - add to body with fixed positioning
      button.style.position = 'fixed';
      button.style.top = '10px';
      button.style.right = '10px';
      button.style.zIndex = '10000';
      document.body.appendChild(button);
    }
  }

  // Handle button click
  function handleButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Get email content from the current context
    const emailContent = extractEmailContent();
    
    if (!emailContent) {
      alert('Please select or compose an email to generate a response.');
      return;
    }

    // Open the Smart Email Assistant popup
    openSmartEmailPopup(emailContent);
  }

  // Extract email content from the current page
  function extractEmailContent() {
    // Gmail selectors
    const gmailContent = document.querySelector('[role="textbox"][aria-label*="Message Body"]');
    const gmailSelected = document.querySelector('.ii.gt .ii.gt');
    
    // Outlook selectors
    const outlookContent = document.querySelector('[data-app-section="MailCompose"] [role="textbox"]');
    const outlookSelected = document.querySelector('.allowTextSelection');

    // Try to get content from compose box or selected email
    if (gmailContent && gmailContent.textContent.trim()) {
      return gmailContent.textContent.trim();
    } else if (gmailSelected && gmailSelected.textContent.trim()) {
      return gmailSelected.textContent.trim();
    } else if (outlookContent && outlookContent.textContent.trim()) {
      return outlookContent.textContent.trim();
    } else if (outlookSelected && outlookSelected.textContent.trim()) {
      return outlookSelected.textContent.trim();
    }

    // Fallback - try to get any selected text
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      return selection.toString().trim();
    }

    return null;
  }

  // Open Smart Email Assistant popup
  function openSmartEmailPopup(emailContent) {
    // Create popup iframe
    const popup = createPopupIframe();
    
    // Send email content to the Angular app
    popup.onload = function() {
      popup.contentWindow.postMessage({
        type: 'INITIAL_EMAIL_CONTENT',
        content: emailContent
      }, '*');
    };
    
    document.body.appendChild(popup);
  }

  // Create popup iframe
  function createPopupIframe() {
    // Remove existing popup
    const existingPopup = document.getElementById(CONFIG.POPUP_ID);
    if (existingPopup) {
      existingPopup.remove();
    }

    const popup = document.createElement('iframe');
    popup.id = CONFIG.POPUP_ID;
    popup.src = chrome.runtime.getURL('dist/smart-email-frontend/index.html');
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 800px;
      height: 600px;
      max-width: 90vw;
      max-height: 90vh;
      border: none;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      z-index: 10001;
      background: white;
    `;

    // Add close button overlay
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: fixed;
      top: calc(50% - 300px + 10px);
      left: calc(50% + 400px - 40px);
      width: 30px;
      height: 30px;
      border: none;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border-radius: 50%;
      cursor: pointer;
      z-index: 10002;
      font-size: 18px;
      line-height: 1;
    `;
    closeButton.onclick = () => {
      popup.remove();
      closeButton.remove();
    };

    document.body.appendChild(closeButton);
    return popup;
  }

  // Listen for messages from the Angular app
  window.addEventListener('message', function(event) {
    if (event.data.type === 'CLOSE_POPUP') {
      const popup = document.getElementById(CONFIG.POPUP_ID);
      if (popup) {
        popup.remove();
      }
    } else if (event.data.type === 'INSERT_RESPONSE') {
      insertEmailResponse(event.data.response);
    }
  });

  // Insert generated response into the email compose area
  function insertEmailResponse(response) {
    // Gmail insertion
    const gmailTextbox = document.querySelector('[role="textbox"][aria-label*="Message Body"]');
    if (gmailTextbox) {
      gmailTextbox.focus();
      gmailTextbox.innerHTML = response;
      return;
    }

    // Outlook insertion
    const outlookTextbox = document.querySelector('[data-app-section="MailCompose"] [role="textbox"]');
    if (outlookTextbox) {
      outlookTextbox.focus();
      outlookTextbox.innerHTML = response;
      return;
    }

    // Fallback - copy to clipboard
    navigator.clipboard.writeText(response).then(() => {
      alert('Email response copied to clipboard!');
    });
  }

  // Initialize
  function init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addSmartEmailButton);
    } else {
      addSmartEmailButton();
    }

    // Re-add button when page content changes (for SPAs)
    const observer = new MutationObserver(function(mutations) {
      const shouldAddButton = mutations.some(mutation => 
        mutation.addedNodes.length > 0 || 
        mutation.type === 'childList'
      );
      
      if (shouldAddButton && !document.getElementById(CONFIG.BUTTON_ID)) {
        setTimeout(addSmartEmailButton, 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start the extension
  init();

})();