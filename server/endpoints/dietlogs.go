package endpoints

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"reflect"
	"strconv"
	"strings"
	"time"

	"example/gymspot/sqldb"

	"github.com/gorilla/mux"
)

type DietLog struct {
	Id               int     `json:"id"`
	Date             string  `json:"date"`
	Consumed_weight  float32 `json:"consumed_weight"`
	Consumed_fat     float32 `json:"consumed_fat"`
	Consumed_carbs   float32 `json:"consumed_carbs"`
	Consumed_protein float32 `json:"consumed_protein"`
	Consumed_cal     float32 `json:"consumed_cal"`
	User_id          int     `json:"user_id"`
	Food_id          int     `json:"food_id"`
}

type DietLogJoin struct {
	Id               int     `json:"id"`
	Date             string  `json:"date"`
	Consumed_weight  float32 `json:"consumed_weight"`
	Consumed_fat     float32 `json:"consumed_fat"`
	Consumed_carbs   float32 `json:"consumed_carbs"`
	Consumed_protein float32 `json:"consumed_protein"`
	Consumed_cal     float32 `json:"consumed_cal"`
	User_id          int     `json:"user_id"`
	Food_id          int     `json:"food_id"`
	Name             string  `json:"name"`
	Serving_weight   float32 `json:"serving_weight"`
	Fat              float32 `json:"fat"`
	Carbs            float32 `json:"carbs"`
	Protein          float32 `json:"protein"`
	Cal              float32 `json:"cal"`
}

type DietLogGroup struct {
	Date      string  `json:"date"`
	Total_cal float32 `json:"total_cal"`
}

type JsonResponseD struct {
	Type    string    `json:"type"`
	Data    []DietLog `json:"data"`
	Message string    `json:"message"`
}

type JsonResponseD2 struct {
	Type    string        `json:"type"`
	Data    []DietLogJoin `json:"data"`
	Message string        `json:"message"`
}

type JsonResponseD3 struct {
	Type    string         `json:"type"`
	Data    []DietLogGroup `json:"data"`
	Message string         `json:"message"`
}

type JsonResponseDates struct {
	Type    string   `json:"type"`
	Data    []string `json:"data"`
	Message string   `json:"message"`
}

// rounds float to x amount of decimals
func roundFloat(val float32, precision uint) float32 {
	ratio := math.Pow(10, float64(precision))
	return float32(math.Round(float64(val)*ratio)) / float32(ratio)
}

// checks that all DietLog fields except Id have valid values
func CheckValidPartialDietLog(d DietLog) error {
	values := reflect.ValueOf(d)
	keys := values.Type()

	// data validation
	for i := 0; i < values.NumField(); i++ {

		// date validation
		if keys.Field(i).Name == "Date" {
			dateString := values.Field(i).Interface().(string)

			// checks that string is correct length (10 char)
			if len(dateString) != 10 {
				return fmt.Errorf("CheckValidPartialDietLog: date length error (input is %v characters long, expected 10 characters)", len(dateString))
			}

			// checks that string contains two forward slashes
			if dateSplit := strings.Split(dateString, "/"); len(dateSplit) != 3 {
				return fmt.Errorf("CheckValidPartialUser: date format error (%v forward slashes present in input, expected 2 forward slashes)", len(dateSplit)-1)
			}

			// checks that string is a valid date
			_, timeParseErr := time.Parse("01/02/2006", dateString)
			if timeParseErr != nil {
				return fmt.Errorf("CheckValidPartialDietLog: time.Parse(): %v", timeParseErr)
			}
		}

		// float32 checks
		if reflect.TypeOf(values.Field(i).Interface()).String() == "float32" {
			numValue := values.Field(i).Interface().(float32)
			measurement := keys.Field(i).Name

			// check that all floats are greater than or equal to zero
			if numValue < 0 {
				return fmt.Errorf("CheckValidPartialFood: %v is out-of-range, expected a float32 greater than or equal to zero, received %v", measurement, numValue)
			}
		}
	}

	// check that total calories is equal to calories from macronutrients (fat, carbs, protein)
	if calCalc := d.Consumed_fat*9 + d.Consumed_carbs*4 + d.Consumed_protein*4; roundFloat(calCalc, 2) != roundFloat(d.Consumed_cal, 2) {
		return fmt.Errorf("CheckValidPartialFood: calorie mismatch error, received %v but expected %v", d.Consumed_cal, calCalc)
	}

	// check that user_id matches user in users table
	if validUserIdErr := CheckValidUserId(d.User_id); validUserIdErr != nil {
		return fmt.Errorf("CheckValidPartialFood: %v", validUserIdErr)
	}

	// check that food_id matches food in foods table

	return nil
}

