package endpoints

import (
	"encoding/json"
	"log"
	"net/http"

	"example/gymspot/sqldb"

	"github.com/gorilla/mux"
)

type Workout struct {
	Id          int    `json:"id"`
	Date        string `json:"date"`
	Exercise_id int    `json:"exercise_id"`
	Weight      string `json:"weight"`
	Reps        string `json:"reps"`
	User_id     int    `json:"user_id"`
}

type WorkoutJoin struct {
	Id           int    `json:"id"`
	Date         string `json:"date"`
	Exercise_id  int    `json:"exercise_id"`
	Weight       string `json:"weight"`
	Reps         string `json:"reps"`
	User_id      int    `json:"user_id"`
	Name         string `json:"name"`
	Muscle_group string `json:"muscle_group"`
}

type JsonResponseW struct {
	Type    string    `json:"type"`
	Data    []Workout `json:"data"`
	Message string    `json:"message"`
}

type JsonResponseW2 struct {
	Type    string        `json:"type"`
	Data    []WorkoutJoin `json:"data"`
	Message string        `json:"message"`
}

// creates new workout in db
// no data field in response
func CreateWorkout(w http.ResponseWriter, r *http.Request) {
	var newWorkout Workout

	// decodes request body into newWorkout
	if bodyParseErr := json.NewDecoder(r.Body).Decode(&newWorkout); bodyParseErr != nil {
		log.Printf("CreateWorkout: json.NewDecoder(r.Body).Decode((&newWorkout)): %v", bodyParseErr)
		w.WriteHeader(500)
		return
	}

	// adds new workout to workout table
	db := sqldb.DB
	var newWorkoutId int
	insertErr := db.QueryRow(`
		INSERT INTO workouts (date, exercise_id, weight, reps, user_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id;
	`, newWorkout.Date, newWorkout.Exercise_id, newWorkout.Weight, newWorkout.Reps, newWorkout.User_id).Scan(&newWorkoutId)
	if insertErr != nil {
		log.Printf("CreateWorkout: db.QueryRow().Scan(): %v", insertErr)
		w.WriteHeader(500)
		return
	}
	log.Printf("CreateWorkout: New workout with id = %v added to workouts table", newWorkoutId)

	response := JsonResponse{Type: "success", Message: "New workout successfully added to database"}
	json.NewEncoder(w).Encode(response)
}

// gets all workouts by userid
// returns array of workout join objects in response
func GetWorkoutsByUserId(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	userId := params["userid"]

	// selects for workouts (joined with exercises) with user_id of userId
	db := sqldb.DB
	rows, queryErr := db.Query(`
		SELECT w.*, e.name, e.muscle_group FROM workouts w JOIN exercises e ON w.exercise_id = e.id
		WHERE w.user_id = $1
		ORDER BY w.date;
	`, userId)
	if queryErr != nil {
		log.Printf("GetWorkoutsByUserId: db.Query(): %v", queryErr)
		w.WriteHeader(500)
		return
	}

	// parses each row, appending to workouts
	var workouts []WorkoutJoin
	for rows.Next() {
		var id int
		var date string
		var exercise_id int
		var weight string
		var reps string
		var user_id int
		var name string
		var muscle_group string

		if rowScanErr := rows.Scan(&id, &date, &exercise_id, &weight, &reps, &user_id, &name, &muscle_group); rowScanErr != nil {
			log.Printf("GetWorkoutsByUserId: error parsing inside rows.Next(): %v", rowScanErr)
			w.WriteHeader(500)
			return
		}
		workouts = append(workouts, WorkoutJoin{Id: id, Date: date, Exercise_id: exercise_id, Weight: weight, Reps: reps, User_id: user_id, Name: name, Muscle_group: muscle_group})
	}

	response := JsonResponseW2{Type: "success", Data: workouts, Message: "Workouts found successfully"}
	json.NewEncoder(w).Encode(response)
}

// deletes workout by id
// no data field in response
func DeleteWorkoutById(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	workoutId := params["id"]

	// deletes workout by id from workouts table
	db := sqldb.DB
	if _, deleteErr := db.Query("DELETE FROM workouts WHERE id = $1", workoutId); deleteErr != nil {
		log.Printf("DeleteWorkoutById: db.Query(): %v", deleteErr)
		w.WriteHeader(500)
		return
	}
	log.Printf("DeleteWorkoutById: Workout with id = %v deleted from workouts table", workoutId)

	response := JsonResponseW{Type: "success", Message: "Workout deleted successfully"}
	json.NewEncoder(w).Encode(response)
}

// edits or deletes each workout received in request body
// no data field in response
func BatchEditWorkouts(w http.ResponseWriter, r *http.Request) {
	var workoutEdits []WorkoutJoin

	// decodes request body into workoutEdits
	if bodyParseErr := json.NewDecoder(r.Body).Decode((&workoutEdits)); bodyParseErr != nil {
		log.Printf("BatchEditWorkouts: json.NewDecoder(r.Body).Decode((&workoutEdits)): %v", bodyParseErr)
		w.WriteHeader(500)
		return
	}

	// for each item in workoutEdits, either deletes or updates workout in workouts table
	db := sqldb.DB
	for _, value := range workoutEdits {
		if value.Weight == "0" && value.Reps == "0" {
			// deletes workout by id from workout table
			if _, deleteErr := db.Query("DELETE FROM workouts WHERE id = $1", value.Id); deleteErr != nil {
				log.Printf("BatchEditWorkouts: deleteErr: %v", deleteErr)
				w.WriteHeader(500)
				return
			}
			log.Printf("BatchEditWorkouts: Workout with id = %v deleted from workouts table", value.Id)
		} else {
			// patches workout by id in workouts table
			_, patchErr := db.Query(`
				UPDATE workouts
				SET
					weight = $1,
					reps = $2
				WHERE id = $3;
			`, value.Weight, value.Reps, value.Id)
			if patchErr != nil {
				log.Printf("BatchEditWorkouts: patchErr: %v", patchErr)
				w.WriteHeader(500)
				return
			}
			log.Printf("BatchEditWorkouts: Workout with id = %v modified in workouts table", value.Id)
		}
	}

	response := JsonResponseD{Type: "success", Message: "Workouts edited successfully"}
	json.NewEncoder(w).Encode(response)
}
