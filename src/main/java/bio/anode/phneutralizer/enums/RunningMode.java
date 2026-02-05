package bio.anode.phneutralizer.enums;

public enum RunningMode {
    MANUAL(1),
    AUTOMATIC(2);

    private final int value;

    RunningMode(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static RunningMode fromValue(int value) {
        for (RunningMode mode : values()) {
            if (mode.value == value) {
                return mode;
            }
        }
        return MANUAL;
    }
}
