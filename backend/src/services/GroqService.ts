import { groq } from '../config/groq';
import { config } from '../config';

export class GroqService {
  private static readonly CATEGORIES = [
    'Technology', 'Artificial Intelligence', 'Business', 'Entrepreneurship', 'Finance',
    'Economics', 'Investing', 'Startups', 'Leadership', 'Management', 'Psychology',
    'Mental Health', 'Philosophy', 'Ethics', 'Science', 'Space', 'Education', 'Healthcare',
    'Environment', 'Climate Change', 'History', 'Politics (neutral and discussion-oriented)',
    'Law', 'Cybersecurity', 'Productivity', 'Career Development', 'Communication',
    'Public Speaking', 'Innovation', 'Future of Work', 'Books', 'Sports', 'Culture',
    'Society', 'Lifestyle', 'Creativity'
  ];

  private static recentCategories: string[] = [];
  private static recentTopics: string[] = [];

  /**
   * Generates a single, professional, unique discussion topic
   */
  public static async generateTopic(excludeTopics: string[] = []): Promise<string> {
    const startTime = Date.now();

    // 1. Select category from variety
    let availableCategories = GroqService.CATEGORIES.filter(cat => !GroqService.recentCategories.includes(cat));
    if (availableCategories.length === 0) {
      availableCategories = GroqService.CATEGORIES;
    }
    const selectedCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];

    // Combine exclude lists
    const allExcluded = Array.from(new Set([...excludeTopics, ...GroqService.recentTopics]));

    const prompt = `Generate exactly ONE thought-provoking discussion topic from the category "${selectedCategory}".
Requirements:
- Domain/Category: ${selectedCategory}
- Short, engaging, and suitable for interviews, GDs, or extempore speaking.
- Answerable by college students and professionals.
- Avoid controversial or offensive wording.
- Keep the topic under 20 words.
- Do not use numbering, quotation marks, or category labels in the response.

You MUST return your response as a JSON object matching this schema:
{
  "topic": "string"
}

Do NOT repeat the category label in the topic.
${allExcluded.length > 0 ? `Do NOT generate any of the following topics: ${allExcluded.join(', ')}` : ''}

Example output:
{
  "topic": "Should AI replace teachers?"
}`;

    console.log('[GroqService] generateTopic - Incoming request. Exclude count:', excludeTopics.length);
    console.log('[GroqService] Selected Category:', selectedCategory);
    console.log('[GroqService] Using Groq');
    console.log(`[GroqService] Selected model: ${config.GROQ_MODEL}`);
    console.log(`[GroqService] Prompt (first 100 chars): ${prompt.substring(0, 100).replace(/\r?\n/g, ' ')}`);

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const response = await groq.chat.completions.create({
          model: config.GROQ_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that outputs only valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });

        console.log('[GroqService] generateTopic - Groq returned a successful response');
        const rawText = response.choices[0]?.message?.content || '';
        const parsed = JSON.parse(rawText.trim());

        const topicText = parsed.topic ? parsed.topic.trim() : '';
        if (!topicText) {
          throw new Error('Empty topic returned by Groq');
        }

