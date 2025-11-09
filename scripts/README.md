# AI Answer Generation Scripts

This directory contains scripts to generate AI answers for all interview questions using OpenRouter API.

## Prerequisites

1. **OpenRouter API Key**: Get your key from [OpenRouter](https://openrouter.ai/keys)
2. **Credits**: You need at least $0.10 in credits (you have $5, plenty!)
3. **Node.js**: v18 or higher

## Setup (One-Time)

### 1. Install Dependencies

First, install the required packages:

```bash
# Install dependencies
pnpm install dotenv tsx

# Or if you prefer npm:
npm install dotenv tsx
```

### 2. Configure API Key

Edit the `.env` file in the root directory and add your OpenRouter API key:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

**Important**: Never commit this file to git! It's already in `.gitignore`.

## Usage

### Step 1: Prepare Questions

This extracts questions from `questions.txt` and creates clean JSON:

```bash
# Using npx (no npm script needed)
npx tsx scripts/1-prepare-questions.ts

# Or if you added npm scripts:
npm run prepare-questions
```

**Output**: `data/fe-questions.json` (174 questions with metadata)

**What it does**:

- Reads `questions.txt`
- Extracts questions from Next.js structure
- Adds difficulty levels (Easy/Medium/Hard)
- Adds empty fields for answers, notes, completion status
- Saves clean JSON

**Time**: ~1 second

---

### Step 2: Generate AI Answers

This generates answers for all questions using AI:

```bash
# Using npx
npx tsx scripts/2-generate-answers.ts

# Or with npm script:
npm run generate-answers
```

**Output**: `data/fe-questions-with-answers.json` (174 questions + AI answers)

**What it does**:

- Loads questions from `data/fe-questions.json`
- Calls OpenRouter API for each question
- Uses Google Gemini Flash (cheapest model)
- Saves progress after each question (resumable)
- Generates high-quality, interview-ready answers

**Time**: ~3-5 minutes for all 174 questions

**Cost**: ~$0.05 - $0.15 (well within your $5 budget)

---

## Model Configuration

The script uses **Google Gemini Flash** by default (cheapest option). You can change the model in `scripts/2-generate-answers.ts`:

```typescript
const CONFIG = {
  model: "google/gemini-flash-1.5-8b", // Current (cheapest)

  // Alternative models (uncomment to use):
  // model: 'openai/gpt-4o-mini',              // $0.15-0.60 total
  // model: 'anthropic/claude-3.5-haiku',      // ~$1 total
  // model: 'google/gemini-flash-1.5',         // ~$0.05 total
  // model: 'openai/gpt-4o',                   // ~$5 total (expensive!)
};
```

**Recommendation**: Stick with Gemini Flash for best cost/quality ratio.

---

## Features

### ✅ Progress Saving

If the script fails or you stop it, progress is saved to `data/progress.json`. Simply re-run the script to continue:

```bash
npx tsx scripts/2-generate-answers.ts
```

It will automatically resume from where it left off.

### ✅ Cost Tracking

The script tracks approximate costs in real-time:

```
[42/174] What is closure and how does it work?
   Tags: JavaScript | Difficulty: Hard
   Tokens: 156 → 423 | Cost: $0.0034
[42/174] ✅ Success
```

### ✅ Smart Prompts

Different question types get different prompts:

- **Behavioral**: STAR method, career advice
- **System Design**: Architecture, scalability, trade-offs
- **Algorithms**: Time/space complexity, code examples
- **Technical**: Concepts, examples, best practices

### ✅ Error Handling

- **Automatic retries**: 3 attempts with exponential backoff
- **Rate limiting**: Respects API limits (50 req/min)
- **Budget protection**: Stops if cost exceeds $5
- **Validation**: Checks answer quality

---

## Output Structure

After running both scripts, you'll have:

```
data/
├── fe-questions.json              # Clean questions (no answers)
├── fe-questions-with-answers.json # Questions + AI answers ⭐
└── progress.json                  # Temporary progress file (auto-deleted)
```

### Sample Output

```json
{
  "id": 176,
  "title": "173. Explain the cookie attribute: \"SameSite\".",
  "tags": "Network",
  "difficulty": "Medium",
  "companies": [
    {
      "id": 2,
      "name": "Google",
      "logo": "https://r2.bfe.dev/img/google.svg"
    }
  ],
  "answer": "The SameSite cookie attribute controls when cookies are sent with cross-site requests...",
  "notes": null,
  "completed": true,
  "lastUpdated": 1699456789000,
  "aiGeneratedAt": 1699456789000,
  "aiModel": "google/gemini-flash-1.5-8b"
}
```

---

## Troubleshooting

### Error: "OPENROUTER_API_KEY not found"

**Solution**: Add your API key to `.env`:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

### Error: "fe-questions.json not found"

**Solution**: Run step 1 first:

```bash
npx tsx scripts/1-prepare-questions.ts
```

### Error: "Rate limit exceeded"

**Solution**: The script already handles this. Wait a few minutes and re-run. Progress is saved!

### Error: "Budget limit reached"

**Solution**: Increase `maxBudget` in `scripts/2-generate-answers.ts`:

```typescript
const CONFIG = {
  maxBudget: 10.0, // Increase from 5.0 to 10.0
};
```

### Answers are too short/generic

**Solution**: Increase `maxTokens` in `scripts/2-generate-answers.ts`:

```typescript
const CONFIG = {
  maxTokens: 800, // Increase from 600 to 800
};
```

Note: This will increase costs slightly.

---

## Next Steps

After generating answers:

1. **Import into Next.js app**:

   ```typescript
   import questions from "@/data/fe-questions-with-answers.json";
   ```

2. **Build the UI** based on `sample-app.tsx`

3. **Deploy** to Vercel (free)

---

## Cost Breakdown

For 174 questions using Gemini Flash:

- **Input tokens**: ~8,700 (questions + context)
- **Output tokens**: ~52,000 (answers)
- **Total cost**: **~$0.05 - $0.15**

Your $5 budget can generate answers for **3,000-10,000 questions**! 🎉

---

## Advanced Usage

### Regenerate Specific Questions

Edit `scripts/2-generate-answers.ts` to filter questions:

```typescript
const questions = allQuestions.filter(
  (q) => q.tags.includes("JavaScript") && q.difficulty === "Hard"
);
```

### Use Different Models for Different Questions

```typescript
const model =
  question.difficulty === "Hard"
    ? "openai/gpt-4o-mini" // Better model for hard questions
    : "google/gemini-flash-1.5-8b"; // Cheaper for easy questions
```

### Batch Processing

Generate answers in batches of 50:

```typescript
const batch = questions.slice(0, 50);
// Process batch
```

---

## Support

If you encounter issues:

1. Check the console output for error messages
2. Verify your API key is correct
3. Check your OpenRouter credits: https://openrouter.ai/credits
4. Review the progress in `data/progress.json`

---

## Files

- `1-prepare-questions.ts` - Extracts and cleans questions
- `2-generate-answers.ts` - Generates AI answers using OpenRouter
- `README.md` - This file

Enjoy your AI-powered interview prep! 🚀
