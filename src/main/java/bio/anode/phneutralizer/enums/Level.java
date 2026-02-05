package bio.anode.phneutralizer.enums;

public enum Level {
    OK(0),
    LOW(1),
    HIGH(1);

    private final int value;

    Level(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static Level fromValue(int value, boolean isLowType) {
        if (value == 0) {
            return OK;
        }
        return isLowType ? LOW : HIGH;
    }
}
