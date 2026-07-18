package com.notebook.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    // LANGUAGE or TOPIC — kept as a plain string rather than an enum since this taxonomy
    // is expected to grow (new languages/topics) without needing a code change.
    @Column(nullable = false, length = 30)
    private String category;
}
