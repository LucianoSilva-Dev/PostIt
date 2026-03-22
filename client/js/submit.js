document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('idea-form');
  const textInput = document.getElementById('idea-text');
  const colorInput = document.getElementById('idea-color');
  const textColorInput = document.getElementById('idea-text-color')
  const textureIdInput = document.getElementById('textureId')
  const textureColorInput = document.getElementById('texture-color')
  const charCount = document.getElementById('char-count');
  const toast = document.getElementById('toast');
  const postit = document.getElementById('postIt')

  postit.addEventListener('click', () => {
    textInput.focus()
  })

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

  textureIdInput.addEventListener('input', (e) => {
    document.querySelector('.post-it-texture').style.maskImage = `url(./img/textures/${e.target.value}.png)`
  })

  textureColorInput.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--texture-color', e.target.value)
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
      await submitPostIt(textInput.value, colorInput.value, textColorInput.value, textureIdInput.value, textureColorInput.value);
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
