import {
  Account,
  postNewAccount,
  getUser,
  getUserData,
} from "./helpers/Account.js";
import { postNewCategory } from "./helpers/Category.js";
import {
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
        url: "https://simple-transaction-tracker.herokuapp.com/accounts",
        method: "get",
        contentType: "application/json",
        dataType: "json",
      });
    }
    getCurrentBalance().done((data) => {
      let currentBalanceData = data.map((element) => {
        targetAccount = new Account(
          element.newAccountName,
          element.transactions,
          element.id
        );
        return targetAccount;
      });
      //Filtered by name
      return (filteredAccount = currentBalanceData.filter(
        (account) => account.username === transactionUserName
      ));
    });

    //Validation
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
      amount: `${transactionAmount}`,
      account: `${transactionUserName}`,
      accountIdFrom: `${userAccountIdFrom}`, // sender ID if type = 'Transfer', otherwise null
      accountIdTo: `${userAccountIdTo}`, // receiver ID if type = 'Transfer', otherwise null
      type: `${transactionType}`,
      category: `${transactionCategory}`,
      description: `${transactionDescription}`,
      accountId: `${userAccountId}`, // account ID for Deposits or Withdraws
    };

    postNewTransaction(newTransactionData)
      .done((data) => {
        let generatedTransactionData;
        data.forEach((element) => {
          generatedTransactionData = generateTransaction(element, element.type);
        });
        if (generatedTransactionData.type === "Transfer") {
          getUser().done((data) => {
            let userData = data.map((element) => {
              targetAccount = new Account(
                element.newAccountName,
                element.transactions,
                element.id
              );
              return targetAccount;
            });
            filteredAccount = userData.filter(
              (account) =>
                account.username === generatedTransactionData.accountIdTo
            );
            let receivedTransaction = newTransactionData;
            receivedTransaction.amount = Math.abs(newTransactionData.amount);
            receivedTransaction.account = filteredAccount[0].username;
            receivedTransaction.id = filteredAccount[0].id;
            receivedTransaction.accountId = filteredAccount[0].id;

            postNewTransaction(receivedTransaction).done((data) => {
              //Get user data to update their balance
              $("#summary_list").empty();
              getUserData();
            });
          });
        }
        createTransactionTable(generatedTransactionData);
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
  $("#filterSelect").change((e) => {
    const filteredName = $("[name=filterSelect] option:selected").text();
    const filteredValue = $("[name=filterSelect] option:selected").val();
    getUser().done((data) => {
      const allUser = data.map((item) => {
        const account = new Account(
          item.newAccountName,
          item.transactions,
          item.id
        );
        return account;
      });
      if (filteredName !== "All") {
        const filteredAccountData = allUser[Number(filteredValue) - 1];
        const filteredTd = $.map(filteredAccountData.transactions, (item) => {
          return `
                  <tr class="transactionRow focus:outline-none h-20 text-sm leading-none text-gray-800 dark:text-white  bg-white dark:bg-gray-800  hover:bg-gray-100 dark:hover:bg-gray-900  border-b border-t border-gray-100 dark:border-gray-700">
                    <td>${item.id}</td>
                    <td>${item.account}</td>
                    <td>${item.type}</td>
                    <td>${item.category}</td>
                    <td>${item.description}</td>
                    <td>${item.amount}</td>
                    <td>${item.accountIdFrom}</td>
                    <td>${item.accountIdTo}</td>
                  </tr>
                  `;
        });
        $(".transactionRow").hide();
        $("#transactionTable").append(filteredTd);
      } else {
        $(".transactionRow").hide();
        getTransactionData().done((data) => {
          data.forEach((item) => {
            item.forEach((element) => {
              createTransactionTable(element);
            });
          });
        });
      }
    });
  });
});
