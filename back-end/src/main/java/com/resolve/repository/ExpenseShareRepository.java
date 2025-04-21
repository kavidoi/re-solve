package com.resolve.repository;

import com.resolve.model.ExpenseShare;
import com.resolve.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseShareRepository extends JpaRepository<ExpenseShare, Long> {
    List<ExpenseShare> findByUser(User user);
    List<ExpenseShare> findByUserAndStatus(User user, com.resolve.model.ShareStatus status);
    List<ExpenseShare> findByExpenseId(Long expenseId);
} 