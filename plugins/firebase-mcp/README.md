# Firebase MCP plugin

This plugin exposes the official Firebase MCP server from `firebase-tools` to Codex for this repository.

Authentication options:

- Run `npx -y firebase-tools@latest login --reauth`
- Or set `GOOGLE_APPLICATION_CREDENTIALS` to a Firebase/Google service-account JSON file

Server source:

- Firebase CLI / MCP docs: https://firebase.google.com/docs/cli/mcp-server
- Repository: https://github.com/firebase/firebase-tools
