const db = require("../database/connection");
const bcrypt = require("bcryptjs");

// GET
async function getUsers() {
  let result;

  const query = { text: "SELECT * FROM users" };

  try {
    result = await db.execute(query.text);
    if (result[0])
      console.log("getUsers", result[0]);
    else
      console.log("getUsers", result[0]);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query getUsers", err.stack);
  }
}

async function getUserId(userId) {
  let result;

  const query = {
    text: "SELECT id FROM users WHERE id=?",
    values: [userId]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0])
      console.log("getUserId", result[0]);
    else
      console.log("getUserId", result[0]);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query getUserId", err.stack);
  }
}

async function userExists(email) {
  let result;

  const query = {
    text: "SELECT * FROM users WHERE email=?",
    values: [email]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query userExists", err.stack);
  }
}

async function findUser(email) {
  let result;

  const query = {
    text: `SELECT * FROM users WHERE email=?`,
    values: [email]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query findUser", err.stack);
  }

}

// POST

async function registerUser(user, key) {
  let result;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);

  const query = {
    text: `INSERT INTO users (firstname, lastname, email, login, age, password, keysi) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    values: [
      user.firstName,
      user.lastName,
      user.email,
      user.login,
      user.age,
      hashedPassword,
      key
    ]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query registerUser", err.stack);
  }
}

async function saveSettings(userId, form) {
  let result;

  const {
    login,
    firstname,
    lastname,
    minage,
    maxage,
    gender,
    orientation,
    perimeter,
    bio,
    city,
    latitude,
    longitude,
    tags,
    avatar
  } = form;

  let formattedTags = tags;
  console.log(formattedTags);
  if (tags.length > 1)
    formattedTags = JSON.stringify(tags);
  console.log("format", formattedTags);

  const query = {
    text: `UPDATE users SET login = ?, firstname = ?, lastname = ?, gender = ?, minage = ?, maxage = ?, orientation = ?, perimeter = ?, bio = ?,
    city = ?, latitude = ?, longitude = ?, is_complete = ?, tags = ?, avatar = ? WHERE id = ?`,
    values: [
      login,
      firstname,
      lastname,
      gender,
      minage,
      maxage,
      orientation,
      perimeter,
      bio,
      city,
      latitude,
      longitude,
      true,
      formattedTags,
      avatar,
      userId
    ]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0])
      return true;
    else
      return false;
  } catch (err) {
    console.error("Error executing query saveSettings", err.stack);
  }
}

async function savePictures(userId, pictures) {
  let result;
  const secureUrls = pictures.map(e => e.secure_url);
  const formattedPics = `{${secureUrls.join(",")}}`;

  const query = {
    text: `UPDATE users
            SET avatar = ?
            WHERE id = ${userId}`,

    values: [formattedPics]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0])
      return pictures;
    else
      return false;
  } catch (err) {
    console.error("Error executing query savePictures", err.stack);
  }
}

// CONTEXT

async function getContextUser(email) {
  let result;

  const query = {
    text: `SELECT id, firstname, lastname, gender, age, avatar, login, email, perimeter, minage, maxage, orientation, city, is_complete, score, tags, lastconnection, latitude, longitude FROM users WHERE email=?`,
    values: [email]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query getContextUser", err.stack);
  }
}

// SEARCH & SUGGESTIONS

async function hasLiked(user, likedUser) {
  let result;

  const query = {
    text: `SELECT * FROM likes WHERE user_id = ? AND liked_user_id = ?`,
    values: [user, likedUser]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query hasLiked", err.stack);
  }
}

async function getSuggestedProfiles(searchedGender, both, userGender, userId) {
  let result;
  searchedGender = searchedGender === 1 ? 1 : 2;
  userGender = userGender === 1 ? 1 : 2;

  const query = {
    text: `SELECT id, firstname, lastname, gender, age, avatar, login, email, perimeter, minage, maxage, orientation, city, is_complete, score, latitude, longitude, bio, logged, tags, lastconnection, palette,
        EXISTS(SELECT * FROM likes WHERE user_id = ? AND liked_user_id = users.id) AS hasliked,
        EXISTS(SELECT * FROM likes WHERE user_id = users.id AND liked_user_id = ?) AS isliked,
        EXISTS(SELECT * FROM blocks WHERE blocked_id = users.id AND blocker_id = ?) AS hasblocked,
        EXISTS(SELECT * FROM blocks WHERE blocker_id = users.id AND blocked_id = ?) AS isblocked
        FROM users WHERE
        (gender = ? OR gender = ?) AND (orientation = 3 OR orientation = ?)
        AND (id <> ?)`,
    values: [
      userId,
      userId,
      userId,
      userId,
      searchedGender,
      both ? 2 : searchedGender,
      userGender,
      userId
    ]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0])
      return result[0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query getSuggestedProfiles", err.stack);
  }
  // return result.rows;
}

async function getUserInfo(userId) {
  let result;

  const query = {
    text: `SELECT * FROM users WHERE id=?`,
    values: [userId]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query getUserInfo", err.stack);
  }
}

async function getOneUser(userId, currentUserId) {
  let result;

  const query = {
    text: `SELECT id, firstname, lastname, gender, age, avatar, login, email, perimeter, minage, maxage, orientation, city, is_complete, score, latitude, longitude, bio, tags, logged, lastconnection, avatar, palette,
        EXISTS(SELECT * FROM likes WHERE user_id = ? AND liked_user_id = users.id) AS hasliked,
        EXISTS(SELECT * FROM likes WHERE user_id = users.id AND liked_user_id = ?) AS isliked,
        EXISTS(SELECT * FROM blocks WHERE blocked_id = ? AND blocker_id = ?) AS hasblocked,
        EXISTS(SELECT * FROM blocks WHERE blocked_id = ? AND blocker_id = ?) AS isblocked
        FROM users WHERE id=?`,
    values: [currentUserId, userId]
  };

  try {
    result = await db.execute(query.text, query.values);

    if (result[0])
      console.log("getOneUser", result[0])
    else
      console.log("getOneUser", result)

    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query getOneUser", err.stack);
  }
}

async function connectUser(userId, status) {
  let result;

  const query = {
    text: `UPDATE users SET logged = ?, lastconnection = localtimestamp WHERE id = ?`,
    values: [status, userId]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query connectUser", err.stack);
  }
}

async function getNotification(id) {
  let result;

  const query = {
    text: `SELECT * FROM notifications WHERE visited_id = ? ORDER BY timestamp DESC`,
    values: [id]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0])
      return result[0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query getNotification", err.stack);
  }
}

async function getUnreadNotification(id) {
  let result;

  const query = {
    text: `SELECT * FROM notifications WHERE visited_id = ? AND unread = true`,
    values: [id]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0])
      return result[0].length;
    else
      return false;
  } catch (err) {
    console.error("Error executing query getUnreadNotification", err.stack);
  }
}

async function readNotification(id) {
  let result;

  const query = {
    text: `UPDATE notifications SET unread = false WHERE visited_id = ?`,
    values: [id]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query readNotification", err.stack);
  }
}

async function saveNotification(req, res) {
  const { type, visited, visitor, timestamp } = req.body;


  const save = async (type, visited, visitor, timestamp) => {
    let result;

    const query = {
      text: `INSERT INTO notifications (type, visited_id, visitor_firstname, timestamp) VALUES(?, ?, ?, ?)`,
      values: [type, visited, visitor, timestamp]
    };

    try {
      result = await db.execute(query.text, query.values);
      if (result[0][0])
        return result[0][0];
      else
        return false;
    } catch (err) {
      console.error("Error executing query save", err.stack);
    }
  };

  save(type, visited, visitor, timestamp);

  if (type === 1)
    save(type, req.body.visitorId, "null", timestamp);
}

async function updateUserScore(visited, score) {
  let result;

  const query = {
    text: `UPDATE users SET score = ? WHERE id = ? `,
    values: [score, visited]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query updateUserScore", err.stack);
  }
}

async function updateUserInfo(id, key, value) {
  let result;

  const query = {
    text: `UPDATE users SET ${key} = ? WHERE id = ?`,
    values: [value, id]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query updateUserInfo", err.stack);
  }
}

async function keyChecker(key) {
  let result;

  const query = {
    text: `SELECT * FROM users WHERE keysi = ?`,
    values: [key]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query keyChecker", err.stack);
  }
}

async function validateAccount(email) {
  let result;

  const query = {
    text: `UPDATE users SET auth = NOT auth WHERE email = ?`,
    values: [email]
  };


  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query", err.stack);
  }
}

async function checkUserStatus(email) {
  let result;

  const query = {
    text: `SELECT * from users WHERE email = ? AND auth = true`,
    values: [email]
  };

  // return result.rowCount;
  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query checkUserStatus", err.stack);
  }
}

async function reportUser(reporterUserId, reportedUserId) {
  let result;

  const query = {
    text: `INSERT INTO reports (reporter_id, reported_id) VALUES(?, ?)`,
    values: [reporterUserId, reportedUserId]
  };

  // return result ? true : false;
  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query reportUser", err.stack);
  }
}

async function hasReported(reporterUserId, reportedUserId) {
  let result;

  const query = {
    text: `SELECT * FROM reports WHERE reporter_id = ? AND reported_id = ?`,
    values: [reporterUserId, reportedUserId]
  };

  // return result.rowCount;
  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query hasReported", err.stack);
  }
}

async function blockUser(blockerUserId, blockedUserId) {
  let result;

  const query = {
    text: `INSERT INTO blocks (blocker_id, blocked_id) VALUES(?, ?)`,
    values: [blockerUserId, blockedUserId]
  };

  // return result ? true : false;
  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query blockUser", err.stack);
  }
}

async function getUserPrivateKey(email) {
  let result;

  const query = {
    text: `SELECT keysi FROM users WHERE email = ?`,
    values: [email]
  };

  // return result.rows[0].key;
  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query getUserPrivateKey", err.stack);
  }
}

async function resetUserPassword(password, key) {
  let result;

  const query = {
    text: `UPDATE users SET password = ? WHERE keysi = ?`,
    values: [password, key]
  };

  // return result ? true : false;
  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query resetUserPassword", err.stack);
  }
}

async function resetUserPassword(password, key) {
  let result;

  const query = {
    text: `UPDATE users SET password = ? WHERE keysi = ?`,
    values: [password, key]
  };

  // return result ? true : false;

  try {
    result = await db.execute(query.text, query.values);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query resetUserPassword", err.stack);
  }
}

async function getBlockStatus(userId, currentUserId) {
  let result;

  const query = {
    text: `SELECT * FROM blocks WHERE blocker_id = ? AND blocked_id = ?`,
    values: [userId, currentUserId]
  };

  // return result.rowCount;
  try {
    result = await db.execute(query.text, query.values);
    if (result[0])
      console.log("getBlockStatus", result[0]);
    else
      console.log("getBlockStatus", result[0]);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query getBlockStatus", err.stack);
  }
}

module.exports = {
  getSuggestedProfiles,
  getUsers,
  getOneUser,
  getUserId,
  userExists,
  registerUser,
  findUser,
  saveSettings,
  savePictures,
  getContextUser,
  connectUser,
  getNotification,
  getUnreadNotification,
  readNotification,
  saveNotification,
  updateUserInfo,
  getUserInfo,
  keyChecker,
  validateAccount,
  checkUserStatus,
  reportUser,
  blockUser,
  getUserPrivateKey,
  resetUserPassword,
  updateUserScore,
  hasReported,
  getBlockStatus
};