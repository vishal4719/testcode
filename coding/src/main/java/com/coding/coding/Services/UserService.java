package com.coding.coding.Services;

import com.coding.coding.Entity.User;
import com.coding.coding.Repository.UserRespository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import org.springframework.scheduling.annotation.Async;
import java.util.concurrent.CompletableFuture;

@Service
public class UserService {

    @Autowired
    private UserRespository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtBlacklistService jwtBlacklistService;

    public void saveNewUser(User user) {
        // Encode the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Arrays.asList("USER"));
        user.setCreatedAt(LocalDateTime.now()); // Set creation timestamp
        userRepository.save(user);
    }
    public void saveAdmin(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Arrays.asList("ADMIN"));
        user.setCreatedAt(LocalDateTime.now()); // Set creation timestamp for admin
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(ObjectId id) {
        return userRepository.findById(id).orElse(null);
    }
    public void loginUser(String email, String jwtToken) {
        User user = userRepository.findByEmail(email);

        if (user.getCurrentSessionToken() != null) {
            throw new IllegalStateException("User is already logged in on another device.");
        }

        user.setCurrentSessionToken(jwtToken);
        user.setLoggedIn(true);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    }


    public void deleteUser(ObjectId id) {
        userRepository.deleteById(id);
    }
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean isUserLoggedIn(String email) {
        User user = findByEmail(email);
        return user != null && user.isLoggedIn();
    }


    public boolean canUserLogin(String email) {
        User user = findByEmail(email);
        return user != null; // Add your business logic here
    }

    public void logoutUser(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            user.setCurrentSessionToken(null);
            user.setLoggedIn(false);
            userRepository.save(user);
        }
    }


    public void forceLogoutUser(String email) {
        logoutUser(email); // Same as regular logout for now
    }

    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public void loginUser(String email) {
        User user = findByEmail(email);
        if (user != null) {
            user.setLoggedIn(true);
            userRepository.save(user);
        }
    }
    public void updateLastLogin(String email) {
        User user = findByEmail(email);
        if (user != null) {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    public void updateUserStatus(User user) {
        userRepository.save(user);
    }

    /**
     * Force logout a user by blacklisting their current session token and clearing status.
     */
    public void forceLogoutUserById(ObjectId id) {
        User user = getUserById(id);
        if (user != null && user.getCurrentSessionToken() != null) {
            jwtBlacklistService.blacklistToken(user.getCurrentSessionToken());
            user.setCurrentSessionToken(null);
            user.setLoggedIn(false);
            userRepository.save(user);
        }
    }

    @Async
    public CompletableFuture<List<User>> getAllUsersAsync() {
        return CompletableFuture.completedFuture(userRepository.findAll());
    }
}