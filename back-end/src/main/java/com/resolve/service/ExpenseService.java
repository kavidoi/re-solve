package com.resolve.service;

import com.resolve.model.Expense;
import com.resolve.model.ExpenseShare;
import com.resolve.model.User;
import com.resolve.repository.ExpenseRepository;
import com.resolve.repository.ExpenseShareRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final ExpenseShareRepository expenseShareRepository;

    public ExpenseService(ExpenseRepository expenseRepository, ExpenseShareRepository expenseShareRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseShareRepository = expenseShareRepository;
    }

    @Transactional
    public Expense createExpense(Expense expense, Map<User, BigDecimal> shares) {
        expense.setDate(LocalDateTime.now());
        expense.setStatus(com.resolve.model.ExpenseStatus.PENDING);
        Expense savedExpense = expenseRepository.save(expense);

        shares.forEach((user, amount) -> {
            ExpenseShare share = new ExpenseShare();
            share.setExpense(savedExpense);
            share.setUser(user);
            share.setAmount(amount);
            share.setStatus(com.resolve.model.ShareStatus.PENDING);
            expenseShareRepository.save(share);
        });

        return savedExpense;
    }

    public List<Expense> getExpensesByUser(User user) {
        return expenseRepository.findByPaidBy(user);
    }

    public List<Expense> getExpensesByGroup(Long groupId) {
        return expenseRepository.findByGroupId(groupId);
    }

    public List<Expense> getExpensesByUserAndDateRange(User user, LocalDateTime start, LocalDateTime end) {
        return expenseRepository.findByPaidByAndDateBetween(user, start, end);
    }

    @Transactional
    public void settleExpense(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        expense.setStatus(com.resolve.model.ExpenseStatus.SETTLED);
        expenseRepository.save(expense);
        
        List<ExpenseShare> shares = expenseShareRepository.findByExpenseId(expenseId);
        shares.forEach(share -> {
            share.setStatus(com.resolve.model.ShareStatus.PAID);
            expenseShareRepository.save(share);
        });
    }

    public void deleteExpense(Long expenseId) {
        expenseRepository.deleteById(expenseId);
    }
} 