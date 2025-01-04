//----------RECUPERATION DES API ----------

// Fonction pour récupérer les travaux depuis l'API
async function getWorks() {
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
    console.error(
      "Erreur lors de la récupération des catégories :",
      error.message
    );
  }
}

//---------------------STYLE DYNAMIQUE BTN NAV  --------------------

const links = document.querySelectorAll("nav a");

const currentPath = window.location.href; //recupere l'url de la page affichée

links.forEach((link) => {
  if (currentPath === link.href) {
    link.classList.add("active");
  }
});

//------------------- style logout -----------------
function toggleLoginLogoutButton() {
  const loginButton = document.querySelector('a[href="login.html#login"]');
  const token = localStorage.getItem("authToken");

  if (token) {
    // Si l'admin est connecté
    loginButton.textContent = "Logout";
    loginButton.style.fontWeight = "bold";
    loginButton.href = "login.html"; // en attente lien modale

    // Ajoute un event listener pour déconnecter
    loginButton.addEventListener("click", () => {
      localStorage.removeItem("authToken"); // Supprime le token
    });
  } else {
    // Si l'admin n'est pas connecté
    loginButton.textContent = "Login";
    loginButton.style.fontWeight = "normal";
    loginButton.href = "login.html";
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
  portfolioSection.insertBefore(
    menu,
    portfolioSection.querySelector(".gallery")
  );

  // ---------------------------- BUTTONS -------------------

  // créer un bouton "Tous" pour permettre d'afficher tous les travaux
  const allButton = document.createElement("button");
  allButton.textContent = "Tous";
  allButton.dataset.category = "all";
  menu.appendChild(allButton);

  // Crée un bouton pour chaque catégorie récupérée et l'ajoute au menu
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.dataset.category = category.id;
    menu.appendChild(button);
  });

  addFilterEvents(); // ajoute les actions quand on clique sur les boutons
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
  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      buttons.forEach((button) => {
        button.classList.remove("active");
      });
      e.target.classList.add("active");
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
  const filteredWorks =
    categoryId === "all"
      ? works
      : works.filter((work) => work.categoryId === parseInt(categoryId));
  // Pour chaque travail filtré, on crée des éléments pour l'afficher dans la galerie
  filteredWorks.forEach((element) => {
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
  const token = localStorage.getItem("authToken");

  if (token) {
    // Si l'utilisateur est connecté
    editBar.classList.remove("hidden"); // Affiche la barre
  } else {
    editBar.classList.add("hidden"); // Cache la barre
  }
}

// ----------------- LANCEMENT DE LA PAGE CHARGEE ----------------

// Fonction principale pour tout lancer quand la page est chargée
document.addEventListener("DOMContentLoaded", () => {
  const closeModalButton = document.querySelector(".close-modal");
  const editButton = document.querySelector("#edit-mode");

  async function init() {
    await createCategoryMenu();
    showWorks();

    // Réinitialise l'état du bouton
    const editButton = document.querySelector("#edit-mode");
    if (editButton) {
      editButton.classList.add("hidden"); // Cache le bouton par défaut
    }

    toggleAdminFeatures();
    toggleLoginLogoutButton();
    toggleEditBar();
  }

  // Appelle la fonction d'initialisation dès le chargement de la page
  init();
});
// ----------------- INTERACTIONS UTILISATEUR ------------------

// Gestion du clic sur le bouton "Modifier"
document.querySelector("#edit-mode").addEventListener("click", () => {
  const button = document.querySelector("#edit-mode");

  // Appliquer la classe pour l'animation
  button.classList.add("animate-dissolve");

  // Après l'animation, rediriger vers la nouvelle page
  setTimeout(() => {
    window.location.href = "#"; // vers la modale ensuite
  }, 300);
});

// ----------------- FONCTIONNALITÉS ADMIN ---------------------
/*après init() pour etre exécuté au chargement de la page, après le contenu dynamique.*/

// Fonction pour afficher ou masquer les fonctionnalités admin
function toggleAdminFeatures() {
  const token = localStorage.getItem("authToken");
  const editButton = document.querySelector("#edit-mode");
  const filters = document.querySelector("#menu-categories");

  if (!editButton) {
    return; // Arrête la fonction ici si l'élément n'existe pas
  }

  if (token) {
    editButton.classList.remove("hidden");
    filters.style.display = "none";
  } else {
    editButton.classList.add("hidden");
  }
  // Vérifie l'état actuel du bouton
  console.log("État du bouton :", editButton.classList);
}

// Ajouter l'événement au bouton "modifier"
document.querySelector("#edit-mode").addEventListener("click", () => {
  window.location.href = "#";
});

// --------------------------------fonctionnalités pour la modale

// Sélection des éléments
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("#gallery-modal");
  const openModalButton = document.querySelector("#edit-mode"); // Bouton "Modifier"
  const closeModalButton = document.querySelector(".close-modal");
  const modalGallery = document.querySelector(".gallery-modal");

  // Fonction pour ouvrir la modale et charger les images
  function openModalGallery() {
    modal.classList.remove("hidden");
    modalGallery.innerHTML = ""; // Vide la galerie existante
    console.log("Modale ouverte et galerie vidée."); // Vérifie que cette étape passe

    // Charge les images via l'API
    getWorks()
      .then((works) => {
        works.forEach((work) => {
          console.log(`Création de figure pour : ${work.title}`); // Vérifie chaque itération

          // Crée l'élément figure pour chaque travail
          const figure = document.createElement("figure");

          // Crée l'icône poubelle
          const trashIcon = document.createElement("i");
          trashIcon.className = "fa-solid fa-trash-can trash-icon"; // Icône poubelle (Font Awesome)

          // Ajoute un événement au clic sur l'icône poubelle
          trashIcon.addEventListener("click", async () => {
            if (confirm(`Voulez-vous vraiment supprimer ${work.title} ?`)) {
              try {
                const response = await fetch(
                  `http://localhost:5678/api/works/${work.id}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "authToken"
                      )}`,
                    },
                  }
                );

                if (response.ok) {
                  console.log(`${work.title} supprimé.`);
                  figure.remove(); // Supprime l'élément du DOM
                } else {
                  console.error(
                    `Erreur lors de la suppression : ${response.status}`
                  );
                }
              } catch (error) {
                console.error("Erreur lors de la requête DELETE :", error);
              }
            }
          });

          // Crée l'image
          const imgElement = document.createElement("img");
          imgElement.src = work.imageUrl;
          imgElement.alt = work.title;

          // Ajoute les éléments aux figures
          figure.appendChild(imgElement);
          figure.appendChild(trashIcon);

          // Ajoute la figure à la galerie
          modalGallery.appendChild(figure);
        });
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des works :", error);
      });
  }

  // Fonction pour fermer la modale
  function closeModalGallery() {
    modal.classList.add("hidden");
  }

  // Écouteurs d'événements
  if (openModalButton) {
    openModalButton.addEventListener("click", openModalGallery);
  }

  // Fermer la modale au clic en dehors
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModalGallery();
    }
  });
});

