from flask import Flask, Response, request, json
from flask_cors import CORS, cross_origin
from controllers.fitbit import extract_calorie_data, get_tdee_data, get_diet_data, get_tdee_data_bounds, get_diet_data_bounds, save_data_path
import zipfile
from io import BytesIO, StringIO
from util import get_db_connection
import time
import pandas as pd

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/', methods=['GET'])
def check_db_conn():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM users;')
    users = cur.fetchall()
    cur.close()
    conn.close()
    return users


@app.route('/data-svc/fitbit', methods=["POST"])
@cross_origin()
def extract_files():
    # checks that file passed in request
    fileExists = 'file' in request.files
    if not fileExists:
        data = {"type": "error", "error": "No file found in request"}
        response = Response(response=json.dumps(
            data), status=400, mimetype='application/json')
        return response

    # checks that a ".zip" file has been uploaded
    file = request.files['file']
    filename = file.filename
    filetype = filename.split('.')[-1]
    if (filetype != 'zip'):
        data = {"type": "error",
                "error": f"Uploaded file was not a .zip file, received a {filetype} file instead"}
        response = Response(response=json.dumps(
            data), status=400, mimetype='application/json')
        return response

    # gets all filenames inside zipfile, checks that zipfile contains data
    file_like_object = file.stream._file
    zipfile_ob = zipfile.ZipFile(file_like_object)
    file_names = zipfile_ob.namelist()
    if not len(file_names):
        data = {"type": "error",
                "error": "Uploaded .zip file did not contain any data"}
        response = Response(response=json.dumps(
            data), status=400, mimetype='application/json')
        return response

    # gets calorie json filenames from extracted FitBit data folder, checks that zipfile contains these files
    calorie_file_names = []
    for file_name in file_names:
        name_split = file_name.split('/')
        if (len(name_split) == 3 and name_split[1] == "Physical Activity" and "calories" in name_split[2] and name_split[2].split('.')[-1] == "json"):
            calorie_file_names.append(file_name)
    if not len(calorie_file_names):
        data = {"type": "error",
                "error": "Uploaded .zip file did not contain any calorie data"}
        response = Response(response=json.dumps(
            data), status=400, mimetype='application/json')
        return response

    # creates list of calorie json files (filename -> byte object -> file-like object)
    calorie_files = [BytesIO(zipfile_ob.open(name).read())
                     for name in calorie_file_names]

    # creates dataframe of calorie data from json files, saves to csv
    outpath = f"/Users/justinbaytosh/Desktop/coding/projects/gym-spot/data-svc/resources/{file_names[0].split('/')[0]}_calories.csv"
    start = time.time()
    cal_df = extract_calorie_data(calorie_files)
    print(f"extract_calorie_data(): {time.time() - start} seconds")
    cal_df.to_csv(outpath, index=False)

    # updates user's data_path to outpath in users table
    save_data_path(outpath, int(request.args.get('user_id')))

    return {'type': 'success'}


@app.route('/data-svc/bodyweight', methods=["POST"])
@cross_origin()
def parse_weights_csv():
    user_id = int(request.args.get('user_id'))

    # reads csv from request into dataframe
    file = request.files['file']
    df = pd.read_csv(file.stream._file)
    df = df.rename(columns={"Date": "date", "Weight (lbs)": "weight"})

    # creates new column "str", which represents SQL code for inserting row of values into bodyweights table
    df['str'] = df.apply(
        lambda row: f"({str(row.weight)}, \'{row.date.split(' ')[0]}\', {user_id})", axis=1)

    # creates insert str for sql
    query = """
        INSERT INTO bodyweights(weight, date, user_id)
        VALUES
    """
    for row in df['str'].tolist():
        query += row + ','
    query = query[:-1] + ';'
    print(query)

    # runs query on db, inserting new bodyweights into bodyweights table
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(query)
    cur.close()
    conn.close()
    print(
        f"parse_weights_csv: {df.shape[0]} records inserted into bodyweights table for user_id = {user_id}")

    return {"type": "success"}


@app.route('/data-svc/user-data', methods=['GET'])
def get_user_data():
    # gets URL query parameters
    user_id = int(request.args.get('user_id'))
    start = int(request.args.get('start'))
    end = int(request.args.get('end'))

    # gets calorie expenditure data for specified date range
    tdee_data = get_tdee_data(user_id, start, end)

    # gets calorie intake data for specified date range
    diet_data = get_diet_data(user_id, start, end)

    return {"type": "success", "data": {"tdee": tdee_data, "diet": diet_data}}


@app.route('/data-svc/bounds', methods=["GET"])
def get_bounds():
    # gets URL query parameters
    user_id = int(request.args.get('user_id'))

    # gets bounding dates for: 1. calorie expenditure data, 2. calorie intake data
    tdee_bounds = get_tdee_data_bounds(user_id)
    diet_bounds = get_diet_data_bounds(user_id)

    # gets min of mins, max of maxes
    min_bound = min(tdee_bounds["min"], diet_bounds["min"])
    max_bound = max(tdee_bounds["max"], diet_bounds["max"])

    return {"min": min_bound, "max": max_bound}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=105)
