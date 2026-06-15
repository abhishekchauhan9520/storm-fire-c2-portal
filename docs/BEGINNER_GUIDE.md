# Beginner Guide

This guide explains how to work with this project in Codex.

## How You Use Codex

You can ask Codex to inspect, fix, build, explain, or run parts of the project. Good requests are specific:

```text
Run the app and fix any startup errors.
Explain how the advisor chat works.
Add scenario save/load to localStorage.
Improve the monitor map UI for mobile.
Find why the build fails.
```

You do not need to know every command. If a command needs permission, Codex will ask or use the approval flow.

## Daily Workflow

1. Start the app:

```powershell
npm.cmd run dev
```

2. Open:

```text
http://127.0.0.1:3000
```

3. Ask Codex for the next change in plain English.

4. After Codex edits code, run:

```powershell
npm.cmd run lint
```

5. For production-style verification, run:

```powershell
npm.cmd run build
```

## Permissions

Codex can read and edit files in this project folder. It may ask permission when:

- Installing packages
- Running browser tools
- Running commands outside the sandbox
- Opening desktop apps
- Accessing network resources

Approve only actions you understand. For this project, normal approvals are dependency installation, local dev server checks, and browser verification.

## Environment Variables

Secrets live in `.env.local`. That file is ignored by `.gitignore`, so it should not be committed.

Minimum file:

```env
GEMINI_API_KEY="your_key_here"
APP_URL="http://127.0.0.1:3000"
```

Optional model override:

```env
GEMINI_MODEL="gemini-2.5-flash"
```

## What To Ask Next

Useful next requests:

```text
Add persistent scenario save and load.
Create a cleaner settings panel.
Make the app mobile responsive.
Add tests for the server health endpoint.
Improve the AI advisor prompt and response UI.
```
