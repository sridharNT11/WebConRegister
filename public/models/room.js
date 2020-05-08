var  db = require(__dirname + '../../config/database');
var  helper = require(__dirname + '../../config/helper');
class Room
{
	getRoombyRoomId(room_id) {
		return new Promise((resolve, reject) => {
			var sql = "select * from rooms where room_id = ?";
	    	db.query(sql,[room_id], function (err, result) {
	      		 return err ? reject(err) : resolve(result);
	    	});
    	});
	}
	getRoombyRoomNo(room_no) {
		return new Promise((resolve, reject) => {
			var sql = "select * from rooms where room_no = ?";
	    	db.query(sql,[room_no], function (err, result) {
	      		 return err ? reject(err) : resolve(result);
	    	});
    	});
	}
	insertRoomNo(room_no) {
		return new Promise((resolve, reject) => {
			var sql = "INSERT INTO rooms (room_no,created_at) VALUES (?,?)";
	    	db.query(sql,[room_no,helper.indianDateTime()], function (err, result) {
	      		 return err ? reject(err) : resolve(result);
	    	});
    	});
	}
	// updateUser(user) {
	// 	return new Promise((resolve, reject) => {
	// 		var sql = "Update users set name = ?,mobile = ?,email = ?,city = ?,state = ?,dob = ?,updated_at = ?  where user_id = ?";
	//     	db.query(sql,[user.name,user.mobile,user.email,user.city,user.state,user.dob,user.updated_at,user.user_id], function (err, result) {
	//       		 return err ? reject(err) : resolve(result);
	//     	});
 //    	});
	// }
}

module.exports = Room;



// module.exports = {
// 	// dob: '12.01.1982',
//   	getUser: async (user_id) => {
//   		var sql = "select * from users where user_id = ?";
//     	var result =  await db.query(sql,[user_id], function (err, result) {
//       		if (err) throw err;
//     	});
//     	return result[0];
//   	},
// 	getUsers: async () => {
// 	    var sql = "select * from users";
//     	var result =  await db.query(sql,[user_id], function (err, result) {
//       		if (err) throw err;
//     	});
//     	return result;
// 	},
// 	getUserbyMobile: async (mobile) => {
// 	    var sql = "select * from users where mobile = ?";
	    
//     	var result =  await db.query(sql,[mobile]);
//     	console.log(result);
//     	return result;
// 	},

	
// };