package endpoints

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/mail"
	"reflect"
	"strings"
	"time"

	"example/gymspot/sqldb"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/exp/slices"
)

type User struct {
	Id                int     `json:"id"`
	First_name        string  `json:"first_name"`
	Last_name         string  `json:"last_name"`
	Email             string  `json:"email"`
	Dob               string  `json:"dob"`
	Height_inches     float32 `json:"height_inches"`
	Weight_pounds     float32 `json:"weight_pounds"`
	Workout_frequency int     `json:"workout_frequency"`
	Diet_plan         string  `json:"diet_plan"`
	Password          string  `json:"password"`
	Data_path         string  `json:"data_path"`
	Gender            string  `json:"gender"`
}

type AccountUpdate struct {
	Email        string `json:"email"`
	New_email    string `json:"new_email"`
	Password     string `json:"password"`
	New_password string `json:"new_password"`
}

type JsonResponse struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

type JsonResponseU struct {
	Type    string `json:"type"`
	Data    []User `json:"data"`
	Message string `json:"message"`
}

// encrypts password to hash
func (user *User) HashPassword(password string) error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		return errors.New("unexpected error in bcrypt.GenerateFromPassword()")
	}
	user.Password = string(bytes)
	return nil
}

// checks that all User fields except Id have valid values
func CheckValidPartialUser(u User) error {
	values := reflect.ValueOf(u)
	keys := values.Type()

	// data validation
	for i := 1; i < values.NumField(); i++ {

		// string checks
		if reflect.TypeOf(values.Field(i).Interface()).String() == "string" {
			// checks for empty strings (only id can be empty, as it's automatically created by PostgreSQL upon insert to users table)
			if keys.Field(i).Name != "Id" && keys.Field(i).Name != "Data_path" && values.Field(i).Interface() == "" {
				return fmt.Errorf("CheckValidPartialUser: The %v field cannot be empty", keys.Field(i).Name)
			}

			// check for whitespace
			if strings.Contains(values.Field(i).Interface().(string), " ") {
				return fmt.Errorf("CheckValidPartialUser: The %v field cannot contain any whitespace", keys.Field(i).Name)
			}

			// check that email is valid email address
			if keys.Field(i).Name == "Email" {
				if _, emailValidErr := mail.ParseAddress(values.Field(i).Interface().(string)); emailValidErr != nil {
					return fmt.Errorf("CheckValidPartialUser: Invalid email provided. Error: %v", emailValidErr)
				}
			}

			// dob validation
			if keys.Field(i).Name == "Dob" {
				dobString := values.Field(i).Interface().(string)

				// checks that string is correct length (10 char)
				if len(dobString) != 10 {
					return fmt.Errorf("CheckValidPartialUser: dob length error (input is %v characters long, expected 10 characters)", len(dobString))
				}

				// checks that string contains two forward slashes
				if dobSplit := strings.Split(dobString, "/"); len(dobSplit) != 3 {
					return fmt.Errorf("CheckValidPartialUser: dob format error (%v forward slashes present in input, expected 2 forward slashes)", len(dobSplit)-1)
				}

				// checks that string is a valid date
				dobDate, timeParseErr := time.Parse("01/02/2006", dobString)
				if timeParseErr != nil {
					return fmt.Errorf("CheckValidPartialUser: time.Parse(): %v", timeParseErr)
				}

				// checks that user is at least 18 years of age
				if userAge := time.Now().Sub(dobDate).Hours() / 24 / 365; userAge < 18 {
					return fmt.Errorf("CheckValidPartialUser: minimum user age not reached (age = %v)", userAge)
				}
			}

			// check that diet_plan is valid
			if keys.Field(1).Name == "Diet_plan" {
				diets := []string{"maintenance", "cut", "bulk", "cut-high", "bulk-high"}
				if !slices.Contains(diets, values.Field(i).Interface().(string)) {
					return fmt.Errorf("CheckValidPartialUser: invalid diet_plan, received %v", values.Field(i).Interface().(string))
				}
			}
		}

		// height_inches and weight_pounds validation
		if measurement := keys.Field(i).Name; measurement == "Height_inches" || measurement == "Weight_pounds" {
			currentNum := values.Field(i).Interface()

			// checks that value is of type float32
			if currentType := reflect.TypeOf(currentNum).String(); currentType != "float32" {
				return fmt.Errorf("CheckValidPartialUser: invalid type for %v, expected float32 but received %v", measurement, currentType)
			}

			// checks that height in range
			if measurement == "Height_inches" && (currentNum.(float32) < 21.51 || currentNum.(float32) > 107.09) {
				return fmt.Errorf("CheckValidPartialUser: %v is out-of-range, expected 21.51 <= x =< 107.09 but received %v", measurement, currentNum.(float32))
			}

			// checks that weight in range
			if measurement == "Weight_pounds" && (currentNum.(float32) < 4.7 || currentNum.(float32) > 1400.00) {
				return fmt.Errorf("CheckValidPartialUser: %v is out-of-range, expected 4.7 <= x <= 1400.00 but received %v", measurement, currentNum.(float32))
			}
		}

		// check that workout_frequency is int and within range 0-7
		if keys.Field(i).Name == "Workout_frequency" {
			workouts := values.Field(i).Interface()

			// checks that value is of type int
			if currentType := reflect.TypeOf(workouts).String(); currentType != "int" {
				return fmt.Errorf("CheckValidPartialUser: invalid type for workout_frequency, expected int but received %v", currentType)
			}
			// checks that value in range
			if workouts.(int) < 0 || workouts.(int) > 7 {
				return fmt.Errorf("CheckValidPartialUser: workout_frequency is out-of-range, expected 0 <= x <= 7 but received %v", workouts.(int))
			}
		}

	}

	return nil
}

