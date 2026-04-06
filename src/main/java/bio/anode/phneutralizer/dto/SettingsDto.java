package bio.anode.phneutralizer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsDto {
    private String systemName;
    private String location;
    private String networkMode;
    private String ipAddress;
    private String subnetMask;
    private String gateway;
    private String dns1;
    private String dns2;
    private String hostname;
    private String timezone;
    private String ntpServer;
    private String authMethod;
    private String oauth2Url;
    private String oauth2ClientId;
    private String oauth2ClientSecret;
    private String credUsername;
    private String credPassword;
    private boolean teamsEnabled;
    private String teamsWebhook;
    private boolean slackEnabled;
    private String slackWebhook;
    private boolean telegramEnabled;
    private String telegramBotToken;
    private String telegramChatId;
    private String zabbixUrl;
    private String zabbixApiToken;
    private String zabbixHost;
}
