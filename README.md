# GymSpot
Tracks workout progress, measures macronutrient intake, and calculates physique-specific calorie goals using React, Go/MUX, Python/Flask, PostgreSQL on Amazon RDS, and AWS EC2.

## Local Environment Setup
- after cloning the repo and installing dependencies, you will need to add to add .env files inside /server and /data-svc
  - /server
    - `JWT_SECRET`: secret key for generating JWT
    - `PG_DSN`: connection string for PostgreSQL database on AWS RDS
      - alternatively, you can setup a local connection with the following environment variables
      - however, you will have to replace all instances of `sqldb.ConnectDB()` with `util.SetupDB()`
      - local PostgreSQL database environment variables
        - `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - /data-svc
    - environment variables for PostgreSQL database on AWS RDS (used by default)
      - `RDS_HOST`, `RDS_DB`, `RDS_PORT`, `RDS_USER`, `RDS_PASSWORD`
    - similar to /server, a local connection to PostgreSQL can be substituted by using the following environment variables
    - however, you will have to update the connection created by get_db_connection() in ./server/util.py to connect successfully
    - local PostgreSQL datbase environment variables
      - `DB_HOST`, `DB_DB`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`

## Running the App Locally
- /server: `go run .`
- /data-svc: `python3 server.py`
- /client: `npm start`

## Account Creation
- upon successful local start, you will be directed to the login page
- click on 'Sign Up', then fill out the form
  - with 'Personal Information' try to be as accurate with your measurements as possible
- after creating your account, you may use return to the previous page to log in

