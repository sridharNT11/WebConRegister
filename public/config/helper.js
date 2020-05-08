module.exports = {
	indianDateTime: () => {
  		var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
		return new Date(indiaTime);
  	},
}