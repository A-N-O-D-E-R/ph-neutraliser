import { Settings } from "../../types"
import { Field, PasswordInput, SectionHeader } from "./Section"
import { Card, CardContent } from "../ui/card"
import { MessageSquare } from "lucide-react"
import MessagingCard from "../card/MessagingCard"
import { SlackIcon, TeamsIcon, TelegramIcon } from "../ui/icons"
import { Input } from "../ui/input"

export default function MessagingSection({
  settings,
  update,
}: {
  settings: Settings
  update: (partial: Partial<Settings>) => void
}) {
  return (
    <Card>
      <SectionHeader
        icon={<MessageSquare className="h-5 w-5" />}
        title="Messaging"
        description="Configure notification channels for alerts and events"
      />
      <CardContent className="pt-6 space-y-3">
        <MessagingCard
          title="Microsoft Teams"
          icon={<TeamsIcon />}
          enabled={settings.teamsEnabled}
          onToggle={() => update({ teamsEnabled: !settings.teamsEnabled })}
        >
          <Field label="Incoming Webhook URL">
            <Input
              value={settings.teamsWebhook}
              onChange={e => update({ teamsWebhook: e.target.value })}
              placeholder="https://outlook.office.com/webhook/..."
            />
          </Field>
        </MessagingCard>

        <MessagingCard
          title="Slack"
          icon={<SlackIcon />}
          enabled={settings.slackEnabled}
          onToggle={() => update({ slackEnabled: !settings.slackEnabled })}
        >
          <Field label="Incoming Webhook URL">
            <Input
              value={settings.slackWebhook}
              onChange={e => update({ slackWebhook: e.target.value })}
              placeholder="https://hooks.slack.com/services/..."
            />
          </Field>
        </MessagingCard>

        <MessagingCard
          title="Telegram"
          icon={<TelegramIcon />}
          enabled={settings.telegramEnabled}
          onToggle={() => update({ telegramEnabled: !settings.telegramEnabled })}
        >
          <Field label="Bot Token">
            <PasswordInput
              value={settings.telegramBotToken}
              onChange={v => update({ telegramBotToken: v })}
              placeholder="123456:ABCdef..."
            />
          </Field>
          <Field label="Chat ID">
            <Input
              value={settings.telegramChatId}
              onChange={e => update({ telegramChatId: e.target.value })}
              placeholder="-100123456789"
            />
          </Field>
        </MessagingCard>
      </CardContent>
    </Card>
  )
}
