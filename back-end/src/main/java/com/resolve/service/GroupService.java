package com.resolve.service;

import com.resolve.model.Group;
import com.resolve.model.User;
import com.resolve.repository.GroupRepository;
import com.resolve.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;

@Service
public class GroupService {
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public GroupService(GroupRepository groupRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    public Group createGroup(Group group, Set<Long> memberIds) {
        Set<User> members = userRepository.findAllById(memberIds);
        group.setMembers(members);
        return groupRepository.save(group);
    }

    public List<Group> getGroupsByUser(User user) {
        return groupRepository.findByMembersContaining(user);
    }

    public List<Group> searchGroups(String name) {
        return groupRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional
    public Group updateGroup(Long id, Group groupDetails, Set<Long> memberIds) {
        return groupRepository.findById(id)
                .map(group -> {
                    group.setName(groupDetails.getName());
                    group.setDescription(groupDetails.getDescription());
                    if (memberIds != null) {
                        Set<User> members = userRepository.findAllById(memberIds);
                        group.setMembers(members);
                    }
                    return groupRepository.save(group);
                })
                .orElseThrow(() -> new RuntimeException("Group not found"));
    }

    public void deleteGroup(Long id) {
        groupRepository.deleteById(id);
    }

    @Transactional
    public void addMember(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        group.getMembers().add(user);
        groupRepository.save(group);
    }

    @Transactional
    public void removeMember(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        group.getMembers().remove(user);
        groupRepository.save(group);
    }
} 