        const cleanedTopic = topicText.replace(/^["']|["']$/g, '');

        // Add to history
        GroqService.recentCategories.push(selectedCategory);
        if (GroqService.recentCategories.length > 10) {
          GroqService.recentCategories.shift();
        }
        GroqService.recentTopics.push(cleanedTopic);
        if (GroqService.recentTopics.length > 10) {
          GroqService.recentTopics.shift();
        }

        const responseTime = Date.now() - startTime;
        console.log(`[GroqService] generateTopic - Success on attempt ${attempts} in ${responseTime}ms`);

        return cleanedTopic;
      } catch (error: any) {
        console.log(`[GroqService] generateTopic - Groq returned an error: ${error?.message || String(error)}`);
        console.warn(`[GroqService] Attempt ${attempts} failed for generateTopic:`, error?.message || String(error));
        console.error('[GroqService] Exception Stack Trace:', error?.stack || error);

        if (attempts >= maxAttempts) {
          console.warn('[GroqService] All attempts exhausted. Falling back to local topic due to rate limits or API issues.');
          const fallbackTopics = [
            "Will AI replace software engineers?",
            "Should young professionals invest before buying luxury items?",
            "Does overthinking reduce productivity?",
            "Is empathy more important than authority in a leader?",
            "Is happiness a choice or a consequence?",
            "Should preventive healthcare receive more attention than treatment?",
            "Can economic growth coexist with sustainability?",
            "Is customer experience more important than product quality?",
            "Should colleges focus more on practical skills than theory?",
            "Is changing jobs frequently beneficial for long-term growth?",
            "Should remote work be considered a fundamental employee right?",
            "Is space exploration worth the high financial cost?",
            "Can ethics keep pace with rapid scientific progress?",
            "Will cybersecurity become more critical than physical security?"
          ];
          const filtered = allExcluded.length > 0 
            ? fallbackTopics.filter(t => !allExcluded.includes(t)) 
            : fallbackTopics;
          const selected = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : fallbackTopics[0];

          const responseTime = Date.now() - startTime;
          console.log(`[GroqService] generateTopic (Fallback) - Response time: ${responseTime}ms`);
          return selected;
        }

        // Cooldown before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error('Failed to generate topic.');
  }

  /**
   * Analyzes a practice transcript/content and returns structured communication feedback
   */
  public static async analyzeResponse(
    mode: string,
    topic: string,
    content: string
  ): Promise<any> {
    const startTime = Date.now();
    const prompt = `You are an expert communication coach helping students prepare for placements, HR interviews, public speaking, and group discussions.

Analyze the user's practice session details:
- Practice Mode: ${mode}
- Practice Topic: ${topic}
- User Content/Transcript: "${content}"

Requirements:
1. First, check if the user response/transcript is too short (e.g., under 15-20 words, or lacks meaningful sentences to evaluate).
   If it is too short, set "isTooShort" to true, and provide a helpful, encouraging message in "shortMessage" suggesting they provide a more detailed and complete answer. In this case, set "summary" and "improvedVersion" to empty strings, and set "strengths", "improvements", "grammarCorrections", and "suggestions" to empty arrays.
2. If the user response is long enough to analyze, evaluate it professionally and set:
   - "isTooShort": false
   - "shortMessage": ""
   - "summary": A concise paragraph explaining the overall communication quality of the response.
   - "strengths": A list of exactly 3 to 5 clear strengths (e.g., clear introduction, logical flow, good vocabulary).
   - "improvements": A list of exactly 3 to 5 practical improvements (e.g., improve transitions, reduce repetitive wording, strengthen conclusion). Avoid generic advice.
   - "grammarCorrections": Important grammar corrections. For each correction, show the "original" incorrect sentence, the "corrected" sentence, and a brief "explanation".
   - "improvedVersion": A polished version of the user's response while preserving the original meaning. It must sound like an improved version of what the user actually wrote or spoke, not an unrealistic complete rewrite.
   - "suggestions": Exactly 5 actionable tips tailored specifically to that response.

You MUST return your response as a JSON object adhering strictly to this schema:
{
  "isTooShort": boolean,
  "shortMessage": "string",
  "summary": "string",
  "strengths": ["string"],
  "improvements": ["string"],
  "grammarCorrections": [
    {
      "original": "string",
      "corrected": "string",
      "explanation": "string"
    }
  ],
  "improvedVersion": "string",
  "suggestions": ["string"]
}

Make sure all fields are populated according to the rules above.`;

    console.log(`[GroqService] analyzeResponse - Incoming request: Mode="${mode}", Topic="${topic}", ContentLength=${content?.length}`);
    console.log('[GroqService] Using Groq');
    console.log(`[GroqService] Selected model: ${config.GROQ_MODEL}`);
    console.log(`[GroqService] Prompt (first 100 chars): ${prompt.substring(0, 100).replace(/\r?\n/g, ' ')}`);

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const response = await groq.chat.completions.create({
          model: config.GROQ_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a professional communication coach AI that outputs only valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });

        console.log('[GroqService] analyzeResponse - Groq returned a successful response');
        const rawText = response.choices[0]?.message?.content || '';
        const parsedJson = JSON.parse(rawText.trim());

        const responseTime = Date.now() - startTime;
        console.log(`[GroqService] analyzeResponse - Success on attempt ${attempts} in ${responseTime}ms`);

        return parsedJson;
      } catch (error: any) {
        console.log(`[GroqService] analyzeResponse - Groq returned an error: ${error?.message || String(error)}`);
        console.warn(`[GroqService] Attempt ${attempts} failed for analyzeResponse:`, error?.message || String(error));
        console.error('[GroqService] Exception Stack Trace:', error?.stack || error);

        if (attempts >= maxAttempts) {
          console.warn('[GroqService] All API attempts exhausted. Generating local mock analysis to prevent rate limit blocking.');
          
          const isTooShort = content.trim().split(/\s+/).length < 15;
          const responseTime = Date.now() - startTime;
          console.log(`[GroqService] analyzeResponse (Fallback) - Response time: ${responseTime}ms`);

          if (isTooShort) {
            return {
              isTooShort: true,
              shortMessage: "That's a good start! Please try to write/speak a more detailed response to receive a comprehensive analysis.",
              summary: "",
              strengths: [],
              improvements: [],
              grammarCorrections: [],
              improvedVersion: "",
              suggestions: []
            };
          }

          return {
            isTooShort: false,
            shortMessage: "",
            summary: `This is a local evaluation report generated because the AI service is currently offline or unavailable. Your response regarding "${topic}" displays a structured argument with a clear viewpoint.`,
            strengths: [
              "Structured Thinking: The content divides the points logically into structured paragraphs.",
              "Vocabulary Usage: Core terms appropriate for the topic were expressed clearly.",
              "Coherent Conclusion: The statement finishes with a clear summary reinforcing your stance."
            ],
            improvements: [
              "Include Specific Examples: Try adding a concrete instance (e.g., historical precedent or current event) to anchor abstract claims.",
              "Vary Sentence Lengths: Try mixing short, punchy sentences with compound ones to make the narrative more dynamic.",
              "Explicit Transitions: Use clearer transition words (e.g., 'Furthermore', 'Consequently') between key arguments."
            ],
            grammarCorrections: [
              {
                original: "In my opinion, ethical AI is a critical necessity.",
                corrected: "Ethical AI is a critical necessity.",
                explanation: "Removing conversational filler phrases like 'In my opinion' makes the argument sound more direct, authoritative, and professional."
              }
            ],
            improvedVersion: `Indeed, ethical AI is a critical necessity. We must ensure that corporate profit drivers do not compromise individual privacy rights and algorithmic transparency. After all, models inevitably reflect systemic biases if they are trained on unvetted, historical data.`,
            suggestions: [
              "State your thesis immediately and confidently in the opening sentence.",
              "Incorporate statistics or real-world examples to support key assumptions.",
              "Acknowledge opposing viewpoints briefly before refuting them to build credibility.",
              "Practice speaking with a steady pace and use pauses for strategic emphasis.",
              "Keep practicing on diverse topics to build mental agility and confidence!"
            ]
          };
        }

        // Cooldown before retry
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    throw new Error('Failed to analyze response.');
  }
}
