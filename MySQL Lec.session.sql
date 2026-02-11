-- create database
CREATE DATABASE IF NOT EXISTS college;

-- switch to database
USE college;

-- create table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    age INT,
    course VARCHAR(50)
);

-- insert data
INSERT INTO students (name, age, course)
VALUES ('Aman', 20, 'BCA');

-- view data
SELECT * FROM students;

