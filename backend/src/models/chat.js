const db = require("../database/connection");
const bcrypt = require("bcryptjs");

const saveMsg = async msgObj => {
  const { sender, content, roomId, receiver } = msgObj;
  let result;
  const query = {
    text: `INSERT INTO
                  messages (
                    sender,
                    content,
                    match_id,
                    receiver,
                    timestamp
                  )
                  VALUES(?, ?, ?, ?, current_timestamp)`,
    values: [sender, content, roomId, receiver]
  };
  try {
    result = await db.query(query.text, query.values, (error, results) => {
      if (error) {
        throw error
      }
    });
    return result ? true : false;
  } catch (err) {
    console.log("Error executing query", err.message);
  }
};

const getMessagesByMatchId = async matchId => {
  let result;
  const query = {
    text: `SELECT content, sender, timestamp FROM messages WHERE match_id = ? ORDER BY messages.timestamp ASC`,
    values: [matchId]
  };
  try {
    result = await db.query(query.text, query.values, (error, results) => {
      if (error) {
        throw error
      }
    });
    return result.rows;
  } catch (err) {
    console.error("Error executing query", err.stack);
  }
};

async function readConv(matchId, reader) {
  let result;
  const query = {
    text: `UPDATE messages SET unread = false WHERE (match_id = ? AND receiver = ?)`,
    values: [matchId, reader]
  };
  try {
    result = await db.query(query.text, query.values, (error, results) => {
      if (error) {
        throw error
      }
    });
    return result ? true : false;
  } catch (err) {
    console.log("Error executing query", err.message);
  }
}

async function getNbUnread(userId) {
  let result;
  const query = {
    text: `SELECT COUNT(*) FROM messages WHERE (receiver = ? AND unread = true)`,
    values: [userId]
  };
  try {
    result = await db.query(query.text, query.values, (error, results) => {
      if (error) {
        throw error
      }
    });
    nbUnread = result.rows[0].count;
    return nbUnread;
  } catch (err) {
    console.log("Error executing query", err.message);
  }
}

const delConvByIdUsers = async (idUser1, idUser2) => {
  let result;
  const query = {
    text: `DELETE from messages WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)`,
    values: [idUser1, idUser2, idUser2, idUser1]
  };
  try {
    result = await db.query(query.text, query.values, (error, results) => {
      if (error) {
        throw error
      }
    });
    return result ? true : false;
  } catch (err) {
    console.log("Error executing query", err.message);
  }
};

module.exports = {
  saveMsg,
  getMessagesByMatchId,
  readConv,
  getNbUnread,
  delConvByIdUsers
};
