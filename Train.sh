export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=dfki_music_recommender
export DB_USER=root
export DB_PASS=root
java -jar config/TensorFactorization/Train.jar ./config/data/models/model.ser
