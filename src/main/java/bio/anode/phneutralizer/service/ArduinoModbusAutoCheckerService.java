package bio.anode.phneutralizer.service;

import com.anode.arduino.ArduinoCLI;

import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.model.connection.ModbusConnectionParameters;
import bio.anode.phneutralizer.model.usage.PhNeutraliserUsage;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Service
@Slf4j
@RequiredArgsConstructor
public class ArduinoModbusAutoCheckerService {

    private static final String FQBN = "arduino:avr:uno";

    private final RawValueReader reader;

    public void checkAndEnsureConnection(PhNeutraliserUsage neutraliser) {
        if (!testConnection(neutraliser)) {
            log.info("Arduino not responding, attempting to upload sketch...");
            try {
                ArduinoCLI cli = new ArduinoCLI();
                String connectionName = ((ModbusConnectionParameters) neutraliser.getNeutralizer().getConnectionParameters()).getName();
                uploadNeutralizerSketch(cli, connectionName);
                log.info("Sketch uploaded successfully");
            } catch (URISyntaxException | IOException e) {
                log.error("Failed to upload sketch to Arduino", e);
                throw new CommunicationException("Failed to upload sketch to Arduino", e);
            }
        } else {
            log.info("Arduino connection established successfully");
        }
    }

    private boolean testConnection(PhNeutraliserUsage neutraliser) {
        try {
            neutraliser.getStatus(reader);
            return true;
        } catch (Exception e) {
            log.debug("Connection test failed: {}", e.getMessage());
            return false;
        }
    }

    private void uploadNeutralizerSketch(ArduinoCLI cli, String host) throws URISyntaxException, IOException {
        URI uri = new URI(host);
        String path = uri.getPath();
        int idx = path.lastIndexOf(':');
        String device = path.substring(0, idx);
        Path sketch = extractSketchToTemp();
        cli.upload(sketch.toString(), FQBN, device);
    }

    private Path extractSketchToTemp() throws IOException {
        String resourcePath = "PhNeutralisation.ino";
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new FileNotFoundException("Resource not found: " + resourcePath);
            }
            Path tempDir = Files.createTempDirectory("arduino-sketch-");
            Path sketchFile = tempDir.resolve(resourcePath);
            Files.copy(is, sketchFile, StandardCopyOption.REPLACE_EXISTING);
            return sketchFile;
        }
    }
}
