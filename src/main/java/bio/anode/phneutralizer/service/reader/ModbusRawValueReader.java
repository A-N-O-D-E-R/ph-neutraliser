package bio.anode.phneutralizer.service.reader;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import com.anode.modbus.ModbusIOService;

import bio.anode.phneutralizer.model.ConnectionParameters;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Profile("!test & !local")
public class ModbusRawValueReader implements RawValueReader {

    private final ModbusIOService modbus;

    @Override
    public Object read(ConnectionParameters parameters) throws Exception {
        return modbus.readHoldingRegisters(
                parameters.getName(),
                parameters.getSlaveId(),
                parameters.getOffset()
        );
    }
}
