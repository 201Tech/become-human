<div align="center">

# BecomeHuman

<table><tr><td><pre>
        __________                                    __________
 =====-'  [o] [o]  ]=[]=[]=[]=[]=[>   *   <__________(          '-=====
                 [====]                         (______
                 [====]                         (______
 =====-._______[====]                            (_______.______.-=====
              machine                                 human
</pre></td></tr></table>

**Your AI agent, working with you. Not just for you.**

[Install](#install) · [What changes](#what-changes) · [Your files](#your-files) · [Make it yours](#make-it-yours)

</div>

## Why

AI agents are fast, but they forget you every session, decide things you wanted to decide,
and leave work you cannot follow. BecomeHuman fixes that in any agent that speaks MCP:
Claude Code, Codex, Cursor, Gemini CLI and others.

## Install

Run it **once per computer**. From then on your agent starts it by itself, every session.

```bash
claude mcp add become-human --scope user -- npx -y github:DanielDDHM/BecomeHuman
```

<details>
<summary>Codex, Gemini CLI, Cursor and others</summary>

```bash
codex mcp add become-human -- npx -y github:DanielDDHM/BecomeHuman
gemini mcp add -s user become-human npx -y github:DanielDDHM/BecomeHuman
```

For Cursor, Windsurf, Claude Desktop and any other agent, add this to its MCP config:

```json
{
  "mcpServers": {
    "become-human": {
      "command": "npx",
      "args": ["-y", "github:DanielDDHM/BecomeHuman"]
    }
  }
}
```

</details>

You only need [Node.js](https://nodejs.org) 20 or newer.

## What changes

> **You:** let's continue<br>
> **Agent:** Last time we left off at #4 "add the login screen". There is also an open question:
> email or phone? Which do you prefer?<br>
> **You:** email, and stop using semicolons<br>
> **Agent:** Done. Learned: you prefer code without semicolons.

- **It does the work and keeps you in the loop:** what it will do, why, and what changed.
- **You decide:** it asks before choosing languages, libraries, architecture, tests or docs.
- **It teaches:** plain explanations, adapted to how much you already know.
- **It learns how you work:** your preferences and corrections, so it never asks twice.
- **It remembers each project:** ideas, decisions, open questions and next steps.
- **It is a real partner:** matches your tone, notices when you are tired, admits mistakes,
  disagrees with respect.

Read the full rules in [rules/human-first.md](rules/human-first.md).

## Your files

Everything stays on your computer, in a folder you can open: **`~/BecomeHuman`**.

| File | What is inside |
| --- | --- |
| `profile.md` | What the agent learned about you, grouped by topic |
| `my-rules.md` | Your own rules for every agent |
| `maps/<project>.md` | One checklist per project: ideas, decisions, questions, next steps |

They are plain text. Read them, fix them, add notes: the agent follows what is there
and never erases what you wrote.
Not sure where they are? Ask your agent: *"where is my data?"*

## Make it yours

- **Your rules:** write them in `~/BecomeHuman/my-rules.md`, one per line. They win over the defaults.
- **Your language:** set `BECOME_HUMAN_LANG=pt` to get your files in Portuguese (`en` is the default).
- **Another folder:** set `BECOME_HUMAN_HOME` to keep the files elsewhere, like a synced folder.
- **Profile size:** the agent keeps at most 50 facts and merges similar ones. Change it with `BECOME_HUMAN_PROFILE_LIMIT`.

To pass a setting to Claude Code, add `-e` when installing:

```bash
claude mcp add become-human --scope user -e BECOME_HUMAN_LANG=pt -- npx -y github:DanielDDHM/BecomeHuman
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). License: [MIT](LICENSE).
