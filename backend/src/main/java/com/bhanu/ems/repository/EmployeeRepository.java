package com.bhanu.ems.repository;

import com.bhanu.ems.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmailIgnoreCase(String email);

    @Query("SELECT e FROM Employee e WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.department) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.position) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY e.id DESC")
    List<Employee> searchEmployees(@Param("search") String search);
}
