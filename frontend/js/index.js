$(() => {
  //Start coding here!
  //Form Check
  $("form").submit((event) => {
    event.preventDefault();
    console.log("Submitted");
  });

  let userList = [];
  //create user account summary list via data stored in server
  $.ajax({
    url: "http://localhost:3000/accounts",
    type: "get",
    contentType: "application/json",
    dataType: "json",
  }).done((data) => {
    console.log(data);
    let account_summary = $.map(data, (user) => {
      return `
              <li>Account Name: ${user.username}: Total Balance: ${user.transactions}</li>
            `;
    });
    $("#summary_list").append(account_summary);
    $.each(data, (index, value) =>{
      createUserList(value.username, accountSelectList);
      createUserList(value.username, fromList);
      createUserList(value.username, toList);
    })
  });

  function createUserList(newUserName, selectTag){
    return selectTag.append(`
      <option value=${newUserName}>${newUserName}</option>
      `);
  }
  const accountSelectList = $("#accountSelect");
  const fromList = $("#fromSelect");
  const toList = $("#toSelect");


  //Get the value from account input
  $("#create_account_button").click((e) => {
    e.preventDefault();
    const newAccountName = $("#account_input").val();
    if (
      newAccountName === "" ||
      $.inArray(newAccountName, userList) !== -1
    ) {
      alert("Pls enter valid user name");
    } else {
      //Create New Account
      $.ajax({
        url: "http://localhost:3000/accounts",
        type: "post",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
          newAccount: {
            username: `${newAccountName}`,
            transactions: [],
          },
        }),
      })
        .done((data) => {
          console.log(data.username);
          userList.push(data.username);
          //Add a new user option tag
          createUserList(data.username, accountSelectList);
          createUserList(data.username, fromList);
          createUserList(data.username, toList);
          //create user account summary
          $("#summary_list")
          .append(`
                  <li>Account Name: ${data.username}: Total Balance: ${data.transactions}</li>
              `);
        //Reset input
        $("#account_input").val('');
        return userList;
        })
        .fail((error) => {
          console.log(error);
        });
    }
  });
  const fromSelect = $("#fromButton");
  const toSelect = $("#toButton");
  const accountSelect = $("#accountButton"
  )

  //Get value of ratio buttons
  $("input:radio[name='r1']").change(() =>{
    let checkedRadio = $("input:radio[name='r1']:checked").val();
    console.log(checkedRadio);
    if(checkedRadio === "Deposit" || checkedRadio === "Withdraw"){
      fromSelect.hide();
      toSelect.hide();
    }else{
      fromSelect.show();
      toSelect.show();
    }

    checkedRadio === "Transfer" ? accountSelect.hide(): accountSelect.show();
  })

  //Add new category
  const categoryInput = $("#categoryInput");
  const categorySelect = $("#categorySelect");
  const newCategoryButton = $("#categoryButton")
  categoryInput.hide();
  newCategoryButton.hide();

  categorySelect.change((event) =>{
    event.preventDefault();
    // console.log($("[name = category]").val());
    if($("[name = category]").val() === "addNewCategory"){
      categoryInput.show();
      newCategoryButton.show();
    }else{
      categoryInput.hide();
      newCategoryButton.hide();
    }
  });

  newCategoryButton.click((event) =>{
    event.preventDefault()
    const categoryInputValue = categoryInput.val();
    //Form validation and adding new category
    (categoryInputValue.length > 0) &&
      $.ajax({
        url: "http://localhost:3000/categories",
        type: "post",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
          newCategory: {
            categoryName: categoryInputValue,
          },
        }),
      })
      .done((data) =>{
        const newCategoryOption = new Option(categoryInputValue);
        $("#firstOption").remove();
        categorySelect.prepend(newCategoryOption);
        categoryInput.hide();
        newCategoryButton.hide();
        categoryInput.val('');
      });
  })
});
