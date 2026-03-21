const API_URL = 'https://dreamviewer.up.railway.app:3000/api/postits';

async function submitPostIt(text, color, textcolor) {
  console.log(JSON.stringify({ text, color, textcolor }))
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, color, textcolor })
  });
  if (!response.ok) throw new Error('Submission failed');
  return response.json();
}
