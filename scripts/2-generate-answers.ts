/**
 * Script 2: Generate AI Answers
 *
 * This script generates AI answers for all questions using:
 * - Vercel AI SDK
 * - OpenRouter API (with your $5 credits)
 * - Google Gemini Flash (cheapest, ~$0.05 for all questions)
 *
 * Features:
 * - Progress saving (resume on failures)
 * - Cost tracking
 * - Rate limiting
 * - Smart prompts based on question type
 * - Error recovery with retries
 *
 * Run: npm run generate-answers
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env" });

interface Company {
  id: number;
  name: string;
  logo: string;
  alias?: string;
}

interface Question {
  id: number;
  title: string;
  permalink: string;
  tags: string;
  likes: number;
  companies: Company[];
  createdAt: number;
  difficulty: "Easy" | "Medium" | "Hard";
  answer: string | null;
  notes: string | null;
  completed: boolean;
  lastUpdated: number | null;
}

interface QuestionWithAnswer extends Question {
  answer: string;
  aiGeneratedAt: number;
  aiModel: string;
}

interface Progress {
  results: QuestionWithAnswer[];
  lastProcessedIndex: number;
  totalCost: number;
  timestamp: number;
}

// Configuration
const CONFIG = {
  // Model selection (OpenRouter)
  model: "google/gemini-2.5-flash",

  maxTokens: 10000, // Increased for detailed answers with code snippets
  temperature: 0.7,
  maxRetries: 3,
  retryDelay: 3000, // 5 seconds

  // Rate limiting (OpenRouter: 60 requests/minute for most models)
  requestsPerMinute: 50, // Stay under limit
  delayBetweenRequests: 1200, // 1.2 seconds = 50 req/min

  // Cost tracking (approximate)
  costPer1MTokens: {
    input: 0.3, // Gemini Flash pricing
    output: 2.5,
  },

  maxBudget: 3.0, // $3

  testMode: null, // Change to a small number(like 2) for testing
};

/**
 * Get system prompt based on question tags
 */
function getSystemPrompt(tags: string): string {
  const tagsLower = tags.toLowerCase();

  if (tagsLower.includes("behavioral")) {
    return `You are an expert career coach. Provide structured behavioral interview answers using STAR framework (Situation, Task, Action, Result).

**Format:** Markdown with clear headings. Keep it practical and focused.
**Include:** Multiple scenarios when necessary.
`;
  }

  if (tagsLower.includes("system") || tagsLower.includes("architecture")) {
    return `You are a senior software architect. Provide practical system design answers.

**Format:** Markdown with headings (##, ###)
**Include:** Architecture patterns, trade-offs, scalability considerations, code examples when relevant
**Code Language:** TypeScript or JavaScript preferred
**Keep it:** Focused and practical - avoid excessive ASCII diagrams. Use simple diagrams only when they add real value.`;
  }

  if (tagsLower.includes("algorithm") || tagsLower.includes("coding")) {
    return `You are a coding interview expert. Provide clear, practical algorithm explanations.

**Include:**
- Approach and intuition
- Time/space complexity
- Clean code implementation in TypeScript or JavaScript
- Key edge cases

**Format:** Markdown with code blocks. Keep it concise and interview-focused.`;
  }

  // Default: Technical knowledge questions
  return `You are an expert frontend engineer. Provide clear, practical answers for technical interviews.

**Structure:**
## Quick Summary (2-3 sentences)
## How It Works (with practical examples)
## Code Example (TypeScript/JavaScript preferred)
## Key Takeaways (bullet points)

**Rules:**
- Format in Markdown with headings
- Code in proper code blocks (\`\`\`typescript or \`\`\`javascript)
- Be thorough but concise - focus on what matters for interviews
- Skip ASCII art unless absolutely necessary
- Prefer code examples over diagrams`;
}

/**
 * Get user prompt for the question
 */
