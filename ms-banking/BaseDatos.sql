-- Script de Creación de Base de Datos
-- Autor: GitHub Copilot
-- Fecha: 14/01/2026

-- -----------------------------------------------------
-- Table `client`
-- -----------------------------------------------------
DROP TABLE IF EXISTS movement;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS client;

CREATE TABLE client (
    client_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    age INT NOT NULL,
    identification VARCHAR(20) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status BOOLEAN NOT NULL
);

-- -----------------------------------------------------
-- Table `account`
-- -----------------------------------------------------
CREATE TABLE account (
    account_number BIGINT PRIMARY KEY,
    account_type VARCHAR(50) NOT NULL,
    initial_balance DECIMAL(15, 2) NOT NULL,
    status BOOLEAN NOT NULL,
    client_id BIGINT,
    CONSTRAINT fk_client_account FOREIGN KEY (client_id) REFERENCES client(client_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table `movement`
-- -----------------------------------------------------
CREATE TABLE movement (
    movement_id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    balance DECIMAL(15, 2) NOT NULL,
    movement_detail VARCHAR(255),
    account_number BIGINT,
    CONSTRAINT fk_account_movement FOREIGN KEY (account_number) REFERENCES account(account_number) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Datos de Prueba (Optional)
-- -----------------------------------------------------

-- Cliente: Jose Lema
INSERT INTO client (name, gender, age, identification, address, phone, password, status)
VALUES ('Jose Lema', 'Masculino', 30, '1234567890', 'Otavalo sn y principal', '098254785', '1234', true);

-- Cliente: Marianela Montalvo
INSERT INTO client (name, gender, age, identification, address, phone, password, status)
VALUES ('Marianela Montalvo', 'Femenino', 28, '1234567891', 'Amazonas y NNUU', '097548965', '5678', true);

-- Cliente: Juan Osorio
INSERT INTO client (name, gender, age, identification, address, phone, password, status)
VALUES ('Juan Osorio', 'Masculino', 25, '1234567892', '13 junio y Equinoccial', '098874587', '1245', true);

-- Cuentas de Jose Lema (ID 1 autogenerado estimado)
INSERT INTO account (account_number, account_type, initial_balance, status, client_id)
VALUES (478758, 'Ahorro', 2000.00, true, (SELECT client_id FROM client WHERE identification = '1234567890'));

-- Cuentas de Marianela Montalvo
INSERT INTO account (account_number, account_type, initial_balance, status, client_id)
VALUES (225487, 'Corriente', 100.00, true, (SELECT client_id FROM client WHERE identification = '1234567891'));

-- Cuentas de Juan Osorio
INSERT INTO account (account_number, account_type, initial_balance, status, client_id)
VALUES (495878, 'Ahorro', 0.00, true, (SELECT client_id FROM client WHERE identification = '1234567892'));

INSERT INTO account (account_number, account_type, initial_balance, status, client_id)
VALUES (496825, 'Ahorro', 540.00, true, (SELECT client_id FROM client WHERE identification = '1234567891'));

-- Movimientos para Cuenta 478758 (Jose Lema)
-- Saldo inicial 2000. Mov -575. Saldo 1425.
INSERT INTO movement (date, movement_type, value, balance, movement_detail, account_number)
VALUES ('2025-02-01 10:00:00', 'Retiro', -575.00, 1425.00, 'Retiro cajero', 478758);

-- Movimiento cuenta 225487 (Marianela)
-- Saldo inicial 100. Deposito 600. Saldo 700.
INSERT INTO movement (date, movement_type, value, balance, movement_detail, account_number)
VALUES ('2025-02-05 15:30:00', 'Deposito', 600.00, 700.00, 'Deposito ventanilla', 225487);

-- Movimiento cuenta 495878 (Juan Osorio)
-- Saldo inicial 0. Deposito 150. Saldo 150.
INSERT INTO movement (date, movement_type, value, balance, movement_detail, account_number)
VALUES ('2025-02-07 09:15:00', 'Deposito', 150.00, 150.00, 'Deposito transferencia', 495878);

-- Movimiento cuenta 496825 (Marianela)
-- Saldo inicial 540. Retiro 540. Saldo 0.
INSERT INTO movement (date, movement_type, value, balance, movement_detail, account_number)
VALUES ('2025-02-08 11:00:00', 'Retiro', -540.00, 0.00, 'Compra en linea', 496825);
