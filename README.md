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
import { createBot } from 'sotobot';
import { createServer } from 'sotobot/cloudflare.js';

const bot = createBot({
  appId: env.APP_ID,
  privateKey: env.PRIVATE_KEY,
  webhookSecret: env.WEBHOOK_SECRET,
  bot: { name: 'soto' },
});

bot.addCommand('ping', async ({ octokit, payload }) => {
  await octokit.request(
    'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
    {
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.issue.number,
      body: 'pong 🏓',
    },
  );
});

export default createServer(bot);
```

## License

[MIT](./LICENSE)
