package bio.anode.phneutralizer.model.usage;

import java.time.Duration;
import java.time.LocalDateTime;

import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.model.component.ClockRTCComponent;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import bio.anode.phneutralizer.service.writer.ValueWriter;

public class ClockRTCComponentUsage extends IOComponentUsage<LocalDateTime> {
    
    private static final int CMD_RTC_SYNC = 1;
    

    public ClockRTCComponent getClock(){
        return ((ClockRTCComponent)getComponent());
    }

    public boolean synchronizeTime(RawValueReader reader, ValueWriter writer) throws CommunicationException {
        try {
            LocalDateTime deviceTime = read(reader);
            LocalDateTime systemTime = LocalDateTime.now();
            if (Duration.between(deviceTime, systemTime).abs().toMinutes() > 5) {
                write(writer,systemTime);                
            }
            return true;   
        } catch (Exception e) {
            return false;
        }
    }
    

    @Override
    public void write(ValueWriter writer, LocalDateTime value) throws Exception {
        long epochSeconds = value.toEpochSecond(java.time.ZoneOffset.UTC);
        int high = (int) (epochSeconds >> 16);
        int low = (int) (epochSeconds & 0xFFFF);
        writer.write(high, getClock().getHighRTCSetConnectionParameters());
        writer.write(low, getClock().getLowRTCSetConnectionParameters());
        writer.write(CMD_RTC_SYNC, getClock().getCommandRTCSetConnectionParameters());
    }

    @Override
    public LocalDateTime read(RawValueReader reader) throws Exception{
        int high = (int)reader.read(getClock().getHighRTCReadConnectionParameters());
        int low = (int)reader.read(getClock().getLowRTCReadConnectionParameters());
        long epochSeconds = ((long) high << 16) | (low & 0xFFFF);
        return LocalDateTime.ofEpochSecond(epochSeconds, 0, java.time.ZoneOffset.UTC);

    }

}
