const { Op } = require("sequelize");
const {
	schoolCategory: SchoolCategory,
	school: School
} = require("../src/config/database/models");


(async() => {
	let deletedSchools = await School.destroy({where: {
		uuid: {[Op.or]: ['bea6c720-2357-11eb-b727-e3274386bcc9','07b27910-2343-11eb-b53c-493088520f9c']}
	}});

	console.log('Deleted school result => ', deletedSchools);
})();
