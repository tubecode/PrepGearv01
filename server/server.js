const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/questions', async (req, res) => {
  const { technologies, questionType, experience, count } = req.body;

  const messages = [
    {
      role: "system",
      content: `You are a helpful interviewer who ONLY outputs JSON arrays of interview questions and answers without any extra commentary.`,
    },
    {
      role: "user",
      content: `Generate exactly ${count} interview questions with answers for a candidate with ${experience} experience in ${technologies.join(", ")}. These are ${questionType} type questions.

Output ONLY valid JSON like this:

[
  {
    "question": "Question text here",
    "answer": "Answer text here"
  }
]

No extra explanation or text. Just valid JSON.`,
    },
  ];

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;

    let questionsArray;
    try {
      questionsArray = JSON.parse(content);
    } catch (e) {
      console.warn("Failed to parse JSON, falling back to rough parsing...");
      const regex = /(?:Q\d+:)?\s*(?:Question\s*\d+:)?\s*(.*?)\*\*?\s*Answer:\s*(.*?)(?=Q\d+:|$)/gs;
      const matches = [...content.matchAll(regex)];
      questionsArray = matches.map(m => ({
        question: m[1].trim(),
        answer: m[2].trim(),
      }));
    }

    res.json({ questions: questionsArray });
  } catch (error) {
    console.error('Error fetching from Groq:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

function showProgressBar() {
  const bar = document.getElementById('progress-bar');
  const inner = document.getElementById('progress-bar-inner');
  bar.style.display = 'block';
  inner.style.width = '0%';
  let progress = 0;
  window.progressInterval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 20, 90);
    inner.style.width = progress + '%';
  }, 400);
}

function hideProgressBar() {
  const bar = document.getElementById('progress-bar');
  const inner = document.getElementById('progress-bar-inner');
  inner.style.width = '100%';
  setTimeout(() => {
    bar.style.display = 'none';
    inner.style.width = '0%';
    clearInterval(window.progressInterval);
  }, 500);
}

async function generateQuestions() {
  showProgressBar();
  // ...existing code...
  try {
    // fetch and process
  } finally {
    hideProgressBar();
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
