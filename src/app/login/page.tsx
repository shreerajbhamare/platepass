"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🍽️</div>
          <CardTitle className="text-3xl font-bold text-green-700">PlatePass</CardTitle>
          <CardDescription className="text-base mt-2">
            The &ldquo;unfair advantage&rdquo; is knowing someone with extra food.
            <br />
            <span className="font-medium text-foreground">Now everyone has it.</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* How it works */}
          <div className="grid grid-cols-3 gap-2 py-3 text-center">
            <div>
              <p className="text-2xl">📸</p>
              <p className="text-xs text-muted-foreground mt-1">Snap a photo</p>
            </div>
            <div>
              <p className="text-2xl">📍</p>
              <p className="text-xs text-muted-foreground mt-1">Pin on map</p>
            </div>
            <div>
              <p className="text-2xl">🤝</p>
              <p className="text-xs text-muted-foreground mt-1">Feed someone</p>
            </div>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            className="w-full h-12 text-base cursor-pointer"
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No sign-up needed. Browse anonymously anytime.
          </p>
          <a
            href="/"
            className="w-full inline-flex items-center justify-center h-10 px-4 rounded-lg text-sm font-medium bg-green-700 text-white hover:bg-green-800 transition-colors"
          >
            Browse Food Map
          </a>
        </CardContent>
      </Card>

      {/* Stats teaser */}
      <div className="mt-6 flex gap-6 text-center text-sm text-muted-foreground">
        <div>
          <p className="text-lg font-bold text-green-700">2.5kg</p>
          <p>CO2 saved per meal</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-700">15min</p>
          <p>avg claim-to-pickup</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-700">$0</p>
          <p>always free</p>
        </div>
      </div>
    </div>
  );
}
