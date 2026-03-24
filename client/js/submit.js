/* Pages
0 - Home
1 - Content + Personalization
2 - Confirmation
3 - Error
4 - Posted
5 - No code page
*/

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const textInput = document.getElementById('idea-text');
  const colorInput = document.getElementById('idea-color');
  const textColorInput = document.getElementById('idea-text-color')
  const textureIdDiv = document.getElementById('textureId')
  let textureId = 0
  const forceCode = true
  const textureColorInput = document.getElementById('texture-color')
  const charCount = document.getElementById('char-count');
  const postit = document.getElementById('postIt')

  let actualPage = 0

  const roomCode = params.get('code')

  if (roomCode) {
    Array.from(document.querySelectorAll('.roomCode')).forEach((c) => {
      c.innerText = roomCode
    })
  } else if (forceCode) {
    let pages = Array.from(document.getElementsByTagName('section'))
    actualPage = 5
    pages.forEach(p => {
      p.style.opacity = '0'
      setTimeout(() => {
        p.removeAttribute('style')
        pages[actualPage].style.display = 'flex'
      }, 150);
    })
  }

  Array.from(document.querySelectorAll('button[type="primary"]')).forEach((b) => {
    let att = b.getAttribute('action')
    if (att == 'next') {
      b.addEventListener('click', () => {
        let exception = b.getAttribute('exception')

        if (!exception) {
          let pages = Array.from(document.getElementsByTagName('section'))
          actualPage++
          pages.forEach(p => {
            p.style.opacity = '0'
            setTimeout(() => {
              p.removeAttribute('style')
              pages[actualPage].style.display = 'flex'
            }, 150);
          })
        } else if (exception == 'haveText') {
          if (textInput.value.trim() != '') {
            let pages = Array.from(document.getElementsByTagName('section'))
            actualPage++
            pages.forEach(p => {
              p.style.opacity = '0'
              setTimeout(() => {
                p.removeAttribute('style')
                pages[actualPage].style.display = 'flex'
              }, 150);
            })
          } else {
            alert('Insira um texto no Post-It!')
          }
        }
      })
    }

    if (att == 'post') {
      b.addEventListener('click', async () => {
        try {
          await submitPostIt(textInput.value, colorInput.value, textColorInput.value, textureId.toString(), textureColorInput.value, roomCode);

          actualPage = 4
          let pages = Array.from(document.getElementsByTagName('section'))
          pages.forEach(p => {
            p.style.opacity = '0'
            setTimeout(() => {
              p.removeAttribute('style')
              pages[actualPage].style.display = 'flex'
            }, 150);
          })
        } catch (err) {
          actualPage = 3
          let pages = Array.from(document.getElementsByTagName('section'))
          pages.forEach(p => {
            p.style.opacity = '0'
            setTimeout(() => {
              p.removeAttribute('style')
              pages[actualPage].style.display = 'flex'
            }, 150);
          })
        }
      })
    }

    if (att == 'home') {
      b.addEventListener('click', () => {
        location.reload()
      })
    }

    if (att == 'useCode') {
      b.addEventListener('click', () => {
        const url = new URL(window.location.href);
        let link = `${url.origin}${url.pathname}`
        let code = document.getElementById('roomCode').value
        function onlyNum(num) {
          return /^[0-9]+$/.test(num)
        }
        if (code.length >= 7 && onlyNum(code)) {
          link = `${url.origin}${url.pathname}?code=${code}`
          location.href = link
        } else {
          alert('Insira um código, ele deve ter 7 números')
        }
      })
    }
  })

  Array.from(document.querySelectorAll('button[type="secondary"]')).forEach((b) => {
    let att = b.getAttribute('action')
    if (att == 'back') {
      b.addEventListener('click', () => {
        let pages = Array.from(document.getElementsByTagName('section'))
        actualPage--
        pages.forEach(p => {
          p.style.opacity = '0'
          setTimeout(() => {
            p.removeAttribute('style')
            pages[actualPage].style.display = 'flex'
          }, 150);
        })
      })
    } else if (att == 'reload') {
      b.addEventListener('click', () => {
        location.reload()
      })
    }
  })

  document.querySelector('button[type="fakeLink"]').addEventListener('click', () => {
    const url = new URL(window.location.href);
    let link = `${url.origin}${url.pathname}`
    location.href = link
  })

  textInput.addEventListener('input', () => {
    charCount.textContent = `${textInput.value.length} / 110`;
    textInput.style.height = 'auto'
    textInput.style.height = `${textInput.scrollHeight}px`
    document.getElementById('confirmText').innerText = textInput.value
  });

  colorInput.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--post-back-color', e.target.value)
  })

  textColorInput.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--post-color', e.target.value)
  })

  textureIdDiv.addEventListener('change', (e) => {
    textureId = e.target.value
    let labels = Array.from(textureIdDiv.querySelectorAll('label'))
    labels.forEach(l => {
      l.removeAttribute('class')
    })

    let correctLabel = textureIdDiv.querySelector(`label[for=${e.target.id}]`)

    if (correctLabel) {
      correctLabel.className = 'selectedLabel'
      document.querySelector('.post-it-texture').style.maskImage = `url(./img/textures/${textureId}.png)`
    }
  })

  postit.addEventListener('click', () => {
    textInput.focus()
  })

  textureColorInput.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--texture-color', e.target.value)
  })
});
