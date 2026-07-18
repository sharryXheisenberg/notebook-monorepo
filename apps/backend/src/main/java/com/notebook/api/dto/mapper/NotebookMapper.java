package com.notebook.api.dto.mapper;

import com.notebook.api.dto.response.NotebookRes;
import com.notebook.api.entity.Notebook;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotebookMapper {
    NotebookRes toRes(Notebook notebook);
}
