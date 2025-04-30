# Render Deployment Information

This document lists the service IDs for manual deployments via the Render CLI.

- **resolve** (static site)
  - Service ID: `srv-d02tenuuk2gs73er4890`

- **resolve-backend** (web service)
  - Service ID: `srv-d02th3adbo4c73c3aigg`

## Manual Deploy Commands

Trigger a new deploy for your backend:
```bash
render deploys create srv-d02th3adbo4c73c3aigg
```

Trigger a new deploy for your frontend:
```bash
render deploys create srv-d02tenuuk2gs73er4890
```
