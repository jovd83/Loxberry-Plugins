const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'plugins-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const GITHUB_USERNAME = config.githubUsername;
const TARGET_TOPICS = config.targetTopics.map(t => t.toLowerCase());

const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'node.js'
};

if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
}

async function fetchAllRepos() {
    let allRepos = [];
    let page = 1;
    console.log(`Fetching repositories for ${GITHUB_USERNAME}...`);

    while (true) {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}&sort=updated`, { headers });
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const repos = await response.json();
        if (repos.length === 0) break;

        allRepos = allRepos.concat(repos);
        page++;
    }

    console.log(`Fetched ${allRepos.length} total repositories.`);
    return allRepos;
}

function processRepos(repos, config) {
    const pluginRepos = repos.filter(repo => {
        if (repo.fork || repo.archived) return false;
        if (!repo.topics) return false;
        return repo.topics.some(topic => TARGET_TOPICS.includes(topic.toLowerCase()));
    });

    console.log(`Found ${pluginRepos.length} LoxBerry plugin repositories.`);

    const outputData = {};

    config.categories.forEach(cat => {
        outputData[cat.name] = {
            description: cat.description,
            subcategories: {}
        };
        cat.subcategories.forEach(sub => {
            outputData[cat.name].subcategories[sub.name] = {
                description: sub.description,
                repos: []
            };
        });
    });

    outputData[config.defaultCategory] = {
        description: config.defaultCategoryDescription,
        subcategories: {
            [config.defaultSubcategory]: {
                description: config.defaultSubcategoryDescription,
                repos: []
            }
        }
    };

    function findCategory(repoTopics) {
        if (!repoTopics || repoTopics.length === 0) return null;
        const lowered = repoTopics.map(t => t.toLowerCase());

        for (const cat of config.categories) {
            for (const sub of cat.subcategories) {
                if (lowered.some(t => sub.topics.map(x => x.toLowerCase()).includes(t))) {
                    return { catName: cat.name, subName: sub.name };
                }
            }
        }
        return null;
    }

    pluginRepos.forEach(repo => {
        let location = findCategory(repo.topics);
        if (!location) {
            location = { catName: config.defaultCategory, subName: config.defaultSubcategory };
        }
        outputData[location.catName].subcategories[location.subName].repos.push(repo);
    });

    // Sort each bucket alphabetically by name for stable output
    for (const cat of Object.values(outputData)) {
        for (const sub of Object.values(cat.subcategories)) {
            sub.repos.sort((a, b) => a.name.localeCompare(b.name));
        }
    }

    return { outputData, count: pluginRepos.length };
}

function generateMarkdown({ outputData, count }) {
    let md = '';

    md += `# LoxBerry Plugins\n\n`;
    md += `An overview of my [LoxBerry](https://www.loxberry.de/) plugins. `;
    md += `This list is automatically rebuilt every day from the topics of my public GitHub repositories — `;
    md += `any repo tagged with the topic \`loxberry-plugin\` shows up here.\n\n`;

    md += `## What is LoxBerry?\n\n`;
    md += `[**LoxBerry**](https://www.loxberry.de/) is a free, open-source Raspberry Pi–based companion platform for the `;
    md += `[Loxone Miniserver](https://www.loxone.com/). It extends the Miniserver with capabilities that are not available out of the box `;
    md += `by hosting community-maintained plugins that bridge third-party devices, services, and protocols (MQTT, REST, UDP, TCP, Modbus, WebSocket, …) `;
    md += `to Loxone — typically through the built-in **MQTT Gateway** or virtual HTTP/UDP inputs.\n\n`;
    md += `Useful links:\n\n`;
    md += `- LoxBerry homepage: <https://www.loxberry.de/>\n`;
    md += `- LoxBerry on GitHub: <https://github.com/mschlenstedt/Loxberry>\n`;
    md += `- LoxBerry Wiki: <https://wiki.loxberry.de/>\n`;
    md += `- Loxone Miniserver: <https://www.loxone.com/>\n\n`;

    md += `## Plugins\n\n`;
    md += `Below is the live list of my LoxBerry plugin repositories (${count} total). `;
    md += `Each entry links to its GitHub repository and includes the repo's own description. `;
    md += `Categorization is driven by GitHub topics — see [\`plugins-config.json\`](plugins-config.json) for the topic-to-category mapping.\n\n`;

    for (const [catName, catData] of Object.entries(outputData)) {
        const hasRepos = Object.values(catData.subcategories).some(sub => sub.repos.length > 0);
        if (!hasRepos) continue;

        md += `## ${catName}\n\n`;
        if (catData.description) md += `${catData.description}\n\n`;

        for (const [subName, subData] of Object.entries(catData.subcategories)) {
            if (subData.repos.length === 0) continue;

            md += `### ${subName}\n\n`;
            if (subData.description) md += `${subData.description}\n\n`;

            subData.repos.forEach(repo => {
                const desc = repo.description ? repo.description : 'No description provided.';
                md += `- **[${repo.name}](${repo.html_url})** — ${desc}\n\n`;

                if (repo.topics && repo.topics.length > 0) {
                    md += `  *Topics:* ${repo.topics.map(t => '`' + t + '`').join(', ')}\n\n`;
                }
            });
        }
    }

    md += `## How this list is maintained\n\n`;
    md += `- A GitHub Actions workflow ([\`.github/workflows/update-plugins.yml\`](.github/workflows/update-plugins.yml)) runs daily at 00:00 UTC (and on manual dispatch).\n`;
    md += `- The workflow executes [\`update-readme.js\`](update-readme.js), which queries the GitHub API for all public, non-fork, non-archived repos owned by [\`${GITHUB_USERNAME}\`](https://github.com/${GITHUB_USERNAME}) and keeps those tagged with the topic \`loxberry-plugin\`.\n`;
    md += `- Each plugin is sorted into a category based on its other GitHub topics, using the rules defined in [\`plugins-config.json\`](plugins-config.json).\n`;
    md += `- To add a new plugin to this overview, simply add the \`loxberry-plugin\` topic to the new repository on GitHub — it will appear here within 24 hours.\n`;

    return md;
}

async function main() {
    try {
        const allRepos = await fetchAllRepos();
        const result = processRepos(allRepos, config);
        const readmeContent = generateMarkdown(result);

        const readmePath = path.join(__dirname, 'README.md');
        fs.writeFileSync(readmePath, readmeContent, 'utf8');

        console.log('README.md successfully updated!');
    } catch (e) {
        console.error('Error updating LoxBerry plugins overview:', e);
        process.exit(1);
    }
}

main();
