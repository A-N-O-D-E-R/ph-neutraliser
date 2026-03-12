package bio.anode.phneutralizer.service;

import bio.anode.phneutralizer.dto.ComponentDto;
import bio.anode.phneutralizer.dto.UsageConnectionRequest;
import bio.anode.phneutralizer.dto.UsageDto;
import bio.anode.phneutralizer.model.component.Component;
import bio.anode.phneutralizer.model.component.NetworkingComponent;
import bio.anode.phneutralizer.model.connection.ModbusConnectionParameters;
import bio.anode.phneutralizer.model.connection.SystemConnectionParameters;
import bio.anode.phneutralizer.model.usage.*;
import bio.anode.phneutralizer.repository.*;
import jakarta.persistence.DiscriminatorValue;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.anode.modbus.ModbusProperties;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HardwareInfoService {

    private final ComponentRepository componentRepository;
    private final HardwareRepository hardwareRepository;
    private final PhNeutraliserRepository phNeutraliserRepository;
    private final ClockRTCRepository clockRTCRepository;
    private final EmbededComputeRepository embededComputeRepository;
    private final ConnectionParametersRepository connectionParametersRepository;

    @Autowired(required = false)
    private ModbusProperties modbusProperties;

    public List<ComponentDto> getComponents() {
        return componentRepository.findAll().stream()
                .map(this::toComponentDto)
                .toList();
    }

    public List<UsageDto> getUsages() {
        List<UsageDto> usages = new ArrayList<>();
        hardwareRepository.findAll().forEach(su -> usages.add(toSensorUsageDto(su)));
        phNeutraliserRepository.findAll().forEach(u -> usages.add(toActuatorUsageDto(u)));
        clockRTCRepository.findAll().forEach(u -> usages.add(toClockUsageDto(u)));
        embededComputeRepository.findAll().forEach(u -> usages.add(toComputeUsageDto(u)));
        return usages;
    }

    private ComponentDto toComponentDto(Component c) {
        return ComponentDto.builder()
                .id(c.getId())
                .type(getDiscriminatorValue(c.getClass()))
                .serialNumber(c.getSerialNumber())
                .version(c.getVersion())
                .modelName(c.getModel() != null ? c.getModel().getName() : null)
                .supplierName(c.getModel() != null && c.getModel().getSupplier() != null
                        ? c.getModel().getSupplier().getName() : null)
                .build();
    }

    private String sensorDisplayName(SensorUsage<?> su) {
        if (su.getComponent() != null && su.getComponent().getModel() != null) {
            return su.getComponent().getModel().getName() + " " + su.getComponent().getSerialNumber();
        }
        return su.getMetricName();
    }

    private UsageDto toSensorUsageDto(SensorUsage<?> su) {
        ModbusConnectionParameters modbusParams = resolveModbusParams(su);
        SystemConnectionParameters systemParams = resolveSystemParams(su);
        String connectionType = modbusParams != null ? "MODBUS" : systemParams != null ? "SYSTEM" : null;
        return UsageDto.builder()
                .id(su.getId())
                .name(sensorDisplayName(su))
                .category("SENSOR")
                .usageType(getDiscriminatorValue(su.getClass()))
                .accessible(su.isAccessible())
                .version(su.getVersion())
                .componentSerialNumber(su.getComponent() != null ? su.getComponent().getSerialNumber() : null)
                .componentModelName(su.getComponent() != null && su.getComponent().getModel() != null
                        ? su.getComponent().getModel().getName() : null)
                .installed(su.isInstalled())
                .metricName(su.getMetricName())
                .unit(su.getUnit())
                .connectionType(connectionType)
                .portName(modbusParams != null ? modbusParams.getName() : null)
                .slaveId(modbusParams != null ? modbusParams.getSlaveId() : null)
                .offset(modbusParams != null ? modbusParams.getOffset() : null)
                .poolName(systemParams != null ? systemParams.getPoolName() : null)
                .build();
    }

    @Transactional
    public void updateSensorConnection(UUID id, UsageConnectionRequest request) {
        SensorUsage<?> su = hardwareRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usage not found: " + id));
        ModbusConnectionParameters modbusParams = resolveModbusParams(su);
        SystemConnectionParameters systemParams = resolveSystemParams(su);
        if (modbusParams != null) {
            if (request.getPortName() != null) modbusParams.setName(request.getPortName());
            if (request.getSlaveId() != null) modbusParams.setSlaveId(request.getSlaveId());
            if (request.getOffset() != null) modbusParams.setOffset(request.getOffset());
            connectionParametersRepository.save(modbusParams);
        } else if (systemParams != null) {
            if (request.getPoolName() != null) systemParams.setPoolName(request.getPoolName());
            connectionParametersRepository.save(systemParams);
        } else {
            throw new IllegalStateException("Sensor has no connection parameters");
        }
    }

    private ModbusConnectionParameters resolveModbusParams(SensorUsage<?> su) {
        if (su.getComponent() instanceof NetworkingComponent nc
                && nc.getConnectionParameters() instanceof ModbusConnectionParameters mp) {
            return mp;
        }
        return null;
    }

    private SystemConnectionParameters resolveSystemParams(SensorUsage<?> su) {
        if (su.getComponent() instanceof NetworkingComponent nc
                && nc.getConnectionParameters() instanceof SystemConnectionParameters sp) {
            return sp;
        }
        return null;
    }

    private UsageDto toActuatorUsageDto(PhNeutraliserUsage u) {
        return UsageDto.builder()
                .id(u.getId())
                .name(u.getName())
                .category("ACTUATOR")
                .accessible(u.isAccessible())
                .version(u.getVersion())
                .componentSerialNumber(u.getComponent() != null ? u.getComponent().getSerialNumber() : null)
                .componentModelName(u.getComponent() != null && u.getComponent().getModel() != null
                        ? u.getComponent().getModel().getName() : null)
                .build();
    }

    private UsageDto toClockUsageDto(ClockRTCComponentUsage u) {
        return UsageDto.builder()
                .id(u.getId())
                .name(u.getName())
                .category("CLOCK")
                .accessible(u.isAccessible())
                .version(u.getVersion())
                .componentSerialNumber(u.getComponent() != null ? u.getComponent().getSerialNumber() : null)
                .componentModelName(u.getComponent() != null && u.getComponent().getModel() != null
                        ? u.getComponent().getModel().getName() : null)
                .installed(u.isInstalled())
                .build();
    }

    private UsageDto toComputeUsageDto(EmbededComputeUsage u) {
        return UsageDto.builder()
                .id(u.getId())
                .name(u.getName())
                .category("COMPUTE")
                .accessible(u.isAccessible())
                .version(u.getVersion())
                .componentSerialNumber(u.getComponent() != null ? u.getComponent().getSerialNumber() : null)
                .componentModelName(u.getComponent() != null && u.getComponent().getModel() != null
                        ? u.getComponent().getModel().getName() : null)
                .build();
    }

    private String getDiscriminatorValue(Class<?> clazz) {
        DiscriminatorValue dv = clazz.getAnnotation(DiscriminatorValue.class);
        return dv != null ? dv.value() : clazz.getSimpleName();
    }

    public List<String> getModbusConnectionNames() {
        if (modbusProperties == null) return List.of();
        return modbusProperties.getConnections().stream()
                .map(ModbusProperties.Connection::getName)
                .toList();
    }
}
