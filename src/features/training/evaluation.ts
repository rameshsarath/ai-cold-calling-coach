export type EvaluationInput = {
  transcript: string;
  scenarioTitle: string;
  scenarioDescription: string;
  industry: string;
  prospectRole: string;
  prospectPersonality: string;
  painPoints: string;
  commonObjections: string;
  desiredOutcome: string;
  difficulty: string;
  callSummary: string;
};

export type EvaluationResult = {
  overall_score: number;
  confidence_score: number;
  objection_handling_score: number;
  active_listening_score: number;
  qualification_score: number;
  desired_outcome_achieved: boolean;
  overall_result: "passed" | "failed";
  strengths: string;
  weaknesses: string;
  coaching_feedback: string;
};

const DIFFICULTY_GUIDANCE = `
**Difficulty Guidance:**

Beginner:
- Basic rapport building
- Basic discovery questions
- Simple objection handling

Intermediate:
- Deeper qualification
- Better questioning
- Stronger objection handling

Advanced:
- Complex discovery
- Strong qualification
- Effective objection handling
- Clear next-step commitment
`;

function buildPrompt(input: EvaluationInput): string {
  return `You are a professional sales coach evaluating a cold-calling simulation.

Evaluate the employee's performance based on the transcript and scenario context.

**Scenario Context:**
- Title: ${input.scenarioTitle}
- Description: ${input.scenarioDescription}
- Industry: ${input.industry}
- Prospect Role: ${input.prospectRole}
- Prospect Personality: ${input.prospectPersonality}
- Pain Points: ${input.painPoints}
- Common Objections: ${input.commonObjections}
- Desired Outcome: ${input.desiredOutcome}
- Difficulty: ${input.difficulty}
- Call Summary: ${input.callSummary}

${DIFFICULTY_GUIDANCE}

**Transcript:**
${input.transcript}

Evaluate the employee against the scenario's desired outcome. Adjust expectations based on the difficulty level.

Return only valid JSON with this exact structure:
{
  "overall_score": 0,
  "confidence_score": 0,
  "objection_handling_score": 0,
  "active_listening_score": 0,
  "qualification_score": 0,
  "desired_outcome_achieved": false,
  "overall_result": "failed",
  "strengths": "concise strengths text",
  "weaknesses": "concise weaknesses text",
  "coaching_feedback": "actionable coaching feedback text"
}

Scores are 0-100. overall_result must be "passed" or "failed". Do not include any text outside the JSON object.`;
}

export async function evaluateTranscript(
  input: EvaluationInput
): Promise<EvaluationResult> {
  const response = await fetch("https://ollama.com/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL,
      messages: [{ role: "user", content: buildPrompt(input) }],
      stream: false,
      format: "json",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  const content = data.message?.content ?? data.response ?? "";

  const parsed: EvaluationResult = JSON.parse(content);

  return {
    overall_score: clampScore(parsed.overall_score),
    confidence_score: clampScore(parsed.confidence_score),
    objection_handling_score: clampScore(parsed.objection_handling_score),
    active_listening_score: clampScore(parsed.active_listening_score),
    qualification_score: clampScore(parsed.qualification_score),
    desired_outcome_achieved: Boolean(parsed.desired_outcome_achieved),
    overall_result: parsed.overall_result === "passed" ? "passed" : "failed",
    strengths: String(parsed.strengths ?? ""),
    weaknesses: String(parsed.weaknesses ?? ""),
    coaching_feedback: String(parsed.coaching_feedback ?? ""),
  };
}

function clampScore(n: unknown): number {
  const num = Number(n);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}
