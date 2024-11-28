//----------RECUPERATION DES API ----------

// Fonction pour récupérer les travaux depuis l'API
async function getWorks() {
  // URL de l'API qui retourne les données des "works"
  const url = "http://localhost:5678/api/works";
  try {
    // Demande au serveur de nous envoyer les informations sur les travaux
    const response = await fetch(url);
    // Vérifie si la réponse HTTP est correcte 
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`); // Si la réponse n'est pas bonne, on affiche un message d'erreur
    }
    // transforme la réponse en quelque chose que notre programme peut comprendre (json)
    const works = await response.json();
    //console.log("Works récupérés :", works); // Affiche les travaux dans la console pour vérifier ce qu'on a reçu
    return works; // Retourne la liste des travaux
  } catch (error) {
    // Si une erreur se produit, affiche un message d'erreur dans la console
    console.error("Erreur lors de la récupération des works :", error.message);
  }
}

// Fonction pour récupérer les catégories depuis l'API
async function getCategories() {
  // URL de l'API qui retourne les données des "categories"
  const url = "http://localhost:5678/api/categories";
  try {
     // On va demander au serveur de nous envoyer les informations sur les catégories
    const response = await fetch(url);
    // Vérifie si la réponse HTTP est correcte (status 200)
    if (!response.ok) {
      throw new Error(`Erreur : ${response.status}`); // Si la réponse n'est pas bonne, on affiche un message d'erreur
    }
    // Convertit les données de la réponse en JSON pour les rendre utilisables
    const categories = await response.json();
    //console.log("Catégories récupérées :", categories); // Vérifie que les données des catégories sont récupérées
    return categories;
  } catch (error) {
    // Si une erreur se produit, affiche un message d'erreur dans la console
    console.error("Erreur lors de la récupération des catégories :", error.message);
  }
}

// --------------- CREATION ET AFFICHAGE DES CATEGORIES ----------

// Fonction pour créer et afficher le menu des catégories
async function createCategoryMenu() {
  // Récupère les catégories depuis l'API
  const categories = await getCategories();
  if (!categories) {
    console.error("Pas de catégories récupérées"); // S'il n'y a pas de catégories, on arrête ici
    return;
  }

  // --------------------- AJOUT DES BUTTONS ET CATEGORIES --------------------

  // -------------------- CONTAINER ------------------------

 // On trouve l'endroit où on va ajouter les boutons de catégories dans la page
  const portfolioSection = document.querySelector("#portfolio");
  // Crée dynamiquement un conteneur pour le menu des catégories
  const menu = document.createElement("div");
  menu.id = "menu-categories"; // On donne un nom à ce container pour pouvoir la retrouver facilement
 // On met le container juste avant la galerie de travaux
  portfolioSection.insertBefore(menu, portfolioSection.querySelector(".gallery"));

// ---------------------------- BUTTONS -------------------

  // On crée un bouton "Tous" pour permettre d'afficher tous les travaux
  const allButton = document.createElement("button");
  allButton.textContent = "Tous"; // Le bouton affiche le mot "Tous"
  allButton.dataset.category = "all"; // On lui donne une categorie pour dire qu'il montre tout
  menu.appendChild(allButton); // On ajoute ce bouton dans la boîte des catégories

  // Crée un bouton pour chaque catégorie récupérée et l'ajoute au menu
  categories.forEach(category => {
    const button = document.createElement("button"); // Crée un bouton pour chaque catégorie
    button.textContent = category.name; // Le texte du bouton est le nom de la catégorie
    button.dataset.category = category.id; // On lui donne une étiquette avec l'identifiant de la catégorie
    menu.appendChild(button); // On ajoute ce bouton dans la boîte des catégories
  });

  //console.log("Menu de catégories créé"); // Affiche dans la console pour vérifier que le menu est bien créé
  addFilterEvents(); // On ajoute les actions quand on clique sur les boutons
}

// -------------------- EVENTS ----------------

// Fonction pour ajouter des événements de clic sur chaque bouton de catégorie
function addFilterEvents() {
  // On trouve tous les boutons qui sont dans le menu des catégories
  const buttons = document.querySelectorAll("#menu-categories button");
  if (buttons.length === 0) {
    console.error("Aucun bouton de catégorie trouvé"); // S'il n'y a pas de boutons, on arrête ici
    return;
  }

  // Pour chaque bouton, on ajoute une action à faire quand on clique dessus
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      // Quand on clique, on récupère l'identifiant de la catégorie liée au bouton
      const categoryId = button.dataset.category;
      //console.log("Filtre appliqué :", categoryId); // Affiche dans la console pour vérifier quel filtre est appliqué
       // On appelle la fonction pour afficher les travaux correspondant à cette catégorie
      showWorks(categoryId);
    });
  });
}

// --------------------------- AFFICHAGE DE LA GAlLERY ----------------

// Fonction pour afficher les travaux dans la galerie
async function showWorks(categoryId = "all") {
  // On trouve l'endroit où sont affichés les travaux
  const gallery = document.querySelector(".gallery");
  if (!gallery) {
    console.error("La galerie est introuvable"); // S'il n'y a pas de galerie, on arrête ici
    return;
  }

  // On vide la galerie pour ne pas mélanger les nouveaux travaux avec les anciens
  gallery.innerHTML = "";
  // On récupère tous les travaux depuis le serveur
  const works = await getWorks();
  if (!works) {
    console.error("Aucun travail récupéré"); // S'il n'y a pas de travaux, on arrête ici
    return;
  }

  // ----------------------- FILTRES ----------------------------

  // On filtre les travaux selon la catégorie choisie
  const filteredWorks = (categoryId === "all")
    ? works // Si "all" est sélectionné, affiche tous les travaux
    : works.filter(work => work.categoryId === parseInt(categoryId)); // Sinon, on garde seulement ceux de la bonne catégorie

  // Pour chaque travail filtré, on crée des éléments pour l'afficher dans la galerie
  filteredWorks.forEach(element => {
    let figure = document.createElement("figure"); // Crée un cadre pour chaque travail
    let img = document.createElement("img"); // Crée un élément <img> pour l'image du "work"
    img.src = element.imageUrl; // Définit l'URL de l'image
    img.alt = element.title; // Définit le texte alternatif pour l'accessibilité

    let figureCaption = document.createElement("figcaption"); // Crée un petit texte pour décrire l'image
    figureCaption.textContent = element.title; // On met le titre du travail dans ce texte
    figure.appendChild(img); // Ajoute l'image à la <figure>
    figure.appendChild(figureCaption); // On ajoute le texte 
    gallery.appendChild(figure); // Ajoute la <figure> à la galerie avec l'image et le texte dans la galerie
  });

  //console.log("Travaux affichés :", filteredWorks); // Vérifie les travaux affichés dans la galerie
}

// ----------------- LANCEMENT DE LA PAGE CHARGEE --------------

// Fonction principale pour tout lancer quand la page est chargée
async function init() {
  await createCategoryMenu(); // Crée le menu de catégories dynamiquement
  showWorks(); // Affiche tous les travaux par défaut au chargement de la page
}

// Appelle la fonction d'initialisation dès le chargement de la page
init();
