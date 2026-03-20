const API_URL = 'http://localhost:3000/api/postits';

async function submitPostIt(text, color) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, color })
  });
  if (!response.ok) throw new Error('Submission failed');
  return response.json();
}
