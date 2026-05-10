"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Something went wrong during sign in. Please try again.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => (window.location.href = "/login")}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Browse Map
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
