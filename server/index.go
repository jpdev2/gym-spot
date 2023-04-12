package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"example/gymspot/auth_util"
	"example/gymspot/endpoints"
	"example/gymspot/sqldb"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	if dbErr := sqldb.ConnectDB(); dbErr != nil {
		log.Fatal(dbErr)
	}
	fmt.Println("AWS RDS Connected")

	router := mux.NewRouter()

	// need to add logic to all routes that use id to query data from table (valid id check)
	// delete error: returns success if run delete query for invalid id (should state that id is invalid)
	// get by id error: returns success if run get by id query for invalid id (returns data: null but should state that id is invalid)

	// auth routes
	router.HandleFunc("/auth/login", endpoints.LoginUser).Methods("POST")
	router.HandleFunc("/auth/logout", auth_util.TokenCheckMiddleware(endpoints.LogoutUser)).Methods("POST")
	router.HandleFunc("/auth/middleware-test", auth_util.TokenCheckMiddleware(endpoints.TestSecuredRoute)).Methods("GET")

	// user routes
	router.HandleFunc("/users", endpoints.CreateUser).Methods("POST")
	router.HandleFunc("/users/{userid}", auth_util.TokenCheckMiddleware(endpoints.GetUserById)).Methods("GET")
	router.HandleFunc("/users", auth_util.TokenCheckMiddleware(endpoints.PatchUser)).Methods("PATCH")
	router.HandleFunc("/users/{userid}", auth_util.TokenCheckMiddleware(endpoints.DeleteUserById)).Methods("DELETE")
	router.HandleFunc("/users/update-account/{userid}", auth_util.TokenCheckMiddleware(endpoints.UpdateUserAccount)).Methods("PATCH")

	// food routes
	router.HandleFunc("/foods", auth_util.TokenCheckMiddleware(endpoints.CreateFood)).Methods("POST")
	router.HandleFunc("/foods/{userid}", auth_util.TokenCheckMiddleware(endpoints.GetFoodsByUserId)).Methods("GET")
	router.HandleFunc("/foods", auth_util.TokenCheckMiddleware(endpoints.DeleteFoodById)).Methods("DELETE")

	// dietlog routes
	// add request.body validation before insert
	router.HandleFunc("/dietlogs", auth_util.TokenCheckMiddleware(endpoints.CreateDietLog)).Methods("POST")
	router.HandleFunc("/dietlogs", auth_util.TokenCheckMiddleware(endpoints.GetDietLogsByDate)).Methods("GET")
	router.HandleFunc("/dietlogs/dates/{userid}", auth_util.TokenCheckMiddleware(endpoints.GetDietLogDates)).Methods("GET")
	router.HandleFunc("/dietlogs/summaries/{userid}", auth_util.TokenCheckMiddleware(endpoints.GetDietLogDailySummaries)).Methods("GET")
	router.HandleFunc("/dietlogs/{id}", auth_util.TokenCheckMiddleware(endpoints.DeleteDietLogById)).Methods("DELETE")
	router.HandleFunc("/dietlogs/batch", auth_util.TokenCheckMiddleware(endpoints.BatchEditDietLogs)).Methods("PATCH")

	// exercise routes
	// add request.body validation before insert
	router.HandleFunc("/exercises", auth_util.TokenCheckMiddleware(endpoints.CreateExercise)).Methods("POST")
	router.HandleFunc("/exercises/{userid}", auth_util.TokenCheckMiddleware(endpoints.GetExercisesByUserId)).Methods("GET")
	router.HandleFunc("/exercises", auth_util.TokenCheckMiddleware(endpoints.DeleteExerciseById)).Methods("DELETE")

	// workout routes
	// add request.body validation before insert
	router.HandleFunc("/workouts", auth_util.TokenCheckMiddleware(endpoints.CreateWorkout)).Methods("POST")
	router.HandleFunc("/workouts/{userid}", auth_util.TokenCheckMiddleware(endpoints.GetWorkoutsByUserId)).Methods("GET")
	router.HandleFunc("/workouts/{id}", auth_util.TokenCheckMiddleware(endpoints.DeleteWorkoutById)).Methods("DELETE")
	router.HandleFunc("/workouts/batch", auth_util.TokenCheckMiddleware(endpoints.BatchEditWorkouts)).Methods("PATCH")

	// bodyweight routes
	router.HandleFunc("/bodyweights", auth_util.TokenCheckMiddleware(endpoints.PostBodyWeight)).Methods("POST")
	router.HandleFunc("/bodyweights/{userid}", auth_util.TokenCheckMiddleware(endpoints.GetBodyWeightsByUserId)).Methods("GET")
	router.HandleFunc("/bodyweights/{id}", auth_util.TokenCheckMiddleware(endpoints.DeleteBodyWeightById)).Methods("DELETE")

	// serve the app at specified port (from env variable) or port 8000
	envFile, _ := godotenv.Read(".env")
	port := envFile["port"]
	if port == "" {
		port = ":8000"
	}
	portNumber := port
	fmt.Printf("Go server running on port %v", strings.Split(portNumber, ":")[1])
	fmt.Println()
	log.Fatal(http.ListenAndServe(port, router))
}
