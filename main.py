import pandas as pd
from sklearn.linear_model import LogisticRegression
import matplotlib.pyplot as plt

# Dataset
data = {
    "study_hours": [1,2,3,4,5,6,7],
    "sleep_hours": [5,6,7,8,6,7,8],
    "screen_time": [6,5,4,3,2,2,1],
    "performance": [0,0,1,1,1,1,1],
    "productivity": [0,0,1,1,2,2,2]
}

df = pd.DataFrame(data)

# Features
X = df[["study_hours", "sleep_hours", "screen_time"]]

# Targets
y1 = df["performance"]
y2 = df["productivity"]

# Models
model_performance = LogisticRegression()
model_productivity = LogisticRegression()

model_performance.fit(X, y1)
model_productivity.fit(X, y2)

# User Input
study = int(input("Enter study hours: "))
sleep = int(input("Enter sleep hours: "))
screen = int(input("Enter screen time: "))

# Predictions
perf = model_performance.predict([[study, sleep, screen]])
prod = model_productivity.predict([[study, sleep, screen]])

print("\nPerformance (0=Bad,1=Good):", perf)
print("Productivity (0=Low,1=Medium,2=High):", prod)

# Graphs
plt.figure(figsize=(10,4))

# Performance graph
plt.subplot(1,2,1)
plt.scatter(df["study_hours"], df["performance"])
plt.title("Study Hours vs Performance")
plt.xlabel("Study Hours")
plt.ylabel("Performance")

# Productivity graph
plt.subplot(1,2,2)
plt.scatter(df["study_hours"], df["productivity"])
plt.title("Study Hours vs Productivity")
plt.xlabel("Study Hours")
plt.ylabel("Productivity")

plt.show()