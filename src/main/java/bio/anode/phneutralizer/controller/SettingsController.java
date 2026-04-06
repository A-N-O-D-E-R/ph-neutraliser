package bio.anode.phneutralizer.controller;

import bio.anode.phneutralizer.dto.ApiResponse;
import bio.anode.phneutralizer.dto.SettingsDto;
import bio.anode.phneutralizer.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "APIs for managing application settings")
public class SettingsController {

    private static final Logger log = LoggerFactory.getLogger(SettingsController.class);

    private final SettingsService settingsService;

    @GetMapping
    @Operation(summary = "Get settings", description = "Returns the current application settings")
    public ResponseEntity<ApiResponse<SettingsDto>> getSettings() {
        log.debug("GET /settings");
        return ResponseEntity.ok(ApiResponse.success(settingsService.getSettings()));
    }

    @PutMapping
    @Operation(summary = "Save settings", description = "Persists application settings to application-custom.yaml")
    public ResponseEntity<ApiResponse<Void>> saveSettings(@RequestBody SettingsDto settings) {
        log.info("PUT /settings");
        settingsService.saveSettings(settings);
        return ResponseEntity.ok(ApiResponse.success("Settings saved"));
    }
}
