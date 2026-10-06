# All APIs mounted under the prefix='/api/v1'
- Send JSON with `Content-Type: application/json`, except where an endpoint below specifies form data
- For authenticated routes, send `Authorization: Bearer <access_token>`. Registration and login return an access token; access tokens expire after the configured interval, currently 15 minutes by default.

# AUTH

**Endpoint:-**
POST /auth/register

**Request Body-**
{
  "name": "string",
  "email": "user@example.com",
  "password": "stringst",
  "timezone": "UTC"
}

**Response Body-**
{
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string",
    "email": "user@example.com",
    "timezone": "string",
    "created_at": "2026-09-27T12:01:38.948Z",
    "updated_at": "2026-09-27T12:01:38.948Z",
    "is_active": true
  },
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer"
}

#**Endpoint:-**
POST /auth/login

**Request Body-**
(application/x-www-form-urlencoded)
{
 "email": "user@example.com",
  "password": "stringst"
}

**Response Body-**
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer"
}


**Endpoint:-**
use to get bearer tokens once access token expires

POST /auth/refresh

**Request Body-**
{
  "refresh_token": "stringstri"
}

**Response Body-**
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer"
}

**Endpoint:-**
get current user details

GET /auth/me

**Response Body-**
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "string",
  "email": "user@example.com",
  "timezone": "string",
  "created_at": "2026-09-27T12:09:57.984Z",
  "updated_at": "2026-09-27T12:09:57.984Z",
  "is_active": true
}


# AGENT / RECRUITER AI

**Endpoint:-**
create a new agent

POST /agents

**Request Body-**
{
  "name": "string",
  "conversation_style": "Friendly Conversational",
  "languages": "English",
  "voice": "Warm & Clear",
  "interview_instruction": "string"
}


Allowed `conversation_style` values:
- `Friendly Conversational`,
- `Conversational`,
- `Formal`,
- `Professional`.

Allowed `languages`:
- `English`,
- `English + Hindi`,
- `English + Hindi + Marathi`.

Allowed `voice`:
- `Warm & Clear`,
- `Clear & Confident`,
- `Natural & Clear`,
- `Soft & Professional`.

**Response Body-**
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "string",
  "conversation_style": "Friendly Conversational",
  "languages": "English",
  "voice": "Warm & Clear",
  "interview_instruction": "string"
}

**Endpoint:-**
get agent details

GET /agents/{agent_id}

**Response Body-**
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "string",
  "conversation_style": "Friendly Conversational",
  "languages": "English",
  "voice": "Warm & Clear",
  "interview_instruction": "string"
}

**Endpoint:-**
update an existing agent

PATCH /agents/{agent_id}

**Request Body-**
PATCH accepts any non-empty subset of following:

{
  "name": "string",
  "conversation_style": "Friendly Conversational",
  "languages": "English",
  "voice": "Warm & Clear",
  "interview_instruction": "string"
}

**Response Body-**
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "string",
  "conversation_style": "Friendly Conversational",
  "languages": "English",
  "voice": "Warm & Clear",
  "interview_instruction": "string"
}

**Endpoint:-**
delete an agent

DELETE /agents/{agent_id}

**Endpoint:-**
list all agents (usercreated + defaults)

GET /agents

**Response Body-**
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string",
    "conversation_style": "Friendly Conversational",
    "languages": "English",
    "voice": "Warm & Clear",
    "interview_instruction": "string",
    "is_preset": false
  }
]
*note- is_preset tells whether this is usercreated i.e. editabable (false) or default i.e. not editable (true)


# CAMPAIGN / HIRING

All campaign routes require a bearer token.
Uses `multipart/form-data` with required `title` and either `raw_text` or `file`. 
Supported requirement-file formats are PDF, DOCX, and TXT.

**Endpoint:-**
create a new campaig

POST /campaigns

**Request Body-**
title: str (Formdata),
EITHER raw_text: str (Formdata),
OR file: UploadFile | None = File(None)
Do not send both requirement sources.
**required_fields: json (send in location, Employment type and Role summary in this)**

**Response Body-**
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "string",
  "workflow_template_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "agent_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "raw_text": "string",
  "required_fields": {
    "additionalProp1": {}
  },
  "file_url": "string",
  "created_at": "2026-10-05T16:17:24.171Z",
  "updated_at": "2026-10-05T16:17:24.171Z"
}

**Endpoint:-**
PATCH /campaigns/{campaign_id}

