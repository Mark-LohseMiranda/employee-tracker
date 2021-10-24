INSERT INTO
    department (department)
VALUES
    ("English"),
    ("Science"),
    ("Administration");

INSERT INTO 
    roles (roles, salary, department_id)
VALUES
    ("Dean", 120000, 3),
    ("Teacher", 12000, 1),
    ("Student Teacher", 5000, 1),
    ("Scientist", 15000, 2);

INSERT INTO 
    employee (first_name, last_name, roles_id, manager_id)
VALUES
    ("Leroy", "Jeeenkins", 1, null),
    ("Bob", "Costas", 2, 1),
    ("Carl", "Junior", 4, 1);