const cron = require("node-cron");
const axios = require("axios");
const Sequelize = require("sequelize")
const transactionService = require("../services/transaction");
const cronJobs = {};




cronJobs.init = function(){
  console.log("*Cron jobs initialized--*");
  cron.schedule('*/5 * * * *', async () => {
    console.log('Cron Job Verification => Running every 5 minutes');

    const {
      transaction: Transaction,
    } = require("../config/database/models");

    let pendingTransactions = await Transaction.findAll({
      where:
        Sequelize.or(
          { status: null },
          { status: "failed" }
        )
    })
    for (const transaction of pendingTransactions) {
      console.log(transaction.reference);
      let transactionRef = transaction.reference;
      let schoolId = transaction.schoolId;
      let monnifyTransactionRef = transaction.monnifyReference;
      let url;

      if (transaction.paymentGateway == "paystack") {
        url = `http://localhost:4000/public/transaction/adminVerify/${schoolId}/${transactionRef}`
      } else if (transaction.paymentGateway == "monnify") {
        url = `http://localhost:4000/public/transaction/adminVerify/${schoolId}/${transactionRef}?monnifyTransactionRef=${monnifyTransactionRef}`
      } else {
        console.log("Cron Job Verification => Invalid Payment Gateway")
      }

      if (url) {
        axios.get(url)
        .then(response => {
          console.log("Cron Job Verification => " + response)
        })
        .catch(error => {
          console.log("Cron Job Verification => " + error)
        });
      }
    }
  });
};

module.exports = cronJobs;