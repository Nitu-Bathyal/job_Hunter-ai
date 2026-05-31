import express from 'express';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { fetchJobs } from './agents/scraper.js';
import { scoreJob } from './agents/matcher.js';
import { writeCoverLetter } from './agents/writer.js';
import { getResumeTips } from './agents/resumeTips.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Make sure data folder exists
await fs.mkdir('./data', { recursive: true });

// ── Main search route ──────────────────────────────
app.post('/api/search', async (req, res) => {
  const { jobTitle, location, resume } = req.body;

  if (!jobTitle || !resume) {
    return res.status(400).json({ error: 'jobTitle and resume are required' });
  }

  try {
    console.log(`\n🔍 Searching: ${jobTitle} in ${location || 'remote'}`);

    // 1. Fetch jobs via Wire/Anakin
    const rawJobs = await fetchJobs(jobTitle, location || 'remote');
    console.log(`✅ Got ${rawJobs.length} jobs from Wire`);

    if (rawJobs.length === 0) {
      return res.json({ success: true, jobs: [] });
    }

    // 2. Score top 10 jobs with Gemini
    const top10 = rawJobs.slice(0, 10);
    console.log(`🤖 Scoring ${top10.length} jobs with Gemini...`);

    const scoredJobs = await Promise.all(
      top10.map(async (job) => {
        const match = await scoreJob(job, resume);
        return { ...job, ...match };
      })
    );

    // 3. Sort best first
    const sorted = scoredJobs.sort((a, b) => b.score - a.score);

    // 4. Save to disk
    await fs.writeFile('./data/jobs.json', JSON.stringify(sorted, null, 2));
    console.log(`💾 Saved ${sorted.length} scored jobs`);

    res.json({ success: true, jobs: sorted });

  } catch (err) {
    console.error('Search failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Cover letter route ─────────────────────────────
app.post('/api/cover-letter', async (req, res) => {
  const { job, resume } = req.body;

  if (!job || !resume) {
    return res.status(400).json({ error: 'job and resume are required' });
  }

  try {
    console.log(`✍️  Writing cover letter for: ${job.title} at ${job.company}`);
    const letter = await writeCoverLetter(job, resume);
    res.json({ letter });
  } catch (err) {
    console.error('Cover letter failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Resume tips route ──────────────────────────────
app.post('/api/resume-tips', async (req, res) => {
  const { resume, jobs } = req.body;

  if (!resume) {
    return res.status(400).json({ error: 'resume is required' });
  }

  try {
    console.log(`💡 Generating resume tips...`);
    const tips = await getResumeTips(resume, jobs || []);
    res.json(tips);
  } catch (err) {
    console.error('Resume tips failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Load saved jobs ────────────────────────────────
app.get('/api/jobs', async (req, res) => {
  try {
    const data = await fs.readFile('./data/jobs.json', 'utf-8');
    res.json(JSON.parse(data));
  } catch {
    res.json([]);
  }
});

// ── Start server ───────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 JobHunter running at http://localhost:${PORT}\n`);
});