package util

import (
	"database/sql"
	"fmt"

	"github.com/joho/godotenv"
)

// sets up connection to local PostgreSQL
// USAGE: db := util.SetupDB()
func SetupDB() *sql.DB {
	// reads variables from .env file
	envFile, _ := godotenv.Read(".env")
	DB_USER := envFile["DB_USER"]
	DB_PASSWORD := envFile["DB_PASSWORD"]
	DB_NAME := envFile["DB_NAME"]

	// connects to db
	dbinfo := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable", DB_USER, DB_PASSWORD, DB_NAME)
	db, err := sql.Open("postgres", dbinfo)
	if err != nil {
		panic(err)
	}

	fmt.Println("Local PostgreSQL Connected!")
	return db
}
