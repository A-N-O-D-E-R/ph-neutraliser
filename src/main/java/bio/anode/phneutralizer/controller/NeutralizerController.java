package bio.anode.phneutralizer.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import bio.anode.phneutralizer.dto.*;
import bio.anode.phneutralizer.service.NeutralizerService;

@RestController
@RequestMapping("/control")
@Tag(name = "Neutralizer Control", description = "APIs for controlling the pH neutralization system")
public class NeutralizerController {

    private static final Logger log = LoggerFactory.getLogger(NeutralizerController.class);

    private final NeutralizerService neutralizerService;

    public NeutralizerController(NeutralizerService neutralizerService) {
        this.neutralizerService = neutralizerService;
    }

    @GetMapping("/status")
    @Operation(summary = "Get current status", description = "Returns the current status of the neutralizer including pH, temperature, levels, and configuration")
    public ResponseEntity<ApiResponse<NeutralizerStatusResponse>> getStatus() {
        log.debug("GET /control/status");
        NeutralizerStatusResponse status = neutralizerService.getStatus();
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @GetMapping("/configuration")
    @Operation(summary = "Get configuration", description = "Returns the current configuration of the neutralizer")
    public ResponseEntity<ApiResponse<NeutralizerConfiguration>> getConfiguration() {
        log.debug("GET /control/configuration");
        NeutralizerConfiguration config = neutralizerService.getConfiguration();
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @PutMapping("/configuration")
    @Operation(summary = "Update configuration", description = "Updates the neutralizer configuration parameters")
    public ResponseEntity<ApiResponse<Void>> updateConfiguration(
            @Valid @RequestBody NeutralizerConfiguration configuration) {
        log.info("PUT /control/configuration");
        neutralizerService.updateConfiguration(configuration);
        return ResponseEntity.ok(ApiResponse.success("Configuration updated successfully"));
    }

    @PostMapping("/start")
    @Operation(summary = "Start automatic mode", description = "Sets the neutralizer to automatic mode")
    public ResponseEntity<ApiResponse<Void>> startAutomaticMode() {
        log.info("POST /control/start");
        neutralizerService.startAutomaticMode();
        return ResponseEntity.ok(ApiResponse.success("Automatic mode started"));
    }

    @PostMapping("/stop")
    @Operation(summary = "Stop automatic mode", description = "Sets the neutralizer to manual mode")
    public ResponseEntity<ApiResponse<Void>> stopAutomaticMode() {
        log.info("POST /control/stop");
        neutralizerService.stopAutomaticMode();
        return ResponseEntity.ok(ApiResponse.success("Switched to manual mode"));
    }

    @PostMapping("/trigger")
    @Operation(summary = "Trigger neutralization", description = "Manually triggers a neutralization cycle")
    public ResponseEntity<ApiResponse<Void>> triggerNeutralization() {
        log.info("POST /control/trigger");
        neutralizerService.triggerNeutralization();
        return ResponseEntity.ok(ApiResponse.success("Neutralization triggered"));
    }

    @PostMapping("/empty-tank1")
    @Operation(summary = "Empty waste tank 1", description = "Manually empties waste tank 1")
    public ResponseEntity<ApiResponse<Void>> emptyTank1(
            @RequestBody(required = false) ManualControlRequest request) {
        log.info("POST /control/empty-tank1");
        int duration = (request != null && request.getDuration() != null) ? request.getDuration() : 5;
        neutralizerService.emptyTank1(duration);
        return ResponseEntity.ok(ApiResponse.success("Tank 1 emptying started"));
    }

    @PostMapping("/empty-tank2")
    @Operation(summary = "Empty waste tank 2", description = "Manually empties waste tank 2")
    public ResponseEntity<ApiResponse<Void>> emptyTank2(
            @RequestBody(required = false) ManualControlRequest request) {
        log.info("POST /control/empty-tank2");
        int duration = (request != null && request.getDuration() != null) ? request.getDuration() : 5;
        neutralizerService.emptyTank2(duration);
        return ResponseEntity.ok(ApiResponse.success("Tank 2 emptying started"));
    }

    @PostMapping("/empty-neutralizer")
    @Operation(summary = "Empty neutralizer tank", description = "Manually empties the neutralizer tank")
    public ResponseEntity<ApiResponse<Void>> emptyNeutralizer(
            @RequestBody(required = false) ManualControlRequest request) {
        log.info("POST /control/empty-neutralizer");
        int duration = (request != null && request.getDuration() != null) ? request.getDuration() : 5;
        neutralizerService.emptyNeutralizer(duration);
        return ResponseEntity.ok(ApiResponse.success("Neutralizer emptying started"));
    }

    @PostMapping("/acid-pump")
    @Operation(summary = "Activate acid pump", description = "Manually activates the acid pump")
    public ResponseEntity<ApiResponse<Void>> activateAcidPump(
            @RequestBody(required = false) ManualControlRequest request) {
        log.info("POST /control/acid-pump");
        int timing = (request != null && request.getTiming() != null) ? request.getTiming() : 10;
        neutralizerService.activateAcidPump(timing);
        return ResponseEntity.ok(ApiResponse.success("Acid pump activated"));
    }

    @PostMapping("/agitation")
    @Operation(summary = "Activate agitation", description = "Manually activates agitation")
    public ResponseEntity<ApiResponse<Void>> activateAgitation(
            @RequestBody(required = false) ManualControlRequest request) {
        log.info("POST /control/agitation");
        int period = (request != null && request.getPeriod() != null) ? request.getPeriod() : 3;
        neutralizerService.activateAgitation(period);
        return ResponseEntity.ok(ApiResponse.success("Agitation activated"));
    }

    @PostMapping("/calibrate")
    @Operation(summary = "Calibrate pH sensor", description = "Calibrates the pH sensor at a specific point (LOW, MID, or HIGH)")
    public ResponseEntity<ApiResponse<Void>> calibratePh(
            @Valid @RequestBody CalibrationRequest request) {
        log.info("POST /control/calibrate");
        neutralizerService.calibratePh(request);
        return ResponseEntity.ok(ApiResponse.success("pH calibration completed for " + request.getPoint() + " point"));
    }

    @GetMapping("/hardware")
    @Operation(summary = "Get hardware status", description = "Returns the hardware connection status and device information")
    public ResponseEntity<ApiResponse<HardwareStatusResponse>> getHardwareStatus() {
        log.debug("GET /control/hardware");
        HardwareStatusResponse status = neutralizerService.getHardwareStatus();
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @PostMapping("/sync-time")
    @Operation(summary = "Synchronize time", description = "Synchronizes the device clock with the server time")
    public ResponseEntity<ApiResponse<Void>> synchronizeTime() {
        log.info("POST /control/sync-time");
        neutralizerService.synchronizeTime();
        return ResponseEntity.ok(ApiResponse.success("Device time synchronized"));
    }
}
