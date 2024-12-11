// Récupération des champs du formulaire
let login = document.querySelector("#email");
let password = document.querySelector("#password");
let submit = document.querySelector("input[type = submit]");



/* -----  eventListener pour le btn "submit" ---- */
submit.addEventListener("click", function (event) { /*addEventListener pour écouter le clic sur le btn "submit"  */
    event.preventDefault(); // Empêche le rechargement de la page
    handleLogin(); // Appelle une fonction pour gérer la connexion
    console.log("Bouton 'Se connecter' cliqué."); // Vérification
  });

/* ---- fonction pour gérer la connex° ---- */
async function handleLogin() {
  // recup des valeurs des champs
  const emailValue = document.querySelector("#email").value;
  const passwordValue = document.querySelector("#password").value;
  
  console.log("Email :", emailValue); // Vérifie l'email saisi
  console.log("Mot de passe :", passwordValue); // Vérifie le mot de passe saisi

  // Verifie que champs sont remplis
  if (!emailValue || !passwordValue) {
    alert("Veuillez remplir tous les champs.");
    return;
    
  }

  // Prepare données pour envoi au serveur
  const payload = {
    email: emailValue,
    password: passwordValue,
  };
    
  console.log("Données envoyées au serveur :", payload); // Vérification

  try {
    // envoi de la request POST au serveur
    const response = await fetch("http://localhost:5678/api/users/login",{  
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      
  
    });
 
        
    
  

    
    if (response.ok) {
      const data = await response.json();
      console.log("Connexion réussie :", data);
      
      // stocke le token dans localStorage
      localStorage.setItem("authToken", data.token);

      // redirection vers page d'accueil
      window.location.href = "index.html";
    } else {
      // afficher message d'erreur si connex° echoue
      alert("Identifiants incorrects. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur lors de la connexion :", error.message);
    alert("Une erreur est survenue. Merci de réessayer plus tard.");
  }
}

  