function getUserPrompt(question: Question): string {
  let prompt = `Interview Question: ${question.title}\n`;
  prompt += `Category: ${question.tags}\n`;
  prompt += `Difficulty: ${question.difficulty}\n`;

  if (question.companies.length > 0) {
    const companyNames = question.companies.map((c) => c.name).join(", ");
    prompt += `Asked by: ${companyNames}\n`;
  }

  prompt += `\nProvide a clear, practical interview answer in Markdown format.`;
  prompt += `\nUse TypeScript or JavaScript for code examples.`;
  prompt += `\nKeep it focused and concise - quality over quantity.`;

  return prompt;
}

/**
 * Call OpenRouter API using fetch (Vercel AI SDK compatible)
 */
async function generateAnswer(question: Question): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not found in .env file!");
  }

  const systemPrompt = getSystemPrompt(question.tags);
  const userPrompt = getUserPrompt(question);

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://github.com/yourusername/sfe", // Optional: your app URL
        "X-Title": "Interview Prep App", // Optional: your app name
      },
      body: JSON.stringify({
        model: CONFIG.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: CONFIG.temperature,
        max_tokens: CONFIG.maxTokens,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Track usage (if provided)
  if (data.usage) {
    const inputCost =
      (data.usage.prompt_tokens / 1_000_000) * CONFIG.costPer1MTokens.input;
    const outputCost =
      (data.usage.completion_tokens / 1_000_000) *
      CONFIG.costPer1MTokens.output;
    const totalCost = inputCost + outputCost;

    console.log(
      `   Tokens: ${data.usage.prompt_tokens} → ${
        data.usage.completion_tokens
      } | Cost: $${totalCost.toFixed(4)}`,
    );
  }

  return data.choices[0].message.content;
}

/**
 * Generate answer with retry logic
 */
async function generateWithRetry(
  question: Question,
  attempt = 1,
): Promise<string> {
  try {
    return await generateAnswer(question);
  } catch (error) {
    if (attempt >= CONFIG.maxRetries) {
      throw error;
    }

    const delay = CONFIG.retryDelay * attempt; // Exponential backoff
    console.log(
      `   ⚠️  Retry ${attempt}/${CONFIG.maxRetries} after ${delay}ms...`,
    );
    await sleep(delay);

    return generateWithRetry(question, attempt + 1);
  }
}

/**
 * Load progress from file
 */
function loadProgress(): Progress {
  const progressPath = path.join(process.cwd(), "src", "data", "progress.json");

  try {
    if (fs.existsSync(progressPath)) {
      const data = fs.readFileSync(progressPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.log("⚠️  Could not load progress, starting fresh", error);
  }

  return {
    results: [],
    lastProcessedIndex: -1,
    totalCost: 0,
    timestamp: Date.now(),
  };
}

/**
 * Save progress to file
 */
function saveProgress(progress: Progress) {
  const progressPath = path.join(process.cwd(), "src", "data", "progress.json");
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

/**
 * Save final results
 */
function saveFinalResults(results: QuestionWithAnswer[]) {
  const outputPath = path.join(
    process.cwd(),
    "src",
    "data",
    "fe-questions-with-answers.json",
  );
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(
    `\n💾 Saved ${results.length} questions with answers to src/data/fe-questions-with-answers.json`,
  );
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate answer quality
 */
function validateAnswer(answer: string): boolean {
  // Minimum length check
  if (answer.length < 50) {
    console.log("   ⚠️  Answer too short, may need regeneration");
    return false;
  }

  // Check for common API errors
  if (answer.includes("I cannot") || answer.includes("I apologize")) {
    console.log("   ⚠️  Answer contains refusal, may need regeneration");
    return false;
  }

  return true;
}

/**
 * Main function to generate all answers
 */
async function generateAllAnswers() {
  console.log("🚀 Starting AI answer generation...\n");

  try {
    // 1. Load questions
    const questionsPath = path.join(
      process.cwd(),
      "src",
      "data",
      "fe-questions.json",
    );
    console.log("📖 Loading questions from src/data/fe-questions.json...");

    if (!fs.existsSync(questionsPath)) {
      throw new Error(
        'fe-questions.json not found! Run "npm run prepare-questions" first.',
      );
    }

    let questions: Question[] = JSON.parse(
      fs.readFileSync(questionsPath, "utf-8"),
    );

    // Apply test mode limit if configured
    if (CONFIG.testMode && CONFIG.testMode > 0) {
      console.log(`🧪 TEST MODE: Limiting to ${CONFIG.testMode} questions\n`);
      questions = questions.slice(0, CONFIG.testMode);
    }

    console.log(`✓ Loaded ${questions.length} questions\n`);

    // 2. Load progress
    const progress = loadProgress();
    const startIndex = progress.lastProcessedIndex + 1;

    if (startIndex > 0) {
      console.log(
        `📝 Resuming from question ${startIndex + 1}/${questions.length}`,
      );
      console.log(`   Already processed: ${progress.results.length} questions`);
      console.log(`   Total cost so far: $${progress.totalCost.toFixed(4)}\n`);
    }

    // 3. Generate answers
    console.log(`🤖 Using model: ${CONFIG.model}`);
    console.log(`💰 Budget limit: $${CONFIG.maxBudget}`);
    console.log(
      `⏱️  Rate limit: ${CONFIG.requestsPerMinute} requests/minute\n`,
    );

    let successCount = progress.results.length;
    let failCount = 0;
    const totalCost = progress.totalCost;

    for (let i = startIndex; i < questions.length; i++) {
      const question = questions[i];
      const progressText = `[${i + 1}/${questions.length}]`;

      try {
        console.log(`${progressText} ${question.title}`);
        console.log(
          `   Tags: ${question.tags} | Difficulty: ${question.difficulty}`,
        );

        // Generate answer
        const answer = await generateWithRetry(question);

        // Validate
        if (!validateAnswer(answer)) {
          console.log(`   ⚠️  Answer validation failed, but continuing...`);
        }

        // Add to results
        const questionWithAnswer: QuestionWithAnswer = {
          ...question,
          answer,
          aiGeneratedAt: Date.now(),
          aiModel: CONFIG.model,
          completed: true,
          lastUpdated: Date.now(),
        };

        progress.results.push(questionWithAnswer);
        progress.lastProcessedIndex = i;
        successCount++;

        console.log(`${progressText} ✅ Success\n`);

        // Save progress after each question
        saveProgress(progress);

        // Check budget
        if (totalCost >= CONFIG.maxBudget) {
          console.log(`\n⚠️  Budget limit reached! ($${CONFIG.maxBudget})`);
          console.log(`Stopping after ${successCount} questions.`);
          break;
        }

        // Rate limiting
        if (i < questions.length - 1) {
          await sleep(CONFIG.delayBetweenRequests);
        }
      } catch (error) {
        failCount++;
        console.error(`${progressText} ❌ Failed: ${error}\n`);

        // Save progress even on failure
        saveProgress(progress);

        // Continue with next question (don't stop entire process)
        continue;
      }
    }

    // 4. Save final results
    saveFinalResults(progress.results);

    // 5. Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 GENERATION COMPLETE");
    console.log("=".repeat(60));
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📝 Total: ${questions.length}`);
    console.log(`💰 Estimated cost: $${totalCost.toFixed(4)}`);
    console.log(`⏱️  Model used: ${CONFIG.model}`);

    if (failCount > 0) {
      console.log(
        `\n⚠️  ${failCount} questions failed. Check logs above for details.`,
      );
      console.log(`You can re-run this script to retry failed questions.`);
    }

    // Clean up progress file
    const progressPath = path.join(process.cwd(), "data", "progress.json");
    if (fs.existsSync(progressPath)) {
      fs.unlinkSync(progressPath);
      console.log(`\n🧹 Cleaned up progress file`);
    }

    console.log(
      "\n✅ All done! Your questions are ready in src/data/fe-questions-with-answers.json",
    );
    console.log("📝 Next: Import this JSON into your Next.js app");
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
generateAllAnswers();
