import { describe, expect, it } from 'vitest';
import { parseCommand } from './comments.js';

const botName = 'test-bot';
const mention = `!${botName}`;

describe('parseCommand', () => {
  it('parses a command with no args', () => {
    expect(parseCommand(botName, `${mention} test-command`)).toEqual({
      name: 'test-command',
      args: [],
    });
  });

  it('parses a command with args', () => {
    expect(
      parseCommand(botName, `${mention} test-command arg-one arg-two`),
    ).toEqual({
      name: 'test-command',
      args: ['arg-one', 'arg-two'],
    });
  });

  it('collapses repeated whitespace between tokens', () => {
    expect(
      parseCommand(botName, `${mention}   test-command    arg-one`),
    ).toEqual({
      name: 'test-command',
      args: ['arg-one'],
    });
  });

  it('ignores leading and trailing whitespace on the line', () => {
    expect(parseCommand(botName, `   ${mention} test-command   `)).toEqual({
      name: 'test-command',
      args: [],
    });
  });

  it('finds the command on any line of a multi-line body', () => {
    const body = ['some intro text', `${mention} test-command`, 'more'].join(
      '\n',
    );
    expect(parseCommand(botName, body)).toEqual({
      name: 'test-command',
      args: [],
    });
  });

  it('returns the first command when several are present', () => {
    const body = [`${mention} first`, `${mention} second`].join('\n');
    expect(parseCommand(botName, body)).toEqual({ name: 'first', args: [] });
  });

  it('returns null when there is no mention', () => {
    expect(parseCommand(botName, 'just a regular comment')).toBeNull();
  });

  it('returns null for an empty body', () => {
    expect(parseCommand(botName, '')).toBeNull();
  });

  it('returns null when the mention has no command name', () => {
    expect(parseCommand(botName, `${mention}`)).toBeNull();
    expect(parseCommand(botName, `${mention}   `)).toBeNull();
  });

  it('requires the mention at the start of the line', () => {
    expect(parseCommand(botName, `hey ${mention} test-command`)).toBeNull();
  });
});
