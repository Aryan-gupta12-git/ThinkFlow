export interface Topic {
  id: string;
  text: string;
  category: string;
}

export const TOPICS: Topic[] = [
  // Technology
  { id: 'tech-1', category: 'Technology', text: 'Should internet access be recognized as a universal human right?' },
  { id: 'tech-2', category: 'Technology', text: 'Is the rapid advancement of technology outpacing human social evolution?' },
  { id: 'tech-3', category: 'Technology', text: 'Do smart devices do more to connect us or isolate us?' },
  { id: 'tech-4', category: 'Technology', text: 'Will quantum computing redefine cybersecurity beyond our control?' },
  
  // Business
  { id: 'biz-1', category: 'Business', text: 'Is remote work the future, or just a temporary trend?' },
  { id: 'biz-2', category: 'Business', text: 'Should companies prioritize stakeholder wellbeing over shareholder profit?' },
  { id: 'biz-3', category: 'Business', text: 'Is a 4-day workweek a viable model for the global economy?' },
  { id: 'biz-4', category: 'Business', text: 'Does corporate social responsibility truly make a difference, or is it mostly marketing?' },

  // Education
  { id: 'edu-1', category: 'Education', text: 'Should college education be completely free for everyone?' },
  { id: 'edu-2', category: 'Education', text: 'Is the traditional grading system an accurate measure of intelligence?' },
  { id: 'edu-3', category: 'Education', text: 'Should financial literacy and tax education be mandatory in high school?' },
  { id: 'edu-4', category: 'Education', text: 'Should classrooms focus more on vocational skills than theoretical knowledge?' },

  // Current Affairs
  { id: 'curr-1', category: 'Current Affairs', text: 'Should social media platforms enforce strict age restrictions under 16?' },
  { id: 'curr-2', category: 'Current Affairs', text: 'How should democratic governments regulate misinformation during elections?' },
  { id: 'curr-3', category: 'Current Affairs', text: 'Is global cooperation still effective in solving borderless crises?' },
  { id: 'curr-4', category: 'Current Affairs', text: 'Should voting in federal elections be legally compulsory?' },

  // Environment
  { id: 'env-1', category: 'Environment', text: 'Can technology solve climate change, or must we fundamentally change our lifestyles?' },
  { id: 'env-2', category: 'Environment', text: 'Should single-use plastics be banned globally, regardless of economic impact?' },
  { id: 'env-3', category: 'Environment', text: 'Is nuclear energy the only realistic solution for transitioning away from fossil fuels?' },
  { id: 'env-4', category: 'Environment', text: 'Should companies be taxed based on the direct carbon footprint of their products?' },

  // Sports
  { id: 'sport-1', category: 'Sports', text: 'Should esports be officially included in the Olympic Games?' },
  { id: 'sport-2', category: 'Sports', text: 'Is the extreme commercialization of sports ruining the pure spirit of games?' },
  { id: 'sport-3', category: 'Sports', text: 'Are professional athletes paid too much compared to essential worker professions?' },
  { id: 'sport-4', category: 'Sports', text: 'Should performance-enhancing drugs be regulated and legalized in a separate league?' },

  // Startups
  { id: 'start-1', category: 'Startups', text: 'Does massive venture funding make or break a startup\'s long-term sustainability?' },
  { id: 'start-2', category: 'Startups', text: 'Should startup culture celebrate failure as a badge of honor?' },
  { id: 'start-3', category: 'Startups', text: 'Is a brilliant execution always more valuable than a brilliant idea?' },
  { id: 'start-4', category: 'Startups', text: 'Should young graduates join early-stage startups or established corporate firms?' },

  // Artificial Intelligence
  { id: 'ai-1', category: 'Artificial Intelligence', text: 'Should AI replace teachers in secondary school classrooms?' },
  { id: 'ai-2', category: 'Artificial Intelligence', text: 'Should AI-generated art and writing be eligible for copyright protection?' },
  { id: 'ai-3', category: 'Artificial Intelligence', text: 'Is artificial general intelligence (AGI) a genuine existential threat to humanity?' },
  { id: 'ai-4', category: 'Artificial Intelligence', text: 'Does AI augment human creativity, or does it slowly replace the need for it?' },

  // Economy
  { id: 'econ-1', category: 'Economy', text: 'Should India move entirely towards a cashless, digital-only economy?' },
  { id: 'econ-2', category: 'Economy', text: 'Is Universal Basic Income (UBI) a viable solution to job loss caused by automation?' },
  { id: 'econ-3', category: 'Economy', text: 'Does globalization benefit developing nations, or does it exploit their resources?' },
  { id: 'econ-4', category: 'Economy', text: 'Should the wealth of billionaires be capped to redistribute capital?' },

  // Ethics
  { id: 'eth-1', category: 'Ethics', text: 'Is it ethical to use CRISPR gene editing to select desirable traits in future children?' },
  { id: 'eth-2', category: 'Ethics', text: 'How should self-driving cars prioritize passengers versus pedestrians in an unavoidable accident?' },
  { id: 'eth-3', category: 'Ethics', text: 'Is whistleblowing a moral duty, or is it a breach of professional loyalty?' },
  { id: 'eth-4', category: 'Ethics', text: 'Should animal testing be completely banned for medical and pharmaceutical research?' },

  // Leadership
  { id: 'lead-1', category: 'Leadership', text: 'Are exceptional leaders born with natural traits, or are they made through experience?' },
  { id: 'lead-2', category: 'Leadership', text: 'Is empathy the single most critical quality for a modern leader?' },
  { id: 'lead-3', category: 'Leadership', text: 'Should leaders make decisions based on team consensus or their own individual vision?' },
  { id: 'lead-4', category: 'Leadership', text: 'Can a leader remain highly effective without being liked by their team?' },

  // Social Issues
  { id: 'soc-1', category: 'Social Issues', text: 'Should work-life balance be legally mandated and protected by governments?' },
  { id: 'soc-2', category: 'Social Issues', text: 'Is social media polarization the single greatest threat to modern democracy?' },
  { id: 'soc-3', category: 'Social Issues', text: 'Does the prison system focus too heavily on punishment rather than rehabilitation?' },
  { id: 'soc-4', category: 'Social Issues', text: 'Should mental health days be legally treated the same as physical sick days?' }
];

export const MOTIVATIONAL_MESSAGES = [
  'Keep going...',
  'Excellent flow...',
  'Don\'t stop thinking...',
  'You\'re doing great...',
  'Think deeper...',
  'Express yourself clearly...',
  'Maintain the momentum...',
  'Let the thoughts flow...',
  'You are doing brilliant...',
  'Write continuously!'
];

export function getRandomTopic(excludeIds: string[] = []): Topic {
  const available = TOPICS.filter(t => !excludeIds.includes(t.id));
  const listToUse = available.length > 0 ? available : TOPICS;
  const randomIndex = Math.floor(Math.random() * listToUse.length);
  return listToUse[randomIndex];
}
