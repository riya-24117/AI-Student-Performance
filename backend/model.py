"""
AI Student Performance & Productivity Model
Trains Random Forest (classification) and Gradient Boosting (regression)
on synthetic student data for performance and productivity prediction.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler


class StudentPerformanceModel:
    """Handles data generation, model training, prediction, and analytics."""

    FEATURE_NAMES = [
        "study_hours",
        "sleep_hours",
        "screen_time",
        "attendance",
        "assignments_completed",
        "previous_grade",
        "extracurricular_hours",
        "stress_level",
    ]

    PERFORMANCE_LABELS = {0: "Poor", 1: "Average", 2: "Good", 3: "Excellent"}

    def __init__(self):
        self.performance_model = None
        self.productivity_model = None
        self.scaler = StandardScaler()
        self.performance_accuracy = 0.0
        self.productivity_r2 = 0.0
        self.feature_importances = {}
        self.data = None
        self._generate_and_train()

    # ------------------------------------------------------------------ #
    #  Data generation
    # ------------------------------------------------------------------ #

    @staticmethod
    def _generate_synthetic_data(n: int = 1000) -> pd.DataFrame:
        """Create a realistic synthetic student dataset."""
        rng = np.random.default_rng(42)

        study_hours = rng.uniform(0, 10, n)
        sleep_hours = rng.uniform(4, 10, n)
        screen_time = rng.uniform(0, 8, n)
        attendance = rng.uniform(30, 100, n)
        assignments_completed = rng.uniform(20, 100, n)
        previous_grade = rng.uniform(2, 10, n)
        extracurricular_hours = rng.uniform(0, 8, n)
        stress_level = rng.uniform(1, 10, n)

        # Weighted composite score → determines performance category
        raw_score = (
            study_hours * 8
            + sleep_hours * 5
            - screen_time * 4
            + attendance * 0.3
            + assignments_completed * 0.3
            + previous_grade * 5
            + extracurricular_hours * 2
            - stress_level * 3
            + rng.normal(0, 5, n)
        )
        norm_score = (raw_score - raw_score.min()) / (raw_score.max() - raw_score.min()) * 100
        performance = np.digitize(norm_score, [25, 50, 75])  # 0‑3

        # Productivity continuous score (0‑100)
        raw_prod = (
            study_hours * 6
            + sleep_hours * 4
            - screen_time * 5
            + assignments_completed * 0.4
            - stress_level * 2
            + rng.normal(0, 5, n)
        )
        productivity = (raw_prod - raw_prod.min()) / (raw_prod.max() - raw_prod.min()) * 100

        return pd.DataFrame(
            {
                "study_hours": np.round(study_hours, 1),
                "sleep_hours": np.round(sleep_hours, 1),
                "screen_time": np.round(screen_time, 1),
                "attendance": np.round(attendance, 1),
                "assignments_completed": np.round(assignments_completed, 1),
                "previous_grade": np.round(previous_grade, 1),
                "extracurricular_hours": np.round(extracurricular_hours, 1),
                "stress_level": np.round(stress_level, 1),
                "performance": performance,
                "productivity": np.round(productivity, 1),
            }
        )

    # ------------------------------------------------------------------ #
    #  Training
    # ------------------------------------------------------------------ #

    def _generate_and_train(self):
        self.data = self._generate_synthetic_data()

        X = self.data[self.FEATURE_NAMES]
        y_perf = self.data["performance"]
        y_prod = self.data["productivity"]

        X_train, X_test, y_perf_train, y_perf_test = train_test_split(
            X, y_perf, test_size=0.2, random_state=42
        )
        _, _, y_prod_train, y_prod_test = train_test_split(
            X, y_prod, test_size=0.2, random_state=42
        )

        X_train_sc = self.scaler.fit_transform(X_train)
        X_test_sc = self.scaler.transform(X_test)

        # Performance classifier
        self.performance_model = RandomForestClassifier(
            n_estimators=100, random_state=42
        )
        self.performance_model.fit(X_train_sc, y_perf_train)
        self.performance_accuracy = accuracy_score(
            y_perf_test, self.performance_model.predict(X_test_sc)
        )

        # Productivity regressor
        self.productivity_model = GradientBoostingRegressor(
            n_estimators=100, random_state=42
        )
        self.productivity_model.fit(X_train_sc, y_prod_train)
        self.productivity_r2 = self.productivity_model.score(X_test_sc, y_prod_test)

        self.feature_importances = dict(
            zip(
                self.FEATURE_NAMES,
                self.performance_model.feature_importances_.tolist(),
            )
        )

        print(
            f"[OK] Models trained -- Performance accuracy: {self.performance_accuracy:.1%}  |  "
            f"Productivity R2: {self.productivity_r2:.1%}"
        )

    # ------------------------------------------------------------------ #
    #  Prediction
    # ------------------------------------------------------------------ #

    def predict(self, input_data: dict) -> dict:
        features = np.array(
            [[input_data[f] for f in self.FEATURE_NAMES]]
        )
        features_sc = self.scaler.transform(features)

        perf_idx = int(self.performance_model.predict(features_sc)[0])
        perf_proba = self.performance_model.predict_proba(features_sc)[0].tolist()
        prod_score = float(self.productivity_model.predict(features_sc)[0])
        prod_score = max(0.0, min(100.0, prod_score))

        # Risk assessment
        if perf_idx <= 1 or prod_score < 40:
            risk = "High"
        elif perf_idx == 2 or prod_score < 60:
            risk = "Medium"
        else:
            risk = "Low"

        labels = [self.PERFORMANCE_LABELS[i] for i in sorted(self.PERFORMANCE_LABELS)]

        return {
            "performance": {
                "label": self.PERFORMANCE_LABELS[perf_idx],
                "value": perf_idx,
                "probabilities": {
                    labels[i]: round(p, 3) for i, p in enumerate(perf_proba)
                },
            },
            "productivity": {
                "score": round(prod_score, 1),
                "level": (
                    "High" if prod_score >= 70 else "Medium" if prod_score >= 40 else "Low"
                ),
            },
            "risk_level": risk,
            "recommendations": self._generate_recommendations(
                input_data, perf_idx, prod_score
            ),
        }

    # ------------------------------------------------------------------ #
    #  Recommendations
    # ------------------------------------------------------------------ #

    @staticmethod
    def _generate_recommendations(
        data: dict, perf: int, prod: float
    ) -> list[dict]:
        recs: list[dict] = []

        if data["study_hours"] < 4:
            recs.append(
                {
                    "category": "Study",
                    "icon": "Book",
                    "title": "Increase Study Hours",
                    "description": (
                        f"Currently at {data['study_hours']}h/day. "
                        "Aim for at least 4‑5 hours for better results."
                    ),
                    "priority": "high",
                }
            )

        if data["sleep_hours"] < 7:
            recs.append(
                {
                    "category": "Health",
                    "icon": "Moon",
                    "title": "Improve Sleep Schedule",
                    "description": (
                        f"Getting only {data['sleep_hours']}h of sleep. "
                        "Aim for 7‑8 hours for optimal cognitive function."
                    ),
                    "priority": "high",
                }
            )

        if data["screen_time"] > 4:
            recs.append(
                {
                    "category": "Lifestyle",
                    "icon": "Smartphone",
                    "title": "Reduce Screen Time",
                    "description": (
                        f"Screen time is {data['screen_time']}h/day. "
                        "Try to limit recreational screen time to under 3 hours."
                    ),
                    "priority": "medium",
                }
            )

        if data["attendance"] < 75:
            recs.append(
                {
                    "category": "Academic",
                    "icon": "School",
                    "title": "Improve Attendance",
                    "description": (
                        f"Attendance is at {data['attendance']}%. "
                        "Aim for at least 85% for better understanding."
                    ),
                    "priority": "high",
                }
            )

        if data["stress_level"] > 7:
            recs.append(
                {
                    "category": "Wellness",
                    "icon": "Brain",
                    "title": "Manage Stress Levels",
                    "description": (
                        f"Stress level is high ({data['stress_level']}/10). "
                        "Consider meditation, exercise, or counseling."
                    ),
                    "priority": "high",
                }
            )

        if data["assignments_completed"] < 70:
            recs.append(
                {
                    "category": "Academic",
                    "icon": "CheckSquare",
                    "title": "Complete More Assignments",
                    "description": (
                        f"Assignment completion is at {data['assignments_completed']}%. "
                        "Try to complete at least 80%."
                    ),
                    "priority": "medium",
                }
            )

        if data["extracurricular_hours"] < 1:
            recs.append(
                {
                    "category": "Growth",
                    "icon": "Target",
                    "title": "Join Extracurricular Activities",
                    "description": (
                        "Extracurricular activities boost overall development. "
                        "Consider joining a club or sport."
                    ),
                    "priority": "low",
                }
            )

        if data["previous_grade"] < 5:
            recs.append(
                {
                    "category": "Academic",
                    "icon": "BookOpen",
                    "title": "Focus on Weak Subjects",
                    "description": (
                        f"Previous grade is {data['previous_grade']}/10. "
                        "Identify weak areas and seek extra help or tutoring."
                    ),
                    "priority": "high",
                }
            )

        if not recs:
            recs.append(
                {
                    "category": "General",
                    "icon": "Star",
                    "title": "Keep Up the Great Work!",
                    "description": (
                        "Your habits look excellent. Maintain consistency "
                        "and continue to challenge yourself."
                    ),
                    "priority": "low",
                }
            )

        return recs

    # ------------------------------------------------------------------ #
    #  Analytics
    # ------------------------------------------------------------------ #

    def get_analytics(self) -> dict:
        data = self.data

        perf_dist = data["performance"].value_counts().sort_index().to_dict()

        avg_by_perf = (
            data.groupby("performance")[self.FEATURE_NAMES].mean().round(2)
        )

        prod_corr = (
            data[self.FEATURE_NAMES + ["productivity"]]
            .corr()["productivity"]
            .drop("productivity")
            .round(3)
            .to_dict()
        )

        return {
            "performance_distribution": {
                self.PERFORMANCE_LABELS.get(k, str(k)): int(v)
                for k, v in perf_dist.items()
            },
            "feature_importances": self.feature_importances,
            "productivity_correlations": prod_corr,
            "avg_metrics_by_performance": {
                self.PERFORMANCE_LABELS.get(k, str(k)): row.to_dict()
                for k, row in avg_by_perf.iterrows()
            },
            "model_metrics": {
                "performance_accuracy": round(self.performance_accuracy * 100, 1),
                "productivity_r2": round(self.productivity_r2 * 100, 1),
            },
            "dataset_size": len(data),
        }

    def get_model_info(self) -> dict:
        return {
            "models": [
                {
                    "name": "Performance Classifier",
                    "type": "Random Forest",
                    "accuracy": round(self.performance_accuracy * 100, 1),
                    "description": "Classifies student performance into Poor, Average, Good, or Excellent categories.",
                },
                {
                    "name": "Productivity Predictor",
                    "type": "Gradient Boosting",
                    "r2_score": round(self.productivity_r2 * 100, 1),
                    "description": "Predicts a continuous productivity score from 0 to 100.",
                },
            ],
            "features": self.FEATURE_NAMES,
            "dataset_size": len(self.data),
            "feature_importances": self.feature_importances,
        }
