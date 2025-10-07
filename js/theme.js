export function initTheme() {
  const themeSelect = document.getElementById('theme-select');
  const htmlElement = document.documentElement;
  
  const savedTheme = localStorage.getItem('theme') || 'catppuccin-mocha';
  htmlElement.setAttribute('data-webtui-theme', savedTheme);
  
  if (themeSelect) {
    themeSelect.value = savedTheme;
    
    themeSelect.addEventListener('change', function() {
      const selectedTheme = this.value;
      htmlElement.setAttribute('data-webtui-theme', selectedTheme);
      localStorage.setItem('theme', selectedTheme);
    });
  }
}
