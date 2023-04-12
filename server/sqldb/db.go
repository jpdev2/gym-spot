package sqldb

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

// global variable holding db connection
var DB *sql.DB

// opens connection to PostgreSQL database hosted on Amazon RDS
func ConnectDB() error {
	// reads PostgreSQL data source name from .env file
	envFile, _ := godotenv.Read(".env")
	PG_DSN := envFile["PG_DSN"]

	// initializes new sql.DB object
	db, connectionErr := sql.Open("pgx", PG_DSN)
	if connectionErr != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", connectionErr)
		os.Exit(1)
	}
	// defer db.Close()
	DB = db

	return db.Ping()
}
