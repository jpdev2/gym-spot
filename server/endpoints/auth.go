package endpoints

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"example/gymspot/auth_util"
	"example/gymspot/sqldb"

	"github.com/twinj/uuid"
	"golang.org/x/crypto/bcrypt"
)

type TokenRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type JsonResponseT struct {
	Type    string   `json:"type"`
	Data    []string `json:"data"`
	Message string   `json:"message"`
}

// decrypts hash to compare with password
func (user *User) CheckPassword(providedPassword string) error {
	if checkPasswordErr := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(providedPassword)); checkPasswordErr != nil {
		return checkPasswordErr
	}

	return nil
}

// returns JWT and User.Id if correct email/password pair passed
func LoginUser(w http.ResponseWriter, r *http.Request) {
	var loginRequest TokenRequest

	// decodes request body into loginRequest
	if bodyParseErr := json.NewDecoder(r.Body).Decode((&loginRequest)); bodyParseErr != nil {
		log.Printf("LoginUser: json.NewDecoder(r.Body).Decode((&newUser)): %v", bodyParseErr)
		w.WriteHeader(500)
		return
	}

	// checks if email exists in users table
	db := sqldb.DB
	if pingErr := db.Ping(); pingErr != nil {
		log.Println("DB Error")
	}
	rows, queryErr := db.Query(`
		SELECT * FROM users
		WHERE email = $1;
	`, loginRequest.Email)
	if queryErr != nil {
		log.Printf("LoginUser: db.Query(): %v", queryErr)
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
			log.Printf("LoginUser: error parsing inside rows.Next(): %v", rowScanErr)
			w.WriteHeader(500)
			return
		}
		users = append(users, User{Id: id, First_name: first_name, Last_name: last_name, Email: email, Dob: dob, Height_inches: height_inches, Weight_pounds: weight_pounds, Workout_frequency: workout_frequency, Diet_plan: diet_plan, Password: password, Data_path: data_path, Gender: gender})
	}

	// checks for duplicates of Users with same id
	if len(users) > 1 {
		log.Printf("Duplication error: multiple users matched to userid")
		w.WriteHeader(500)
		return
	}

	// checks that password is correct
	loggedInUser := users[0]
	if passwordError := loggedInUser.CheckPassword(loginRequest.Password); passwordError != nil {
		log.Printf("LoginUser: loggedInUser.CheckPassword(): %v", passwordError)
		w.WriteHeader(500)
		return
	}

	// this may cause issues when user updates their account but token is not updated
	// fix: make user create their own username upon signup
	tempUsername := loggedInUser.First_name + "_" + loggedInUser.Last_name + "_" + loggedInUser.Dob[6:len(loggedInUser.Dob)]
	authuuid := uuid.NewV4().String()

	// adds to auth table
	var authInsertId string
	insertErr := db.QueryRow(`
		INSERT INTO auth(user_id, auth_uuid)
		VALUES($1, $2)
		RETURNING id;
	`, tempUsername, authuuid).Scan(&authInsertId)
	if insertErr != nil {
		log.Printf("LoginUser: db.QueryRow().Scan(): %v", insertErr)
		w.WriteHeader(500)
		return
	}

	// generates JWT token string from tempUsername and authuuid
	tokenString, tokenGenErr := auth_util.GenerateJWT(tempUsername, authuuid)
	if tokenGenErr != nil {
		log.Printf("LoginUser: auth_util.GenerateJWT(tempUsername, authuuid): %v", tokenGenErr)
	}
	loggedInUserId := strconv.Itoa(loggedInUser.Id)
	log.Printf("User (id = %v) logged in", loggedInUser.Id)

	response := JsonResponseT{Type: "success", Data: []string{tokenString, loggedInUserId}, Message: "User logged in successfully"}
	json.NewEncoder(w).Encode(response)
}

func LogoutUser(w http.ResponseWriter, r *http.Request) {
	// extracts Username and Auth_uuid from JWT string
	tokenString := r.Header.Get("Authorization")
	username, authuuid := auth_util.ExtractTokenAuth(tokenString)

	// remove matching object from auth table (match user_id and auth_uuid from token)
	db := sqldb.DB
	if _, deleteErr := db.Query("DELETE FROM auth WHERE user_id = $1 AND auth_uuid = $2", username, authuuid); deleteErr != nil {
		log.Printf("LogoutUser: db.Query(): %v", deleteErr)
		w.WriteHeader(500)
		return
	}
	log.Printf("User (id = %v) logged out", username)

	response := JsonResponse{Type: "success", Message: "User logged out successfully"}
	json.NewEncoder(w).Encode(response)
}

// tests auth middleware
func TestSecuredRoute(w http.ResponseWriter, r *http.Request) {
	response := JsonResponse{Type: "success", Message: "secure route successfully accessed"}
	json.NewEncoder(w).Encode(response)
}
