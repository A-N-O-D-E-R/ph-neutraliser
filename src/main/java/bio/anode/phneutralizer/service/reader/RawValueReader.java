package bio.anode.phneutralizer.service.reader;

import bio.anode.phneutralizer.model.ConnectionParameters;

public interface RawValueReader {
    Object read(ConnectionParameters parameters) throws Exception;
}
