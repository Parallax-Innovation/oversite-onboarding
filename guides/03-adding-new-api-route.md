# Adding a New API Route

## File Location

API routes live in `src/app/api/`. Next.js App Router uses file-based routing.

```
src/app/api/
  events/route.ts         -> /api/events
  agent/
    chat/route.ts         -> /api/agent/chat
    health/route.ts       -> /api/agent/health
  contractors/
    route.ts              -> /api/contractors
    upload/route.ts       -> /api/contractors/upload
```

## Basic Route Template

Create `src/app/api/your-endpoint/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("your_table")
      .select("*");

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.requiredField) {
      return NextResponse.json(
        { error: "requiredField is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("your_table")
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Using Supabase Client

Import from lib:

```typescript
import { supabase } from "@/lib/supabase";

// Query
const { data, error } = await supabase
  .from("events")
  .select("*")
  .eq("session_id", sessionId)
  .order("timestamp", { ascending: true });

// Insert
const { data, error } = await supabase
  .from("events")
  .insert({ type: "my_event", payload: { ... } });

// Update
const { data, error } = await supabase
  .from("records")
  .update({ status: "completed" })
  .eq("id", recordId);
```

## Dynamic Routes

For routes with parameters like `/api/sessions/[sessionId]`:

Create `src/app/api/sessions/[sessionId]/route.ts`:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  // use sessionId
}
```

## Testing Your Route

```bash
# GET
curl http://localhost:3000/api/your-endpoint

# POST
curl -X POST http://localhost:3000/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'
```