// creates new user in db
// returns user object in response
func CreateUser(w http.ResponseWriter, r *http.Request) {
	var newUser User

	// decodes request body into newUser
	if bodyParseErr := json.NewDecoder(r.Body).Decode((&newUser)); bodyParseErr != nil {
		log.Printf("CreateUser: json.NewDecoder(r.Body).Decode((&newUser)): %v", bodyParseErr)
		w.WriteHeader(500)
		return
	}

	// validates newUser data before adding to database
	if newUserDataErr := CheckValidPartialUser(newUser); newUserDataErr != nil {
		log.Printf("CreateUser: CheckValidPartialUser(newUser): %v", newUserDataErr)
		w.WriteHeader(500)
		return
	}

	// encrypts newUser.Password
	if hashErr := newUser.HashPassword(newUser.Password); hashErr != nil {
		log.Printf("CreateUser: newUser.HashPassword(): %v", hashErr)
		w.WriteHeader(500)
		return
	}

	// adds new user to users table
	db := sqldb.DB
	var newUserId int
	insertErr := db.QueryRow(`
		INSERT INTO users(first_name, last_name, email, dob, gender, height_inches, weight_pounds, workout_frequency, diet_plan, password, data_path) 
		VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
		RETURNING id;
		`, newUser.First_name, newUser.Last_name, newUser.Email, newUser.Dob, newUser.Gender, newUser.Height_inches, newUser.Weight_pounds, newUser.Workout_frequency, newUser.Diet_plan, newUser.Password, "N/A").Scan(&newUserId)
	if insertErr != nil {
		log.Printf("CreateUser: db.QueryRow().Scan(): %v", insertErr)
		w.WriteHeader(500)
		return
	}
	log.Printf("CreateUser: New user with id = %v added to users table", newUserId)

	// removes password from newUser (don't want to include password in response)
	newUser.Password = ""
	users := []User{newUser}

	response := JsonResponseU{Type: "success", Data: users, Message: "New user successfully added to database"}
	json.NewEncoder(w).Encode(response)
}

