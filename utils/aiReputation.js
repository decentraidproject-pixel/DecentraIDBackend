const axios = require("axios");


const sleep = (ms) => new Promise((res) => setTimeout(res, ms));


const scoreCache = new Map();

async function getAIReputationScore(post, retryCount = 0) {
  const cacheKey = `${post.title}-${post.description}`;

  
  if (scoreCache.has(cacheKey)) {
    return scoreCache.get(cacheKey);
  }

  try {
    const prompt = `
Evaluate the quality and authenticity of this contribution:

Title: ${post.title}
Description: ${post.description}
Category: ${post.category}
Tags: ${post.tags}

Rules:
- Genuine, useful work → 10 to 20
- Average → 5 to 10
- Low effort → 0 to 5
- Fake/spam → -5 to -20

Return ONLY a number.
`;

   
    await sleep(1000);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const raw = response.data.choices[0].message.content;

    const score = parseInt(raw.replace(/[^\d\-]/g, "")) || 0;

    
    scoreCache.set(cacheKey, score);

    return score;
  } catch (err) {
    console.error("AI ERROR:", err.response?.status || err.message);


  console.error("FULL AI ERROR DEBUG:");

  console.error("Status:", err.response?.status);
  console.error("Data:", err.response?.data);
  console.error("Message:", err.message);

  

    
    if (err.response?.status === 429 && retryCount < 3) {
      console.log("Rate limited. Retrying...");

      await sleep(2000 * (retryCount + 1)); // exponential backoff
      return getAIReputationScore(post, retryCount + 1);
    }

    return 0;
  }
}

module.exports = getAIReputationScore;