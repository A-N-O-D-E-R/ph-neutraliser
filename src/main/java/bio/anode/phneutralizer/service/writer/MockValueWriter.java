package bio.anode.phneutralizer.service.writer;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.model.connection.ConnectionParameters;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Profile("local")
public class MockValueWriter implements ValueWriter{
    

    @Override
    public void write(Object value, ConnectionParameters parameters) throws CommunicationException {
        System.out.println("Mock write value : "+value+" on "+parameters.getId()+" type : "+ parameters.getClass().getName());
    }
    
}
