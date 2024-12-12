//----------RECUPERATION DES API ----------

// Fonction pour récupérer les travaux depuis l'API
async function getWorks() {
  // URL de l'API qui retourne les données des "works"
  const url = "http://localhost:5678/api/works";
  try {   
    const response = await fetch(url); 
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`); 
    }
    const works = await response.json();
    return works; 
  } catch (error) {
    console.error("Erreur lors de la récupération des works :", error.message);
  }
}

// Fonction pour récupérer les catégories depuis l'API
async function getCategories() {
  // URL de l'API qui retourne les données des "categories"
  const url = "http://localhost:5678/api/categories";
  try { 
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur : ${response.status}`); 
    }
    // Convertit les données de la réponse en JSON pour les rendre utilisables
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error.message);
  }
}

//---------------------STYLE DYNAMIQUE BTN NAV  --------------------

const links = document.querySelectorAll("nav a");

const currentPath = window.location.href;  //recupere l'url actuelle

links.forEach(link => {
    if (currentPath === link.href) {
        link.classList.add("active"); 
    }
});


//------------------- style logout -----------------
function toggleLoginLogoutButton() {
  console.log("toggleLoginLogoutButton exécuté"); // vérifier si la fonction est appelée
  const loginButton = document.querySelector('a[href="login.html"]'); // Sélectionne le lien "login"
  console.log("Bouton login/logout sélectionné :", loginButton);


  if (!loginButton) {
    console.error("Le bouton login/logout n'a pas été trouvé dans le DOM.");
    return; // Sortir de la fonction si l'élément n'existe pas
  }

  const token = localStorage.getItem("authToken"); // Vérifie si un token est présent
  console.log("Token trouvé :", token); // Ajoute ce log pour vérifier si le token est trouvé

  if (token) {
    // Si l'admin est connecté
    console.log("Token trouvé :", token); // Vérifie si le token est récupéré
    loginButton.textContent = "Logout"; // Change le texte du bouton
    loginButton.style.fontWeight = "bold"; // Met le texte en gras
    loginButton.href = "#"; // Supprime la redirection vers la page login

    // Ajoute un event listener pour déconnecter
    loginButton.addEventListener("click", () => {
      localStorage.removeItem("authToken"); // Supprime le token
      alert("Vous avez été déconnecté.");
      window.location.reload(); // Recharge la page pour revenir à l'état non connecté
    });
  } else {
    // Si l'admin n'est pas connecté
    console.log("Aucun token trouvé"); // Vérifie si aucun token
    console.log("Utilisateur non connecté, bouton 'Login' visible."); // Ajoute ce log
    loginButton.textContent = "Login"; // Remet le texte par défaut
    loginButton.style.fontWeight = "normal"; // Texte normal
    loginButton.href = "login.html"; // Redirection vers la page de connexion
  }

}



// --------------- CREATION ET AFFICHAGE DES CATEGORIES ----------

// Fonction pour créer et afficher le menu des catégories
async function createCategoryMenu() {
  // Récupère les catégories depuis l'API
  const categories = await getCategories();
  if (!categories) {
    console.error("Pas de catégories récupérées"); 
    return;
  }

  // --------------------- AJOUT DES BUTTONS ET CATEGORIES --------------------

  // -------------------- CONTAINER ------------------------

  const portfolioSection = document.querySelector("#portfolio");
  const menu = document.createElement("div");
  menu.id = "menu-categories"; 
  portfolioSection.insertBefore(menu, portfolioSection.querySelector(".gallery"));

// ---------------------------- BUTTONS -------------------

  // On crée un bouton "Tous" pour permettre d'afficher tous les travaux
  const allButton = document.createElement("button");
  allButton.textContent = "Tous"; 
  allButton.dataset.category = "all"; 
  menu.appendChild(allButton); 

  // Crée un bouton pour chaque catégorie récupérée et l'ajoute au menu
  categories.forEach(category => {
    const button = document.createElement("button"); 
    button.textContent = category.name; 
    button.dataset.category = category.id; 
    menu.appendChild(button); 
  });
 
  addFilterEvents(); // On ajoute les actions quand on clique sur les boutons
}

// -------------------- EVENTS ----------------

// Fonction pour ajouter des événements de clic sur chaque bouton de catégorie
function addFilterEvents() {
  const buttons = document.querySelectorAll("#menu-categories button");
  if (buttons.length === 0) {
    console.error("Aucun bouton de catégorie trouvé"); 
    return;
  }

  // Pour chaque bouton, on ajoute une action à faire quand on clique dessus
  buttons.forEach(button => {
    button.addEventListener("click", (e) => {
      buttons.forEach(button => {
        button.classList.remove("active"); 
          });
      e.target.classList.add ("active") 
      const categoryId = button.dataset.category;
      showWorks(categoryId);
    });
  });
}

