package auth_util

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"example/gymspot/sqldb"

	"github.com/dgrijalva/jwt-go"
	"github.com/joho/godotenv"
)

type JWTClaim struct {
	Username  string `json:"username"`
	Auth_uuid string `json:"authuuid"`
	jwt.StandardClaims
}

// gets JWT secret from .env file
func getJwtKey() (jwtKey []byte) {
	envFile, _ := godotenv.Read(".env")
	jwtSecret := envFile["JWT_SECRET"]

	return []byte(jwtSecret)
}

// generates JWT from username and authuuid
func GenerateJWT(username string, authuuid string) (tokenString string, err error) {
	// sets token to expire in 1 hour
	expirationTime := time.Now().Add(1 * time.Hour)

	claims := &JWTClaim{
		Username:       username,
		Auth_uuid:      authuuid,
		StandardClaims: jwt.StandardClaims{ExpiresAt: expirationTime.Unix()},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	jwtKey := getJwtKey()

	tokenString, err = token.SignedString(jwtKey)
	return
}

// checks that token is valid
func ValidateToken(signedToken string) (err error) {
	// parses signedToken
	token, tokenParseErr := jwt.ParseWithClaims(
		signedToken,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			jwtKey := getJwtKey()
			return []byte(jwtKey), nil
		},
	)
	if tokenParseErr != nil {
		return
	}

	// parses token claims
	claims, ok := token.Claims.(*JWTClaim)
	if !ok {
		err = errors.New("couldn't parse claims")
		return
	}

	// checks that token credentials are in auth table
	db := sqldb.DB
	var loggedInUser string
	authDbErr := db.QueryRow(`
		SELECT id FROM auth
		WHERE user_id = $1 AND auth_uuid = $2
	`, claims.Username, claims.Auth_uuid).Scan(&loggedInUser)
	if authDbErr != nil {
		err = errors.New("credentials not in auth table")
		return
	}

	// checks that token has not passed expiration date
	if claims.ExpiresAt < time.Now().Local().Unix() {
		err = errors.New("token expired")
		return
	}

	return
}

// extracts username and authuuid from tokenString
func ExtractTokenAuth(tokenString string) (username string, authuuid string) {
	// parses tokenString
	token, _, tokenParseErr := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
	if tokenParseErr != nil {
		fmt.Printf("Error %s", tokenParseErr)
		return
	}

	// parses token claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		fmt.Printf("couldn't parse claims")
		return
	}

	return claims["username"].(string), claims["authuuid"].(string)
}

// checks that request header contains valid token
func TokenCheckMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			log.Printf("Request does not contain an access token")
			w.WriteHeader(401)
			return
		}
		err := ValidateToken(tokenString)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		next(w, r)
	}
}
