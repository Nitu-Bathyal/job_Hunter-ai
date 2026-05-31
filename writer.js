import dotenv from 'dotenv';
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
export async function writeCoverLetter(job, resumeText) {
  const prompt = `Write a compelling, personalized cover letter for this job.

RESUME: ${resumeText}
JOB TITLE: ${job.title}
COMPANY: ${job.company}
DESCRIPTION: ${job.description}

Rules:
- 3 short paragraphs only
- Sound human, not robotic
- Reference specific things from the job
- End with a clear call to action
- Do not include subject line or date`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();
    return data.candidates[0].content.parts[0].text;

  } catch (err) {
    console.error('Gemini writer error:', err.message);
    return 'Could not generate cover letter. Please try again.';
  }
}