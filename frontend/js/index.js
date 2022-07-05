$(() => {
  //Start coding here!

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
          console.log(data.id);
          userList.push(data.username);
          //Add a new user option tag
          createUserList(data.username, data.id, accountSelectList);
          createUserList(data.username, data.id, fromList);
          createUserList(data.username, data.id, toList);
          //create user account summary
          $("#summary_list").append(`
                  <li>Account Name: ${data.username}: Total Balance: ${data.transactions}</li>
              `);
          //Reset input
          $("#account_input").val("");
          alert("New account added");
          return userList;
        })
        .fail((error) => {
          alert(error);
        });
    }
  });

  //create user account summary list via data stored in server
  let userList = [];
  $(document).ready(() => {
    $.ajax({
      url: "http://localhost:3000/accounts",
      type: "get",
      contentType: "application/json",
      dataType: "json",
    }).done((data) => {
      let account_summary = $.map(data, (user) => {
        return `
                <li>Account Name: ${user.username}: Total Balance: ${user.transactions}</li>
              `;
      });
      $("#summary_list").append(account_summary);
      $.each(data, (index, value) => {
        createUserList(value.username, value.id, accountSelectList);
        createUserList(value.username, value.id, fromList);
        createUserList(value.username, value.id, toList);
      });
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
  categoryInput.hide();
  newCategoryButton.hide();

  //Create category list
  $(document).ready(() => {
    $.ajax({
      url: "http://localhost:3000/categories",
      type: "get",
      contentType: "application/json",
      dataType: "json",
    }).done((data) => {
      console.log(data);
      let categoryOption = $.map(data, (item) => {
        return `
               <option value=${item.name.categoryName}>${item.name.categoryName}</option>
              `;
      });
      categorySelect.prepend(categoryOption);
      // $("#firstOption").remove();
    });
  });

  categorySelect.change((event) => {
    event.preventDefault();
    // console.log($("[name = category]").val());
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


  //Add new transaction
  $("#transactionForm").submit((event) => {
    event.preventDefault();
    if($("#description").val() === '' || $("#amount").val() === '' ){
      alert("Pls enter valid description or amount")
      return;
    }
    const transactionType = $("input[name='transactionType']:checked").val();
    const transactionCategory = categorySelect.val();
    const transactionAmount = Number($("#amount").val());
    const transactionDescription = $("#description").val();
    let userAccountId;
    let userAccountIdFrom;
    let userAccountIdTo;
    // console.log(
    //   transactionType,
    //   transactionCategory,
    //   transactionAmount,
    //   transactionDescription
    //   );

    if(transactionType === "Deposit" || transactionType === "Withdraw"){
      userAccountId = $("#accountSelect").val();
    }
    // console.log(userAccountId, $("#accountSelect").val());

    if(transactionType === "Transfer"){
      userAccountIdFrom = $("#fromSelect").val();
      userAccountIdTo = $("#toSelect").val();
    }else{
      userAccountIdFrom = null;
      userAccountIdTo = null;
    }

    const newTransaction = {
          accountId: `${userAccountId}`, // account ID for Deposits or Withdraws
          accountIdFrom: `${userAccountIdFrom}`, // sender ID if type = 'Transfer', otherwise null
          accountIdTo: `${userAccountIdTo}`, // receiver ID if type = 'Transfer', otherwise null
          // all info from form
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
        newTransaction
      }),
    })
      .done((data) => {
        $("#amount").val("");
        $("#description").val("");
        alert("New transaction added");
      })
      .fail((error) => {
        alert(error);
      });
  });
});
