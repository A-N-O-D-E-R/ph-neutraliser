package bio.anode.phneutralizer.service;

import bio.anode.phneutralizer.dto.AuthUserDto;
import bio.anode.phneutralizer.dto.CreateUserRequest;
import bio.anode.phneutralizer.dto.UpdateUserRequest;
import bio.anode.phneutralizer.dto.UserDto;
import bio.anode.phneutralizer.model.AppUser;
import bio.anode.phneutralizer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserDto> getAll() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public UserDto create(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + request.getUsername());
        }
        AppUser user = new AppUser(
                UUID.randomUUID(),
                request.getUsername(),
                request.getPassword(),
                request.getRole(),
                Instant.now().toString()
        );
        return toDto(userRepository.save(user));
    }

    public UserDto update(UUID id, UpdateUserRequest request) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        if (!user.getUsername().equals(request.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + request.getUsername());
        }

        user.setUsername(request.getUsername());
        user.setRole(request.getRole());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(request.getPassword());
        }
        return toDto(userRepository.save(user));
    }

    public void delete(UUID id) {
        userRepository.deleteById(id);
    }

    public Optional<AuthUserDto> login(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(u -> u.getPasswordHash().equals(password)) //HASHING TO BE IMPLEMENTED
                .map(u -> new AuthUserDto(u.getUsername(), u.getRole()));
    }

    private UserDto toDto(AppUser user) {
        return new UserDto(user.getId(), user.getUsername(), user.getRole(), user.getCreatedAt());
    }
}
