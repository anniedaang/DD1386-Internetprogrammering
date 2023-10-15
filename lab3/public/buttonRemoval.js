let Request1 = false;
console.log("in the buttonRemoval function1");

if (window.XMLHttpRequest) {
  Request1 = new XMLHttpRequest();
} else if (window.ActiveXObject) {
  Request1 = new ActiveXObject("Microsoft.XMLHTTP");
}

function buttonRemoval() {
  if (Request1) {
    // send get response to server to remove other sessions from map
    Request1.open("GET", "removeOtherUsers");
    // remove the button
    Request1.onreadystatechange = function removeButton() {
      console.log(`readystate:${Request1.readyState}`);
      console.log(`status:${Request1.status}`);
      // readyState 4: all data received, status 200: successful HTTP request
      if (Request1.readyState === 4 && Request1.status === 200) {
        // remove link
        document.getElementById("logoutLink").innerHTML = "";
        // document.getElementById("logoutSessions").innerHTML = "";
      }
    };
    Request1.send(null);
  }
}
