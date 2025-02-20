const utils = require("../utils");
const constants = require("../config/constants");
const {
  supportTicket: SupportTicket,
  user: User
} = require("../config/database/models");

module.exports = {
  createSupportTicket: async(req, res, next) => {
    let fieldsValid = await utils.validateReqFields(req, res, ["subject","message"]);
    if(fieldsValid){
      let { subject, message, } = req.body;

      let createdTicket = await SupportTicket.create({
        subject,
        message,
        userId: req.user.uuid
      });

      if(!createdTicket){
        return res.status(500).send({ success: false, message: "Could not create your support ticket at this time" });
      }
      return res.send({ success: true, message: "Support ticket created successfully", data: createdTicket });
    }
  },
  replySupportTicket: async(req, res, next) => {
    try{
      let fieldsValid = utils.validateReqFields(req, res, ["reply"]);
      if(fieldsValid){
        let supportTicket = await SupportTicket.findOne({ where: { uuid: req.params.ticketId } });
        if(!supportTicket){
          return res.status(404).send({ success: false, message: "Support ticket not found" });
        }

        supportTicket.adminReply = req.body.reply;
        supportTicket.adminId = req.user.uuid;
        supportTicket.save()
          .then(() => res.send({ success: true, message: "Support ticket replied successfully" }))
          .catch(next);

      }
    } catch(e){
      next(e);
    }
  },
  getTickets: async(req, res, next) => {
    try{
      let fieldsValid = utils.validateReqFields(req, res, ["page"]);
      if(fieldsValid){
        let { page, limit } = req.query;
        limit = limit ? limit : constants.course.pagination.limit;

        let whereClause = {};
        if(req.user.role == "user"){
          whereClause = { userId: req.user.uuid };
        }
        let tickets = await SupportTicket.findAndCountAll({
          where: whereClause,
          include: [
            { model: User, as: "user" },
            { model: User, as: "admin" }
          ],
          ...utils.paginate({ limit, page })
        });
        if(!tickets){
          return res.status(500).send({ success: false, message: "Support tickets could not be retrieved at this time" });
        }
        let pages = Math.ceil(tickets.count / limit);
        return res.send({ success: true, message: "Support tickets retrieved", data: tickets.rows, count: tickets.count, pages });
      }
    } catch(e){
      next(e);
    }

  }
};