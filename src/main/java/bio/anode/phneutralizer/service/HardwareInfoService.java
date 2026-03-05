package bio.anode.phneutralizer.service;

import bio.anode.phneutralizer.dto.ComponentDto;
import bio.anode.phneutralizer.dto.UsageDto;
import bio.anode.phneutralizer.model.component.Component;
import bio.anode.phneutralizer.model.usage.*;
import bio.anode.phneutralizer.repository.*;
import jakarta.persistence.DiscriminatorValue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HardwareInfoService {

    private final ComponentRepository componentRepository;
    private final HardwareRepository hardwareRepository;
    private final PhNeutraliserRepository phNeutraliserRepository;
    private final ClockRTCRepository clockRTCRepository;
    private final EmbededComputeRepository embededComputeRepository;

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
                .build();
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
}
