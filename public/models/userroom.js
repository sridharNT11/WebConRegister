var  db = require(__dirname + '../../config/database');
var  helper = require(__dirname + '../../config/helper');
class UserRoom
{

	insertUserRoom(user_id,room_id,join_at,socket_id) {
		return new Promise((resolve, reject) => {
			var sql = "INSERT INTO users_rooms (user_id,room_id,join_at,socket_id) VALUES (?,?,?,?)";
	    	db.query(sql,[user_id,room_id,join_at,socket_id], function (err, result) {
	      		 return err ? reject(err) : resolve(result);
	    	});
    	});
	}
	UpdateLeaveRoom(user_id,room_id,socket_id) {
		return new Promise((resolve, reject) => {
			var sql = "UPDATE users_rooms SET leave_at = ? where user_id = ? AND room_id = ? AND socket_id = ?";
	    	db.query(sql,[helper.indianDateTime(),user_id,room_id,socket_id], function (err, result) {
	      		 return err ? reject(err) : resolve(result);
	    	});
    	});
	}
	getUserbySocketId(socket_id) {
		return new Promise((resolve, reject) => {
			var sql = "select * from users u inner join users_rooms ur on u.user_id = ur.user_id where socket_id = ?";
	    	db.query(sql,[socket_id], function (err, result) {
	      		 return err ? reject(err) : resolve(result);
	    	});
    	});
	}
}
module.exports = UserRoom;


