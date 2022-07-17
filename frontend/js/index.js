import {
  Account,
  postNewAccount,
  updateUserList,
  getUserData,
} from "./helpers/Account.js";
import { postNewCategory } from "./helpers/Category.js";
import {
  Transaction,
  validatedTransaction,
  generateTransaction,
  postNewTransaction,
  getTransactionData,
  createTransactionTable,
} from "./helpers/Transaction.js";

$(() => {
  //Start coding here!
  //Create New Account
  let userList = [];
  $("#accountForm").submit((event) => {
    event.preventDefault();
    const newAccountName = $("#account_input").val();

    //Validations
    if (newAccountName === "") {
      alert("Pls enter valid user name");
      return;
    }
    if (userList.includes(newAccountName)) {
      alert("This user already exists");
      return false;
    }
    userList.push(newAccountName);
    const newAccount = {
      newAccountName,
      transactions: [],
    };
    postNewAccount(newAccount);
  });
  // updateUserList();

  //Show and hide select buttons based on transaction type
  const fromSelect = $("#fromButton");
  const toSelect = $("#toButton");
  const accountSelect = $("#accountButton");

  //Get value of ratio buttons
  $("input:radio[name='transactionType']").change(() => {
    let checkedRadio = $("input:radio[name='transactionType']:checked").val();
    // console.log(checkedRadio);
    if (checkedRadio === "Deposit" || checkedRadio === "Withdraw") {
      fromSelect.hide();
      toSelect.hide();
    } else {
      fromSelect.show();
      toSelect.show();
    }
    checkedRadio === "Transfer" ? accountSelect.hide() : accountSelect.show();
  });

  //Add new category
  const categoryInput = $("#categoryInput");
  const categorySelect = $("#categorySelect");
  const newCategoryButton = $("#categoryButton");

  //Create category list
  categorySelect.change((event) => {
    event.preventDefault();
    if ($("[name = category]").val() === "addNewCategory") {
      categoryInput.show();
      newCategoryButton.show();
    } else {
      categoryInput.hide();
      newCategoryButton.hide();
    }
  });

  newCategoryButton.click((event) => {
    event.preventDefault();
    const categoryInputValue = categoryInput.val();
    //Form validation and adding new category
    categoryInputValue.length > 0 && postNewCategory(categoryInputValue);
  });

  let filteredAccount;
  let targetAccount;
  let targetAccountName;
  let targetAccountBalance;

  //Add new transaction table
  getTransactionData().done((data) => {
    data.forEach((item) => {
      item.forEach((element) => {
        createTransactionTable(element);
      });
    });
  });

  //Transaction
  $("#transactionForm").submit((event) => {
    event.preventDefault();
    //Transaction amount should be greater than 0. Description is needed. Category should be given.
    if ($("#description").val() === "") {
      alert("Please enter description");
      return;
    } else if (Number($("#amount").val()) < 0) {
      alert("Transaction amount should be greater than 0");
      return;
    } else if ($("[name = category]").val() === "addNewCategory") {
      alert("Please enter valid category");
      return;
    }

    const transactionType = $("input[name='transactionType']:checked").val();
    const transactionCategory = categorySelect.val();
    const transactionDescription = $("#description").val();
    let transactionAmount;
    let transactionUserName;
    let userAccountId;
    let userAccountIdFrom;
    let userAccountIdTo;

    //Deposit and Withdraw
    if (transactionType === "Deposit" || transactionType === "Withdraw") {
      userAccountId = $("#accountSelect").val();
      transactionUserName = $("[name=accountSelect] option:selected").text();
      if (transactionType === "Deposit") {
        transactionAmount = Number($("#amount").val());
      } else {
        transactionAmount = -Number($("#amount").val());
      }
    }

    //Transfer
    if (transactionType === "Transfer") {
      userAccountId = $("#fromSelect").val();
      transactionUserName = $("[name=fromSelect] option:selected").text();
      userAccountIdFrom = $("[name=fromSelect] option:selected").text();
      userAccountIdTo = $("[name=toSelect] option:selected").text();

      //Check if the sender and receiver are the same account;
      if (userAccountIdFrom === userAccountIdTo) {
        alert(
          "I'm afraid you're about to transfer money to the same account...."
        );
        return;
      }

      if (transactionUserName === userAccountIdFrom) {
        transactionAmount = -Number($("#amount").val());
      } else {
        transactionAmount = Number($("#amount").val());
      }
    } else {
      userAccountIdFrom = null;
      userAccountIdTo = null;
    }

    //Check the balance
    function getCurrentBalance() {
      return $.ajax({
        url: "http://localhost:3000/accounts",
        type: "get",
        contentType: "application/json",
        dataType: "json",
      });
    }
    getCurrentBalance().done((data) => {
      console.log(data);
      let currentBalanceData = data.map((element) => {
        console.log(element);
        targetAccount = new Account(
          element.newAccountName,
          element.transactions,
          element.id
        );
        return targetAccount;
      });
      //Filtered by name
      filteredAccount = currentBalanceData.filter(
        (account) => account.username === transactionUserName
      );
      targetAccountName = filteredAccount[0].username;
      targetAccountBalance = filteredAccount[0].balance;
    });

    if (
      (transactionType === "Transfer" &&
        Math.abs(transactionAmount) > targetAccountBalance) ||
      (transactionType === "Withdraw" &&
        Math.abs(transactionAmount) > targetAccountBalance)
    ) {
      alert("You don't have enough balance for this transaction");
      return;
    }

    const newTransactionData = {
      accountId: `${userAccountId}`, // account ID for Deposits or Withdraws
      accountIdFrom: `${userAccountIdFrom}`, // sender ID if type = 'Transfer', otherwise null
      accountIdTo: `${userAccountIdTo}`, // receiver ID if type = 'Transfer', otherwise null
      // all info from form
      account: `${transactionUserName}`,
      type: `${transactionType}`,
      category: `${transactionCategory}`,
      description: `${transactionDescription}`,
      amount: `${transactionAmount}`,
    };

    postNewTransaction(newTransactionData)
      .done((data) => {
        let generatedTransactionData;
        data.forEach((element) => {
          generatedTransactionData = generateTransaction(element, element.type);
        });
        createTransactionTable(generatedTransactionData);
        //Get user data to update their balance
        $("#summary_list").empty();
        getUserData();

        $("#amount").val("");
        $("#description").val("");
      })
      .fail((error) => {
        alert(error);
      });

    alert("Your transaction went through!!");
  });

  //Filter transaction
  //Get user name from account
  // $(filterSelectList).change((e) => {
  //   console.log($("[name=filterSelect] option:selected").text());
  //   const filteredName = $("[name=filterSelect] option:selected").text();
  //   const filteredValue = $("[name=filterSelect] option:selected").val();
  //   $.ajax({
  //     url: "http://localhost:3000/accounts",
  //     type: "get",
  //     contentType: "application/json",
  //     dataType: "json",
  //   })
  //     .done((data) => {
  //       const allUser = data.map((item) => {
  //         const account = new Account(item.username, item.transactions);
  //         return account;
  //       });
  //       if (filteredName !== "All") {
  //         const filteredAccountData = allUser[Number(filteredValue) - 1];
  //         const filteredTd = $.map(
  //           filteredAccountData.transactions,
  //           (item) => {
  //             return `
  //             <tr class="transactionRow focus:outline-none h-20 text-sm leading-none text-gray-800 dark:text-white  bg-white dark:bg-gray-800  hover:bg-gray-100 dark:hover:bg-gray-900  border-b border-t border-gray-100 dark:border-gray-700">
  //               <td>${item.id}</td>
  //               <td>${item.userName}</td>
  //               <td>${item.type}</td>
  //               <td>${item.category}</td>
  //               <td>${item.description}</td>
  //               <td>${item.transactionAmount}</td>
  //               <td>${item.accountIdFrom}</td>
  //               <td>${item.accountIdTo}</td>
  //             </tr>
  //             `;
  //           }
  //         );
  //         $(".transactionRow").empty();
  //         $("#transactionTable").append(filteredTd);
  //       } else {
  //         $(".transactionRow").empty();
  //         updateTransactionTable();
  //       }
  //     })
  //     .fail((error) => {
  //       alert(error);
  //     });
  // });
});
