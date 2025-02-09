import inquirer from "inquirer";
import { Client } from "pg";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

dotenv.config();

if (!process.env.DB_USER || !process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_PASSWORD || !process.env.DB_PORT) {
    console.error("❌ Missing database environment variables! Check your .env file.");
    process.exit(1);
}

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

async function initializeDatabase() {
    try {
        await client.connect();
        console.log("✅ Connected to the database.");

        const schemaPath = path.join(__dirname, './schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

        await client.query(schemaSQL);
        console.log("✅ Database schema initialized successfully.");
    } catch (err) {
        console.error("❌ Error initializing database schema:", err);
    }
}

async function mainMenu() {
    try {
        const answer = await inquirer.prompt([
            {
                type: "list",
                name: "choice",
                message: "What would you like to do?",
                choices: [
                    "View all departments",
                    "View all roles",
                    "View all employees",
                    "Add a department",
                    "Add a role",
                    "Add an employee",
                    "Update an employee role",
                    "Exit",
                ],
            },
        ]);

        switch (answer.choice) {
            case "View all departments":
                await viewDepartments();
                break;
            case "View all roles":
                await viewRoles();
                break;
            case "View all employees":
                await viewEmployees();
                break;
            case "Add a department":
                await addDepartment();
                break;
            case "Add a role":
                await addRole();
                break;
            case "Add an employee":
                await addEmployee();
                break;
            case "Update an employee role":
                await updateEmployeeRole();
                break;
            case "Exit":
                console.log("👋 Exiting application...");
                await client.end();
                process.exit();
        }

        await mainMenu();
    } catch (error) {
        console.error("❌ An error occurred:", error);
        await mainMenu();
    }
}

async function viewDepartments() {
    const res = await client.query("SELECT * FROM departments");
    console.table(res.rows);
}

async function viewRoles() {
    const res = await client.query(`
        SELECT roles.id, roles.title, departments.name AS department, roles.salary
        FROM roles
        JOIN departments ON roles.department_id = departments.id
    `);
    console.table(res.rows);
}

async function viewEmployees() {
    const res = await client.query(`
        SELECT employees.id, employees.first_name, employees.last_name, roles.title AS job_title, 
        departments.name AS department, roles.salary, 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employees
        JOIN roles ON employees.role_id = roles.id
        JOIN departments ON roles.department_id = departments.id
        LEFT JOIN employees AS manager ON employees.manager_id = manager.id
    `);
    console.table(res.rows);
}

async function addDepartment() {
    const { name } = await inquirer.prompt([
        { type: "input", name: "name", message: "Enter department name:" },
    ]);
    await client.query("INSERT INTO departments (name) VALUES ($1)", [name]);
    console.log(`✅ Department "${name}" added.`);
}

async function addRole() {
    const departments = await client.query("SELECT * FROM departments");
    const { title, salary, department_id } = await inquirer.prompt([
        { type: "input", name: "title", message: "Enter role name:" },
        { type: "input", name: "salary", message: "Enter salary:" },
        {
            type: "list",
            name: "department_id",
            message: "Select department:",
            choices: departments.rows.map((d) => ({ name: d.name, value: d.id })),
        },
    ]);
    await client.query("INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)", [title, salary, department_id]);
    console.log(`✅ Role "${title}" added.`);
}

async function addEmployee() {
    const roles = await client.query("SELECT * FROM roles");
    const employees = await client.query("SELECT * FROM employees");

    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
        { type: "input", name: "first_name", message: "Enter first name:" },
        { type: "input", name: "last_name", message: "Enter last name:" },
        {
            type: "list",
            name: "role_id",
            message: "Select role:",
            choices: roles.rows.map((r) => ({ name: r.title, value: r.id })),
        },
        {
            type: "list",
            name: "manager_id",
            message: "Select manager:",
            choices: [{ name: "None", value: null }, ...employees.rows.map((e) => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }))],
        },
    ]);

    await client.query("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)", [first_name, last_name, role_id, manager_id]);
    console.log(`✅ Employee "${first_name} ${last_name}" added.`);
}

async function updateEmployeeRole() {
    const employees = await client.query("SELECT * FROM employees");
    const roles = await client.query("SELECT * FROM roles");

    const { employee_id, role_id } = await inquirer.prompt([
        {
            type: "list",
            name: "employee_id",
            message: "Select employee to update:",
            choices: employees.rows.map((e) => ({ name: `${e.first_name} ${e.last_name}`, value: e.id })),
        },
        {
            type: "list",
            name: "role_id",
            message: "Select new role:",
            choices: roles.rows.map((r) => ({ name: r.title, value: r.id })),
        },
    ]);

    await client.query("UPDATE employees SET role_id = $1 WHERE id = $2", [role_id, employee_id]);
    console.log(`✅ Employee role updated.`);
}

initializeDatabase().then(mainMenu);
