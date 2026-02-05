package bio.altar.phneutralizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;

import bio.anode.phneutralizer.controller.NeutralizerController;
import bio.anode.phneutralizer.dto.CalibrationRequest;
import bio.anode.phneutralizer.dto.NeutralizerConfiguration;
import bio.anode.phneutralizer.enums.CalibrationPoint;
import bio.anode.phneutralizer.service.NeutralizerService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NeutralizerController.class)
class NeutralizerControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NeutralizerService neutralizerService;

    @Test
    void getStatus_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/control/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void startAutomaticMode_shouldReturnOk() throws Exception {
        mockMvc.perform(post("/control/start"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Automatic mode started"));
    }

    @Test
    void stopAutomaticMode_shouldReturnOk() throws Exception {
        mockMvc.perform(post("/control/stop"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Switched to manual mode"));
    }

    @Test
    void triggerNeutralization_shouldReturnOk() throws Exception {
        mockMvc.perform(post("/control/trigger"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void updateConfiguration_withValidData_shouldReturnOk() throws Exception {
        NeutralizerConfiguration config = NeutralizerConfiguration.builder()
                .phTarget(7.5)
                .wasteSelect(1)
                .emptyingTank1(5)
                .emptyingTank2(5)
                .emptyingNeutralizer(5)
                .idleTimeBeforeNeutralization(30)
                .neutralizationTimeout(2)
                .neutralizationPeriod(4)
                .acidPulseTiming(10)
                .acidPulsePeriod(3)
                .firstNeutralizationHour(8)
                .build();

        mockMvc.perform(put("/control/configuration")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void updateConfiguration_withInvalidPhTarget_shouldReturnBadRequest() throws Exception {
        NeutralizerConfiguration config = NeutralizerConfiguration.builder()
                .phTarget(15.0) // Invalid: exceeds 9.5
                .build();

        mockMvc.perform(put("/control/configuration")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void calibratePh_withValidData_shouldReturnOk() throws Exception {
        CalibrationRequest request = CalibrationRequest.builder()
                .point(CalibrationPoint.MID)
                .phValue(7.0)
                .build();

        mockMvc.perform(post("/control/calibrate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getHardwareStatus_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/control/hardware"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
