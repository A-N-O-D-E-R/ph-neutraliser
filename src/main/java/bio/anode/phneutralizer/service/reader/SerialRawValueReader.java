package bio.anode.phneutralizer.service.reader;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import com.anode.modbus.ModbusIOService;

import bio.anode.phneutralizer.model.connection.ConnectionParameters;
import bio.anode.phneutralizer.model.connection.ModbusConnectionParameters;
import bio.anode.phneutralizer.model.connection.SystemConnectionParameters;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Profile("!test & !local")
public class SerialRawValueReader implements RawValueReader {

    private final ModbusIOService modbus;
    private final MeterRegistry meterRegistry;


    @Override
    public Object read(ConnectionParameters parameters) throws Exception {
        return switch (parameters) {
            case ModbusConnectionParameters modbusParams ->
                    modbus.readHoldingRegisters(
                            modbusParams.getName(),
                            modbusParams.getSlaveId(),
                            modbusParams.getOffset()
                    );
            case SystemConnectionParameters systemParams -> 
                meterRegistry
                    .get(systemParams.getMetricName())
                    .tag("id", systemParams.getPoolName())
                    .gauge()
                    .value();
            default -> throw new IllegalArgumentException("Unsupported connection parameters type: " + parameters.getClass().getName());
        };
    }
}