// creates new dietlog in db
// no data field in response
func CreateDietLog(w http.ResponseWriter, r *http.Request) {
	var newDietLog DietLog

	// decodes request body into newDietLog
	if bodyParseErr := json.NewDecoder(r.Body).Decode((&newDietLog)); bodyParseErr != nil {
		log.Printf("CreateDietLog: json.NewDecoder(r.Body).Decode((&newDietLog)): %v", bodyParseErr)
		w.WriteHeader(500)
		return
	}

	// validates newDietLog data before adding to database
	if newUserDataErr := CheckValidPartialDietLog(newDietLog); newUserDataErr != nil {
		log.Printf("CreateUser: CheckValidPartialUser(newUser): %v", newUserDataErr)
		w.WriteHeader(500)
		return
	}

	// adds new dietlog to dietlogs table
	db := sqldb.DB
	var newDietLogId int
	insertErr := db.QueryRow(`
		INSERT INTO dietlogs (date, consumed_weight, consumed_fat, consumed_carbs, consumed_protein, consumed_cal, user_id, food_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id;
	`, newDietLog.Date, newDietLog.Consumed_weight, newDietLog.Consumed_fat, newDietLog.Consumed_carbs, newDietLog.Consumed_protein, newDietLog.Consumed_cal, newDietLog.User_id, newDietLog.Food_id).Scan(&newDietLogId)
	if insertErr != nil {
		log.Printf("CreateDietLog: db.QueryRow().Scan(): %v", insertErr)
		w.WriteHeader(500)
		return
	}
	log.Printf("CreateDietLog: New dietlog with id = %v added to dietlogs table", newDietLogId)

	response := JsonResponse{Type: "success", Message: "New dietlog successfully added to database"}
	json.NewEncoder(w).Encode(response)
}

// gets all dietlogs by userid
// returns array of dietlog objects in response
func GetDietLogsByDate(w http.ResponseWriter, r *http.Request) {
	date := r.URL.Query().Get("date")
	userIdString := r.URL.Query().Get("userid")

	// converts userid from string to int
	userId, strConvErr := strconv.Atoi(userIdString)
	if strConvErr != nil {
		log.Printf("GetDietLogsByDate: strconv.Atoi(params[\"userid\"]): %v", strConvErr)
		w.WriteHeader(500)
		return
	}

	// selects for dietlogs with user_id of userid and date of date
	db := sqldb.DB
	rows, queryErr := db.Query(`
		SELECT l.*, f.name, f.serving_weight, f.fat, f.carbs, f.protein, f.cal  FROM dietlogs l JOIN foods f ON l.food_id = f.id
		WHERE l.user_id = $1 AND l.date = $2
		ORDER BY l.id;
	`, userId, date)
	if queryErr != nil {
		log.Printf("GetDietLogsByDate: db.Query(): %v", queryErr)
		w.WriteHeader(500)
		return
	}

	// parses each row, appending to dietlogs
	var dietlogs []DietLogJoin
	for rows.Next() {
		var id int
		var date string
		var consumed_weight float32
		var consumed_fat float32
		var consumed_carbs float32
		var consumed_protein float32
		var consumed_cal float32
		var user_id int
		var food_id int
		var name string
		var serving_weight float32
		var fat float32
		var carbs float32
		var protein float32
		var cal float32

		if rowScanErr := rows.Scan(&id, &date, &consumed_weight, &consumed_fat, &consumed_carbs, &consumed_protein, &consumed_cal, &user_id, &food_id, &name, &serving_weight, &fat, &carbs, &protein, &cal); rowScanErr != nil {
			log.Printf("GetDietLogsByUserId: error parsing inside rows.Next(): %v", rowScanErr)
			w.WriteHeader(500)
			return
		}
		dietlogs = append(dietlogs, DietLogJoin{Id: id, Date: date, Consumed_weight: consumed_weight, Consumed_fat: consumed_fat, Consumed_carbs: consumed_carbs, Consumed_protein: consumed_protein, Consumed_cal: consumed_cal, User_id: user_id, Food_id: food_id, Name: name, Serving_weight: serving_weight, Fat: fat, Carbs: carbs, Protein: protein, Cal: cal})
	}

	response := JsonResponseD2{Type: "success", Data: dietlogs, Message: "Dietlogs found successfully"}
	json.NewEncoder(w).Encode(response)
}

