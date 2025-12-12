CREATE TABLE subscriber
(
    subscriber_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

INSERT INTO subscriber (name, email) VALUES
('Alex', 'alexgafita@a.com');

