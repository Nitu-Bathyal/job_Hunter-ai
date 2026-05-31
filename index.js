import express from 'express';
import fs from 'fs/promises';
import { createRequire } from 'module';
import { fetchJobs } from './agents/scraper.js';
import { scoreJob } from './agents/matcher.js';
import { writeCoverLetter } from './agents/writer.js';
import { getResumeTips } from './agents/resumeTips.js';

const require = createRequire(import.meta.url);
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

await fs.mkdir('./data', { recursive: true });

app.post('/api/search', async (req, res) => {
  const { jobTitle, location, resume } = req.body;
  if (!jobTitle || !resume) {
    return res.status(400).json({ error: 'jobTitle and resume are required' });
  }
  try {
    console.log(`Searching: ${jobTitle} in ${location || 'remote'}`);
    const rawJobs = await fetchJobs(jobTitle, location || 'remote');
    console.log(`Got ${rawJobs.length} jobs`);
    if (rawJobs.length === 0) return res.json({ success: true, jobs: [] });
    const top10 = rawJobs.slice(0, 10);
    const scoredJobs = await Promise.all(
      top10.map(async (job) => {
        const match = await scoreJob(job, resume);
        return { ...job, ...match };
      })
    );
    const sorted = scoredJobs.sort((a, b) => b.score - a.score);
    await fs.writeFile('./data/jobs.json', JSON.stringify(sorted, null, 2));
    res.json({ success: true, jobs: sorted });
  } catch (err) {
    console.error('Search failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cover-letter', async (req, res) => {
  const { job, resume } = req.body;
  if (!job || !resume) return res.status(400).json({ error: 'job and resume are required' });
  try {
    const letter = await writeCoverLetter(job, resume);
    res.json({ letter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resume-tips', async (req, res) => {
  const { resume, jobs } = req.body;
  if (!resume) return res.status(400).json({ error: 'resume is required' });
  try {
    const tips = await getResumeTips(resume, jobs || []);
    res.json(tips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const data = await fs.readFile('./data/jobs.json', 'utf-8');
    res.json(JSON.parse(data));
  } catch {
    res.json([]);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`JobHunter running at http://localhost:${PORT}`);
});
