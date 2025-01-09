

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
  
  console.log("DOM entièrement chargé !");
  //addphoto(); // Appelle la fonction après le chargement du DOM  ----------------------------------------------
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
    console.log("Modale ouverte, lancement de addphoto()");
    
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

// Prévisualisation de l'image ajoutée
document.querySelector("#image").addEventListener("change", (event) => {
  const previewContainer = document.querySelector("#preview-container");
  const previewImage = document.querySelector("#image-preview");

  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result; // Affecte l'URL de l'image au src
      previewImage.style.display = "block"; // Affiche l'image
    };
    reader.readAsDataURL(file); // Convertit le fichier en base64
  } else {
    // Si aucun fichier sélectionné
    previewImage.style.display = "none";
    previewImage.src = "";
  }
});

// Déclare toutes tes fonctions principales
function addphoto() { // Ajoute cette ligne pour déclarer la fonction
  console.log("Fonction addphoto appelée"); // Vérifie si la fonction est exécutée
  

  const form = document.querySelector("#add-project-form"); // Sélectionne le formulaire
  if (!form) { // Si le formulaire n'est pas trouvé
    
    console.error("Le formulaire n'est pas trouvé !");
    return; // Arrête la fonction ici
  }

    console.log("Formulaire trouvé :", form); // Affiche le formulaire trouvé
  
    // Ajoute un écouteur d'événements pour le formulaire
    form.addEventListener("submit", async (event) => { // Ajoute un écouteur d'événement pour le formulaire
      event.preventDefault(); // Empêche le comportement par défaut
      console.log("Formulaire soumis !"); // Ajoute cette ligne pour vérifier que le formulaire est soumis

      //recupère les données du formulaire
      const formData = new FormData(form); // Crée un objet FormData
      console.log("données du formulaire:", [...formData.entries()]); // Ajoute cette ligne pour afficher les données soumises.

      //recupère le token pour l'authentification
      const token = localStorage.getItem("authToken");  // Récupère le token

      try { // Ajoute un bloc try...catch pour gérer les erreurs
        // Envoie les données au serveur
        const response = await fetch("http://localhost:5678/api/works", {   // Envoie les données au serveur
          method: "POST",     // Utilise la méthode POST
          headers: {         // Ajoute les headers
            Authorization: `Bearer ${token}`, // Ajoute le token au header
          },
          body: formData, // Contient l'image et les autres champs
        });

        if (response.ok) { // Si la réponse est ok
          const newWork = await response.json();  // Récupère le travail ajouté
          console.log("Travail ajouté :", newWork); // Affiche le travail ajouté

          //ajoute le travail à la galerie
          addWorkToGallery(newWork); // Appelle la fonction pour ajouter le travail
          if (response.ok) {
            //const newWork = await response.json();
            //console.log("Travail ajouté :", newWork);
        } else { // Si la réponse n'est pas ok
          console.error(`Erreur lors de l'ajout : ${response.status}`); // Affiche le statut de la réponse
    }
  }
      } catch (error) { // Si une erreur se produit
        console.error("Erreur lors de l'envoi des données", error);   // Affiche l'erreur
      }
    });
 
  //} else { // Si le formulaire n'est pas trouvé
    //console.error("Formulaire introuvable."); // Affiche un message d'erreur
  }
 // Ajoute cette ligne pour fermer la fonction

// Fonction pour ajouter un travail à la galerie
function addWorkToGallery(work) {   // Ajoute cette ligne pour déclarer la fonction
  const gallery = document.querySelector(".gallery");   // Sélectionne la galerie
  if (!gallery) {   // Si la galerie n'est pas trouvée
    console.error("Galerie introuvable.");  // Affiche un message d'erreur
    return; // Arrête la fonction ici pour éviter les erreurs
  }

  // Vérifie si l'image existe déjà dans la galerie
  const existingImages = Array.from(gallery.querySelectorAll("img"));
  const isImageAlreadyPresent = existingImages.some(
    (img) => img.src === work.imageUrl);


  if (isImageAlreadyPresent) {
    console.log("L'image existe déjà dans la galerie.");
    return; // Si l'image existe, on quitte la fonction
  }

  // Crée un élément figure pour le travail
  const figure = document.createElement("figure"); // Crée une figure

  const img = document.createElement("img");  // Crée une image
  img.src = work.imageUrl; // Récupère l'URL de l'image
  img.alt = work.title; // Récupère le titre du travail

  const figcaption = document.createElement("figcaption");  // Crée une légende
  figcaption.textContent = work.title;  // Récupère le titre du travail

  // Ajoute l'image et la légende à la figure
  figure.appendChild(img); // Ajoute l'image à la figure
  figure.appendChild(figcaption); // Ajoute la légende à la figure

  // Ajoute la figure à la galerie
  gallery.appendChild(figure);
  console.log("Travail ajouté : ${work.title}");
} //else {
  //console.log("L'image existe déjà dans la galerie.");
//}

// place l'ecouteur d'événement pour ajouter un travail
document.addEventListener("DOMContentLoaded", addphoto);  // Appelle la fonction pour ajouter un travail
console.log("Le fichier JS est chargé.");
addphoto(); // Appel de la fonction pour ajouter un travail


//} else {
  //console.log("Formulaire introuvable.")
    //const submitButton = document.querySelector("#submit-photo");
    
//if (!submitButton) {
  //console.log("Bouton Valider trouvé :", submitButton);
  //console.log("État du bouton Valider :", submitButton.disabled);
    //console.error("Bouton Valider non trouvé !");
//} else {
  //console.log("Formulaire détecté.");
  //console.error("Bouton Valider introuvable !");
//}

//}
const form = document.querySelector("#add-project-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Formulaire soumis !");

    const formData = new FormData(form);
    console.log([...formData.entries()]); // Ajoute cette ligne pour afficher les données soumises.
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Réponse du serveur :", response);

      if (response.ok) {
        console.log("Travail ajouté avec succès.");
        closeModal("#photo-modal"); // Ferme la modale
        openModal("#gallery-modal"); // Ouvre la modale précédente
      } else {
        console.error(`Erreur lors de l'ajout : ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de la requête POST :", error);
    }
  });
//}

/*addphoto(); // Appel de la fonction pour ajouter un travail*/
