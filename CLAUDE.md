# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm start            # run production server (node index.js)
npm run dev          # run with auto-reload (nodemon index.js)
```

No test runner or linter is configured. Manual testing uses cURL against the running server (see README for examples).

## Environment Setup

Copy `.env.example` to `.env` and fill in:

```
API_KEY=<secret key callers must supply in every request>
KC_CLIENT_ID=<KingsChat OAuth client ID>
PORT=3000
```

`STATIC_REFRESH_TOKEN` is hardcoded in `index.js:13` — it is the ministry-level refresh token used exclusively by `/refresh-static-token`.

## Architecture

The entire service is a single file: `index.js`. There are no modules, routers, or subdirectories.

### Auth model

Every endpoint requires `apiKey` in the JSON request body. It is compared directly to the `API_KEY` environment variable. There is no session or JWT — this is a simple shared-secret check.

### Endpoints and what they call

| Route | External call |
|---|---|
| `POST /notify` | `kingschat-web-sdk.sendMessage()` → token refresh via `kingslist-dispatch-api` if it fails |
| `POST /notify-batch` | Same as `/notify` but loops over a `kcid` array (single string also accepted) |
| `POST /get-access-token` | `kingslist-dispatch-api.onrender.com/api/refresh-token` with caller-supplied `refreshToken` |
| `POST /refresh-static-token` | Same refresh endpoint but using the hardcoded `STATIC_REFRESH_TOKEN` |
| `POST /send-notification` | `web.espees.org/api/notifications/send` — sends to the `healingschool` channel; does **not** use `kingschat-web-sdk` |

### Token retry pattern

`/notify` and `/notify-batch` use a two-attempt loop: try `sendMessage`, and if it throws, call `kingslist-dispatch-api` to refresh the token, then retry once. The refreshed tokens are only held in local variables for the duration of the request — they are not persisted server-side.

### `jsonResponse` helper (`index.js:20`)

All responses go through this wrapper, which serialises the payload with a replacer that converts `undefined` → `null`, preventing Express from throwing on undefined values. Use it for every `res` call.
