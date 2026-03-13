
import { RefreshCw, WifiOff } from "lucide-react";
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button";

export default function NetworkConnectionErrorCard({error,refetch}: { error: Error, refetch: () => void }) {
    return (
            <Card className="rounded-2xl border-red-200 dark:border-red-900 max-w-md w-full">
              <CardContent className="p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                  <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="font-semibold text-lg">Connection Error</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Retry
                </Button>
              </CardContent>
            </Card>
    );
}
            