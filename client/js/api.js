const API_URL = '/api/postits';

async function submitPostIt(text, color, textcolor) {
  console.log(JSON.stringify({ text, color, textcolor }))
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, color, textcolor })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Submission failed');
  }
  return response.json();
}
