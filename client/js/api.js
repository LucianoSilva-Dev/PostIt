let API_URL = '/api/postits';
let API_URL_STREAM = '/api/postits/stream';
let API_URL_GET = '/api/postits';
const devPort = 'http://localhost:3000';
const devMode = false

if (devMode) {
  API_URL = devPort + API_URL
  API_URL_GET = devPort + API_URL_GET
  API_URL_STREAM = devPort + API_URL_STREAM
}

async function submitPostIt(text, color, textcolor, textureId, textureColor, roomCode) {
  console.log(JSON.stringify({ text, color, textcolor, textureId, textureColor, roomCode }))
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, color, textcolor, textureId, textureColor, roomCode })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Submission failed');
  }
  return response.json();
}
