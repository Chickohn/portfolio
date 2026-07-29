"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { VictoriaMessage, VictoriaUsername } from "@/lib/victoria/types";

type Props = {
  initialMessages: VictoriaMessage[];
  currentUsername: VictoriaUsername;
  realtimeEnabled: boolean;
};

type BrowserRealtimeChannel = {
  subscribe: (event: string, callback: (message: { data: VictoriaMessage }) => void) => void;
  unsubscribe: () => void;
};

type BrowserRealtimeClient = {
  channels: {
    get: (name: string) => BrowserRealtimeChannel;
  };
  close: () => void;
};

declare global {
  interface Window {
    Ably?: {
      Realtime: new (options: { authUrl: string }) => BrowserRealtimeClient;
    };
  }
}

function makeNonce() {
  return crypto.randomUUID();
}

export function VictoriaMessageWall({ initialMessages, currentUsername, realtimeEnabled }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!realtimeEnabled) {
      return undefined;
    }

    let client: BrowserRealtimeClient | null = null;
    let channel: BrowserRealtimeChannel | null = null;
    let active = true;

    const start = () => {
      if (!active || !window.Ably) return;
      client = new window.Ably.Realtime({ authUrl: "/api/victoria/realtime/auth" });
      channel = client.channels.get("private:two-notes");
      channel.subscribe("message.created", (event: { data: VictoriaMessage }) => {
        const message = event.data;
        setMessages((current) => (current.some((item) => item.id === message.id) ? current : [...current, message]));
        if (message.authorUsername !== currentUsername && liveRef.current) {
          liveRef.current.textContent = `New note from ${message.authorDisplayName}`;
        }
      });
    };

    if (window.Ably) {
      start();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.ably.com/lib/ably.min-2.js";
      script.async = true;
      script.onload = start;
      document.head.appendChild(script);
    }

    return () => {
      active = false;
      channel?.unsubscribe();
      client?.close();
    };
  }, [currentUsername, realtimeEnabled]);

  const canSend = useMemo(() => body.trim().length > 0 && body.trim().length <= 2000, [body]);

  function sendMessage() {
    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }

    setError(null);
    const optimisticId = `optimistic-${makeNonce()}`;
    const createdAt = new Date().toISOString();
    setBody("");
    setMessages((current) => [
      ...current,
      {
        id: optimisticId,
        authorUserId: "current",
        authorUsername: currentUsername,
        authorDisplayName: currentUsername === "freddie" ? "Freddie" : "Victoria",
        body: trimmed,
        createdAt,
      },
    ]);

    startTransition(async () => {
      const response = await fetch("/api/victoria/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: trimmed, clientNonce: makeNonce() }),
      });

      if (!response.ok) {
        setError("That note could not be saved. Try again in a moment.");
        setMessages((current) => current.filter((message) => message.id !== optimisticId));
        setBody(trimmed);
        return;
      }

      const data = (await response.json()) as { message: VictoriaMessage };
      setMessages((current) => current.map((message) => (message.id === optimisticId ? data.message : message)));
    });
  }

  return (
    <section className="rounded-[2rem] border border-white/45 bg-white/70 p-5 shadow-xl backdrop-blur md:p-7" aria-labelledby="message-wall-heading">
      <div className="mb-4">
        <h2 id="message-wall-heading" className="text-xl font-semibold text-stone-950">
          Notes for later
        </h2>
        <p className="text-sm text-stone-600">A private wall for small messages. Nothing here is sent to public analytics.</p>
      </div>
      <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-4 text-sm text-stone-600">
            No notes yet. Leave the first one whenever it feels right.
          </p>
        ) : (
          messages.map((message) => {
            const mine = message.authorUsername === currentUsername;
            return (
              <article key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[86%] rounded-3xl px-4 py-3 ${mine ? "bg-stone-950 text-white" : "bg-rose-100 text-stone-900"}`}>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>
                  <p className={`mt-2 text-[0.7rem] ${mine ? "text-white/65" : "text-stone-500"}`}>
                    {message.authorDisplayName} ·{" "}
                    {new Date(message.createdAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Europe/London",
                    })}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>
      <div ref={liveRef} className="sr-only" aria-live="polite" />
      <div className="mt-4 space-y-2">
        <label htmlFor="victoria-note" className="sr-only">
          Leave a note
        </label>
        <textarea
          id="victoria-note"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              sendMessage();
            }
          }}
          maxLength={2000}
          rows={3}
          className="w-full resize-none rounded-3xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-950 shadow-inner outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
          placeholder="Leave a small note..."
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-stone-500">{body.length}/2000</p>
          <Button type="button" onClick={sendMessage} disabled={!canSend || isPending} className="rounded-full bg-rose-700 text-white hover:bg-rose-800">
            <Send aria-hidden className="h-4 w-4" />
            Send
          </Button>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
    </section>
  );
}
