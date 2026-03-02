"use server"

export async function fetchGithubProfile(githubUrl: string): Promise<string> {
    if (!githubUrl) return "No GitHub URL provided.";

    try {
        // Extract username from URL
        const match = githubUrl.match(/github\.com\/([^/]+)/i);
        if (!match || !match[1]) {
            return "Invalid GitHub URL format.";
        }

        const username = match[1];

        // Fetch user profile
        const userRes = await fetch(`https://api.github.com/users/${username}`, {
            headers: {
                "User-Agent": "HireNexus-AI",
                "Accept": "application/vnd.github.v3+json"
            },
            // Cache loosely to avoid rate limits
            next: { revalidate: 3600 }
        });

        if (!userRes.ok) {
            return `Failed to fetch GitHub profile for ${username}: ${userRes.statusText}`;
        }

        const userData = await userRes.json();

        // Fetch recent public repositories
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, {
            headers: {
                "User-Agent": "HireNexus-AI",
                "Accept": "application/vnd.github.v3+json"
            },
            next: { revalidate: 3600 }
        });

        let reposData = [];
        if (reposRes.ok) {
            reposData = await reposRes.json();
        }

        // Format the extracted data into a clean text block for the LLM
        let formattedData = `GitHub Profile: ${userData.login}\n`;
        if (userData.name) formattedData += `Name: ${userData.name}\n`;
        if (userData.bio) formattedData += `Bio: ${userData.bio}\n`;
        formattedData += `Followers: ${userData.followers} | Public Repos: ${userData.public_repos}\n\n`;

        if (reposData && reposData.length > 0) {
            formattedData += `Recent Active Repositories (Top 5):\n`;
            reposData.forEach((repo: any) => {
                formattedData += `- ${repo.name}`;
                if (repo.language) formattedData += ` [Language: ${repo.language}]`;
                formattedData += `\n`;
                if (repo.description) formattedData += `  Description: ${repo.description}\n`;
            });
        } else {
            formattedData += `No public repositories found.\n`;
        }

        return formattedData;

    } catch (error) {
        console.error("Error fetching GitHub profile:", error);
        return `Error fetching GitHub profile data: ${error instanceof Error ? error.message : String(error)}`;
    }
}
