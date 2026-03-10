# Adding a Dashboard Feature

## Dashboard Structure

The dashboard lives in `src/app/dashboard/`:

```
src/app/dashboard/
  page.tsx                    # Sessions list
  [sessionId]/page.tsx        # Session detail
  setup/page.tsx              # CSV upload for project data
```

Components are in `src/components/dashboard/`.

## Adding a New Dashboard Page

1. Create the route file:

```typescript
// src/app/dashboard/my-feature/page.tsx

import { fetchMyData } from "@/lib/queries";

export default async function MyFeaturePage() {
  const data = await fetchMyData();

  return (
    <div className="mx-auto px-6 md:px-[5.58vw] py-8">
      <h1 className="font-serif text-[36px] leading-[36px] tracking-[-1.12px] text-[#0e0d0c]">
        My Feature
      </h1>

      {/* Your content */}
    </div>
  );
}
```

2. Add query function in `src/lib/queries.ts`:

```typescript
export async function fetchMyData() {
  const { data, error } = await supabase
    .from("my_table")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  }

  return data;
}
```

## Dashboard Styling Conventions

**Colors:**
- Primary text: `text-[#0e0d0c]`
- Muted text: `text-[#858484]` or `text-[#0e0d0c]/60`
- Accent: `text-[#FF3E1A]`
- Background: `#fcfcfc`
- Borders: `border-[#d9d9d9]` or `border-[#d9d9d9]/40`

**Typography:**
- Headings: `font-serif` with negative tracking
- Body: `font-sans`
- Sizes: 14px for body, 24-56px for headings

**Spacing:**
- Container: `px-6 md:px-[5.58vw]`
- Sections: `pt-[80px] md:pt-[164px]`
- Between elements: `mt-4`, `mt-8`, `gap-4`, `gap-8`

## Adding a Component

Create in `src/components/dashboard/`:

```typescript
// src/components/dashboard/my-component.tsx

interface MyComponentProps {
  data: MyData;
}

export function MyComponent({ data }: MyComponentProps) {
  return (
    <div className="border border-[#d9d9d9]/40 px-6 py-6">
      <p className="text-[14px] tracking-[-0.28px] text-[#0e0d0c]">
        {data.title}
      </p>
    </div>
  );
}
```

## Real-time Updates

For real-time data (like event streams), use Supabase subscriptions:

```typescript
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function LiveEvents({ sessionId }: { sessionId: string }) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel(`events-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "events",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setEvents((prev) => [...prev, payload.new as Event]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return (
    <div>
      {events.map((e) => (
        <div key={e.id}>{e.type}</div>
      ))}
    </div>
  );
}
```
