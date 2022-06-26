$(() => {
  //Start coding here!
  //Form Check
  $('form').submit((event) =>{
    event.preventDefault();
    console.log('Submitted');
  });

  const name = []
  //Get the value from account input
  $("#create_account_button").click((e) =>{
    e.preventDefault()
    if ($("#account_input").val() === '' || ($.inArray($("#account_input").val(), name) !== -1)){
      alert('Pls enter valid user name')
    }else{
      name.push($("#account_input").val());
    }

    console.log(name);
  })

  //Create New Account
  const userA = new Account('Yuto')
  console.log(userA);

  $.ajax({
    url: 'http://localhost:3000/accounts',
    type: 'post',
    dataType: 'json',
  }).done((data) =>{
    console.log(`Posted by Ajax ${data}`)
  })
});