// Fonction pour ouvrir une modale spécifique
function openModal(modalId) {
  const modal = document.querySelector(modalId);
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  } else {
    console.error(`La modale avec l'ID ${modalId} n'existe pas.`);
  }
}

// Fonction pour fermer une modale spécifique
function closeModal(modalId) {
  const modal = document.querySelector(modalId);
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  } else {
    console.error(`La modale avec l'ID ${modalId} n'existe pas.`);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  
  // Bouton pour ouvrir la deuxième modale depuis la première
  const addPhotoButton = document.querySelector("#add-photo");
  if (addPhotoButton) {
    addPhotoButton.addEventListener("click", () => {
      closeModal("#gallery-modal"); // Ferme la première modale
      openModal("#photo-modal"); // Ouvre la deuxième modale
    });
  }

  // Boutons pour fermer la deuxième modale
  const closePhotoModalButton = document.querySelector(".close-photo-modal");
  if (closePhotoModalButton) {
    closePhotoModalButton.addEventListener("click", () =>
      closeModal("#photo-modal")
    );
  }

  // Ajout dynamique des catégories dans la deuxième modale
  const categorySelect = document.querySelector("#category");

  if (categorySelect) {
    try {
      const categories = await getCategories(); // Récupère les catégories via l'API
      if (categories && categories.length > 0) {
         // Nettoie le select pour éviter les doublons
         categorySelect.innerHTML = "";

          // Ajoute une option vide par défaut
        const defaultOption = document.createElement("option");
        defaultOption.value = "";  // Pas de texte dans l'option
        defaultOption.textContent = "";
        defaultOption.disabled = true; // Rend l'option non cliquable
        defaultOption.selected = true; // Affiche cette option par défaut
        categorySelect.appendChild(defaultOption);

        // Utilisation d'un Set pour éviter les doublons
        const uniqueCategoryNames = new Set();
        
        categories.forEach((category) => {
          if (!uniqueCategoryNames.has(category.name)) {
            uniqueCategoryNames.add(category.name);

          const option = document.createElement("option");
          option.value = category.id;
          option.textContent = category.name;
          categorySelect.appendChild(option); // Ajoute chaque catégorie comme option
          }
        });

        console.log("Catégories uniques ajoutées au select avec succès.");
      } else {
        console.error("Aucune catégorie récupérée ou liste vide.");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout des catégories :", error);
    }
  } else {
    console.error("Élément select pour les catégories introuvable.");
  }
});


