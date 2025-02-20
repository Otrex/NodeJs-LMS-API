const request = require("request-promise");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const utils = require("../../utils");
const path = require("path");
const constants = require("../../config/constants");
const axios = require("axios")

const {
  paymentProvider: PaymentProvider,
  schoolPaymentProvider: SchoolPaymentProvider,
  course: Course,
  user: User,
  transfer: Transfer
} = require("../../config/database/models");

const transactionLogFile = path.join(__dirname,"../../../logs/transactions.log");
const transferLogFile = path.join(__dirname,"../../../logs/transfers.log");
const paystackVerificationUrl = "https://api.paystack.co/transaction/verify";
const paystackAccountNumberResolutionUrl = "https://api.paystack.co/bank/resolve";
const paystackCreateTransferRecipientUrl = "https://api.paystack.co/transferrecipient";
const paystackInitiateTransferUrl = "https://api.paystack.co/transfer";
const paystackBankListUrl = "https://api.paystack.co/bank";

//MonnifyDetails
const monnifyApiUrl = "https://sandbox.monnify.com";
const monnifyApiKey = process.env.MONNIFY_API_KEY;
const monnifyContractCode = process.env.MONNIFY_CONTRACT_CODE;
const monnifySecretKey = process.env.MONNIFY_SECRET_KEY;

