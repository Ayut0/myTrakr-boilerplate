$(() => {
  //Start coding here!
  //Form Check
  $('form').submit((event) =>{
    event.preventDefault();
    console.log('Submitted');
  });

  //Get the value from account input
  $("#create_account_button").click((e) =>{
    e.preventDefault()
    if ($("#account_input").val() === '' || ($.inArray($("#account_input").val(), name) !== -1)){
      alert('Pls enter valid user name')
    }else{
      //Create New Account
      $.ajax({
        url: "http://localhost:3000/accounts",
        type: "post",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
          newAccount: {
            username: `${$("#account_input").val()}`,
            transactions: [],
          },
        }),
      })
        .done((data) => {
          console.log(data);
        })
        .fail((error) => {
          console.log(error);
        });
    }

    console.log(name);
  })

});
