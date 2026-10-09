import { inngest } from "./index.js";
import { octokit } from "../lib/github.js";

export const githubPrReviewer = inngest.createFunction(
  { id: "github-pr-reviewer", triggers: [{ event: "github/pr.reviewer" }] },
  async ({ event, step }) => {
    const { owner, repo, pull_number } = event.data;
    let pullRequestInfo;
    try {
      pullRequestInfo = await step.run("fetch the data of pr", async () => {
        
        const { data } = await octokit.pulls.get({
          owner, repo, pull_number
        })
        return {
          id: data.id,
          title: data.title,
          state: data.state,
          pr_number: data.number,
          comments: data.comments,
          diffUrls: data.diff_url,
          commits: data.commits
        }
      })
    }
    catch (err) {
      return { message: "Failed to fetch PR info", status: "500", error: err.message };
    }

    if(!pullRequestInfo) {
      return {
        "message": "No pull request found!",
        "status": "404",
        "skipped":true
      }
    }
    if (pullRequestInfo.state !== "open") {
      return {
        "message": "No pull request found!",
        "status": "404"
      };
    }

    const changes = await step.run("fetch changes", async()=>{
      const changeResult = await octokit.paginate(octokit.pulls.listFiles, {
        owner,
        repo,
        pull_number,
        per_page: 100,
      })

      return changeResult.map(change=>({
        filename: change.filename,
        status:change.status,
        patch:change.patch,
        additions:change.additions,
        deletions:change.deletions,
        changes:change.changes
      }))
    })

    return { changes, ...pullRequestInfo };
  },
);

export const functions = [
  githubPrReviewer
];