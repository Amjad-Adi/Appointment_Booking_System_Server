const loginForm=document.querySelector(".login-form");
loginForm.addEventListener("submit",async (event)=>{
    event.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm).entries());
    const response=await fetch(window.location.origin +"/api/auth/login",
        {method:"POST"
            ,headers:{"Content-Type":"application/json"},
            body:JSON.stringify(data)});
    if(!response.ok){
        throw new Error("Login failed.");
    }
    const json = await response.json();
    console.log(json);
})