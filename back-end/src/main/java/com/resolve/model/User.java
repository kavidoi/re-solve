package com.resolve.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Set;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String email;

    private String firstName;
    private String lastName;
    private String profilePicture;

    @OneToMany(mappedBy = "paidBy")
    private Set<Expense> expensesPaid;

    @OneToMany(mappedBy = "user")
    private Set<ExpenseShare> expenseShares;

    @ManyToMany(mappedBy = "members")
    private Set<Group> groups;
} 