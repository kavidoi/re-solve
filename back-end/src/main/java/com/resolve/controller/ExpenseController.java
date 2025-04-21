package com.resolve.controller;

import com.resolve.model.Expense;
import com.resolve.model.User;
import com.resolve.service.ExpenseService;
import com.resolve.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseService expenseService;
    private final UserService userService;

    public ExpenseController(ExpenseService expenseService, UserService userService) {
        this.expenseService = expenseService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody ExpenseRequest request) {
        User paidBy = userService.getUserById(request.getPaidBy())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Expense expense = new Expense();
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setPaidBy(paidBy);
        expense.setGroup(request.getGroupId() != null ? new com.resolve.model.Group() : null);
        
        Map<User, java.math.BigDecimal> shares = request.getShares().entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                        entry -> userService.getUserById(entry.getKey())
                                .orElseThrow(() -> new RuntimeException("User not found")),
                        Map.Entry::getValue
                ));
        
        return ResponseEntity.ok(expenseService.createExpense(expense, shares));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Expense>> getExpensesByUser(@PathVariable Long userId) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(expenseService.getExpensesByUser(user));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Expense>> getExpensesByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(expenseService.getExpensesByGroup(groupId));
    }

    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<List<Expense>> getExpensesByDateRange(
            @PathVariable Long userId,
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(expenseService.getExpensesByUserAndDateRange(user, start, end));
    }

    @PostMapping("/{expenseId}/settle")
    public ResponseEntity<Void> settleExpense(@PathVariable Long expenseId) {
        expenseService.settleExpense(expenseId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long expenseId) {
        expenseService.deleteExpense(expenseId);
        return ResponseEntity.ok().build();
    }
}

class ExpenseRequest {
    private String description;
    private java.math.BigDecimal amount;
    private Long paidBy;
    private Long groupId;
    private Map<Long, java.math.BigDecimal> shares;

    // Getters and setters
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public java.math.BigDecimal getAmount() { return amount; }
    public void setAmount(java.math.BigDecimal amount) { this.amount = amount; }
    public Long getPaidBy() { return paidBy; }
    public void setPaidBy(Long paidBy) { this.paidBy = paidBy; }
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public Map<Long, java.math.BigDecimal> getShares() { return shares; }
    public void setShares(Map<Long, java.math.BigDecimal> shares) { this.shares = shares; }
} 