/**
 * Script 1: Prepare Questions
 *
 * This script reads questions.txt and prepares clean JSON data:
 * - Extracts questions from Next.js pageProps structure
 * - Adds missing fields (difficulty, answer, notes, completed)
 * - Saves to data/fe-questions.json
 *
 * Run: npm run prepare-questions
 */

import fs from "fs";
import path from "path";

interface Company {
  id: number;
  name: string;
  logo: string;
  alias?: string;
}

interface RawQuestion {
  id: number;
  title: string;
  permalink: string;
  tags: string;
  likes: number;
  companies: Company[];
  createdAt: number;
  tried?: number;
  accepted?: number;
  isNew?: boolean;
}

interface PreparedQuestion extends RawQuestion {
  difficulty: "Easy" | "Medium" | "Hard";
  answer: string | null;
  notes: string | null;
  completed: boolean;
  lastUpdated: number | null;
}

/**
 * Infer difficulty based on tags and question content
 */
function inferDifficulty(
  tags: string,
  title: string
): "Easy" | "Medium" | "Hard" {
  const tagsLower = tags.toLowerCase();
  const titleLower = title.toLowerCase();

  // Easy: Behavioral, General knowledge, Basic concepts
  if (
    tagsLower.includes("behavioral") ||
    tagsLower.includes("general") ||
    titleLower.includes("what is") ||
    titleLower.includes("explain") ||
    titleLower.includes("difference between")
  ) {
    return "Easy";
  }

  // Hard: System Design, Architecture, Advanced patterns, Algorithms
  if (
    tagsLower.includes("system") ||
    tagsLower.includes("architecture") ||
    tagsLower.includes("design") ||
    tagsLower.includes("algorithm") ||
    tagsLower.includes("performance") ||
    titleLower.includes("implement") ||
    titleLower.includes("build") ||
    titleLower.includes("design")
  ) {
    return "Hard";
  }

  // Default: Medium
  return "Medium";
}

/**
 * Main function to prepare questions
 */
async function prepareQuestions() {
  console.log("🚀 Starting question preparation...\n");

  try {
    // 1. Read questions.txt
    const questionsPath = path.join(process.cwd(), "questions.txt");
    console.log("📖 Reading questions.txt...");

    if (!fs.existsSync(questionsPath)) {
      throw new Error(
        "questions.txt not found! Make sure it exists in the root directory."
      );
    }

    const rawData = fs.readFileSync(questionsPath, "utf-8");
    const data = JSON.parse(rawData);

    // 2. Extract questions array from Next.js structure
    console.log("🔍 Extracting questions from Next.js structure...");
    const rawQuestions: RawQuestion[] = data.props?.pageProps?.items || [];

    if (rawQuestions.length === 0) {
      throw new Error(
        "No questions found in questions.txt! Check the file structure."
      );
    }

    console.log(`✓ Found ${rawQuestions.length} questions\n`);

    // 3. Prepare questions with additional fields
    console.log("⚙️  Preparing questions...");
    const preparedQuestions: PreparedQuestion[] = rawQuestions.map(
      (q, index) => {
        const difficulty = inferDifficulty(q.tags, q.title);

        if ((index + 1) % 50 === 0) {
          console.log(
            `   Processed ${index + 1}/${rawQuestions.length} questions...`
          );
        }

        return {
          id: q.id,
          title: q.title,
          permalink: q.permalink,
          tags: q.tags,
          likes: q.likes,
          companies: q.companies || [],
          createdAt: q.createdAt,
          difficulty,
          answer: null,
          notes: null,
          completed: false,
          lastUpdated: null,
        };
      }
    );

    console.log(`✓ Prepared ${preparedQuestions.length} questions\n`);

    // 4. Save to data/fe-questions.json
    const outputPath = path.join(process.cwd(), "data", "fe-questions.json");
    console.log("💾 Saving to data/fe-questions.json...");

    fs.writeFileSync(outputPath, JSON.stringify(preparedQuestions, null, 2));

    // 5. Print statistics
    const stats = {
      total: preparedQuestions.length,
      easy: preparedQuestions.filter((q) => q.difficulty === "Easy").length,
      medium: preparedQuestions.filter((q) => q.difficulty === "Medium").length,
      hard: preparedQuestions.filter((q) => q.difficulty === "Hard").length,
      withCompanies: preparedQuestions.filter((q) => q.companies.length > 0)
        .length,
    };

    console.log("\n📊 Statistics:");
    console.log(`   Total Questions: ${stats.total}`);
    console.log(
      `   Easy: ${stats.easy} (${Math.round(
        (stats.easy / stats.total) * 100
      )}%)`
    );
    console.log(
      `   Medium: ${stats.medium} (${Math.round(
        (stats.medium / stats.total) * 100
      )}%)`
    );
    console.log(
      `   Hard: ${stats.hard} (${Math.round(
        (stats.hard / stats.total) * 100
      )}%)`
    );
    console.log(`   With Companies: ${stats.withCompanies}`);

    console.log(
      "\n✅ Success! Questions prepared and saved to data/fe-questions.json"
    );
    console.log(
      '\n📝 Next step: Run "npm run generate-answers" to generate AI answers'
    );
  } catch (error) {
    console.error("\n❌ Error preparing questions:", error);
    process.exit(1);
  }
}

// Run the script
prepareQuestions();
