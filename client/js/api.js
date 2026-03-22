let API_URL = '/api/postits';
const devPort = 'http://localhost:3000';
const devMode = true

if (devMode) {
  API_URL = devPort + API_URL
}

async function submitPostIt(text, color, textcolor, textureId, textureColor) {
  console.log(JSON.stringify({ text, color, textcolor, textureId, textureColor }))
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, color, textcolor, textureId, textureColor })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Submission failed');
  }
  return response.json();
}