// gets user in db by userid
// returns user object in response
func GetUserById(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	userId := params["userid"]

	// selects for users by id
	db := sqldb.DB
	rows, queryErr := db.Query("SELECT * FROM users WHERE id = $1", userId)
	if queryErr != nil {
		log.Printf("GetUserById: db.Query(): %v", queryErr)
		w.WriteHeader(500)
		return
	}

	// parses each row, adding user to users
	var users []User
	for rows.Next() {
		var id int
		var first_name string
		var last_name string
		var email string
		var dob string
		var height_inches float32
		var weight_pounds float32
		var workout_frequency int
		var diet_plan string
		var password string
		var data_path string
		var gender string

		if rowScanErr := rows.Scan(&id, &first_name, &last_name, &email, &dob, &height_inches, &weight_pounds, &workout_frequency, &diet_plan, &password, &data_path, &gender); rowScanErr != nil {
			log.Printf("GetUserById: error parsing inside rows.Next(): %v", rowScanErr)
			w.WriteHeader(500)
			return
		}
		users = append(users, User{Id: id, First_name: first_name, Last_name: last_name, Email: email, Dob: dob, Height_inches: height_inches, Weight_pounds: weight_pounds, Workout_frequency: workout_frequency, Diet_plan: diet_plan, Password: "secret", Data_path: data_path, Gender: gender})
	}

	// checks for duplicate id
	if len(users) > 1 {
		log.Printf("GetUserById: DuplicateUserCheck: %v users found with id = %v", len(users), userId)
		w.WriteHeader(500)
		return
	}

	response := JsonResponseU{Type: "success", Data: users, Message: "User found successfully"}
	json.NewEncoder(w).Encode(response)
}

// updates user info in db by userid
// returns user object in response
func PatchUser(w http.ResponseWriter, r *http.Request) {
	var userToUpdate User

	// decodes request body into userToUpdate
	if bodyParseErr := json.NewDecoder(r.Body).Decode((&userToUpdate)); bodyParseErr != nil {
		log.Printf("UpdateUserInfo: json.NewDecoder(r.Body).Decode((&newUser)): %v", bodyParseErr)
		w.WriteHeader(500)
		return
	}

	// TODO: only check that non-empty strings and non-zero values are valid
	// validates newUser data before adding to database
	// if newUserDataErr := CheckValidPartialUser(userToUpdate); newUserDataErr != nil {
	// 	log.Printf("CreateUser: CheckValidPartialUser(newUser): %v", newUserDataErr)
	// 	w.WriteHeader(500)
	// 	return
	// }

	// updates user by id in users table
	db := sqldb.DB
	_, queryErr := db.Exec(`
		UPDATE users
		SET
			first_name = CASE WHEN $1 = '' THEN first_name ELSE $1 END,
			last_name = CASE WHEN $2 = '' THEN last_name ELSE $2 END,
			email = CASE WHEN $3 = '' THEN email ELSE $3 END,
			dob = CASE WHEN $4 = '' THEN dob ELSE $4 END,
			height_inches = CASE WHEN $5 = 0 THEN height_inches ELSE $5 END,
			weight_pounds = CASE WHEN $6 = 0 THEN weight_pounds ELSE $6 END,
			workout_frequency = CASE WHEN $7 = 0 THEN workout_frequency ELSE $7 END,
			diet_plan = CASE WHEN $8 = '' THEN diet_plan ELSE $8 END,
			data_path = CASE WHEN $9 = '' THEN data_path ELSE $9 END,
			gender = CASE WHEN $10 = '' THEN gender ELSE $10 END
		WHERE id = $11;
	`, userToUpdate.First_name, userToUpdate.Last_name, userToUpdate.Email, userToUpdate.Dob, userToUpdate.Height_inches, userToUpdate.Weight_pounds, userToUpdate.Workout_frequency, userToUpdate.Diet_plan, userToUpdate.Data_path, userToUpdate.Gender, userToUpdate.Id)
	if queryErr != nil {
		log.Printf("UpdateUserInfo: db.Exec(): %v", queryErr)
		w.WriteHeader(500)
		return
	}
	log.Printf("UpdateUserInfo: User with id = %v modified in users table", userToUpdate.Id)
	userToUpdate.Password = "secret"
	users := []User{userToUpdate}

	response := JsonResponseU{Type: "success", Data: users, Message: "User info updated successfully"}
	json.NewEncoder(w).Encode((response))
}

