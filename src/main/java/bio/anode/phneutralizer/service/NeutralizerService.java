package bio.anode.phneutralizer.service;

import bio.anode.phneutralizer.dto.CalibrationRequest;
import bio.anode.phneutralizer.dto.HardwareStatusResponse;
import bio.anode.phneutralizer.dto.NeutralizerConfiguration;
import bio.anode.phneutralizer.dto.NeutralizerStatusResponse;

public interface NeutralizerService {

    NeutralizerStatusResponse getStatus();

    NeutralizerConfiguration getConfiguration();

    void updateConfiguration(NeutralizerConfiguration configuration);

    void startAutomaticMode();

    void stopAutomaticMode();

    void triggerNeutralization();

    void emptyTank1(int duration);

    void emptyTank2(int duration);

    void emptyNeutralizer(int duration);

    void activateAcidPump(int timing);

    void activateAgitation(int period);

    void calibratePh(CalibrationRequest request);

    HardwareStatusResponse getHardwareStatus();

    void synchronizeTime();
}
