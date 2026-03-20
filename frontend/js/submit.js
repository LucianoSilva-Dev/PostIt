document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('idea-form');
  const textInput = document.getElementById('idea-text');
  const colorInput = document.getElementById('idea-color');
  const textColorInput = document.getElementById('idea-text-color')
  const charCount = document.querySelector('.char-count');
  const toast = document.getElementById('toast');

  textInput.addEventListener('input', () => {
    charCount.textContent = `${textInput.value.length} / 110`;
    textInput.style.height = 'auto'
    textInput.style.height = `${textInput.scrollHeight}px`
  });

  colorInput.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--accent', e.target.value)
  })

  textColorInput.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--post-color', e.target.value)
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const originalText = btn.textContent;
    btn.textContent = 'MANIFESTING...';
    btn.disabled = true;

    try {
      await submitPostIt(textInput.value, colorInput.value, textColorInput.value);
      textInput.value = '';
      charCount.textContent = '0 / 110';

      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    } catch (err) {
      alert('Failed to send. The universe is blocked.');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

  // Enable 'Enter' to submit
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });
});
