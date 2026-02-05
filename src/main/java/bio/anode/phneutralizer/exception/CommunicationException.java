package bio.anode.phneutralizer.exception;

public class CommunicationException extends RuntimeException {

    public CommunicationException(String message) {
        super(message);
    }

    public CommunicationException(String message, Throwable cause) {
        super(message, cause);
    }
}
