export async function scoreJob(job, resume) {

  const resumeText = resume.toLowerCase();

  const skills = [
    "html",
    "css",
    "javascript",
    "react",
    "node",
    "express",
    "mongodb",
    "sql",
    "python",
    "java",
    "cpp",
    "dsa",
    "power bi",
    "excel"
  ];

  const matchedSkills = skills.filter(skill =>
    resumeText.includes(skill)
  );

  const missingSkills = skills.filter(skill =>
    !resumeText.includes(skill)
  );

  let score = Math.min(
    100,
    Math.round((matchedSkills.length / skills.length) * 100)
  );

  let verdict = "Needs Improvement";

  if (score >= 80) verdict = "Excellent Match";
  else if (score >= 60) verdict = "Good Match";
  else if (score >= 40) verdict = "Average Match";

  return {
    score,
    verdict,
    matchedSkills,
    missingSkills
  };
}
