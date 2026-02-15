package bio.anode.phneutralizer.exception;

public class ConnectorInstanciationException extends RuntimeException {

    public ConnectorInstanciationException(String message) {
        super(message);
    }

    public ConnectorInstanciationException(String message, Throwable cause) {
        super(message, cause);
    }
}