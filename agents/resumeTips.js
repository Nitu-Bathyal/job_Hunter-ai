import dotenv from 'dotenv';
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
export async function getResumeTips(resumeText, topJobs) {
  const jobTitles = topJobs.map(j => j.title).join(', ');
  const missingSkills = [...new Set(topJobs.flatMap(j => j.missingSkills || []))];

  const prompt = `Based on this resume and the jobs the person is applying to, give 5 short actionable tips to improve their resume.

RESUME: ${resumeText}
APPLYING FOR: ${jobTitles}
COMMONLY MISSING SKILLS: ${missingSkills.join(', ')}

Respond ONLY with valid JSON, no markdown:
{
  "tips": [
    "Add Docker to your skills section",
    "Quantify your achievements with numbers"
  ]
}`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);

  } catch (err) {
    console.error('Gemini tips error:', err.message);
    return { tips: [] };
  }
}
