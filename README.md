# sotobot 🤖

A serverless-focused GitHub bot framework.

> [!WARNING]
> This project is in early development and will have many breaking changes.

## Install

```sh
npm install sotobot
```

## Usage

```ts
import { createBot, GitHubDriver } from 'sotobot';
import { createServer } from 'sotobot/cloudflare.js';

const driver = new GitHubDriver({
  appId: env.APP_ID,
  privateKey: env.PRIVATE_KEY,
  webhookSecret: env.WEBHOOK_SECRET,
});

const bot = createBot({ name: 'soto' }, driver);

bot.addEventListener('botCommand', async (event) => {
  const { command, args, owner, repo, pullRequestNumber, source } =
    event.detail;

  if (command !== 'ping') {
    return;
  }

  const { octokit } = source;
  await octokit.request(
    'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
    {
      owner,
      repo,
      issue_number: pullRequestNumber,
      body: 'pong 🏓',
    },
  );
});

export default createServer(bot);
```

## License

[MIT](./LICENSE)
