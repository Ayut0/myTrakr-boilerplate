export class Account {
  constructor(username, transactions, id) {
    this.username = username;
    this.transactions = transactions;
    this.id = id;
  }

  get balance() {
    return this.transactions.reduce((total, transaction) => {
      return total + Number(transaction.amount);
    }, 0);
  }
}

const accountSelectList = $("#accountSelect");
const fromList = $("#fromSelect");
const toList = $("#toSelect");
const filterSelectList = $("#filterSelect");

// create user account summary list via data stored in server
export const createAccountSummary = (account) => {
  const accountSummary = `
      <li>Account Name: ${account.username}: Total Balance: ${
    account.transactions.length === 0 ? 0 : account.balance
  }</li>
    `;
  $("#summary_list").append(accountSummary);
};

// Function creates a user list
export const createUserList = (newUserName, newUserId, selectTag) => {
  return selectTag.append(`
        <option value=${newUserId}>${newUserName}</option>
        `);
};

//post new account
export const postNewAccount = (account) => {
  const newAccount = { ...account };
  $.ajax({
    url: "https://simple-transaction-tracker.herokuapp.com/accounts",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ newAccount }),
  })
    .done((data) => {
      //Add a new user option tag
      const account = new Account(
        data.newAccountName,
        data.transactions,
        data.id
      );
      createUserList(account.username, account.id, accountSelectList);
      createUserList(account.username, account.id, fromList);
      createUserList(account.username, account.id, toList);
      createUserList(account.username, account.id, filterSelectList);
      //create user account summary
      createAccountSummary(account);
      //Reset input
      $("#account_input").val("");
      alert("New account added");
    })
    .fail((error) => {
      console.error(error);
    });
};

//Get user data
export const getUser = () => {
  return $.ajax({
    url: "https://simple-transaction-tracker.herokuapp.com/accounts",
    type: "get",
    contentType: "application/json",
    dataType: "json",
  });
};

export const updateUserList = () => {
  $.ajax({
    url: "https://simple-transaction-tracker.herokuapp.com/accounts",
    method: "get",
    dataType: "json",
  }).done((data) => {
    //Add a new user option tag
    const userData = data.map((user) => {
      return new Account(user.newAccountName, user.transactions, user.id);
    });
    const account = new Account(data.newAccountName, data.transactions);
    userData.forEach((element) => {
      createUserList(element.username, element.id, accountSelectList);
      createUserList(element.username, element.id, fromList);
      createUserList(element.username, element.id, toList);
      createUserList(element.username, element.id, filterSelectList);
      //create user account summary
      createAccountSummary(element);
    });
  });
};
updateUserList();

let targetAccount;
//Get current balance
export const getUserData = () => {
  return $.ajax({
    url: "https://simple-transaction-tracker.herokuapp.com/accounts",
    method: "get",
    contentType: "application/json",
    dataType: "json",
  }).done((data) => {
    let currentBalanceData = data.map((element) => {
      targetAccount = new Account(
        element.newAccountName,
        element.transactions,
        element.id
      );
      return targetAccount;
    });
    currentBalanceData.forEach((user) => {
      createAccountSummary(user);
    });
  });
};