// deletes user by id
// no data field in response
func DeleteUserById(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	userId := params["userid"]

	// deletes user by id from users table
	db := sqldb.DB
	if _, deleteErr := db.Query("DELETE FROM users WHERE id = $1", userId); deleteErr != nil {
		log.Printf("DeleteUserById: db.Query(): %v", deleteErr)
		w.WriteHeader(500)
		return
	}
	log.Printf("DeleteUserById: User with id = %v deleted from users table", userId)

	response := JsonResponse{Type: "success", Message: "User deleted successfully"}
	json.NewEncoder(w).Encode(response)
}

func UpdateUserAccount(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	userId := params["userid"]

	var accountUpdate AccountUpdate

	// decodes request body into accountUpdate
	if bodyParseErr := json.NewDecoder(r.Body).Decode((&accountUpdate)); bodyParseErr != nil {
		log.Printf("UpdateUserAccount: json.NewDecoder(r.Body).Decode((&accountUpdate)): %v", bodyParseErr)
		w.WriteHeader(500)
		return
	}

	// selects for users by id
	db := sqldb.DB
	rows, queryErr := db.Query("SELECT * FROM users WHERE id = $1", userId)
	if queryErr != nil {
		log.Printf("UpdateUserAccount: db.Query(): %v", queryErr)
		w.WriteHeader(500)
		return
	}

	// parses each row, adding user to users
	var users []User
	for rows.Next() {
		var id int
		var first_name string
		var last_name string
		var email string
		var dob string
		var height_inches float32
		var weight_pounds float32
		var workout_frequency int
		var diet_plan string
		var password string
		var data_path string
		var gender string

		if rowScanErr := rows.Scan(&id, &first_name, &last_name, &email, &dob, &height_inches, &weight_pounds, &workout_frequency, &diet_plan, &password, &data_path, &gender); rowScanErr != nil {
			log.Printf("UpdateUserAccount: error parsing inside rows.Next(): %v", rowScanErr)
			w.WriteHeader(500)
			return
		}
		users = append(users, User{Id: id, First_name: first_name, Last_name: last_name, Email: email, Dob: dob, Height_inches: height_inches, Weight_pounds: weight_pounds, Workout_frequency: workout_frequency, Diet_plan: diet_plan, Password: password, Data_path: data_path, Gender: gender})
	}

	// checks for duplicate id
	if len(users) > 1 {
		log.Printf("UpdateUserAccount: DuplicateUserCheck: %v users found with id = %v", len(users), userId)
		w.WriteHeader(500)
		return
	}

	// checks that email is correct
	currUser := users[0]
	if currUser.Email != accountUpdate.Email {
		log.Println("UpdateUserAccount: Provided current email does not match current email in database")
		w.WriteHeader(500)
		return
	}

	// checks that password is correct
	if passwordError := currUser.CheckPassword(accountUpdate.Password); passwordError != nil {
		log.Printf("UpdateUserAccount: loggedInUser.CheckPassword(): %v", passwordError)
		w.WriteHeader(500)
		return
	}

	// checks that new email is valid email address
	if _, emailValidErr := mail.ParseAddress(accountUpdate.New_email); emailValidErr != nil {
		log.Printf("UpdateUserAccount: emailValidErr: %v", emailValidErr)
		w.WriteHeader(500)
		return
	}

	// encrypts new password
	currUser.Password = accountUpdate.New_password
	if hashErr := currUser.HashPassword(currUser.Password); hashErr != nil {
		log.Printf("UpdateUserAccount: currUser.HashPassword(): %v", hashErr)
		w.WriteHeader(500)
		return
	}

	// updates user email and password by id in users table
	_, updateErr := db.Exec(`
		UPDATE users
		SET
			email = CASE WHEN $1 = '' THEN email ELSE $1 END,
			password = CASE WHEN $2 = '' THEN password ELSE $2 END
		WHERE id = $3;
	`, accountUpdate.New_email, currUser.Password, currUser.Id)
	if updateErr != nil {
		log.Printf("UpdateUserInfo: db.Exec(): %v", updateErr)
		w.WriteHeader(500)
		return
	}

	log.Printf("UpdateUserInfo: User with id = %v modified in users table", currUser.Id)

	response := JsonResponseE{Type: "success", Message: "User account updated successfully"}
	json.NewEncoder(w).Encode((response))
}
