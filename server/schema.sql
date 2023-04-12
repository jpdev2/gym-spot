CREATE TABLE auth (
	id SERIAL PRIMARY KEY,
	user_id VARCHAR(100) NOT NULL,
	auth_uuid VARCHAR(36) NOT NULL
)

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	first_name VARCHAR(30) NOT NULL,
	last_name VARCHAR(30) NOT NULL,
	email VARCHAR(50) NOT NULL,
	dob VARCHAR(10) NOT NULL,
	height_inches FLOAT NOT NULL,
	weight_pounds FLOAT NOT NULL,
	workout_frequency INT NOT NULL,
	diet_plan VARCHAR(20) NOT NULL,
	password VARCHAR(100) NOT NULL
	data_path VARCHAR(200)
)

CREATE TABLE foods (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	serving_weight FLOAT NOT NULL,
	fat FLOAT NOT NULL,
	carbs FLOAT NOT NULL,
	protein FLOAT NOT NULL,
	cal FLOAT NOT NULL,
	user_id SERIAL NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id),
	deleted BOOLEAN
)

CREATE TABLE dietlogs (
	id SERIAL PRIMARY KEY,
	date DATE NOT NULL,
	consumed_weight FLOAT NOT NULL,
	consumed_fat FLOAT NOT NULL,
	consumed_carbs FLOAT NOT NULL,
	consumed_protein FLOAT NOT NULL,
	consumed_cal FLOAT NOT NULL,
	user_id SERIAL NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id),
	food_id SERIAL NOT NULL,
	FOREIGN KEY(food_id) REFERENCES foods(id)
)

CREATE TABLE exercises (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	muscle_group VARCHAR(50) NOT NULL,
	user_id SERIAL NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id),
	deleted BOOLEAN
)

CREATE TABLE workouts (
	id SERIAL PRIMARY KEY,
	date DATE NOT NULL,
	exercise_id SERIAL NOT NULL,
	FOREIGN KEY (exercise_id) REFERENCES exercises(id),
	weight VARCHAR(50) NOT NULL,
	reps VARCHAR(50) NOT NULL,
	user_id SERIAL NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id)
)

CREATE TABLE bodyweights (
	id SERIAL PRIMARY KEY,
	weight FLOAT NOT NULL,
	date DATE NOT NULL,
	user_id SERIAL NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id)
)
