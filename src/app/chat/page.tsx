import { Card, CardContent } from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Chat</h1>
        <p className="text-muted-foreground">
          Project-wide chat with @mentions and voice messages.
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-24">
          <p className="text-muted-foreground">Chat coming soon.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This page will show project conversations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
