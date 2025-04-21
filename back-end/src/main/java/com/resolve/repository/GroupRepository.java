package com.resolve.repository;

import com.resolve.model.Group;
import com.resolve.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByMembersContaining(User user);
    List<Group> findByNameContainingIgnoreCase(String name);
} 