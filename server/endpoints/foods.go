package endpoints

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"reflect"

	"example/gymspot/sqldb"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

type Food struct {
	Id             string  `json:"id"`
	Name           string  `json:"name"`
	Serving_weight float32 `json:"serving_weight"`
	Fat            float32 `json:"fat"`
	Carbs          float32 `json:"carbs"`
	Protein        float32 `json:"protein"`
	Cal            float32 `json:"cal"`
	User_id        int     `json:"user_id"`
	Deleted        bool    `json:"deleted"`
}

// JsonResponseFoods (data is array of Foods)
type JsonResponseF struct {
	Type    string `json:"type"`
	Data    []Food `json:"data"`
	Message string `json:"message"`
}

// checks that id matches user in users table
func CheckValidUserId(id int) error {
	db := sqldb.DB
	var userId int
	userExistsErr := db.QueryRow(`
		SELECT distinct 1 id from users
		WHERE id = $1
	`, id).Scan(&userId)
	if userExistsErr != nil {
		return fmt.Errorf("CheckValidUserId: user with id = %v not found in users table", id)
	}

	return nil
}

// checks that all Food fields except Id have valid values
func CheckValidPartialFood(f Food) error {
	values := reflect.ValueOf(f)
	keys := values.Type()

	// data validation
	for i := 0; i < values.NumField(); i++ {

		// string checks (name)
		if keys.Field(i).Name != "Id" && reflect.TypeOf(values.Field(i).Interface()).String() == "string" {
			// check for empty string
			if values.Field(i).Interface() == "" {
				return fmt.Errorf("CheckValidPartialFood: The %v field cannot be empty", keys.Field(i).Name)
			}
			// check that string length is in range
			if len(values.Field(i).Interface().(string)) < 3 || len(values.Field(i).Interface().(string)) > 50 {
				return fmt.Errorf("CheckValidPartialFood: %v is out-of-range, expected a string of length 3 <= x <= 50 but received %v", keys.Field(i).Name, len(values.Field(i).Interface().(string)))
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
	if calCalc := f.Fat*9 + f.Carbs*4 + f.Protein*4; calCalc != f.Cal {
		return fmt.Errorf("CheckValidPartialFood: calorie mismatch error, received %v but expected %v", f.Cal, calCalc)
	}

	// check that user_id matches user in users table
	if validUserIdErr := CheckValidUserId(f.User_id); validUserIdErr != nil {
		return fmt.Errorf("CheckValidPartialFood: %v", validUserIdErr)
	}

	return nil
}

// creates new food in db
// no data field in response
func CreateFood(w http.ResponseWriter, r *http.Request) {
	var newFood Food

	// decodes request body into newFood
	if bodyParseErr := json.NewDecoder(r.Body).Decode((&newFood)); bodyParseErr != nil {
		log.Printf("CreateFood: json.NewDecoder(r.Body).Decode((&newFood)): %v", bodyParseErr)
		w.WriteHeader(500)
		return
	}

	// validates newFood data before adding to database
	if newFoodDataErr := CheckValidPartialFood(newFood); newFoodDataErr != nil {
		log.Printf("CreateFood: CheckValidPartialFood(newFood): %v", newFoodDataErr)
		w.WriteHeader(500)
		return
	}

	// adds new food to foods table
	db := sqldb.DB
	var newFoodId int
	insertErr := db.QueryRow(`
		INSERT INTO foods(name, serving_weight, fat, carbs, protein, cal, user_id, deleted)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id;
	`, newFood.Name, newFood.Serving_weight, newFood.Fat, newFood.Carbs, newFood.Protein, newFood.Cal, newFood.User_id, false).Scan(&newFoodId)
	if insertErr != nil {
		log.Printf("CreateFood: db.QueryRow().Scan(): %v", insertErr)
		w.WriteHeader(500)
		return
	}
	log.Printf("CreateFood: New food with id = %v added to foods table", newFoodId)

	response := JsonResponse{Type: "success", Message: "New food successfully added to database"}
	json.NewEncoder(w).Encode(response)
}

// gets all foods by userid
// returns array of food objects in response
func GetFoodsByUserId(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	userId := params["userid"]

	// selects for foods with user_id of userId
	db := sqldb.DB
	rows, queryErr := db.Query(`
		SELECT * FROM foods
		WHERE user_id = $1 AND deleted = false
		ORDER BY id;
	`, userId)
	if queryErr != nil {
		log.Printf("GetFoodsByUserId: db.Query(): %v", queryErr)
		w.WriteHeader(500)
		return
	}

	// parses each row, appending to foods
	var foods []Food
	for rows.Next() {
		var id string
		var name string
		var serving_weight float32
		var fat float32
		var carbs float32
		var protein float32
		var cal float32
		var user_id int
		var deleted bool

		if rowScanErr := rows.Scan(&id, &name, &serving_weight, &fat, &carbs, &protein, &cal, &user_id, &deleted); rowScanErr != nil {
			log.Printf("GetFoodsByUserId: error parsing inside rows.Next(): %v", rowScanErr)
			w.WriteHeader(500)
			return
		}
		foods = append(foods, Food{Id: id, Name: name, Serving_weight: serving_weight, Fat: fat, Carbs: carbs, Protein: protein, Cal: cal, User_id: user_id, Deleted: deleted})
	}

	response := JsonResponseF{Type: "success", Data: foods, Message: "Foods found successfully"}
	json.NewEncoder(w).Encode(response)
}

// deletes food by id (or updates to deleted = true)
// no data field in response
func DeleteFoodById(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("user_id")
	foodId := r.URL.Query().Get("food_id")

	// checks if foodId exists in dietlogs table
	db := sqldb.DB
	var foodExists bool
	queryErr := db.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM dietlogs
			WHERE user_id = $1 AND food_id = $2
			LIMIT 1
		)
	`, userId, foodId).Scan(&foodExists)
	if queryErr != nil {
		log.Printf("DeleteFoodById: queryErr: %v", queryErr)
		w.WriteHeader(500)
		return
	}

	// if food is linked to a dietlog, update food (prevents foreign key error)
	// else, delete food from table
	if foodExists {
		// updates food by id from foods table (deleted = true)
		_, updateErr := db.Query(`
			UPDATE foods
			SET deleted = true
			WHERE id = $1 AND user_id = $2
		`, foodId, userId)
		if updateErr != nil {
			log.Printf("DeleteFoodById: updateErr: %v", updateErr)
			w.WriteHeader(500)
			return
		}
		log.Printf("DeleteFoodById: Food with id = %v updated in foods table", foodId)
	} else {
		// deletes food by id from foods table
		if _, deleteErr := db.Query("DELETE FROM foods WHERE id = $1", foodId); deleteErr != nil {
			log.Printf("DeleteFoodById: deleteErr: %v", deleteErr)
			w.WriteHeader(500)
			return
		}
		log.Printf("DeleteFoodById: Food with id = %v deleted from foods table", foodId)
	}

	response := JsonResponse{Type: "success", Message: "Food deleted successfully"}
	json.NewEncoder(w).Encode(response)
}
