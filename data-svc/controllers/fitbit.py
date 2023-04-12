import pandas as pd
from datetime import datetime
import time
from util import get_db_connection


# returns dataframe of all calorie data extracted from json files


def extract_calorie_data(files):
    # parses each file in files_df and adds data to cal_df
    cal_df = pd.DataFrame(columns=['date', 'calories_burned'])
    for file in files:
        activity_df = pd.read_json(file)

        # converts dateTime col to str and value col to float
        activity_df['dateTime'] = activity_df['dateTime'].astype(str)
        activity_df['value'] = activity_df['value'].replace(
            ',', '', regex=True).astype(float)

        # extracts date from dateTime column, drops dateTime and time columns
        if (activity_df['dateTime'].str.split(
                ' ', expand=True).shape[1] > 1):
            activity_df[['date', 'time']] = activity_df['dateTime'].str.split(
                ' ', expand=True)
            activity_df = activity_df.drop(columns=["dateTime", "time"])
        else:
            activity_df = activity_df.rename(columns={"dateTime": "date"})

        # renames value column to calories_burned
        activity_df = activity_df.rename(columns={"value": "calories_burned"})

        # groups rows by date, then adds rows to cal_df
        grouped_df = activity_df.groupby("date").sum()
        cal_df = pd.concat([cal_df, grouped_df])

    # creates date column with data type and sorts rows by date in descending order
    min_df = cal_df[["calories_burned"]].copy()
    min_df = min_df.reset_index()
    min_df = min_df.rename(columns={"index": "date"})
    min_df['date'] = pd.to_datetime(min_df['date'], format='%Y-%m-%d')
    min_df.sort_values(by="date", ascending=True, inplace=True)

    return min_df

# returns user's calorie expenditure data for days between start and end dates


def get_tdee_data(user_id, start, end, in_milliseconds=False):
    # gets data_path from users table
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT data_path FROM users
        WHERE id = %s
    """, (user_id, ))
    data_path = cur.fetchone()[0]
    cur.close()
    conn.close()

    # converts csv to dataframe, date column converted from string to datetime
    df = pd.read_csv(data_path)
    df['date'] = pd.to_datetime(df['date'], format="%Y-%m-%d")

    # converts timestamp from int to dateime, performs millisecond conversion if necessary
    if (in_milliseconds):
        start /= 1000
        end /= 1000
    start_date = datetime.fromtimestamp(start)
    end_date = datetime.fromtimestamp(end)

    # selects rows where date in range of start_date and end_date (inclusive)
    df = df.loc[(df["date"] >= start_date) & (df["date"] <= end_date), [
        "date", "calories_burned"]]
    dates = df["date"].tolist()
    calories = df["calories_burned"].tolist()

    return {"dates": dates, "calories": calories}


# returns user's calorie intake data for days between start and end dates
def get_diet_data(user_id, start, end, in_milliseconds=False):
   # converts timestamp from int to dateime, performs millisecond conversion if necessary
    if (in_milliseconds):
        start /= 1000
        end /= 1000
    start_date = datetime.fromtimestamp(start)
    end_date = datetime.fromtimestamp(end)

    # gets grouped diet data (total cal + macros for each day)
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT date, SUM(consumed_fat) AS total_fat, SUM(consumed_carbs) AS total_carbs, SUM(consumed_protein) AS total_protein, SUM(consumed_cal) AS total_cal FROM dietlogs
        WHERE user_id = %s AND date >= %s AND date <= %s
        GROUP BY date
        ORDER BY date;
    """, (user_id, start_date, end_date))
    diet_data = cur.fetchall()
    cur.close()
    conn.close()

    # reads diet_data into dataframe, rounds floats to nearest whole number, extracts col values
    df = pd.DataFrame(diet_data, columns=[
                      'date', 'fat', 'carbs', 'protein', 'cal'])
    df = df.round({'fat': 0, "carbs": 0, "protein": 0, "cal": 0})
    dates = df['date'].to_list()
    fat = df['fat'].to_list()
    carbs = df['carbs'].to_list()
    protein = df['protein'].to_list()
    cal = df['cal'].to_list()

    return {"dates": dates, "fat": fat, "carbs": carbs, "protein": protein, "cal": cal}


# gets earliest and latest dates from user's calorie expenditure data
def get_tdee_data_bounds(user_id):
    # gets data_path from users table
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT data_path FROM users
        WHERE id = %s
    """, (user_id, ))
    data_path = cur.fetchone()[0]
    cur.close()
    conn.close()

    # converts csv to dataframe, gets min and max from date column
    df = pd.read_csv(data_path)
    min_date_str = df['date'].min()
    max_date_str = df['date'].max()

    # converts string to epoch
    min_date_epoch = datetime.strptime(min_date_str, '%Y-%m-%d').timestamp()
    max_date_epoch = datetime.strptime(max_date_str, '%Y-%m-%d').timestamp()

    return {"min": min_date_epoch, "max": max_date_epoch}


# gets earliest and latest dates from user's calorie intake data
def get_diet_data_bounds(user_id):
    # gets min and max dates from dietlogs table
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT MIN(date) AS min, MAX(date) AS max FROM dietlogs
        WHERE user_id = %s
    """, (user_id, ))
    dates = cur.fetchall()[0]
    cur.close()
    conn.close()

    # converts datetime to epoch (dt -> str -> dt due to missing timestamp() attribute bug)
    min_date_epoch = datetime.strptime(
        dates[0].strftime("%m/%d/%Y"), "%m/%d/%Y").timestamp()
    max_date_epoch = datetime.strptime(
        dates[1].strftime("%m/%d/%Y"), "%m/%d/%Y").timestamp()

    return {"min": min_date_epoch, "max": max_date_epoch}

# saves path in users table


def save_data_path(path, user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE users
        SET data_path = %s
        WHERE id = %s;
    """, (path, user_id))
    conn.commit()
    cur.close()
    conn.close()
