package com.bhanu.ems.service;

import com.bhanu.ems.entity.Employee;
import com.bhanu.ems.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public List<Employee> getEmployees(String search) {
        return search == null || search.isBlank()
                ? repository.findAll()
                : repository.searchEmployees(search.trim());
    }

    public Employee getEmployee(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
    }

    public Employee createEmployee(Employee employee) {
        String email = employee.getEmail().trim();
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An employee with this email already exists");
        }
        employee.setName(employee.getName().trim());
        employee.setEmail(email.toLowerCase());
        employee.setDepartment(employee.getDepartment().trim());
        employee.setPosition(employee.getPosition().trim());
        return repository.save(employee);
    }

    public Employee updateEmployee(Long id, Employee data) {
        Employee existing = getEmployee(id);
        String email = data.getEmail().trim();

        if (!existing.getEmail().equalsIgnoreCase(email)
                && repository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An employee with this email already exists");
        }

        existing.setName(data.getName().trim());
        existing.setEmail(email.toLowerCase());
        existing.setDepartment(data.getDepartment().trim());
        existing.setPosition(data.getPosition().trim());
        existing.setSalary(data.getSalary());
        return repository.save(existing);
    }

    public void deleteEmployee(Long id) {
        repository.delete(getEmployee(id));
    }
}
