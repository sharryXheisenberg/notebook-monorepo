package com.notebook.api.dto.mapper;

import com.notebook.api.dto.response.BlockRes;
import com.notebook.api.entity.Block;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BlockMapper {
    BlockRes toRes(Block block);
}
