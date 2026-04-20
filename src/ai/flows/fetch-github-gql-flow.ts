export async function fetchGithubGQL(username: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is missing in environment variables.");
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        repositories(first: 20, orderBy: {field: PUSHED_AT, direction: DESC}, isFork: false) {
          nodes {
            name
            description
            stargazerCount
            forkCount
            primaryLanguage {
              name
            }
            languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                }
              }
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  history {
                    totalCount
                  }
                }
              }
            }
            issues(states: OPEN) {
              totalCount
            }
            pullRequests(states: MERGED) {
              totalCount
            }
          }
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { username } }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(`GitHub GraphQL Error: ${json.errors.map((e: any) => e.message).join(", ")}`);
  }

  return json.data.user;
}
