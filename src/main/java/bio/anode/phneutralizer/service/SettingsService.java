package bio.anode.phneutralizer.service;

import bio.anode.phneutralizer.dto.SettingsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.refresh.ContextRefresher;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class SettingsService {

    private static final Path SETTINGS_FILE = Path.of("application-custom.yaml");
    private static final String SETTINGS_KEY = "settings";

    private final ObjectMapper objectMapper;

    @Autowired
    private ContextRefresher contextRefresher;

    public SettingsDto getSettings() {
        if (!Files.exists(SETTINGS_FILE)) {
            return new SettingsDto();
        }
        try (InputStream in = Files.newInputStream(SETTINGS_FILE)) {
            Yaml yaml = new Yaml();
            Map<String, Object> root = yaml.load(in);
            if (root == null || !root.containsKey(SETTINGS_KEY)) {
                return new SettingsDto();
            }

            return objectMapper.convertValue(root.get(SETTINGS_KEY), SettingsDto.class);
        
        } catch (Exception e) {
            log.error("Failed to load settings from {}", SETTINGS_FILE, e);
            return new SettingsDto();
        }
    }

    public void saveSettings(SettingsDto settings) {
        try {
            Map<String, Object> data = objectMapper.convertValue(settings, new TypeReference<>() {});
            Map<String, Object> root = Map.of(SETTINGS_KEY, data);

            DumperOptions opts = new DumperOptions();
            opts.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
            opts.setPrettyFlow(true);
            Yaml yaml = new Yaml(opts);

            Files.writeString(SETTINGS_FILE, yaml.dump(root));
            log.info("Settings saved to {}", SETTINGS_FILE);
            contextRefresher.refresh();
        } catch (Exception e) {
            log.error("Failed to save settings to {}", SETTINGS_FILE, e);
            throw new RuntimeException("Failed to save settings", e);
        }
    }
}
