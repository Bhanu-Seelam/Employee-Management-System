package com.bhanu.ems.controller;

import com.bhanu.ems.entity.Employee;
import com.bhanu.ems.repository.EmployeeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final EmployeeRepository repository;

    public DashboardController(EmployeeRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        List<Employee> employees = repository.findAll();

        long total = employees.size();
        long departments = employees.stream()
                .map(Employee::getDepartment)
                .filter(d -> d != null && !d.isBlank())
                .distinct()
                .count();

        double payroll = employees.stream()
                .map(Employee::getSalary)
                .filter(s -> s != null)
                .mapToDouble(Double::doubleValue)
                .sum();

        Map<String, Object> result = new HashMap<>();
        result.put("totalEmployees", total);
        result.put("departments", departments);
        result.put("annualPayroll", payroll);
        result.put("activeEmployees", total);
        return result;
    }
}
