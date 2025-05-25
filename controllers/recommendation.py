import joblib
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

model_data = joblib.load('reco_model.pkl')

items = model_data['items']
ratings = model_data['ratings']
content_sim = model_data['content_sim']
pivot = model_data['pivot']
knn = model_data['knn']

def hybrid_recommend(user_id, top_n=3):
    rated_items = ratings[ratings['user_id'] == user_id]['item_id'].tolist()
    if len(rated_items) == 0:
        return []

    # Similarité contenu
    sim_scores = np.mean([content_sim[i - 1] for i in rated_items], axis=0)

    # Similarité utilisateur
    if user_id not in pivot.index:
        return []

    user_vec = pivot.loc[user_id].values.reshape(1, -1)
    distances, indices = knn.kneighbors(user_vec, n_neighbors=3)
    similar_users = pivot.index[indices.flatten()].tolist()
    similar_users = [u for u in similar_users if u != user_id]

    collab_series = pivot.loc[similar_users].mean() if similar_users else None

    all_item_ids = items['item_id'].tolist()
    collab_scores = {item_id: 0.0 for item_id in all_item_ids}
    if collab_series is not None:
        for item_id, val in collab_series.items():
            if item_id in collab_scores:
                collab_scores[item_id] = val

    hybrid_scores = []
    for i, item_id in enumerate(all_item_ids):
        score = 0.5 * sim_scores[i] + 0.5 * collab_scores.get(item_id, 0)
        hybrid_scores.append((item_id, score))

    recommendations = [(item_id, score) for item_id, score in hybrid_scores if item_id not in rated_items]
    recommendations.sort(key=lambda x: x[1], reverse=True)

    return recommendations[:top_n]

@app.route("/recommend", methods=["POST"])
def recommend():
    user_id = request.json.get("user_id")
    if user_id is None:
        return jsonify({"error": "user_id is required"}), 400

    recs = hybrid_recommend(user_id)
    results = []
    for item_id, score in recs:
        title = items[items['item_id'] == item_id]['title'].values[0]
        description = items[items['item_id'] == item_id]['description'].values[0]
        rating = ratings[ratings['item_id'] == item_id]['rating'].values[0]
        results.append({"item_id": int(item_id),"title": str(title),"score": float(score),"description": str(description),"rating": int(rating)})  # ou int(rating) selon le cas})
    return jsonify({"recommendations": results})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
