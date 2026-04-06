package bio.anode.phneutralizer.service;

import bio.anode.phneutralizer.dto.CreateUserRequest;
import bio.anode.phneutralizer.dto.UpdateUserRequest;
import bio.anode.phneutralizer.dto.UserDto;
import bio.anode.phneutralizer.dto.AuthUserDto;
import bio.anode.phneutralizer.mapper.UserMapper;
import bio.anode.phneutralizer.model.AppUser;

import bio.anode.phneutralizer.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtEncoder jwtEncoder;
    private final UserMapper userMapper;
    
    public List<UserDto> getAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
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
        return userMapper.toDto(userRepository.save(user));
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
            user.setPasswordHash(request.getPassword()); // bad but access is LAN only so ok
        }
        return userMapper.toDto(userRepository.save(user));
    }

    public void delete(UUID id) {
        userRepository.deleteById(id);
    }

   public Optional<AuthUserDto> login(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(u -> u.getPasswordHash().equals(password))
                .map(u -> AuthUserDto.builder().username(u.getUsername()).token(generateToken(u)).role(u.getRole()).build());
    }

     public String generateToken(AppUser u) {
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("ph-neutralizer.local")
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.HOURS))
                .subject(u.getUsername())
                .claim("role", u.getRole())
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

}