// gets all dates which has a dietlog
// returns array of dates in response
func GetDietLogDates(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	userId := params["userid"]

	db := sqldb.DB
	rows, queryErr := db.Query("SELECT DISTINCT date FROM dietlogs WHERE user_id = $1 ORDER BY date", userId)
	if queryErr != nil {
		log.Printf("GetDietLogDates: db.Query(): %v", queryErr)
		w.WriteHeader(500)
		return
	}

	var dates []string
	for rows.Next() {
		var date string

		if rowScanErr := rows.Scan(&date); rowScanErr != nil {
			log.Printf("GetDietLogDates: error parsing inside rows.Next(): %v", rowScanErr)
			w.WriteHeader(500)
			return
		}
		dates = append(dates, date)
	}

	response := JsonResponseDates{Type: "success", Data: dates, Message: "Dietlog dates found successfully"}
	json.NewEncoder(w).Encode(response)
}

// gets dietlog daily summaries by userid
// returns array of summaries in response
func GetDietLogDailySummaries(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	userId := params["userid"]

	db := sqldb.DB
	rows, queryErr := db.Query(`
		SELECT date, SUM(consumed_cal) AS total_cal FROM dietlogs
		WHERE user_id = $1
		GROUP BY (date, user_id)
		ORDER BY date;
	`, userId)
	if queryErr != nil {
		log.Printf("GetDietLogDailySummaries: db.Query(): %v", queryErr)
		w.WriteHeader(500)
		return
	}

	var sums []DietLogGroup
	for rows.Next() {
		var date string
		var total_cal float32

		if rowScanErr := rows.Scan(&date, &total_cal); rowScanErr != nil {
			log.Printf("GetDietLogDailySummaries:  error parsing inside rows.Next(): %v", rowScanErr)
			w.WriteHeader(500)
			return
		}
		sums = append(sums, DietLogGroup{Date: date, Total_cal: total_cal})
	}

	response := JsonResponseD3{Type: "success", Data: sums, Message: "Dietlog daily summaries found successfully"}
	json.NewEncoder(w).Encode(response)
}

// deletes dietlog by id
// no data field in response
func DeleteDietLogById(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	dietlogId := params["id"]

	// deletes dietlog by id from dietlogs table
	db := sqldb.DB
	if _, deleteErr := db.Query("DELETE FROM dietlogs WHERE id = $1", dietlogId); deleteErr != nil {
		log.Printf("DeleteDietLogById: db.Query(): %v", deleteErr)
		w.WriteHeader(500)
		return
	}
	log.Printf("DeleteDietLogById: Dietlog with id = %v deleted from dietlogs table", dietlogId)

	response := JsonResponseD{Type: "success", Message: "Dietlog deleted successfully"}
	json.NewEncoder(w).Encode(response)
}

// edits or deletes each dietlog received in request body
// no data field in response
func BatchEditDietLogs(w http.ResponseWriter, r *http.Request) {
	var dietLogEdits []DietLogJoin

	// decodes request body into dietLogEdits
	if bodyParseErr := json.NewDecoder(r.Body).Decode((&dietLogEdits)); bodyParseErr != nil {
		log.Printf("BatchEditDietLogs: json.NewDecoder(r.Body).Decode((&newDietLog)): %v", bodyParseErr)
		w.WriteHeader(500)
		return
	}

	// for each item in dietLogEdits, either deletes or updates dietlog in dietlogs table
	db := sqldb.DB
	for _, value := range dietLogEdits {
		if value.Consumed_weight == 0 {
			// deletes dietlog by id from dietlogs table
			if _, deleteErr := db.Query("DELETE FROM dietlogs WHERE id = $1", value.Id); deleteErr != nil {
				log.Printf("BatchEditDietLogs: db.Query(): %v", deleteErr)
				w.WriteHeader(500)
				return
			}
			log.Printf("BatchEditDietLogs: Dietlog with id = %v deleted from dietlogs table", value.Id)
		} else {
			// recalculates macros/calories based on new serving_weight
			servingRatio := value.Consumed_weight / value.Serving_weight
			newFat := servingRatio * value.Fat
			newCarbs := servingRatio * value.Carbs
			newProtein := servingRatio * value.Protein
			newCal := servingRatio * value.Cal

			// patches dietlog by id in dietlogs table
			_, patchErr := db.Query(`
				UPDATE dietlogs
				SET
					consumed_weight = $1,
					consumed_fat = $2,
					consumed_carbs = $3,
					consumed_protein = $4,
					consumed_cal = $5
				WHERE id = $6;
			`, value.Consumed_weight, newFat, newCarbs, newProtein, newCal, value.Id)
			if patchErr != nil {
				log.Printf("BatchEditDietLogs: db.Query(): %v", patchErr)
				w.WriteHeader(500)
				return
			}
			log.Printf("BatchEditDietLogs: Dietlog with id = %v modified in dietlogs table", value.Id)
		}
	}

	response := JsonResponseD{Type: "success", Message: "Dietlogs edited successfully"}
	json.NewEncoder(w).Encode(response)
}
