const db = require("../database/connection");

const setLike = async obj => {
  let result;
  const { user, likedUser, interested } = obj;
  const query = {
    text: `INSERT INTO
                likes (
                  liked_user_id,
                  interested,
                  user_id
                )
                VALUES(?, ?, ?)`,
    values: [likedUser, interested, user]
  };
  try {
    result = await db.query(query.text, query.values, (error, results) => {
      if (error) {
        throw error
      }
    });
    return result ? true : false;
  } catch (err) {
    console.log("Error executing query setLike", err.message);
  }
};

const DelLike = async obj => {
  let result;
  const { user, likedUser } = obj;
  const query = {
    text: `DELETE from likes WHERE liked_user_id = ? AND user_id = ?`,
    values: [likedUser, user]
  };
  try {
    result = await db.query(query.text, query.values, (error, results) => {
      if (error) {
        throw error
      }
    });
    return result ? true : false;
  } catch (err) {
    console.log("Error executing query DelLike", err.message);
  }
};

module.exports = {
  setLike,
  DelLike
};