**Request Body-**
title: str (Formdata),
EITHER raw_text: str (Formdata),
OR file: UploadFile | None = File(None)
Do not send both requirement sources.
**required_fields: json (send in location, Employment type and Role summary in this)**

**Response Body-**
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "string",
  "workflow_template_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "agent_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "raw_text": "string",
  "required_fields": {
    "additionalProp1": {}
  },
  "file_url": "string",
  "created_at": "2026-10-05T16:17:24.171Z",
  "updated_at": "2026-10-05T16:17:24.171Z"
}

*Endpoint-
GET /api/v1/campaigns/
list all campaigns of this user

Response-
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "string",
    "workflow_template_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "agent_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "created_at": "2026-10-05T16:16:22.993Z",
    "updated_at": "2026-10-05T16:16:22.993Z"
  }
]

**Endpoint:-**
POST /campaigns/{campaign_id}/candidates/upload
upload Candidate Profiles

**Request Body-**
Upload one or more files as `multipart/form-data`, using the field name `files` for each file. Supported files are PDF, DOCX, TXT or ZIP.

**Response Body-**
{
  "batch_id": "string",
  "status": "string",
  "accepted_files": 0,
  "rejected_files": 0
}

POST /campaigns/{campaign_id}/candidates/upload/{batch_id}/retry
retry failed uploads

**Response Body-**
{
  "batch_id": "string",
  "status": "string",
  "accepted_files": 0,
  "rejected_files": 0
}

**Endpoint:-**
GET /campaigns/{campaign_id}/candidates/upload/{batch_id}/status
get candidates uploading status

**Response Body-**
{
  "batch_id": "string",
  "status": "string",
  "total_files": 0,
  "processed": 0,
  "failed": 0,
  "created_at": "string",
  "updated_at": "string",
  "finished_at": "string",
  "failed_files": [
    "string"
  ]
}

- ***POST /campaigns/{campaign_id}/candidates/upload also supports .csv files now, so use same endpoint for spreadsheets***


**Endpoint:-**
GET /campaigns/{campaign_id}/candidates
get all candidates in a campaign

**Response Body-**
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "campaign_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string",
    "email": "string",
    "phone": "string",
    "file_url": "string",
    "ingestion_item_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "extracted_fields": {
      "additionalProp1": {}
    },
    "workflow_step": "string",
    "step_status": "PENDING",
    "created_at": "2026-09-27T13:23:51.005Z",
    "updated_at": "2026-09-27T13:23:51.005Z"
  }
]

**Endpoint:-**
PATCH /campaigns/{campaign_id}/candidates/{candidate_id}
update a candidate's details

**Request Body-**
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "extracted_fields": {
    "additionalProp1": {}
  }
}

**Response Body-**
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "campaign_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "string",
  "email": "string",
  "phone": "string",
  "file_url": "string",
  "ingestion_item_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "extracted_fields": {
    "additionalProp1": {}
  },
  "workflow_step": "string",
  "step_status": "PENDING",
  "created_at": "2026-09-27T14:08:02.858Z",
  "updated_at": "2026-09-27T14:08:02.858Z"
}

**Endpoint:-**
POST /campaigns/{campaign_id}/candidates/screen
screen candidates profiles

**Request Body-**
{
  "candidate_ids": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  ]
}

**Response Body-**
{
  "batch_id": "string",
  "status": "string"
}

**Endpoint:-**
GET /api/v1/campaigns/{campaign_id}/candidates/screen/{batch_id}/status
candidates screening status

**Response Body-**
{
  "batch_id": "string",
  "status": "string",
  "total_candidates": 0,
  "processed": 0,
  "failed": 0,
  "created_at": "string",
  "updated_at": "string",
  "finished_at": "string",
  "failed_candidates": [
    "string"
  ]
}

**Endpoint:-**
POST /campaigns/{campaign_id}/candidates/call
call candidate profiles

**Request Body-**
{
  "candidate_ids": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  ]
}

**Response Body-**
{
  "batch_id": "string",
  "status": "string"
}

**Endpoint:-**
POST /campaigns/{campaign_id}/candidates/call/{batch_id}/status
call candidate profiles status

**Response Body-**
{
  "batch_id": "string",
  "status": "string",
  "total_candidates": 0,
  "processed": 0,
  "failed": 0,
  "created_at": "string",
  "updated_at": "string",
  "finished_at": "string",
  "failed_candidates": [
    "string"
  ]
}
