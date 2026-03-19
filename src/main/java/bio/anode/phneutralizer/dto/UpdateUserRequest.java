package bio.anode.phneutralizer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @NotBlank
    private String username;
    private String password;
    @NotBlank
    private String role;
}
