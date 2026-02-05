package bio.anode.phneutralizer.enums;

public enum Status {
    IDLE(0),
    NEUTRALIZING(1),
    EMPTYING_WASTE_TANKS(2),
    WAITING_BEFORE_NEUTRALIZATION(3),
    EMPTYING_NEUTRALIZER(4),
    FORCING_EMPTYING_NEUTRALIZER(5),
    FORCING_EMPTYING_WASTE(6),
    MANUALLY_EMPTYING_WASTE(7),
    MANUALLY_PUMPING_ACID(8),
    MANUALLY_BULLING(9);

    private final int value;

    Status(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static Status fromValue(int value) {
        for (Status status : values()) {
            if (status.value == value) {
                return status;
            }
        }
        return IDLE;
    }
}
