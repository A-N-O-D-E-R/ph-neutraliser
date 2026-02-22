package bio.anode.phneutralizer.model.usage;

import bio.anode.phneutralizer.service.reader.RawValueReader;
import bio.anode.phneutralizer.service.writer.ValueWriter;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
public abstract class IOComponentUsage<T> extends NetworkingComponantUsage {
    private boolean installed;

    public abstract void write(ValueWriter writer, T value) throws Exception;
    public abstract T read(RawValueReader reader) throws Exception;

}
