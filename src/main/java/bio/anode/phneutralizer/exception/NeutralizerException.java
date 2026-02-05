package bio.anode.phneutralizer.exception;

public class NeutralizerException extends RuntimeException {

    public NeutralizerException(String message) {
        super(message);
    }

    public NeutralizerException(String message, Throwable cause) {
        super(message, cause);
    }
}
