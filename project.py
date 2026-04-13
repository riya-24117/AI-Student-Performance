import pandas as pd

data = {
    "study_hours": [2,4,6],
    "sleep_hours": [5,7,8],
    "screen_time": [6,3,2],
    "performance": [0,1,1]
}

df = pd.DataFrame(data)

print(df)