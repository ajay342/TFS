"use strict";

$("#rate").hide();
//Login EndPoint
  var submit = document.getElementById('login_btn');
  function login() {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
              $(".log").hide();
              $("#rate").show();
              $(".ts").hide();
               alert(this.responseText);
                submit.value = 'Sucess!';
            } else if (request.status === 403) {
                submit.value = 'Invalid credentials. Try again?';
            } else if (request.status === 500) {
                alert('Something went wrong on the server Do Something');
                submit.value = 'Login';
            } else {
                alert('Something went wrong on the server');
                submit.value = 'Login';
            }
        }  
      };
      var id = document.getElementById('id').value;
      var password = document.getElementById('pass').value;
      request.open('POST','/ulogin');
      request.setRequestHeader('Content-Type', 'application/json');
      request.send(JSON.stringify({id: id, password: password}));
  };

//$(".log").hide();
//$("#admin").hide();
$('#addStudent').click(() =>{
  $("#addStu").show();
  $("#addTec").hide();
});
$('#addTeacher').click(() =>{
  $('#addStu').hide();
  $("#addTec").show();
});

//Add a student
$('#st').click(() =>{
 let sid = $('#sid').val();
 let sname = $('#sname').val();
 let sbranch = $('#sbranch').val();
 let smail = $('#smail').val();
 let scontact = $('#scontact').val();
 let pass = $('#pass').val();

    $.post("http://localhost:8080/addStu",
    {
      sid : sid,
      sname: sname,
      sbranch: sbranch,
      smail: smail,
      scontact: scontact,
      pass: pass,
    },
    function(data,status){
      alert("Data: " + data + "\nStatus: " + status);
    });
});

//Add a Teacher
$('#tc').click(() =>{
 let tid = $('#tid').val();
 let tname = $('#tname').val();
 let desc = $('#desc').val();
 let tmail = $('#tmail').val();
 let tcontact = $('#tcontact').val();
 let tbranch = $('#tbranch').val();
 $.post("http://localhost:8080/addTec",
 {
   tid : tid,
   tname: tname,
   desc:desc,
   tmail: tmail,
   tcontact: tcontact,
   tbranch: tbranch,
 },
 function(data,status){
   alert("Data: " + data + "\nStatus: " + status);
 });
});

//Search Teacher
$('#search').click(() =>{
 let tn = $('#tn').val();
 $.get("http://localhost:8080/teacher/"+tn,
 function(data,status){
   let d1= JSON.parse(data);
   let name= d1.TName;
   let d2 = d1.Description;
   let mail = d1.TMail;
   let con = d1.TContact;
   let b =d1.TBranch.split('$');
   let b1 = b.join("<br>");
    $('#td').html(`<h1>${name}</h1><hr><h2>${d2}</h2><hr><h2>${mail}</h2><hr><h2>${con}</h2><hr><h2>${b}</h2><hr>`);
 });
});

//rating 
$('#ratet').click(() =>{
  alert("Clicked");
  let teacherName = $('#tname').val();
  alert(teacherName);
  $.get("http://localhost:8080/rateteacher/"+teacherName,
   (data1,status) => {
    if(status == 'success'){
      $('#ri').html(data1);
    }
    else{
      $("#ratet").html("Sorry No Teacher Found");
    }
  });
 });
 
$('#logout').click(() => {
  $.get("http://localhost:8080/logout",
   (data, status) => {
    if(status == 'success'){
        $('#ri').html(data);
    }
});
});