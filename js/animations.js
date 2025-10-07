export function runInitialAnimations() {
  const header = document.querySelector('.terminal-header');
  if (header) {
    header.style.opacity = '0';
    setTimeout(() => {
      header.style.transition = 'opacity 0.5s ease';
      header.style.opacity = '1';
    }, 100);
  }
  
  const boxes = document.querySelectorAll('.terminal-box');
  boxes.forEach((box, index) => {
    box.style.opacity = '0';
    setTimeout(() => {
      box.style.transition = 'all 0.5s ease';
      box.style.opacity = '1';
    }, 100 * (index + 1));
  });
}
