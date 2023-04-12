package endpoints

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"reflect"
	"strings"
	"time"

	"example/gymspot/sqldb"

	"github.com/gorilla/mux"
)

type BodyWeight struct {
	Id      string  `json:"id"`
	Weight  float32 `json:"weight"`
	Date    string  `json:"date"`
	User_id int     `json:"user_id"`
}

type JsonResponseB struct {
	Type    string       `json:"type"`
	Data    []BodyWeight `json:"data"`
	Message string       `json:"message"`
}

// checks that all BodyWeight fields except Id have valid values
func CheckValidPartialBodyWeight(b BodyWeight) error {
	values := reflect.ValueOf(b)
	keys := values.Type()

	// data validation
	for i := 0; i < values.NumField(); i++ {

		// date validation
		if keys.Field(i).Name == "Date" {
			dateString := values.Field(i).Interface().(string)

			// checks that string is correct length (10 char)
			if len(dateString) != 10 {
				return fmt.Errorf("CheckValidPartialBodyWeight: date length error (input is %v characters long, expected 10 characters)", len(dateString))
			}

			// checks that string contains two forward slashes
			if dateSplit := strings.Split(dateString, "/"); len(dateSplit) != 3 {
				return fmt.Errorf("CheckValidPartialBodyWeight: date format error (%v forward slashes present in input, expected 2 forward slashes)", len(dateSplit)-1)
			}

			// checks that string is a valid date
			_, timeParseErr := time.Parse("01/02/2006", dateString)
			if timeParseErr != nil {
				return fmt.Errorf("CheckValidPartialBodyWeight: time.Parse(): %v", timeParseErr)
			}
		}

		// weight validation
		if reflect.TypeOf(values.Field(i).Interface()).String() == "float32" && keys.Field(i).Name == "Weight" {
			weight := values.Field(i).Interface().(float32)

			// checks that weight in range
			if weight < 4.7 || weight > 1400.00 {
				return fmt.Errorf("CheckValidPartialBodyWeight: Weight is out-of-range, expected 4.7 <= x <= 1400.00 but received %v", weight)
			}
		}
	}

	// check that user_id matches user in users table
	if userIdErr := CheckValidUserId(b.User_id); userIdErr != nil {
		return fmt.Errorf("CheckValidPartialBodyWeight: userIdErr: %v", userIdErr)
	}

	return nil
}

// creates new bodyweight in db
// no data field in response
func PostBodyWeight(w http.ResponseWriter, r *http.Request) {
	var newBodyWeight BodyWeight

	// decodes request body into newBodyWeight
	if bodyParseErr := json.NewDecoder(r.Body).Decode((&newBodyWeight)); bodyParseErr != nil {
		log.Printf("PostBodyWeight: bodyParseErr: %v", bodyParseErr)
		w.WriteHeader(500)
		return
	}

	// validates newBodyWeight data before adding to database
	if newBodyWeightDataErr := CheckValidPartialBodyWeight(newBodyWeight); newBodyWeightDataErr != nil {
		log.Printf("PostBodyWeight: newBodyWeightDataErr: %v", newBodyWeightDataErr)
		w.WriteHeader(500)
		return
	}

	// insert into table
	var newBodyWeightId int
	db := sqldb.DB
	insertErr := db.QueryRow(`
		INSERT INTO bodyweights(weight, date, user_id)
		VALUES($1, $2, $3)
		RETURNING id;
	`, newBodyWeight.Weight, newBodyWeight.Date, newBodyWeight.User_id).Scan(&newBodyWeightId)
	if insertErr != nil {
		log.Printf("PostBodyWeight: insertErr: %v", insertErr)
		w.WriteHeader(500)
		return
	}
	log.Printf("PostBodyWeight: New bodyweight with id = %v added to bodyweights table", newBodyWeightId)

	response := JsonResponse{Type: "success", Message: "New bodyweight successfully added to bodyweights table"}
	json.NewEncoder(w).Encode(response)
}

// gets all bodyweights by userid
// returns array of bodyweight objects in response
func GetBodyWeightsByUserId(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["userid"]

	// selects for bodyweights with user_id of userId
	db := sqldb.DB
	rows, queryErr := db.Query(`
		SELECT * FROM bodyweights 
		WHERE user_id = $1
		ORDER BY date;
	`, userId)
	if queryErr != nil {
		log.Printf("GetBodyWeightsByUserId: queryErr: %v", queryErr)
		w.WriteHeader(500)
		return
	}

	// parses each row, appending to bodyweights
	var bodyweights []BodyWeight
	for rows.Next() {
		var id string
		var weight float32
		var date string
		var user_id int

		if rowScanErr := rows.Scan(&id, &weight, &date, &user_id); rowScanErr != nil {
			log.Printf("GetBodyWeightsByUserId: rowScanErr: %v", rowScanErr)
			w.WriteHeader(500)
			return
		}
		bodyweights = append(bodyweights, BodyWeight{Id: id, Weight: weight, Date: date, User_id: user_id})
	}

	response := JsonResponseB{Type: "success", Data: bodyweights, Message: "Bodyweights found successfully"}
	json.NewEncoder(w).Encode(response)
}

// deletes bodyweight by id
// no data field in response
func DeleteBodyWeightById(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	bodyWeightId := params["id"]

	db := sqldb.DB
	if _, deleteErr := db.Query("DELETE FROM bodyweights WHERE id = $1", bodyWeightId); deleteErr != nil {
		log.Printf("DeleteBodyWeightById: deleteErr: %v", deleteErr)
		w.WriteHeader(500)
		return
	}
	log.Printf("DeleteBodyWeightById: Bodyweight with id = %v deleted from bodyweights table", bodyWeightId)

	response := JsonResponse{Type: "success", Message: "Bodyweight deleted successfully"}
	json.NewEncoder(w).Encode(response)
}
