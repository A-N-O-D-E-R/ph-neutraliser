import { useAuth } from "../../hooks/use-auth"
import CredentialsForm from "../login/CredentialsForm"
import OAuth2Form from "../login/OAuth2Form"
import { Card, CardContent } from "../ui/card"


export function LoginPage() {
  const { authMethod, oauth2Url, login, loginOAuth2 } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">pH Neutralizer</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {authMethod === "oauth2" && oauth2Url
              ? <OAuth2Form onLogin={loginOAuth2} providerUrl={oauth2Url} />
              : <CredentialsForm onLogin={login} />
            }
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
