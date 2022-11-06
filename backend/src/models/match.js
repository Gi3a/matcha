const db = require("../database/connection");

const setMatch = async obj => {
  let result;
  const { user, likedUser } = obj;

  const query = {
    text: `INSERT INTO
                matches (
                  id_user1,
                  id_user2,
                  timestamp
                )
                VALUES(?, ?, localtimestamp)`,
    values: [user, likedUser]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0])
      return true;
    else
      return false;
  } catch (err) {
    console.error("Error executing query setMatch", err.stack);
  }
};

const delMatch = async obj => {
  let result;

  const { user, likedUser } = obj;
  const query = {
    text: `DELETE from matches WHERE (id_user1 = ? AND id_user2 = ?) OR (id_user2 = ? AND id_user1 = ?)`,
    values: [likedUser, user]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0])
      return true;
    else
      return false;
  } catch (err) {
    console.error("Error executing query delMatch", err.stack);
  }
};

const getMatchesByIdUser = async userId => {
  let result;

  const query = {
    text: `SELECT
        id,
        (SELECT firstname FROM users WHERE users.id = matches.id_user1) AS firstname1,
        (SELECT firstname FROM users WHERE users.id = matches.id_user2) AS firstname2,
        (SELECT id FROM users WHERE users.id = matches.id_user1) AS id1,
        (SELECT id FROM users WHERE users.id = matches.id_user2) AS id2,
        (SELECT avatar FROM users WHERE users.id = matches.id_user1) AS avatar1,
        (SELECT avatar FROM users WHERE users.id = matches.id_user2) AS avatar2,
        (SELECT logged FROM users WHERE users.id = matches.id_user1) AS logged1,
        (SELECT logged FROM users WHERE users.id = matches.id_user2) AS logged2,
        (SELECT content FROM messages WHERE match_id = matches.id ORDER BY messages.timestamp DESC LIMIT 1) AS preview,
        (SELECT sender FROM messages WHERE match_id = matches.id ORDER BY messages.timestamp DESC LIMIT 1) AS preview_sender,
        (SELECT COUNT(*) FROM messages WHERE match_id = matches.id AND messages.receiver = ? AND unread = true) AS unread,
        EXISTS(SELECT * FROM blocks WHERE (blocker_id = matches.id_user1 AND blocked_id = matches.id_user2) OR (blocker_id = matches.id_user2 AND blocked_id = matches.id_user1)) AS block
        FROM matches WHERE matches.id_user1 = ? OR matches.id_user2 = ?`,
    values: [userId, userId, userId]
  };

  try {
    result = await db.execute(query.text, query.values);
    if (result[0])
      return result[0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query getMatchesByIdUser", err.stack);
  }
};

const getMatch = async matchId => {
  let result;

  const query = {
    text: `SELECT * FROM matches WHERE id= ?`,
    values: [matchId]
  };

  try {
    result = await db.execute(query.text, query.values);
    console.log(result);
    if (result[0][0])
      return result[0][0];
    else
      return false;
  } catch (err) {
    console.error("Error executing query getMatchesByIdUser", err.stack);
  }
};

module.exports = {
  setMatch,
  delMatch,
  getMatchesByIdUser,
  getMatch
};
