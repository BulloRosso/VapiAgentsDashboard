
# API Documentation

## Calls

### GET /api/calls
Retrieves all calls.

**Response**: Array of call objects

### POST /api/calls
Creates a new call.

**Request Body**: Must conform to `insertCallSchema`  
**Response**: Created call object

## Scheduled Calls

### GET /api/scheduled-calls-today
Retrieves all scheduled calls for the current day.

**Response**: Array of scheduled call objects
```ts
{
  id: number,
  created_at: string,
  agent_name: string,
  call_time: string,
  topic: string,
  phone_number: string,
  customer_name: string
}
```

### POST /api/scheduled-calls
Creates a new scheduled call.

**Request Body**: Must conform to `scheduledCall` schema  
**Response**: Created scheduled call object

### PUT /api/scheduled-calls/:id
Updates an existing scheduled call.

**Parameters**:
- `id`: Scheduled call ID

**Request Body**: Must conform to `scheduledCall` schema  
**Response**: Updated scheduled call object

### DELETE /api/scheduled-calls/:id
Deletes a scheduled call.

**Parameters**:
- `id`: Scheduled call ID

**Response**: 204 No Content

## Agents

### GET /api/agents
Retrieves all agents.

**Response**: Array of agent objects
```ts
{
  id: number,
  created_at: string,
  agent_id: string,
  name: string,
  image_url: string | null
}
```

## Logs

### GET /api/logs
Retrieves all logs.

**Response**: Array of log objects with mapped status values:
- 'in-progress' → 'in_call'
- 'queued' → 'scheduled'
- 'forwarding' → 'in_call'
- 'ended' → 'finished'

## Webhook

### POST /api/webhook
Handles VAPI webhook events.

**Request Body**: Must conform to `messageSchema`  
**Response**: Updated log object

Handles two types of messages:
1. status-update
2. end-of-call-report

## Costs

### GET /api/costs-today
Retrieves total costs for the current day.

**Response**:
```ts
{
  total: number
}
```

## Cron Configuration

### GET /api/cron/config
Retrieves current cron configuration.

**Response**: Current cron configuration object

### POST /api/cron/config
Updates cron configuration.

**Request Body**:
```ts
{
  schedule?: string,
  endpoint?: string,
  enabled?: boolean
}
```
**Response**: Success message
