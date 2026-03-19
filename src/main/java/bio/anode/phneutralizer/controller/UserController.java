package bio.anode.phneutralizer.controller;

import bio.anode.phneutralizer.dto.*;
import bio.anode.phneutralizer.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing application users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    @GetMapping
    @Operation(summary = "List all users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAll() {
        log.debug("GET /users");
        return ResponseEntity.ok(ApiResponse.success(userService.getAll()));
    }

    @PostMapping
    @Operation(summary = "Create a user")
    public ResponseEntity<ApiResponse<UserDto>> create(@Valid @RequestBody CreateUserRequest request) {
        log.info("POST /users username={}", request.getUsername());
        return ResponseEntity.ok(ApiResponse.success(userService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a user")
    public ResponseEntity<ApiResponse<UserDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {
        log.info("PUT /users/{}", id);
        return ResponseEntity.ok(ApiResponse.success(userService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        log.info("DELETE /users/{}", id);
        userService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }

    @PostMapping("/login")
    @Operation(summary = "Validate credentials")
    public ResponseEntity<ApiResponse<AuthUserDto>> login(@Valid @RequestBody LoginRequest request) {
        log.debug("POST /users/login username={}", request.getUsername());
        return userService.login(request.getUsername(), request.getPassword())
                .map(authUser -> ResponseEntity.ok(ApiResponse.success(authUser)))
                .orElse(ResponseEntity.status(401).body(ApiResponse.error("Invalid credentials")));
    }
}
