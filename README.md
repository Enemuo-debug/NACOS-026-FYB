# FYB API (NACOS-026)

Backend for creating user accounts, defining custom FYB forms (up to 10 fields), and accepting public entries linked to each definition. Includes JWT auth, MongoDB persistence, and Swagger docs.

## Quick Start
```bash
npm install
npm run dev          # ts-node (hot reload)
npm run build        # compile to dist
npm start            # run compiled build
```

## Environment
Create `.env`:
```
PORT=3000
MONGODB_URI=<mongo connection string>
JWT_SECRET=<strong secret>
SUPER_USER_EMAIL=<seed superuser email>
SUPER_USER_PASSWORD=<seed superuser password>
APP_URL=http://localhost:3000          # used for swagger and share links

# Mail (used for invitations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<smtp user>
EMAIL_PASS=<smtp password or app password>

# Cloudinary (image uploads for FYB entries)
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
```

## Auth & Users
- **POST /api/users/login** – `{ email, password }` → `{ token, user }`
- **POST /api/users/invite** (super user) – `{ email }` → sends invitation email
- **POST /api/users/register** – `{ token, password, name }` (token from invite link)
- **GET /api/users** (auth) – list users
- **DELETE /api/users/:id** (super user)

JWT: send `Authorization: Bearer <token>` on protected routes.

## FYB Definitions (form schema)
- A definition has **up to 10 slots**, each with `label` and `type` (`TEXT`, `NUMBER`, `IMAGE`).
- Stored as fixed columns `slot1..slot10` (all strings) for atomic DB design—no arrays.
- Share link is generated for public submissions.

Endpoints:
- **POST /api/definitions** (auth)  
  ```json
  { "name": "Customer Intake", "description": "Basic", "fields": [
    { "label": "Full Name", "type": "TEXT" },
    { "label": "Age", "type": "NUMBER" },
    { "label": "Photo", "type": "IMAGE" }
  ] }
  ```
  Returns definition + `shareLink`.
- **GET /api/definitions** (auth) – list your definitions with their fields and share links.

## FYB Entries (public)
- **POST /api/definitions/{definitionId}/entries**  
  Body: `{ "values": [ { "label": "Age", "value": 34 }, { "label": "Photo", "value": "<url or data URI>" } ] }`
  - Numbers are validated before save (then stored as string).
  - Images are uploaded to Cloudinary; stored value is the returned URL.
  - Text is stored as provided.
- **GET /api/definitions/{definitionId}/entries** – list all entries for that definition.

## Swagger
- UI: `GET /api-docs`
- JSON: `GET /api-docs.json`
Auto-generated in `src/config/swagger.ts` with all user and FYB endpoints.

## Project Structure (key files)
- `src/index.ts` – app entry, routes, swagger, Mongo connect, seed super user.
- `src/controllers/` – request handling (users, FYB definitions/entries).
- `src/routers/` – route wiring.
- `src/models/` – Mongoose models (`User`, `FYBDefinition`, `FYBEntry`).
- `src/interfaces/user.interface.ts` – enums for `UserRole` and FYB `FieldType` (TEXT/NUMBER/IMAGE).
- `src/middleware/auth.middleware.ts` – JWT auth & super-user guard.
- `src/config/swagger.ts` – OpenAPI spec builder.

## Data Model (slots explained)
- **FYBDefinition**: fixed columns `slot1Label..slot10Label` + `slot1Type..slot10Type` (all optional). Each slot stores the label and type chosen at creation.
- **FYBEntry**: fixed columns `slot1..slot10` (all strings). When an entry is submitted, values are placed into the matching slot by label.
  - TEXT → stored as provided string  
  - NUMBER → validated as number, then stored as string  
  - IMAGE → uploaded to Cloudinary, store returned URL  
- This keeps the DB atomic (no arrays/objects in a single column) while staying flexible for the first 10 fields.

## API Flow (frontend-friendly)
1) **Auth**
   - `POST /api/users/login` → `{ token }`; send `Authorization: Bearer <token>` on protected routes.
2) **Create FYB definition (auth)**
   - `POST /api/definitions`
   - Body: `{ name, description?, fields:[{label,type}] }` (max 10).
   - Response includes `shareLink` and the resolved fields with assigned slots.
3) **List my definitions (auth)**
   - `GET /api/definitions` → definitions + `shareLink` for each.
4) **Public entry submission**
   - `POST /api/definitions/{definitionId}/entries`
   - Body: `{ values:[{label, value}] }`
   - For images: send a URL or a base64/data URI string.
5) **Read entries (public)**
   - `GET /api/definitions/{definitionId}/entries`

## Request/Response Shapes (quick reference)
- Definition creation response:
  ```json
  {
    "_id": "64f...",
    "name": "Customer Intake",
    "description": "Basic",
    "fields": [
      { "label": "Full Name", "type": "TEXT" },
      { "label": "Age", "type": "NUMBER" },
      { "label": "Photo", "type": "IMAGE" }
    ],
    "shareLink": "http://localhost:3000/api/definitions/64f.../entries"
  }
  ```
- Entry submission body:
  ```json
  {
    "values": [
      { "label": "Full Name", "value": "Ada Lovelace" },
      { "label": "Age", "value": 36 },
      { "label": "Photo", "value": "data:image/png;base64,..." }
    ]
  }
  ```
- Entry response (stored in slots):
  ```json
  {
    "_id": "650...",
    "definitionId": "64f...",
    "slot1": "Ada Lovelace",
    "slot2": "36",
    "slot3": "https://res.cloudinary.com/...",
    "createdAt": "...",
    "updatedAt": "..."
  }
  ```

## Frontend Integration Tips
- **Auth header**: `Authorization: Bearer <token>` for any protected endpoint.
- **Definition builder UI**: collect up to 10 rows of `{ label, type }`. Disable add button after 10.
- **Entry form UI**: build fields from the definition’s `fields` array; submit values by `label` (no slot numbers needed).
- **Images**: allow file upload → convert to base64/data URI or upload to a URL first; send that string in `value`.
- **Validation**: front-end can mirror rules (max 10 fields, required labels/types, number-only for NUMBER).
- **Swagger**: use `/api-docs` to auto-generate client stubs or explore requests.

## Notes
- Seed super user is created on startup if absent (email/password from `.env`).
- All FYB slot values persist as strings; numeric validation occurs pre-save.
- Image uploads require Cloudinary credentials; without them, image entry requests will fail.
