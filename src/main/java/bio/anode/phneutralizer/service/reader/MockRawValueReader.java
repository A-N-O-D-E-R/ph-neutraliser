package bio.anode.phneutralizer.service.reader;

import java.util.Random;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Profile({"test", "local"})
@Service
public class MockRawValueReader implements RawValueReader {

    private final Random random = new Random();

    @Override
    public Object read(bio.anode.phneutralizer.model.ConnectionParameters parameters) throws Exception {
        return (random.nextDouble()*1400)+100;
    }
    
}
