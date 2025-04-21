package com.resolve.repository;

import com.resolve.model.Expense;
import com.resolve.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByPaidBy(User user);
    List<Expense> findByGroupId(Long groupId);
    List<Expense> findByPaidByAndDateBetween(User user, java.time.LocalDateTime start, java.time.LocalDateTime end);
} 