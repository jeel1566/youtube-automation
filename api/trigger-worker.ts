import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
    const REPO_NAME = process.env.GITHUB_REPO_NAME;

    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
        return response.status(500).json({ error: 'Missing server configuration' });
    }

    try {
        const res = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event_type: 'trigger-worker',
                }),
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`GitHub API error: ${res.status} ${errorText}`);
        }

        return response.status(200).json({ success: true, message: 'Worker triggered' });
    } catch (error: any) {
        console.error(error);
        return response.status(500).json({ error: error.message });
    }
}