![image](https://user-images.githubusercontent.com/130605175/231585340-d55f7dba-088e-43dd-9969-2a1879b44180.png)


## Home Page
- base page redirected to after successful login; also accessible by clicking 'GymSpot` in the top navigation bar
![image](https://user-images.githubusercontent.com/130605175/231585918-067984dd-5799-4647-b70e-3dc26bc15153.png)

- 'Fitness Plan' component
  - displays TDEE (total daily energy expenditure or the amount of calories you burn per day) and BMI (body mass index)
  - calculates your calorie goal (and breaks down by macronutrient) based on your 'current physique goal'
    - typically, bulking is used for gaining muscle and cutting is used for losing fat
    - the amount of calories you should eat per day will change as you change your 'current physique goal'
    - this is not a strict limit but rather a guideline to help structure your food intake (consult a physician and registered dietician before beginning a diet plan and exercise routine)
- 'Bodyweight Log' component
  - displays a record of your weight in chronological order
  - when your account is first created, this will be empty, as you have not logged your bodyweight yet
- 'Log Weight' component
  - used to log bodyweight
  - to open, click the 'Log Weight' button in the bottom right-hand corner
  - enter your weight and the day you weighed yourself, then click the 'Log Weight' button
![image](https://user-images.githubusercontent.com/130605175/231590741-6c4ccfba-ae20-4e5d-a30c-d4b983415682.png)
  - after successful log, this weight should be visible in the 'Bodyweight Log' component
  
  
## Gym Page
- contains your exercises and logged workouts; will appear empty when your account is first created
![image](https://user-images.githubusercontent.com/130605175/231587828-fbff50bd-5491-460f-9435-902a6bc299b3.png)
- 'Exercises' component
  - displays all exercises you have added (an exercise must be created before it can be logged)
  - click on the 'New Exercise' button to create an exercise
  ![image](https://user-images.githubusercontent.com/130605175/231597517-459fc6bf-8d83-4497-b20b-95082328f981.png)
- 'Workouts' component
  - displays logged workouts in chronological order
  - as you complete a workout, you can find the exercise you did in 'Exercises' and then click the green '+' button to log it
  ![image](https://user-images.githubusercontent.com/130605175/231597801-e7385955-fd1e-424d-82d4-11009f31025f.png)
  - inside reps, type in a comma-separated value representing the reps you did each set (e.g. 4,4,4 = 3 sets of 4 reps)
    - I chose to record reps and sets this way, as it allows for more accurate tracking (e.g. missing your last rep on the last set of 3x10 is more accurately described as 10,10,9 instead of 3x10)

## Diet Page
- contains your foods and diet logs; will appear empty when your account is first created
![image](https://user-images.githubusercontent.com/130605175/231588617-8a1a1452-5a1f-43c5-8d3e-cd86e2d68f8c.png)

- 'Pantry' component
  - displays all foods that you have added to your pantry
  - most foods and drinks will have a nutrition label that provides the calories and macronutrients per serving
  ![image](https://user-images.githubusercontent.com/130605175/231595845-a56b489c-b547-4852-8d75-79a5f6c3cbe2.png)
    - if you are eating out, look up the restaurant's nutritional information and find the item you consumed (most large food chains are good about providing this information)
    - if you bought something without a label (e.g. fresh produce or meat), you can usually find the nutritional information online
  - to add a food to your pantry, click on the 'New Food' button
  ![image](https://user-images.githubusercontent.com/130605175/231595946-4980968f-1fc4-4519-9061-698c757f7bf1.png)
    - using the nutrition label, enter in the relevant information for your food
      - for 'Serving Size', I typically use the weight of one serving (e.g. 45 grams)
      - however, sometimes it may make more sense to use a quantity (e.g. 2 snack size Kit Kats weighing 28 grams total is one serving, but it doesn't make sense to weigh them out since they are produced roughly the same and contain the same nutrition per package, thus counting is an accurate and acceptable way of measuring)
      ![image](https://user-images.githubusercontent.com/130605175/231596890-741f9abf-aab1-43e0-ba00-d164e9520a80.png)

- 'Diet Log' component
  - displays diet log for specified date
  ![image](https://user-images.githubusercontent.com/130605175/231594539-28f1f791-8be3-449a-96f9-e1835a6eb597.png)
  - selected diet log can be edited (e.g. adjusting logged food weight or deleting logged food) by clicking the 'Edit' button
- 'Past Logs' component
  - lists total calories consumed by date in chronological order

## Progress Page
- displays graph of TDEE and calorie intake over time; for TDEE to appear, FitBit data must be uploaded (see below)
![image](https://user-images.githubusercontent.com/130605175/231589003-7b2a3ef0-bdfb-4931-8010-0ab426d9c602.png)
- 'Calorie Trends' component
  - displays TDEE and calorie intake data versus time in a line graph
    - TDEE data originates from FitBit data, calorie intake data is pulled from your diet logs
  - dates can be changed to display data for a specific time range
- 'Upload Data' component
![Screen Shot 2023-04-12 at 2 43 00 PM](https://user-images.githubusercontent.com/130605175/231592590-896a5069-a2b3-4ee8-8299-accdf628c202.png)
  - used to upload .zip file containing FitBit data (e.g. FitBit Charge 5, FitBit Inspire 3)
    - please follow the instructions
  - at this time, no other devices are supported
    - however, if you use another device to track your TDEE (e.g. Apple Watch), you can use a workout to format your data manually to make it compatible with the ETL pipeline
      - create a folder, then inside of it, create a folder named 'Physicial Activity'
      - inside 'Physical Activity', create a file named 'calories.json' (you can also have multiple json files in 'Physical Activity', just ensure the file name starts with 'calories' and uses the '.json' file extension)
      - each object should have a `dateTime` representing the date, and a `value` representing that day's TDEE
      ![Screen Shot 2023-04-12 at 2 48 46 PM](https://user-images.githubusercontent.com/130605175/231593633-388a208c-b0f9-4e8a-bb48-6e444ac0fb08.png)
  - after loading the correct file, click the 'Upload' button
  - a loading indicator will appear, please wait until it completes before exiting (data processing usually takes around a minute)
  - once the success message appears and the page reloads, your TDEE data should appear in the 'Calorie Trends' component

## Settings Page
- 'Personal Information' component
![Screen Shot 2023-04-12 at 3 17 28 PM](https://user-images.githubusercontent.com/130605175/231598450-734896ea-0f8d-4c6a-ad47-7f43d320ed53.png)
  - used to change personal information of account (e.g. name, dob, height)
  - 'Save Info' must be clicked to update this information, otherwise, it will be lost
- 'Account Settings' component
![Screenshot](https://user-images.githubusercontent.com/130605175/231590007-cb2f133d-7cf1-4070-9122-1af7a4bd86e4.png)
  - used to change email and/or password of GymSpot account
  - old email and password must be correct and new email and/or password must match, otherwise, the settings will not be change when the 'Update Account' button is clicked
- 'Contact Support' component
![Screenshot](https://user-images.githubusercontent.com/130605175/231590235-58d1f631-67c4-4ad8-bb93-f5780c34ac09.png)
  - used to send me message regarding the application
  - inside the form, 'Contact Email' does not have to be the email you used to sign up for GymSpot, but doing so will help me find your account (an issue may be specific to your GymSpot account)



  
  
  
  
  