// --------------------------- AFFICHAGE DE LA GAlLERY ----------------

// Fonction pour afficher les travaux dans la galerie
async function showWorks(categoryId = "all") {
  const gallery = document.querySelector(".gallery");
  if (!gallery) {
    console.error("La galerie est introuvable"); 
    return;
  }

  // On vide la galerie pour ne pas mélanger les nouveaux travaux avec les anciens
  gallery.innerHTML = "";
  // On récupère tous les travaux depuis le serveur
  const works = await getWorks();
  if (!works) {
    console.error("Aucun travail récupéré"); 
    return;
  }

  // ----------------------- FILTRES ----------------------------

  // On filtre les travaux selon la catégorie choisie
  const filteredWorks = (categoryId === "all")
    ? works 
    : works.filter(work => work.categoryId === parseInt(categoryId)); 
  // Pour chaque travail filtré, on crée des éléments pour l'afficher dans la galerie
  filteredWorks.forEach(element => {
    let figure = document.createElement("figure"); 
    let img = document.createElement("img"); 
    img.src = element.imageUrl; 
    img.alt = element.title; 
    let figureCaption = document.createElement("figcaption"); 
    figureCaption.textContent = element.title; 
    figure.appendChild(img); 
    figure.appendChild(figureCaption); 
    gallery.appendChild(figure); 
  }); 
}

// ----------------- BARRE NOIRE EN MODE ÉDITION ------------------
function toggleEditBar() {
  const editBar = document.querySelector("#edit-bar");
  const token = localStorage.getItem("authToken"); // Vérifie si un token est présent

  if (token) {
    // Si l'utilisateur est connecté
    editBar.classList.remove("hidden"); // Affiche la barre
  } else {
    // Si l'utilisateur n'est pas connecté
    editBar.classList.add("hidden"); // Cache la barre
  }
}

// ----------------- LANCEMENT DE LA PAGE CHARGEE ----------------

// Fonction principale pour tout lancer quand la page est chargée
/*async function init() {
  await createCategoryMenu(); 
  showWorks();
  toggleAdminFeatures(); // Appelle la fonction pour activer les fonctionnalités admin
  toggleEditBar(); // Appelle la fonction pour gérer la barre noire
}

// Appelle la fonction d'initialisation dès le chargement de la page
init();*/


// ----------------- LANCEMENT DE LA PAGE CHARGEE --------------

// Fonction principale pour tout lancer quand la page est chargée
async function init() {
  await createCategoryMenu(); 
  showWorks(); 
  toggleAdminFeatures(); // Ajoute cette ligne pour activer les fonctionnalités admin
  toggleLoginLogoutButton(); // Appelle la gestion du bouton login/logout
}

// Appelle la fonction d'initialisation dès le chargement de la page
init();

// ----------------- INTERACTIONS UTILISATEUR ------------------

// Gestion du clic sur le bouton "Modifier"
document.querySelector("#edit-mode").addEventListener("click", () => {
  const button = document.querySelector("#edit-mode");

  // Appliquer la classe pour l'animation
  button.classList.add("animate-dissolve");

  // Après l'animation, rediriger vers la nouvelle page
  setTimeout(() => {
    window.location.href = "#"; // vers la modale ensuite
  }, 300); // 300ms correspond à la durée de l'animation définie en CSS
});

// ----------------- FONCTIONNALITÉS ADMIN --------------------- 
/*après init() pour etre exécuté au chargement de la page, après le contenu dynamique.*/

// Fonction pour afficher ou masquer les fonctionnalités admin
function toggleAdminFeatures() {                               //affichage ou suppression des elemt si token dans le localStorage.
  const token = localStorage.getItem("authToken");
  console.log("Token trouvé :", token); // Vérifie si le token est récupérés
  const editButton = document.querySelector("#edit-mode");
  console.log("Bouton modifier détecté :", editButton); // Vérifie si le bouton existe dans le DOM
  const filters = document.querySelector("#menu-categories");

  if (token) {
    console.log("Admin logué : token présent.");
    // Si l'utilisateur est connecté (token présent)
    editButton.style.display = "block";
    filters.style.display = "none";
  } else {
    console.log("Admin non logué : pas de token.");
    // Si l'utilisateur n'est pas connecté
    editButton.style.display = "none";
    filters.style.display = "flex"; // Si les filtres sont en flex
  }
}

// Ajouter l'événement au bouton "modifier"
document.querySelector("#edit-mode").addEventListener("click", () => {
  // Rediriger vers la modale
  window.location.href = "#";
});