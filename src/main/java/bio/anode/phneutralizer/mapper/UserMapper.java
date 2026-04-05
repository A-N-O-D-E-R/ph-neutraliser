package bio.anode.phneutralizer.mapper;

import org.mapstruct.Mapper;

import bio.anode.phneutralizer.dto.UserDto;
import bio.anode.phneutralizer.model.AppUser;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto toDto(AppUser user);
}
