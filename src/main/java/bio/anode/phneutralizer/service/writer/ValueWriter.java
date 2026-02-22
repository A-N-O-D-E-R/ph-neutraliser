package bio.anode.phneutralizer.service.writer;

import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.model.connection.ConnectionParameters;

public interface ValueWriter {
    void write(Object value, ConnectionParameters parameters) throws CommunicationException;
} 
