# Employee Management System

Full-stack Employee Management System using Java 21, Spring Boot, MySQL, React and Vite.

## Features
- Dashboard with employee, department and annual payroll statistics
- Employee search
- Add, edit, view and delete employees
- Functional Dashboard, Employees and Departments navigation
- Department overview with employee counts and payroll
- Responsive professional UI
- REST API validation and clear error messages
- MySQL persistence

## Run

### Backend
Create the database:
```sql
CREATE DATABASE employee_management;
```

Edit `backend/src/main/resources/application.properties` and replace `YOUR_MYSQL_PASSWORD`.

Then:
```powershell
cd backend
mvn clean spring-boot:run
```

Backend runs on `http://localhost:8092`.

### Frontend
In another terminal:
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.
