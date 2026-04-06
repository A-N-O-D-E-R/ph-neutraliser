package bio.anode.phneutralizer.service;

import bio.anode.phneutralizer.dto.SettingsDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@Service
public class SettingsService {

    private static final Logger log = LoggerFactory.getLogger(SettingsService.class);
    private static final Path SETTINGS_FILE = Path.of("application-custom.yaml");
    private static final String SETTINGS_KEY = "settings";

    private final ObjectMapper objectMapper;

    public SettingsService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

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
        } catch (Exception e) {
            log.error("Failed to save settings to {}", SETTINGS_FILE, e);
            throw new RuntimeException("Failed to save settings", e);
        }
    }
}
