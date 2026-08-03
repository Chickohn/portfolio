"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VICTORIA_MESSAGE_LIMIT } from "@/lib/victoria/constants";
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

/** Built once, not per message per render. See lib/victoria/dates.ts. */
const timestampFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/London",
});

function makeNonce() {
  return crypto.randomUUID();
}

const MessageBubble = memo(function MessageBubble({ message, mine }: { message: VictoriaMessage; mine: boolean }) {
  return (
    <article className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[86%] rounded-3xl px-4 py-3 ${mine ? "bg-stone-950 text-white" : "bg-rose-100 text-stone-900"}`}>
        <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>
        <p className={`mt-2 text-[0.7rem] ${mine ? "text-white/65" : "text-stone-500"}`}>
          {message.authorDisplayName} · {timestampFormatter.format(new Date(message.createdAt))}
        </p>
      </div>
    </article>
  );
});

/**
 * The composer owns its own draft state.
 *
 * When `body` lived in VictoriaMessageWall, every keystroke re-rendered all 30
 * message bubbles and re-formatted all 30 timestamps. Keeping the draft here means
 * typing only re-renders this subtree.
 */
const MessageComposer = memo(function MessageComposer({
  onSend,
  error,
}: {
  onSend: (body: string) => Promise<boolean>;
  error: string | null;
}) {
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const trimmed = body.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= VICTORIA_MESSAGE_LIMIT;

  function submit() {
    if (!canSend || isSending) {
      return;
    }
    setBody("");
    setIsSending(true);
    onSend(trimmed)
      // Put the draft back rather than losing what they typed.
      .then((sent) => {
        if (!sent) setBody(trimmed);
      })
      .finally(() => setIsSending(false));
  }

  return (
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
            submit();
          }
        }}
        maxLength={VICTORIA_MESSAGE_LIMIT}
        rows={3}
        className="w-full resize-none rounded-3xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-950 shadow-inner outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
        placeholder="Leave a message..."
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500">
          {body.length}/{VICTORIA_MESSAGE_LIMIT}
        </p>
        <Button
          type="button"
          onClick={submit}
          disabled={!canSend || isSending}
          className="rounded-full bg-rose-700 text-white hover:bg-rose-800"
        >
          <Send aria-hidden className="h-4 w-4" />
          Send
        </Button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
});

export function VictoriaMessageWall({ initialMessages, currentUsername, realtimeEnabled }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Only connect once the wall is actually on screen — the Ably bundle is ~85KB
  // gzipped from a third-party CDN and opens a WebSocket as soon as it loads.
  const [shouldConnect, setShouldConnect] = useState(false);

  function scrollListToBottom() {
    const list = listRef.current;
    if (!list) {
      return;
    }
    list.scrollTop = list.scrollHeight;
  }

  // Pin to the newest notes on first paint. Double rAF waits until the bubbles
  // have laid out (esp. on mobile after hydrate), otherwise scrollHeight can
  // still be the empty-container height.
  useEffect(() => {
    let cancelled = false;
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => {
        if (!cancelled) {
          scrollListToBottom();
        }
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, []);

  useEffect(() => {
    scrollListToBottom();
  }, [messages]);

  useEffect(() => {
    if (!realtimeEnabled || shouldConnect) {
      return undefined;
    }

    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      setShouldConnect(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldConnect(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [realtimeEnabled, shouldConnect]);

  useEffect(() => {
    if (!realtimeEnabled || !shouldConnect) {
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

        // The sender already has their own message via the optimistic update and
        // the POST response (see sendMessage below), which is why this handler
        // used to duplicate it: the realtime echo carries the real server id,
        // which never matches the client's `optimistic-...` placeholder, so the
        // id-based dedupe below let it through as a second, separate bubble.
        // Only the *other* participant's tabs need this event.
        if (message.authorUsername === currentUsername) {
          return;
        }

        setMessages((current) => (current.some((item) => item.id === message.id) ? current : [...current, message]));
        if (liveRef.current) {
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
  }, [currentUsername, realtimeEnabled, shouldConnect]);

  const sendMessage = useCallback(
    async (trimmed: string) => {
      setError(null);
      const optimisticId = `optimistic-${makeNonce()}`;
      setMessages((current) => [
        ...current,
        {
          id: optimisticId,
          authorUserId: "current",
          authorUsername: currentUsername,
          authorDisplayName: currentUsername === "freddie" ? "Freddie" : "Victoria",
          body: trimmed,
          createdAt: new Date().toISOString(),
        },
      ]);

      const rollback = () => {
        setError("That note could not be saved. Try again in a moment.");
        setMessages((current) => current.filter((message) => message.id !== optimisticId));
        return false;
      };

      try {
        const response = await fetch("/api/victoria/messages", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ body: trimmed, clientNonce: makeNonce() }),
        });

        if (!response.ok) {
          return rollback();
        }

        const data = (await response.json()) as { message: VictoriaMessage };
        setMessages((current) => current.map((message) => (message.id === optimisticId ? data.message : message)));
        return true;
      } catch {
        return rollback();
      }
    },
    [currentUsername],
  );

  return (
    <section
      ref={sectionRef}
      className="rounded-[2rem] border border-white/45 bg-white/70 p-5 shadow-xl md:p-7"
      aria-labelledby="message-wall-heading"
    >
      <div className="mb-4">
        <h2 id="message-wall-heading" className="text-xl font-semibold text-stone-950">
          Messages
        </h2>
        <p className="text-sm text-stone-600">In case you want to send me a message I can find later</p>
      </div>
      <div ref={listRef} className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-4 text-sm text-stone-600">
            No notes yet.
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} mine={message.authorUsername === currentUsername} />
          ))
        )}
      </div>
      <div ref={liveRef} className="sr-only" aria-live="polite" />
      <MessageComposer onSend={sendMessage} error={error} />
    </section>
  );
}
