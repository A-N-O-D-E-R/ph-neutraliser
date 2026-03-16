import { Settings } from "../types"

export const TIMEZONES = [
  "UTC",
  "Europe/Paris", "Europe/London", "Europe/Berlin", "Europe/Madrid", "Europe/Rome",
  "Europe/Amsterdam", "Europe/Brussels", "Europe/Zurich", "Europe/Warsaw", "Europe/Prague",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Sao_Paulo", "America/Mexico_City", "America/Toronto", "America/Vancouver",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore",
  "Asia/Seoul", "Asia/Taipei", "Asia/Bangkok",
  "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland",
  "Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos",
]

export const STORAGE_KEYS = {
  SETTINGS: "app-settings",
  USERS: "app-users",
  SESSION: "app-session",
  THEME: "theme",
} as const


export const DEFAULT_SETTINGS: Settings = {
  systemName: "",
  location: "",
  networkMode: "dhcp",
  ipAddress: "",
  subnetMask: "255.255.255.0",
  gateway: "",
  dns1: "",
  dns2: "",
  hostname: "",
  timezone: "UTC",
  ntpServer: "pool.ntp.org",
  authMethod: "credentials",
  oauth2Url: "",
  oauth2ClientId: "",
  oauth2ClientSecret: "",
  credUsername: "",
  credPassword: "",
  teamsEnabled: false,
  teamsWebhook: "",
  slackEnabled: false,
  slackWebhook: "",
  telegramEnabled: false,
  telegramBotToken: "",
  telegramChatId: "",
  zabbixUrl: "",
  zabbixApiToken: "",
  zabbixHost: "",
}