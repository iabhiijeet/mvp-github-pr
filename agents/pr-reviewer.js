import { Agent } from '@openai/agents';
import { z } from 'zod';

export const prReviewerAgent = new Agent({
    name:"github pr reviewer",
    outputSchema: GithubReviewAgentResultSchema,
    instructions: `
    You're an expert AI code reviewer.
    You are given a pull request details with some basic information about the pull request
    and the changes in that pull requests.
    Give a detailed review about the code and suggest some fixes if any, your comments, etc.
    Use emojis in comments to make it natural.
  `,
})