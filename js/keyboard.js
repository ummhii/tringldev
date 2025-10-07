export function initKeyboardShortcuts() {
  document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      const contactForm = document.getElementById('contact');
      if (contactForm) {
        contactForm.scrollIntoView({ behavior: 'smooth' });
        const nameInput = document.getElementById('name');
        if (nameInput) nameInput.focus();
      }
    }
    
    if (event.ctrlKey && event.key === 'h') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
