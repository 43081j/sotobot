export interface ParsedCommand {
  name: string;
  args: string[];
}

export function parseCommand(
  botName: string,
  body: string,
): ParsedCommand | null {
  const mention = `!${botName}`;

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith(mention)) {
      continue;
    }

    const parts = line.slice(mention.length).trim().split(/\s+/);
    const [name, ...args] = parts;
    if (!name) {
      continue;
    }

    return { name, args };
  }

  return null;
}
