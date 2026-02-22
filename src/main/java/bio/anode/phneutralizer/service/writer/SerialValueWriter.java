package bio.anode.phneutralizer.service.writer;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import com.anode.modbus.ModbusIOService;

import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.model.connection.ConnectionParameters;
import bio.anode.phneutralizer.model.connection.ModbusConnectionParameters;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Profile("!test & !local")
public class SerialValueWriter implements ValueWriter{
    
    private final ModbusIOService modbusService;

    @Override
    public void write(Object value, ConnectionParameters parameters) throws CommunicationException {
        try{
            switch (parameters) {
                case ModbusConnectionParameters modbusParams ->
                        modbusService.writeHoldingRegisters(
                                modbusParams.getName(),
                                modbusParams.getSlaveId(),
                                modbusParams.getOffset(),
                                ((Number) value).intValue()
                        );
                default -> throw new IllegalArgumentException("Unsupported connection parameters type: " + parameters.getClass().getName());
            };
        } catch (Exception e) {
            throw new CommunicationException("Unable to write data on "+parameters.getId()+" type : "+ parameters.getClass().getName(), e);
        }
    }
    
}
