import { LogIn } from "lucide-react";
import { Button } from "../ui/button";

export default function OAuth2Form({ onLogin, providerUrl }: { onLogin: () => void; providerUrl: string }) {
  const label = providerUrl
    ? `Sign in with ${new URL(providerUrl).hostname}`
    : "Sign in with SSO"

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        This application uses OAuth2 / SSO authentication.
      </p>
      <Button className="w-full" onClick={onLogin}>
        <LogIn className="h-4 w-4 mr-2" />
        {label}
      </Button>
    </div>
  )
}
