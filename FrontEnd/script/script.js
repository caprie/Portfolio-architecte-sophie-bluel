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

//---------------------STYLE DYNAMIQUE BTN NAV  NE FONCTIONNE PAS--------------------

const links = document.querySelectorAll("nav a");

const currentPath = window.location.href;  //recupere l'url actuelle

links.forEach(link => {
    if (currentPath === link.href) {
        link.classList.add("active"); 
    }
});



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

// ----------------- LANCEMENT DE LA PAGE CHARGEE --------------

// Fonction principale pour tout lancer quand la page est chargée
async function init() {
  await createCategoryMenu(); 
  showWorks(); 
}

// Appelle la fonction d'initialisation dès le chargement de la page
init();
