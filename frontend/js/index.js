$(() => {
  //Start coding here!
  $(document).ready(() => {
    //Creating new account
    $("#accountForm").submit((event) => {
      event.preventDefault();
      const newAccountName = $("#account_input").val();
      if (newAccountName === "" || $.inArray(newAccountName, userList) !== -1) {
        alert("Pls enter valid user name");
      } else {
        //Create New Account
        const newAccount = {
          username: `${newAccountName}`,
          transactions: [],
        };
        $.ajax({
          url: "http://localhost:3000/accounts",
          type: "post",
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify({
            newAccount,
          }),
        })
          .done((data) => {
            userList.push(data.username);
            //Add a new user option tag
            createUserList(data.username, data.id, accountSelectList);
            createUserList(data.username, data.id, fromList);
            createUserList(data.username, data.id, toList);
            createUserList(data.username, data.id, filterSelectList);
            //create user account summary
            $("#summary_list").append(`
                    <li>Account Name: ${data.username}: Total Balance: ${data.transactions}</li>
                `);
            //Reset input
            $("#account_input").val("");
            alert("New account added");
            // return userList;
          })
          .fail((error) => {
            alert(error);
          });
      }
    });
  
    //create user account summary list via data stored in server
    let userList = [];
    function createAccountSummary(userArray){
      let account_summary = $.map(userArray, (user) => {
        console.log(user)
        return `
                  <li>Account Name: ${user.username}: Total Balance: ${user.transactions.length === 0? 0: user.balance}</li>
                `;
      });
      $("#summary_list").append(account_summary);
    }

    $.ajax({
      url: "http://localhost:3000/accounts",
      type: "get",
      contentType: "application/json",
      dataType: "json",
    }).done((data) => {
      const allUser = data.map((item) => {
        const account = new Account(item.username, item.transactions);
        return account;
      });
      createAccountSummary(allUser)
      $.each(data, (index, value) => {
        createUserList(value.username, value.id, accountSelectList);
        createUserList(value.username, value.id, fromList);
        createUserList(value.username, value.id, toList);
        createUserList(value.username, value.id, filterSelectList);
      });
    });


    // Function creates a user list
    function createUserList(newUserName, newUserId, selectTag) {
      return selectTag.append(`
        <option value=${newUserId}>${newUserName}</option>
        `);
    }
    const accountSelectList = $("#accountSelect");
    const fromList = $("#fromSelect");
    const toList = $("#toSelect");
    const filterSelectList = $("#filterSelect")
  
    //Show and hide select buttons
    const fromSelect = $("#fromButton");
    const toSelect = $("#toButton");
    const accountSelect = $("#accountButton");
  
    //Get value of ratio buttons
    $("input:radio[name='transactionType']").change(() => {
      let checkedRadio = $("input:radio[name='transactionType']:checked").val();
      console.log(checkedRadio);
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
    $(document).ready(() => {
      $.ajax({
        url: "http://localhost:3000/categories",
        type: "get",
        contentType: "application/json",
        dataType: "json",
      }).done((data) => {
        let categoryOption = $.map(data, (item) => {
          return `
                 <option value=${item.name.categoryName}>${item.name.categoryName}</option>
                `;
        });
        categorySelect.prepend(categoryOption);
      });
    });
  
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
      categoryInputValue.length > 0 &&
        $.ajax({
          url: "http://localhost:3000/categories",
          type: "post",
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify({
            newCategory: {
              categoryName: categoryInputValue,
            },
          }),
        }).done((data) => {
          const newCategoryOption = new Option(categoryInputValue);
          $("#firstOption").remove();
          categorySelect.prepend(newCategoryOption);
          categoryInput.hide();
          newCategoryButton.hide();
          categoryInput.val("");
        });
    });
  
    let filteredAccount;
    let targetAccount;
    let targetAccountName;
    let targetAccountBalance;
  
    $("#transactionForm").submit((event) => {
      event.preventDefault();
      //Transaction amount should be greater than 0. Description is needed. Category should be given.
      if (
        $("#description").val() === "" ||
        Number($("#amount").val()) < 0 ||
        $("[name = category]").val() === "addNewCategory"
      ) {
        alert("Pls enter valid information");
        return;
      }
      const transactionType = $("input[name='transactionType']:checked").val();
      const transactionCategory = categorySelect.val();
      let transactionAmount;
      const transactionDescription = $("#description").val();
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
      
      function getCurrentBalance(){
        return $.ajax({
          url: "http://localhost:3000/accounts",
          type: "get",
          contentType: "application/json",
          dataType: "json",
        })
      }
      getCurrentBalance().done((data) => {
        let currentBalanceData = data.map((element) => {
          targetAccount = new Account(element.username, element.transactions);
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
      ){
        alert("You don't have enough balance for this transaction");
        return;
      }
  
        const newTransactionData = {
          accountId: `${userAccountId}`, // account ID for Deposits or Withdraws
          accountIdFrom: `${userAccountIdFrom}`, // sender ID if type = 'Transfer', otherwise null
          accountIdTo: `${userAccountIdTo}`, // receiver ID if type = 'Transfer', otherwise null
          // all info from form
          userName: `${transactionUserName}`,
          type: `${transactionType}`,
          category: `${transactionCategory}`,
          description: `${transactionDescription}`,
          transactionAmount: `${transactionAmount}`,
        };
  
        $.ajax({
          url: "http://localhost:3000/transaction",
          type: "post",
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify({
            newTransaction: newTransactionData,
          }),
        })
          .done((data) => {
            //Update transaction table
            const instancedTransaction = new Transaction(
              data[0].userName,
              data[0].transactionAmount
            );
            //Get user data to update their balance
            $.ajax({
              url: "http://localhost:3000/accounts",
              type: "get",
              dataType: "json",
            }).done((data) => {
              $("#summary_list").empty();
              console.log(data);
              const userData = data.map((item) => {
                const instancedAccount = new Account(
                  item.username,
                  item.transactions
                );
                return instancedAccount;
              });
              console.log(userData)
              createAccountSummary(userData);
            });
  
            const td = $.map(data, (item) => {
              return `
              <tr class="transactionRow focus:outline-none h-20 text-sm leading-none text-gray-800 dark:text-white  bg-white dark:bg-gray-800  hover:bg-gray-100 dark:hover:bg-gray-900  border-b border-t border-gray-100 dark:border-gray-700">
                <td>${item.id}</td>
                <td>${item.userName}</td>
                <td>${item.type}</td>
                <td>${item.category}</td>
                <td>${item.description}</td>
                <td>${item.transactionAmount}</td>
                <td>${item.accountIdFrom}</td>
                <td>${item.accountIdTo}</td>
              </tr>
              `;
            });
            $("#transactionTable").append(td);
            $("#amount").val("");
            $("#description").val("");
  
          })
          .fail((error) => {
            alert(error);
          });
  
      alert("Your transaction went through!!");
    });
  
    //Add new transaction table
    function createTransactionTable(transactionData) {
      $.each(transactionData, (index, Array) => {
        const td = $.map(Array, (item) => {
          return `
          <tr class="transactionRow focus:outline-none h-20 text-sm leading-none text-gray-800 dark:text-white  bg-white dark:bg-gray-800  hover:bg-gray-100 dark:hover:bg-gray-900  border-b border-t border-gray-100 dark:border-gray-700">
            <td>${item.id}</td>
            <td>${item.userName}</td>
            <td>${item.type}</td>
            <td>${item.category}</td>
            <td>${item.description}</td>
            <td>${item.transactionAmount}</td>
            <td>${item.accountIdFrom}</td>
            <td>${item.accountIdTo}</td>
          </tr>
          `;
        });
        $("#transactionTable").append(td);
      });
    }

    // function createTransactionTableByAccounts(accountData){
    //   const td = $.map(accountData, (item) => {
    //     return `
    //       <tr class="transactionRow focus:outline-none h-20 text-sm leading-none text-gray-800 dark:text-white  bg-white dark:bg-gray-800  hover:bg-gray-100 dark:hover:bg-gray-900  border-b border-t border-gray-100 dark:border-gray-700">
    //         <td>${item.id}</td>
    //         <td>${item.userName}</td>
    //         <td>${item.type}</td>
    //         <td>${item.category}</td>
    //         <td>${item.description}</td>
    //         <td>${item.transactionAmount}</td>
    //         <td>${item.accountIdFrom}</td>
    //         <td>${item.accountIdTo}</td>
    //       </tr>
    //       `;
    //   });
    //   $("#transactionTable").append(td);
    // }

    //Update transaction table
    function updateTransactionTable(){
      $.ajax({
        url: "http://localhost:3000/transactions",
        type: "get",
        contentType: "application/json",
        dataType: "json",
      })
        .done((data) => {
          createTransactionTable(data);
        })
        .fail((error) => {
          alert(error);
        });
    }
    updateTransactionTable()
  
      //Filter transaction
      //Get user name from account
      $(filterSelectList).change((e) => {
        console.log($("[name=filterSelect] option:selected").text());
        const filteredName = $("[name=filterSelect] option:selected").text();
        const filteredValue = $("[name=filterSelect] option:selected").val()
        $.ajax({
        url: "http://localhost:3000/accounts",
        type: "get",
        contentType: "application/json",
        dataType: "json",
      }).done((data) => {
        const allUser = data.map((item) => {
          const account = new Account(item.username, item.transactions);
          return account;
        });
        if(filteredName !== "All"){
          const filteredAccountData = allUser[Number(filteredValue) - 1];
          const filteredTd = $.map(filteredAccountData.transactions, (item) => {
            return `
                <tr class="transactionRow focus:outline-none h-20 text-sm leading-none text-gray-800 dark:text-white  bg-white dark:bg-gray-800  hover:bg-gray-100 dark:hover:bg-gray-900  border-b border-t border-gray-100 dark:border-gray-700">
                  <td>${item.id}</td>
                  <td>${item.userName}</td>
                  <td>${item.type}</td>
                  <td>${item.category}</td>
                  <td>${item.description}</td>
                  <td>${item.transactionAmount}</td>
                  <td>${item.accountIdFrom}</td>
                  <td>${item.accountIdTo}</td>
                </tr>
                `;
          });
          $(".transactionRow").empty();
          $("#transactionTable").append(filteredTd);
        }else{
          $(".transactionRow").empty();
          updateTransactionTable();
        }
      }).fail((error) => {
            alert(error);
          });
    });

  });
});