const transactionService = {
  verifyPaystackTransaction: async(transactionRef, schoolId) => {
    try{
      let paystack = await SchoolPaymentProvider.findOne({
        where: { schoolId },
        include: [{
          model: PaymentProvider,
          where: { name: "paystack" }
        }]
      });
      console.log("Payment provider => ", "Paystack");

      if(paystack){
        let paystackSecretKey = utils.decryptAPIKey(JSON.parse(paystack.credentials).secretKey);
        let response = await request.get({
          url : `${paystackVerificationUrl}/${transactionRef}`,
          headers : {
            "Content-Type":"application/json",
            "Authorization" : `Bearer ${paystackSecretKey}`
          },
          json : true
        });
        if(response){
          utils.writeToFile(`Transaction verification response => ${response.toString()}`);
          if(response.data.status === "success"){
            return response.data;
          } else {
            return null;
          }
        } else {
          utils.writeToFile("Transaction verification response => None gotten");
          return null;
        }
      } else {
        console.log("Paystack provider record not found");
        return null;
      }
    } catch(e){
      utils.writeToFile(e.toString(), transactionLogFile);
      return null;
    }
  },
  verifyMonnifyTransaction: async (transactionRef, monnifyTransactionRef, schoolId) => {
    try {
      let encodedMonnifyTransactionRef = encodeURIComponent(monnifyTransactionRef);
      let monnifyAccessToken = await utils.getMonnifyAccessToken();
      let response = await axios({
        method: 'get',
        url: `${monnifyApiUrl}/api/v2/transactions/${encodedMonnifyTransactionRef}`,
        headers: {
          "Content-Type":"application/json",
          "Authorization" : `Bearer ${monnifyAccessToken}`
        }
      });
      if(response){
        utils.writeToFile(`Transaction verification response => ${response.toString()}`);
        if(response.data.responseBody.paymentStatus === "PAID"){
          return response.data.responseBody;
        } else {
          return null;
        }
      } else {
        utils.writeToFile("Transaction verification response => None gotten");
        return null;
      }
    } catch (e) {
      
    }
  },
  resolveAccountNumber: async(accountNumber, bankCode) => {
    try {
      let paystack = await PaymentProvider.scope("withHiddenFields").findOne({ where : { name : "paystack" } });
      let paystackSecretKey = utils.decryptAPIKey(paystack.secretKey);

      let response = await request.get({
        url : `${paystackAccountNumberResolutionUrl}`,
        headers : {
          "Authorization" : `Bearer ${paystackSecretKey}`
        },
        qs : {
          account_number : accountNumber,
          bank_code : bankCode
        },
        json : true
      });
      if(response){
        if(response.status == true){
          return response.data;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch(e){
      utils.writeToFile(e.toString(), transferLogFile);
      return null;
    }
  },
  createPaystackTransferRecipient: async(bankAccountName, bankAccountNumber, bankCode) => {
    try{
      let paystack = await PaymentProvider.scope("withHiddenFields").findOne({ where : { name : "paystack" } });
      let paystackSecretKey = utils.decryptAPIKey(paystack.secretKey);

      let response = await request.post({
        url : `${paystackCreateTransferRecipientUrl}`,
        headers : {
          "Content-Type":"application/json",
          "Authorization" : `Bearer ${paystackSecretKey}`
        },
        body : {
          type: "nuban",
          name: bankAccountName,
          account_number: bankAccountNumber,
          bank_code: bankCode
        },
        json : true
      });
      if(response){
        if(response.status == true){
          return response.data;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch(e){
      utils.writeToFile(e.toString(), transferLogFile);
      return null;
    }
  },
  initiatePaystackTransfer: async(instructor, amount) => {
    // @TODO !IMPORTANT! subtract amount from instructor balance after SUCCESSFUl transfer
    console.log(`\nInitiating transfer of N${amount} to ${instructor.firstName} ${instructor.lastName}, Recipient${instructor.paystackRecipientCode}\n`);
    try {
      let paystack = await PaymentProvider.scope("withHiddenFields").findOne({ where : { name : "paystack" } });
      let paystackSecretKey = utils.decryptAPIKey(paystack.secretKey);

      let transfer = await Transfer.create({
        userId : instructor.uuid,
        amount
      });

      if(!transfer){
        console.log("No transfer created");
        return null;
      }

      transfer.reference = `${transfer.uuid}_acadabay`;
      transfer.save()
        .then(async(transfer) => {

          let response = await request.post({
            url : paystackInitiateTransferUrl,
            headers : {
              "Content-Type":"application/json",
              "Authorization" : `Bearer ${paystackSecretKey}`
            },
            body : {
              source: "balance",
              recipient: instructor.paystackRecipientCode,
              amount: utils.convertNairaToKobo(amount),
              reason: "Acadabay instructor payout",
              reference : transfer.reference
            },
            json : true
          });
          if(response){
            if(response.status == true){
              return response.data;
            } else {
              return null;
            }
          } else {
            return null;
          }
        })
        .catch(e => {
          utils.writeToFile(e.toString(), transferLogFile);
          return null;
        });
    } catch(e){
      utils.writeToFile(e.toString(), transferLogFile);
      return null;
    }
  },
  makeInstructorPayouts: async() => {
    User.findAll({
      where: { balance: { [Op.gt]: 0 } },
      attributes : [
        "uuid","firstName","lastName","paystackRecipientCode","balance"
        // [Sequelize.literal(constants.rawQueries.totalInstructorPayoutDue), "payoutDue"]
      ],
      include : { model : Course, as : "courses", required : true }
    })
      .then(instructors => {
        if(!instructors){
        // something went wrong, handle properly
        }
        console.log("Instructors => ",instructors);
        for(let instructor of instructors){
          instructor = instructor.get();
          transactionService.initiatePaystackTransfer(instructor, instructor.balance);
        }
      })
      .catch(err => {
      // handle properly
        console.log(err);
      });
  },
  getBanks: async(schoolId) => {
    try {
      let paystack = await SchoolPaymentProvider.findOne({
        where: { schoolId },
        include: [{
          model: PaymentProvider,
          where: { name: "paystack" }
        }]
      });
      let paystackSecretKey = utils.decryptAPIKey(JSON.parse(paystack.credentials).secretKey);
      let response = await request.get({
        url : paystackBankListUrl,
        headers : {
          "Authorization" : `Bearer ${paystackSecretKey}`
        },
        qs: {
          perPage: 500
        },
        json : true
      });
      if(response){
        if(response.status == true){
          return response.data;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch(e){
      utils.writeToFile(e.toString(), transferLogFile);
      return null;
    }
  }
};

module.exports = transactionService;
