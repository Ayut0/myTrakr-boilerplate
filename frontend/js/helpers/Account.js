class Account {
  constructor(username, transactions) {
    this.username = username;
    this.transactions = transactions;
  }

  get balance() {
    return this.transactions.reduce((total, transaction) => {
      return total + Number(transaction.transactionAmount);
    }, 0);
  }
}

// const accountSelectList = $("#accountSelect");
// const fromList = $("#fromSelect");
// const toList = $("#toSelect");
// const filterSelectList = $("#filterSelect");

// const createAccountSummary = (userArray) => {
//   let account_summary = $.map(userArray, (user) => {
//     console.log(user);
//     return `
//             <li>Account Name: ${user.username}: Total Balance: ${user.transactions.length === 0 ? 0 : user.balance}</li>
//           `;
//   });
//   $("#summary_list").append(account_summary);
// }

//Function to add a new user option tag
// const createUserList =(newUserName, newUserId, selectTag)=> {
//   return selectTag.append(`
//         <option value=${newUserId}>${newUserName}</option>
//         `);
// }

//create user account summary list via data stored in server
// function createAccountSummary(userArray) {
//   let account_summary = $.map(userArray, (user) => {
//     console.log(user);
//     return `
//             <li>Account Name: ${user.username}: Total Balance: ${
//       user.transactions.length === 0 ? 0 : user.balance
//     }</li>
//                 `;
//   });
//   $("#summary_list").append(account_summary);
// }

// let userList = [];

// export const createNewAccount = (newAccount)=>{
//   $.ajax({
//     url: "http://localhost:3000/accounts",
//     type: "post",
//     contentType: "application/json",
//     dataType: "json",
//     data: JSON.stringify({
//       newAccount,
//     }),
//   })
//     .done((data) => {
//       userList.push(data.username);
//       const account = new Account(data.username, data.transactions);
//       createAccountSummary(account)
//       //Add a new user option tag
//       createUserList(data.username, data.id, accountSelectList);
//       createUserList(data.username, data.id, fromList);
//       createUserList(data.username, data.id, toList);
//       createUserList(data.username, data.id, filterSelectList);

//       //Reset input
//       $("#account_input").val("");
//       alert("New account added");
//     })
//     .fail((error) => {
//       alert(error);
//     });;
// }
