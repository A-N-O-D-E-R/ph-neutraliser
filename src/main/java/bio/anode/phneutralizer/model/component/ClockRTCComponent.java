package bio.anode.phneutralizer.model.component;

import bio.anode.phneutralizer.model.connection.ConnectionParameters;
import bio.anode.phneutralizer.model.connection.ModbusConnectionParameters;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("CLOCK_RTC")
@NoArgsConstructor
public class ClockRTCComponent extends NetworkingComponent {

    // Offsets relative to connectionParameters.offset (= REG_RTC_COMMAND)
    private static final int OFF_TIME_H     = 1; // REG_RTC_TIME_H
    private static final int OFF_TIME_L     = 2; // REG_RTC_TIME_L
    private static final int OFF_SET_TIME_H = 3; // REG_RTC_SET_TIME_H
    private static final int OFF_SET_TIME_L = 4; // REG_RTC_SET_TIME_L

    public ConnectionParameters getCommandRTCSetConnectionParameters() {
        return getConnectionParameters();
    }

    public ConnectionParameters getHighRTCReadConnectionParameters() {
        return atOffset(OFF_TIME_H);
    }

    public ConnectionParameters getLowRTCReadConnectionParameters() {
        return atOffset(OFF_TIME_L);
    }

    public ConnectionParameters getHighRTCSetConnectionParameters() {
        return atOffset(OFF_SET_TIME_H);
    }

    public ConnectionParameters getLowRTCSetConnectionParameters() {
        return atOffset(OFF_SET_TIME_L);
    }

    private ModbusConnectionParameters atOffset(int delta) {
        ModbusConnectionParameters base = (ModbusConnectionParameters) getConnectionParameters();
        return new ModbusConnectionParameters(base.getName(), base.getSlaveId(), base.getOffset() + delta);
    }
}
