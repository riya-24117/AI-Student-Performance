import pandas as pd
from sklearn.linear_model import LogisticRegression

# Dataset
data = {
    "study_hours": [2,4,6,1,5,7],
    "sleep_hours": [5,7,8,4,6,7],
    "screen_time": [6,3,2,7,4,2],
    "performance": [0,1,1,0,1,1]
}

df = pd.DataFrame(data)

# Input (features)
X = df[["study_hours", "sleep_hours", "screen_time"]]

# Output (target)
y = df["performance"]

# Model
model = LogisticRegression()
model.fit(X, y)

# Prediction
result = model.predict([[3,6,5]])

print("Prediction (1=Good, 0=Bad):", result)
import pandas as pd
import matplotlib
matplotlib.use('TkAgg')
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
plt.scatter(df["study_hours"], df["performance"])
plt.xlabel("Study Hours")
plt.ylabel("Performance")
plt.title("Study Hours vs Performance")
plt.show()