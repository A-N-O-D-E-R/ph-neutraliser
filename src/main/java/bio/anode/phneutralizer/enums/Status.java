package bio.anode.phneutralizer.enums;

public enum Status {
    IDLE(1),
    NEUTRALIZING(3),
    EMPTYING_WASTE_TANKS(4),
    WAITING_BEFORE_NEUTRALIZATION(5),
    EMPTYING_NEUTRALIZER(6),
    MANUALLY_EMPTYING_TANKS(7),
    FORCING_EMPTYING_NEUTRALIZER(8),
    FORCING_EMPTYING_WASTE(9),
    MANUALLY_PUMPING_ACID(10),
    MANUALLY_BULLING(11);

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
