// demoData.js
export const demoData = [
  {
    topic: "PCA",
    question: "What is the main goal of Principal Component Analysis (PCA)?",
    options: [
      "To increase the number of features",
      "To reduce dimensionality while retaining variance",
      "To cluster similar data points",
      "To normalize the dataset"
    ],
    answer: 1,
    code: `from sklearn.decomposition import PCA
import numpy as np

X = np.array([[2.5, 2.4],
              [0.5, 0.7],
              [2.2, 2.9],
              [1.9, 2.2]])

pca = PCA(n_components=1)
X_reduced = pca.fit_transform(X)
print(X_reduced)`,
    explanation:
      "PCA reduces dimensionality by transforming correlated features into uncorrelated components called principal components, capturing the maximum variance in the data."
  }
];
