package com.notebook.api.dto.mapper;

import com.notebook.api.dto.response.ReviewCommentRes;
import com.notebook.api.entity.ReviewComment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReviewCommentMapper {
    ReviewCommentRes toRes(ReviewComment comment);
}
