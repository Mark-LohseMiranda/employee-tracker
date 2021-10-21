INSERT INTO
    department (department)
VALUES
    ("English"),
    ("Science");

INSERT INTO 
    roles (title, salary, department_id)
VALUES
    ("Teacher", 12000, 1),
    ("Student Teacher", 5000, 1),
    ("Scientist", 15000, 2);

INSERT INTO 
    employee (first_name, last_name, roles_id, manager_id)
VALUES
    ("Bob", "Costas", 1, 1),
    ("Carl", "Junior", 2, 2),
    ("Leroy", "Jeeenkins", 3, null);