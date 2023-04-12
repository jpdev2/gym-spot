package endpoints

import (
	"encoding/json"
	"log"
	"net/http"

	"example/gymspot/sqldb"

	"github.com/gorilla/mux"
)

type Exercise struct {
	Id           int    `json:"id"`
	Name         string `json:"name"`
	Muscle_group string `json:"muscle_group"`
	User_id      int    `json:"user_id"`
	Deleted      bool   `json:"deleted"`
}

type JsonResponseE struct {
	Type    string     `json:"type"`
	Data    []Exercise `json:"data"`
	Message string     `json:"message"`
}

// creates new exercise in db
// no data field in response
func CreateExercise(w http.ResponseWriter, r *http.Request) {
	var newExercise Exercise

	// decodes request body into newExercise, checks for errors
	if bodyParseErr := json.NewDecoder(r.Body).Decode(&newExercise); bodyParseErr != nil {
		log.Printf("CreateExercise: json.NewDecoder(r.Body).Decode(&newExercise): %v", bodyParseErr)
		w.WriteHeader(500)
		return
	}

	// add validation

	// adds new exercise to exercises table
	db := sqldb.DB
	var newExerciseId int
	insertErr := db.QueryRow(`
		INSERT INTO exercises(name, muscle_group, user_id, deleted)
		VALUES($1, $2, $3, $4)
		RETURNING id;
	`, newExercise.Name, newExercise.Muscle_group, newExercise.User_id, false).Scan(&newExerciseId)
	if insertErr != nil {
		log.Printf("CreateExercise: db.QueryRow(): %v", insertErr)
		w.WriteHeader(500)
		return
	}
	log.Printf("CreateExercise: New exercise with id = %v added to exercises table", newExerciseId)

	response := JsonResponse{Type: "success", Message: "New exercise successfully added to database"}
	json.NewEncoder(w).Encode(response)
}

// gets all exercises by userid
// returns array of exercise objects in response
func GetExercisesByUserId(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	userId := params["userid"]

	// selects for exercises with user_id of userId
	db := sqldb.DB
	rows, queryErr := db.Query(`
		SELECT * FROM exercises
		WHERE user_id = $1 AND deleted = false
		ORDER BY id;
	`, userId)
	if queryErr != nil {
		log.Printf("GetExercisesByUserId: db.Query(): %v", queryErr)
		w.WriteHeader(500)
		return
	}

	// parses each row, appending to exercises
	var exercises []Exercise
	for rows.Next() {
		var id int
		var name string
		var muscle_group string
		var user_id int
		var deleted bool

		if rowScanErr := rows.Scan(&id, &name, &muscle_group, &user_id, &deleted); rowScanErr != nil {
			log.Printf("GetExercisesByUserId: error parsing inside rows.Next(): %v", rowScanErr)
			w.WriteHeader(500)
			return
		}
		exercises = append(exercises, Exercise{Id: id, Name: name, Muscle_group: muscle_group, User_id: user_id, Deleted: deleted})
	}

	response := JsonResponseE{Type: "success", Data: exercises, Message: "Exercises found successfully"}
	json.NewEncoder(w).Encode(response)
}

// deletes exercise by id (or updates to deleted = true)
// no data field in response
func DeleteExerciseById(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("user_id")
	exerciseId := r.URL.Query().Get("exercise_id")

	// checks if exerciseId exists in workouts table
	db := sqldb.DB
	var exerciseExists bool
	queryErr := db.QueryRow(`
			SELECT EXISTS(
				SELECT 1 FROM workouts
				WHERE user_id = $1 AND exercise_id = $2
				LIMIT 1
			)
		`, userId, exerciseId).Scan(&exerciseExists)
	if queryErr != nil {
		log.Printf("DeleteExerciseById: queryErr: %v", queryErr)
		w.WriteHeader(500)
		return
	}

	// if exercise is linked to a workout, update exercise (prevents foreign key error)
	// else, delete exercise from table
	if exerciseExists {
		// updates exercise by id from exercises table (deleted = true)
		_, updateErr := db.Query(`
			UPDATE exercises
			SET deleted = true
			WHERE id = $1 AND user_id = $2
		`, exerciseId, userId)
		if updateErr != nil {
			log.Printf("DeleteExerciseById: updateErr: %v", updateErr)
			w.WriteHeader(500)
			return
		}
		log.Printf("DeleteExerciseById: Exercise with id = %v updated in exercises table", exerciseId)
	} else {
		// deletes exercise from exercises table
		if _, deleteErr := db.Query("DELETE FROM exercises WHERE id = $1", exerciseId); deleteErr != nil {
			log.Printf("DeleteExerciseById: db.Query(): %v", deleteErr)
			w.WriteHeader(500)
			return
		}
		log.Printf("DeleteExerciseById: Exercise with id = %v deleted from exercises table", exerciseId)
	}

	response := JsonResponse{Type: "success", Message: "Exercise deleted successfully"}
	json.NewEncoder(w).Encode(response)
}
